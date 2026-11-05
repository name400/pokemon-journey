import test from 'node:test';import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
function fixture({modern=true,used=false,extra=false,dynamax=false,heroHp=1}={}){
 const hero=makeReferenceMon(7,50,{boxId:'hero',moves:['Splash']}),foe=makeReferenceMon(151,50,{boxId:'foe',moves:['Last Resort','Tackle',...(extra?['Splash']:[])]});
 const run={id:'last-ai',seed:'last-ai',rng:42,wave:20,screen:'battle',party:[hero],modifiers:[],tools:{},encounter:{kind:'trainer'},enemyAiRule:'source-ranked-v1',...(modern?{enemyAiLastResortRule:'source-v1'}:{})};run.combat=createClassicCombat(run,[foe],{trainer:true});const b=restoreClassicNativeBattle(run.combat,run);
 if(used){assert.equal(b.choose('p1','move splash'),true);assert.equal(b.choose('p2','move tackle'),true);}
 b.p1.active[0].hp=heroHp;run.party[0].hp=heroHp;if(dynamax)b.p2.active[0].addVolatile('dynamax');run.combat.snapshot=snapshotClassicNativeBattle(b);return run;
}
async function act(run){const doc=await decodeGameData(await encodeGameData({run,other:{keep:true}}));doc.run.combat=playClassicCombat(doc.run,{type:'move',move:'splash'});assert.deepEqual(doc.other,{keep:true});return restoreClassicNativeBattle(doc.run.combat,doc.run);}
test('Last Resort is not treated as a KO before other moves are used',async()=>{const modern=await act(fixture()),old=await act(fixture({modern:false}));assert.ok(modern.log.some(s=>s.includes('|Tackle|')));assert.equal(modern.p1.pokemon[0].hp,0);assert.ok(old.log.some(s=>s.includes('|Last Resort|')));assert.equal(old.p1.pokemon[0].hp,1);});
test('Last Resort is legal after the other move was really used and the battle was reloaded',async()=>{const b=await act(fixture({used:true,heroHp:40}));assert.ok(b.log.some(s=>s.includes('|Last Resort|')),JSON.stringify({log:b.log,slots:b.p2.active[0]?.moveSlots}));assert.equal(b.p1.pokemon[0].hp,0);});
test('using only one of multiple other moves is insufficient',async()=>{const b=await act(fixture({used:true,extra:true}));assert.ok(!b.log.some(s=>s.includes('|Last Resort|')));assert.equal(b.p1.pokemon[0].hp,0);});
test('the Dynamaxed Max Move does not have the Last Resort condition',async()=>{const b=await act(fixture({dynamax:true}));assert.ok(b.log.some(s=>s.includes('|Max Strike|')));assert.equal(b.p1.pokemon[0].hp,0);});
test('new starts enable the rule without changing another slot',async()=>{const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs');const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'last-ai',seed:'last-ai'});assert.equal(run.enemyAiLastResortRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});});
test('switching out clears the used-move condition after re-entry and save recovery',async()=>{
 const hero=makeReferenceMon(7,50,{boxId:'hero',moves:['Splash']}),foe=makeReferenceMon(151,50,{boxId:'foe',moves:['Last Resort','Tackle']}),bench=makeReferenceMon(1,50,{boxId:'bench',moves:['Splash']});
 const run={id:'last-switch',seed:'last-switch',rng:42,wave:20,screen:'battle',party:[hero],modifiers:[],tools:{},encounter:{kind:'trainer'},enemyAiRule:'source-ranked-v1',enemyAiLastResortRule:'source-v1'};run.combat=createClassicCombat(run,[foe,bench],{trainer:true});const b=restoreClassicNativeBattle(run.combat,run);
 assert.equal(b.choose('p1','move splash'),true);assert.equal(b.choose('p2','move tackle'),true);assert.equal(b.p2.active[0].moveSlots.find(s=>s.id==='tackle').used,true);
 assert.equal(b.choose('p1','move splash'),true);assert.equal(b.choose('p2','switch 2'),true);assert.equal(b.choose('p1','move splash'),true);assert.equal(b.choose('p2','switch 2'),true);assert.equal(b.p2.active[0].moveSlots.find(s=>s.id==='tackle').used,false);
 b.p1.active[0].hp=1;run.party[0].hp=1;run.combat.snapshot=snapshotClassicNativeBattle(b);const after=await act(run);assert.ok(after.log.slice(-20).some(s=>s.includes('|Tackle|')));assert.ok(!after.log.slice(-20).some(s=>s.includes('|Last Resort|')));assert.equal(after.p1.pokemon[0].hp,0);
});
