import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture({move,hp,modern=true,dynamax=false}) {
 const hero=makeReferenceMon(143,50,{boxId:'hero',moves:['Splash'],ability:'runaway'});
 const foe=makeReferenceMon(151,50,{boxId:'foe',moves:[move,'Splash'],ability:'runaway'});
 const run={id:'hp-cost-ai',seed:'hp-cost-ai',rng:42,wave:20,screen:'battle',party:[hero],modifiers:[],tools:{},encounter:{kind:'trainer'},enemyAiRule:'source-ranked-v1',...(modern?{enemyAiHpCostRule:'source-v1'}:{})};
 run.combat=createClassicCombat(run,[foe],{trainer:true});
 const b=restoreClassicNativeBattle(run.combat,run);b.p2.active[0].hp=hp(b.p2.active[0].maxhp);
 if(dynamax)b.p2.active[0].addVolatile('dynamax');
 run.combat.snapshot=snapshotClassicNativeBattle(b);return run;
}
async function act(run) {
 const doc=await decodeGameData(await encodeGameData({run,other:{keep:true}}));
 doc.run.combat=playClassicCombat(doc.run,{type:'move',move:'splash'});
 assert.deepEqual(doc.other,{keep:true});return restoreClassicNativeBattle(doc.run.combat,doc.run);
}
for(const [move,ratio] of [['Clangorous Soul',3],['Fillet Away',2]]) {
 test(`${move} avoids an insufficient HP cost and legacy retains its behavior`,async()=>{
  const hp=max=>Math.floor(max/ratio),modern=await act(fixture({move,hp})),legacy=await act(fixture({move,hp,modern:false}));
  assert.ok(!modern.log.some(s=>s.includes(`|${move}|`)),modern.log.join('\n'));
  assert.ok(legacy.log.some(s=>s.includes(`|${move}|`)),legacy.log.join('\n'));
 });
 test(`${move} can be selected above the HP boundary`,async()=>{
  const b=await act(fixture({move,hp:max=>Math.floor(max/ratio)+1}));
  assert.ok(b.log.some(s=>s.includes(`|${move}|`)),b.log.join('\n'));
 });
}
test('Dynamax can select Max Guard at low HP',async()=>{
 const b=await act(fixture({move:'Fillet Away',hp:()=>1,dynamax:true}));
 assert.ok(b.log.some(s=>s.includes('|Max Guard|')),b.log.join('\n'));
});
test('new runs enable the rule and preserve another slot',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs');
 const {starterCatalog}=await import('../lib/rogue-starter-system.mjs');
 const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);
 state.slots[1]={keep:true};
 const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'hp-cost-ai',seed:'hp-cost-ai'});
 assert.equal(run.enemyAiHpCostRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});
});
