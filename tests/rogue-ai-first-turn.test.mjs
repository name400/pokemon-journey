import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture({modern=true,move='Fake Out',actions=1}={}){
 const hero=makeReferenceMon(7,50,{boxId:'hero',moves:['Splash']}),foe=makeReferenceMon(151,50,{boxId:'foe',moves:[move,'Tackle']});hero.hp=1;
 const run={id:'ai-first',seed:'ai-first',rng:42,wave:20,screen:'battle',party:[hero],modifiers:[],tools:{},encounter:{kind:'trainer'},enemyAiRule:'source-ranked-v1',...(modern?{enemyAiFirstTurnRule:'source-v1'}:{})};
 run.combat=createClassicCombat(run,[foe],{trainer:true});const b=restoreClassicNativeBattle(run.combat,run);b.p2.active[0].activeMoveActions=actions;run.combat.snapshot=snapshotClassicNativeBattle(b);return run;
}
async function act(run){const doc=await decodeGameData(await encodeGameData({run,other:{keep:true}}));doc.run.combat=playClassicCombat(doc.run,{type:'move',move:'splash'});assert.deepEqual(doc.other,{keep:true});return restoreClassicNativeBattle(doc.run.combat,doc.run);}
for(const move of ['Fake Out','First Impression']){
 test(`${move} is not chosen as a KO after the first action`,async()=>{
  const modern=await act(fixture({move})),old=await act(fixture({move,modern:false}));assert.ok(modern.log.some(s=>s.includes('|Tackle|')));assert.equal(modern.p1.pokemon[0].hp,0);assert.ok(old.log.some(s=>s.includes(`|${move}|`)));assert.equal(old.p1.pokemon[0].hp,1);
 });
 test(`${move} remains usable on entry`,async()=>{const b=await act(fixture({move,actions:0}));assert.ok(b.log.some(s=>s.includes(`|${move}|`)));assert.equal(b.p1.pokemon[0].hp,0);});
}
test('new starts use the first-turn rule while another slot is preserved',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs');const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'ai-first',seed:'ai-first'});assert.equal(run.enemyAiFirstTurnRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});
});
test('switching out and back restores first-turn eligibility across a save',async()=>{
 const hero=makeReferenceMon(7,50,{boxId:'hero',moves:['Splash']}),foe=makeReferenceMon(151,50,{boxId:'foe',moves:['Fake Out','Tackle']}),bench=makeReferenceMon(1,50,{boxId:'bench',moves:['Splash']});
 const run={id:'switch-first',seed:'switch-first',rng:42,wave:20,screen:'battle',party:[hero],modifiers:[],tools:{},encounter:{kind:'trainer'},enemyAiRule:'source-ranked-v1',enemyAiFirstTurnRule:'source-v1'};run.combat=createClassicCombat(run,[foe,bench],{trainer:true});const b=restoreClassicNativeBattle(run.combat,run);
 assert.equal(b.choose('p1','move splash'),true);assert.equal(b.choose('p2','move fakeout'),true);
 assert.equal(b.choose('p1','move splash'),true);assert.equal(b.choose('p2','switch 2'),true);
 assert.equal(b.choose('p1','move splash'),true);assert.equal(b.choose('p2','switch 2'),true);
 assert.equal(b.p2.active[0].activeMoveActions,0);b.p1.active[0].hp=1;run.party[0].hp=1;run.combat.snapshot=snapshotClassicNativeBattle(b);
 const after=await act(run);assert.ok(after.log.slice(-20).some(s=>s.includes('|Fake Out|')));assert.equal(after.p1.pokemon[0].hp,0);
});
test('a Dynamaxed user can use the corresponding Max Move after its first action',async()=>{
 const run=fixture(),b=restoreClassicNativeBattle(run.combat,run);b.p2.active[0].addVolatile('dynamax');run.combat.snapshot=snapshotClassicNativeBattle(b);const after=await act(run);assert.ok(after.log.some(s=>s.includes('|Max Strike|')));assert.equal(after.p1.pokemon[0].hp,0);
});
