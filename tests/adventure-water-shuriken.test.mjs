import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';
import {createMission10DoubleSnapshot,playMission10MultiTurn} from '../lib/cloud-adventure/adventure-mission10-double.mjs';
import {createMission37TripleSnapshot,playMission37TriplePrototype} from '../lib/cloud-adventure/adventure-mission37-triple.mjs';
import {installAdventurePlusStatus} from '../lib/cloud-adventure/adventure-plus-status.mjs';
const mon=(id,boxId,move)=>({...makeMon(id,50),boxId,moves:[move],pp:{}});
const player=()=>({...mon(658,'player','물수리검'),adventurePlusMastered:['watershuriken']});
const flags=c=>({...c,adventurePlusGaugeV1:{charge:1,max:3},adventurePlusStatusV1:true,adventureWaterShurikenV1:true,disableCpuTera:true});
const damageCount=c=>c.events.filter(e=>e.kind==='damage'&&e.side===1).length;

test('move power is set for normal, Plus and Mega users only in new battles',()=>{
 let modify;const p1={},battle={format:{},p1,onEvent(_name,_format,_options,fn){modify=fn;}};
 installAdventurePlusStatus(battle,true,'player','watershuriken',true,true,true,true);
 const move=()=>({id:'watershuriken',basePower:15,multihit:[2,5],basePowerCallback(){return 15;}});
 const normal=move();modify.call(battle,normal,{side:p1,set:{trainerToken:'other'},species:{}});assert.equal(normal.multihit,5);assert.equal(normal.basePower,15);
 const plus=move();modify.call(battle,plus,{side:p1,set:{trainerToken:'player'},species:{}});assert.equal(plus.multihit,undefined);assert.equal(plus.basePower,75);assert.equal(plus.basePowerCallback,undefined);
 const mega=move();modify.call(battle,mega,{side:{},set:{},species:{isMega:true}});assert.equal(mega.multihit,undefined);assert.equal(mega.basePower,75);
 installAdventurePlusStatus(battle,true,'player','watershuriken',true,true,true,false);const old=move();modify.call(battle,old,{side:p1,set:{trainerToken:'player'},species:{}});assert.deepEqual(old.multihit,[2,5]);assert.equal(old.basePower,15);
});

test('new Water Shuriken uses five normal hits and one Plus hit while old battles are unchanged',()=>{
 const p=player(),enemy=mon(143,'enemy','튀어오르기'),fresh=flags(createCombat([p],[enemy]));fresh.snapshot.prng='1,2,3,4';
 const old={...structuredClone(fresh),adventureWaterShurikenV1:false};
 const normal=playCpu(fresh,{type:'move',move:'물수리검'}),plus=playCpu(fresh,{type:'move',move:'물수리검',plus:true}),legacy=playCpu(old,{type:'move',move:'물수리검',plus:true});
 assert.equal(damageCount(normal),5);assert.equal(damageCount(plus),1);assert.ok(damageCount(legacy)>1);assert.equal(plus.adventurePlusGaugeV1.charge,0);
 assert.equal(JSON.parse(JSON.stringify(plus)).adventureWaterShurikenV1,true);assert.equal(JSON.parse(JSON.stringify(plus)).teams[1][0].hp,plus.teams[1][0].hp);
});

test('Water Shuriken Plus targets an opponent once in companion and three-ally battles',()=>{
 const p=player(),a=mon(143,'ally','튀어오르기'),b=mon(143,'ally2','튀어오르기'),foes=[1,2,3].map(i=>mon(143,`foe${i}`,'튀어오르기'));
 for(const [combat,play] of [[createMission10DoubleSnapshot([p],[a],foes.slice(0,2)),playMission10MultiTurn],[createMission37TripleSnapshot([p],[a],[b],foes),playMission37TriplePrototype]]){
  const c=flags(combat);c.snapshot.prng='1,2,3,4';const out=play(c,{type:'move',move:'watershuriken',target:1,plus:true});
  assert.equal(damageCount(out),1);assert.equal(out.adventurePlusGaugeV1.charge,0);assert.equal(JSON.parse(JSON.stringify(out)).adventureWaterShurikenV1,true);
 }
});
