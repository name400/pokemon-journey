import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture(rule){
 const hero=makeReferenceMon(150,50,{boxId:'hero',moves:['Earthquake']}),ally=makeReferenceMon(143,50,{boxId:'ally',moves:['Splash']}),foe=makeReferenceMon(143,50,{boxId:'foe',moves:['Splash']}),foe2=makeReferenceMon(143,50,{boxId:'foe2',moves:['Splash']});
 ally.ability='stickyhold';foe.ability='stickyhold';foe.rogueFixedModifiers=[{id:'widelens',count:2,typeBoost:null}];
 const run={id:'grip-ally',wave:20,rng:42,party:[hero,ally],modifiers:[{id:'gripclaw',boxId:'hero',count:5,typeBoost:null},{id:'widelens',boxId:'ally',count:2,typeBoost:null}],tools:{},encounter:{kind:'trainer'},...(rule?{gripClawRule:rule}:{})};
 run.combat=createClassicCombat(run,[foe,foe2],{trainer:true,doubles:true});return run;
}
const amount=(list,owner)=>list.filter(m=>m.id==='widelens'&&m.boxId===owner).reduce((n,m)=>n+m.count,0);
test('ally Sticky Hold permits Grip Claw but enemy Sticky Hold still blocks it',async()=>{
 for(const rule of ['source-v2',null]){
  const doc=await decodeGameData(await encodeGameData({run:fixture(rule),other:{keep:true}})),run=doc.run,b=restoreClassicNativeBattle(run.combat,run),hero=b.p1.active[0],ally=b.p1.active[1],foe=b.p2.active[0];
  b.randomChance=()=>true;const move=b.dex.moves.get('tackle');b.runEvent('DamagingHit',ally,hero,move,5);b.runEvent('DamagingHit',foe,hero,move,5);
  assert.equal(amount(run.modifiers,'hero'),rule?1:0);assert.equal(amount(run.modifiers,'ally'),rule?1:2);
  assert.equal(amount(run.combat.modifiers,'foe'),2);assert.deepEqual(doc.other,{keep:true});
  const saved=await decodeGameData(await encodeGameData(doc));assert.equal(amount(saved.run.modifiers,'hero'),rule?1:0);
 }
});
test('real doubles Earthquake transfers exactly one ally item and survives battle restoration',async()=>{
 const run=fixture('source-v2'),b=restoreClassicNativeBattle(run.combat,run),random=b.randomChance;
 b.randomChance=function(n,d){return d===10?true:random.call(this,n,d);};b.makeChoices('move earthquake, move splash','move splash, move splash');
 assert.equal(amount(run.modifiers,'hero'),1);assert.equal(amount(run.modifiers,'ally'),1);assert.equal(amount(run.combat.modifiers,'foe'),2);
 run.combat=snapshotClassicNativeBattle(b,run.combat);const restored=await decodeGameData(await encodeGameData({run}));
 assert.equal(amount(restored.run.modifiers,'hero'),1);assert.equal(amount(restored.run.modifiers,'ally'),1);
});
test('combat snapshot keeps the ally rule without its parent run',()=>{
 const run=fixture('source-v2'),b=restoreClassicNativeBattle(run.combat),hero=b.p1.active[0],ally=b.p1.active[1];b.randomChance=()=>true;
 assert.equal(run.combat.gripClawRule,'source-v2');b.runEvent('DamagingHit',ally,hero,b.dex.moves.get('tackle'),5);
 assert.equal(amount(run.combat.modifiers,'hero'),1);assert.equal(amount(run.combat.modifiers,'ally'),1);
});
test('new games select the rule without changing another save slot',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs');
 const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};
 const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'grip-v2',seed:'grip-v2'});
 assert.equal(run.gripClawRule,'source-v2');assert.deepEqual(state.slots[1],{keep:true});
});
