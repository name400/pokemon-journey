import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture(rule,count=4,native=false){
 const hero=makeReferenceMon(151,50,{boxId:'hero',moves:['Splash']}),foe=makeReferenceMon(143,50,{boxId:'foe',moves:['Splash']});
 hero.hp=30;if(native)hero.item='leftovers';
 const run={id:'leftovers-rounding',wave:20,party:[hero],modifiers:[{id:'leftovers',boxId:'hero',count}],tools:{},encounter:{kind:'trainer'},...(rule?{leftoversRule:rule}:{})};
 run.combat=createClassicCombat(run,[foe],{trainer:true});return run;
}
test('new rule rounds each Leftovers stack before adding them',async()=>{
 for(const rule of ['source-v2',null])for(const count of [1,2,3,4]){
  let run=fixture(rule,count);const data=await decodeGameData(await encodeGameData({run,other:{keep:true}}));run=data.run;
  const battle=restoreClassicNativeBattle(run.combat,run),hero=battle.p1.active[0],max=hero.baseMaxhp,before=hero.hp;
  assert.notEqual(max%16,0);battle.makeChoices('move splash','move splash');
  const expected=rule==='source-v2'?Math.max(1,Math.floor(max/16))*count:Math.floor(max*count/16);
  assert.equal(hero.hp,before+expected,`${rule}:${count}`);assert.deepEqual(data.other,{keep:true});
 }
});
test('native and modifier copies heal consistently and the snapshot retains its rule',()=>{
 const run=fixture('source-v2',3,true),battle=restoreClassicNativeBattle(run.combat),hero=battle.p1.active[0],before=hero.hp,max=hero.baseMaxhp;
 assert.equal(run.combat.leftoversRule,'source-v2');battle.makeChoices('move splash','move splash');
 assert.equal(hero.hp,before+Math.max(1,Math.floor(max/16))*4);
});
test('healing never exceeds maximum HP',()=>{
 const run=fixture('source-v2'),battle=restoreClassicNativeBattle(run.combat,run),hero=battle.p1.active[0];
 hero.hp=hero.maxhp-1;battle.makeChoices('move splash','move splash');assert.equal(hero.hp,hero.maxhp);
});
test('new games receive the source rule without rewriting another slot',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs');
 const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);
 state.slots[1]={keep:true};const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'leftovers-v2',seed:'leftovers-v2'});
 assert.equal(run.leftoversRule,'source-v2');assert.deepEqual(state.slots[1],{keep:true});
});
