import test from 'node:test';
import assert from 'node:assert/strict';
import {Battle} from '@pkmn/sim';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu,combatView} from '../lib/party-battle.mjs';
import {createMission10DoubleSnapshot,playMission10MultiTurn,mission10MultiView} from '../lib/cloud-adventure/adventure-mission10-double.mjs';
import {createMission37TripleSnapshot,playMission37TriplePrototype,mission37TripleView,restoreMission37TripleSnapshot} from '../lib/cloud-adventure/adventure-mission37-triple.mjs';
const mon=(id,boxId,moves)=>({...makeMon(id,50),boxId,moves,pp:{}});
const flags=c=>({...c,adventurePlusGaugeV1:{charge:1,max:3},adventurePlusStatusV1:true,adventurePlusStatusV2:true,adventurePlusStatusV3:true,disableCpuTera:true});

test('Conversion Plus changes type and adds one defense stage only in newly started battles',()=>{
 const p={...mon(137,'p',['전기쇼크','텍스처']),adventurePlusMastered:['conversion']},foe=mon(143,'foe',['튀어오르기']),legacy=flags(createCombat([p],[foe]));delete legacy.adventurePlusStatusV3;const fresh={...legacy,adventurePlusStatusV3:true};
 assert.equal(combatView(legacy).requests[0].moves.find(m=>m.id==='conversion').plusReady,false);assert.throws(()=>playCpu(legacy,{type:'move',move:'텍스처',plus:true}));assert.match(combatView(fresh).requests[0].moves.find(m=>m.id==='conversion').description,/1랭크.*근사/);
 const normal=playCpu(fresh,{type:'move',move:'텍스처'}),plus=playCpu(fresh,{type:'move',move:'텍스처',plus:true}),b=Battle.fromJSON(plus.snapshot);assert.deepEqual(normal.teams[0][0].currentTypes,['전기']);assert.deepEqual(plus.teams[0][0].currentTypes,['전기']);assert.equal(Battle.fromJSON(normal.snapshot).p1.active[0].boosts.def,0);assert.equal(b.p1.active[0].boosts.def,1);assert.equal(plus.adventurePlusGaugeV1.charge,0);
 const loaded=JSON.parse(JSON.stringify(plus)),again=playCpu(loaded,{type:'move',move:'텍스처'});assert.equal(Battle.fromJSON(again.snapshot).p1.active[0].boosts.def,1);
});

test('Conversion Plus respects ownership, failure, and reconnect in multi and triple',()=>{
 const p={...mon(137,'p',['전기쇼크','텍스처']),adventurePlusMastered:['conversion']},a=mon(25,'a',['튀어오르기']),b=mon(25,'b',['튀어오르기']),foes=[mon(143,'e1',['튀어오르기']),mon(143,'e2',['튀어오르기']),mon(143,'e3',['튀어오르기'])];
 for(const [start,view,play,restore] of [[flags(createMission10DoubleSnapshot([p],[a],foes.slice(0,2))),mission10MultiView,playMission10MultiTurn,c=>Battle.fromJSON(c.snapshot)],[flags(createMission37TripleSnapshot([p],[a],[b],foes)),mission37TripleView,playMission37TriplePrototype,restoreMission37TripleSnapshot]]){
  const move=view(start).requests[0].actors[0].moves.find(m=>m.id==='conversion');assert.equal(move.plusReady,true);const result=play(start,{type:'move',move:'conversion',plus:true});assert.equal(result.adventurePlusGaugeV1.charge,0);const sim=restore(JSON.parse(JSON.stringify(result)));assert.equal(sim.p1.active[0].boosts.def,1);assert.equal(sim.p1.active[1]?.boosts.def||0,0);assert.deepEqual(result.owners,start.owners);assert.equal(view(result).adventurePlusGauge.charge,0);
 }
 const sameType={...p,moves:['몸통박치기','텍스처']},fight=flags(createCombat([sameType],[foes[0]])),result=playCpu(fight,{type:'move',move:'텍스처',plus:true});assert.equal(Battle.fromJSON(result.snapshot).p1.active[0].boosts.def,0);
});

test('verified Conversion natural mastery and automatic Mega bonus',async()=>{
 const {adventureMoveMastered}=await import('../lib/cloud-adventure/adventure-plus-mastery.mjs');for(const id of [137,233,474,352]){assert.equal(adventureMoveMastered({...makeMon(id,9)},'conversion'),false);assert.equal(adventureMoveMastered({...makeMon(id,10)},'conversion'),true);}
 const player={...mon(65,'mega',['전기쇼크','텍스처']),item:'alakazite'},foe=mon(143,'foe',['튀어오르기']),start={...flags(createCombat([player],[foe])),adventurePlusGaugeV1:{charge:3,max:3}},result=playCpu(start,{type:'move',move:'텍스처',special:'mega'});assert.equal(result.teams[0][0].mega,true);assert.equal(Battle.fromJSON(result.snapshot).p1.active[0].boosts.def,1);assert.equal(result.adventurePlusGaugeV1.charge,0);
});
