import test from 'node:test';import assert from 'node:assert/strict';import {Dex} from '@pkmn/sim';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture({modern=true,target=7,moves=['Quick Attack','Tackle'],ability='pressure',hp=1,foeHp=null,terrain=true}={}){
 const hero=makeReferenceMon(target,50,{boxId:'hero',moves:['Splash']}),foe=makeReferenceMon(151,50,{boxId:'foe',moves,ability});hero.hp=hp;if(foeHp!==null)foe.hp=foeHp;
 const run={id:'ai-terrain',seed:'ai-terrain',rng:42,wave:20,screen:'battle',party:[hero],modifiers:[],tools:{},encounter:{kind:'trainer'},enemyAiRule:'source-ranked-v1',...(modern?{enemyAiTerrainRule:'source-v1'}:{})};run.combat=createClassicCombat(run,[foe],{trainer:true});
 const b=restoreClassicNativeBattle(run.combat,run);if(terrain)b.field.setTerrain('psychicterrain',b.p1.active[0]);run.combat.snapshot=snapshotClassicNativeBattle(b);return run;
}
async function act(run){const doc=await decodeGameData(await encodeGameData({run,other:{keep:true}}));run=doc.run;run.combat=playClassicCombat(run,{type:'move',move:'splash'});const b=restoreClassicNativeBattle(run.combat,run);assert.deepEqual(doc.other,{keep:true});return {run,b};}
test('grounded target: blocked priority damage is not treated as a KO',async()=>{
 const modern=await act(fixture()),old=await act(fixture({modern:false}));assert.ok(modern.b.log.some(s=>s.includes('|Tackle|')));assert.equal(modern.b.p1.pokemon[0].hp,0);
 assert.ok(old.b.log.some(s=>s.includes('|Quick Attack|')));assert.equal(old.b.p1.pokemon[0].hp,1);assert.equal(modern.run.combat.enemyAiTerrainRule,'source-v1');
});
test('airborne targets or missing terrain remain legal priority targets',async()=>{
 for(const options of [{target:16},{terrain:false}]){const {b}=await act(fixture(options));assert.ok(b.log.some(s=>s.includes('|Quick Attack|')));assert.equal(b.p1.pokemon[0].hp,0);}
});
test('Prankster status is recognized without mutating shared move data',async()=>{
 const move=Dex.moves.get('thunderwave'),before=Object.hasOwn(move,'pranksterBoosted'),modern=await act(fixture({hp:30,moves:['Thunder Wave','Splash'],ability:'prankster'}));
 assert.ok(!modern.b.log.some(s=>s.includes('|Thunder Wave|')));assert.equal(modern.b.p1.pokemon[0].status,'');assert.equal(Object.hasOwn(move,'pranksterBoosted'),before);
 const old=await act(fixture({modern:false,hp:30,moves:['Thunder Wave','Splash'],ability:'prankster'}));assert.ok(old.b.log.some(s=>s.includes('|Thunder Wave|')));assert.equal(old.b.p1.pokemon[0].status,'');
});
test('self-targeted priority recovery is not blocked by the opposing terrain',async()=>{
 const {b}=await act(fixture({hp:30,foeHp:30,moves:['Splash','Recover'],ability:'prankster'}));assert.ok(b.log.some(s=>s.includes('|Recover|')));assert.ok(b.p2.pokemon[0].hp>30);
});
test('in doubles priority damage selects the airborne target over a grounded target',async()=>{
 const ground=makeReferenceMon(7,50,{boxId:'ground',moves:['Splash']}),flying=makeReferenceMon(16,50,{boxId:'flying',moves:['Splash']}),foe=makeReferenceMon(151,50,{boxId:'foe',moves:['Quick Attack','Splash']}),foe2=makeReferenceMon(4,50,{boxId:'foe2',moves:['Splash']});ground.hp=flying.hp=1;
 const run={id:'ai-terrain-double',seed:'ai-terrain-double',rng:42,wave:20,screen:'battle',party:[ground,flying],modifiers:[],tools:{},encounter:{kind:'trainer'},enemyAiRule:'source-ranked-v1',enemyAiTerrainRule:'source-v1'};run.combat=createClassicCombat(run,[foe,foe2],{trainer:true,doubles:true});const b=restoreClassicNativeBattle(run.combat,run);b.field.setTerrain('psychicterrain',b.p1.active[0]);run.combat.snapshot=snapshotClassicNativeBattle(b);
 const doc=await decodeGameData(await encodeGameData({run,other:{keep:true}}));doc.run.combat=playClassicCombat(doc.run,{type:'turn',actions:[{actor:0,type:'move',move:'splash'},{actor:1,type:'move',move:'splash'}]});const after=restoreClassicNativeBattle(doc.run.combat,doc.run);assert.equal(after.p1.pokemon[0].hp,1);assert.equal(after.p1.pokemon[1].hp,0);assert.deepEqual(doc.other,{keep:true});
});
test('new games enable the rule without changing another slot',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs');const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'ai-terrain',seed:'ai-terrain'});assert.equal(run.enemyAiTerrainRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});
});
