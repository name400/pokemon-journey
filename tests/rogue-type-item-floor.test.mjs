import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture(rule,count=1){
 const hero=makeReferenceMon(151,50,{boxId:'hero',moves:['Struggle']}),foe=makeReferenceMon(143,100,{boxId:'foe',moves:['Splash']});
 const run={id:'type-item-floor',wave:20,rng:42,party:[hero],modifiers:count?[{id:'silkscarf',typeBoost:'Normal',boxId:'hero',count}]:[],tools:{},encounter:{kind:'trainer'},...(rule?{typeItemRule:rule}:{})};
 run.combat=createClassicCombat(run,[foe],{trainer:true});return run;
}
test('new source rule floors each type item boost and keeps legacy calculation',async()=>{
 for(const rule of ['source-v2',null])for(const count of [1,2,3]){
  const data=await decodeGameData(await encodeGameData({run:fixture(rule,count),other:{keep:true}}));
  const b=restoreClassicNativeBattle(data.run.combat,data.run),hero=b.p1.active[0],foe=b.p2.active[0],move=b.dex.moves.get('tackle');
  for(const power of [13,17,23,29]){const actual=b.runEvent('BasePower',hero,foe,move,power);if(rule)assert.equal(actual,Math.floor(power*(1+.2*count)),`${count}:${power}`);else if(count===1&&power===13)assert.equal(actual,16);}
  assert.deepEqual(data.other,{keep:true});
 }
});
test('typeless Struggle receives no type item boost',()=>{
 for(const rule of ['source-v2',null]){
  const run=fixture(rule,3),b=restoreClassicNativeBattle(run.combat,run),hero=b.p1.active[0],foe=b.p2.active[0],move=b.dex.moves.get('struggle');
  assert.equal(b.runEvent('BasePower',hero,foe,move,50),rule?50:80);
 }
});
test('actual Struggle damage is unchanged by type items',()=>{
 const damages=[];for(const count of [0,3]){const run=fixture('source-v2',count),b=restoreClassicNativeBattle(run.combat,run),before=b.p2.active[0].hp;b.makeChoices('move struggle','move splash');damages.push(before-b.p2.pokemon[0].hp);}
 assert.ok(damages[0]>0);assert.equal(damages[1],damages[0]);
});
test('item rounding composes with the fog Solar Beam reduction',()=>{
 const run=fixture('source-v2',1);run.modifiers[0].typeBoost=run.combat.modifiers[0].typeBoost='Grass';const b=restoreClassicNativeBattle(run.combat,run),hero=b.p1.active[0],foe=b.p2.active[0];b.rogueFog=true;
 assert.equal(b.runEvent('BasePower',hero,foe,b.dex.moves.get('solarbeam'),23),13);
});
test('source rule survives without the parent run and leaves unrelated types alone',()=>{
 const run=fixture('source-v2',3),b=restoreClassicNativeBattle(run.combat),hero=b.p1.active[0],foe=b.p2.active[0];
 assert.equal(run.combat.typeItemRule,'source-v2');assert.equal(b.runEvent('BasePower',hero,foe,b.dex.moves.get('ember'),13),13);
 assert.equal(b.runEvent('BasePower',hero,foe,b.dex.moves.get('tackle'),13),Math.floor(13*1.6));
});
test('new game receives the rule while a second slot remains intact',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs');
 const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};
 const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'type-item-v2',seed:'type-item-v2'});
 assert.equal(run.typeItemRule,'source-v2');assert.deepEqual(state.slots[1],{keep:true});
});
