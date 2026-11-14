import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createCombat,combatView,playCpu} from '../lib/party-battle.mjs';
const mon=(id,boxId,moves)=>({...makeMon(id,50),boxId,moves,pp:{}});
const value=(c,id)=>combatView(c).requests[0].moves.find(m=>m.id===id)?.effectiveness;
test('battle type preview handles move-specific effectiveness without mutating saves',()=>{
 const player=mon(362,'player',['프리즈드라이','냉동빔','웨더볼']);
 const foe=mon(79,'foe',['튀어오르기']);const c=createCombat([player],[foe]);const snapshot=JSON.stringify(c.snapshot);
 assert.equal(value(c,'freezedry'),2);assert.equal(value(c,'icebeam'),.5);assert.equal(value(c,'weatherball'),null);
 assert.equal(JSON.stringify(c.snapshot),snapshot);const restored=JSON.parse(JSON.stringify(c));assert.equal(value(restored,'freezedry'),2);
 const next=playCpu(restored,{type:'move',move:'프리즈드라이'});assert.ok(next.teams[1][0].hp<foe.hp);
 const ghost=createCombat([mon(6,'p',['몸통박치기'])],[mon(92,'g',['튀어오르기'])]);assert.equal(value(ghost,'tackle'),0);
});
test('special dual-type and ground immunity previews match their simulator type rules',()=>{
 const p=mon(701,'p',['플라잉프레스','사우전드애로']);
 const grass=createCombat([p],[mon(152,'g',['튀어오르기'])]);assert.equal(value(grass,'flyingpress'),2);
 const flying=createCombat([p],[mon(16,'f',['튀어오르기'])]);assert.equal(value(flying,'thousandarrows'),1);
});

test('multi and triple show separate opposing type previews without touching stored snapshots',async()=>{
 const {createMission10DoubleSnapshot,mission10MultiView,playMission10MultiTurn}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 const {createMission37TripleSnapshot,mission37TripleView,playMission37TriplePrototype}=await import('../lib/cloud-adventure/adventure-mission37-triple.mjs');
 const p=mon(362,'p',['프리즈드라이','웨더볼']),a=mon(25,'a',['튀어오르기']),b=mon(25,'b',['튀어오르기']),water=mon(79,'water',['튀어오르기']),ice=mon(361,'ice',['튀어오르기']),ghost=mon(92,'ghost',['튀어오르기']);
 for(const [c,view,play] of [[createMission10DoubleSnapshot([p],[a],[water,ice]),mission10MultiView,playMission10MultiTurn],[createMission37TripleSnapshot([p],[a],[b],[water,ice,ghost]),mission37TripleView,playMission37TriplePrototype]]){
  const saved=JSON.stringify(c),v=view(c),moves=v.requests[0].moves,freeze=moves.find(m=>m.id==='freezedry'),weather=moves.find(m=>m.id==='weatherball');
  assert.deepEqual(freeze.effectivenessByTarget.slice(0,2).map(x=>[x.slot,x.multiplier]),[[0,2],[1,.5]]);
  assert.ok(weather.effectivenessByTarget.every(x=>x.multiplier===null));assert.equal(JSON.stringify(c),saved);
  const next=play(JSON.parse(saved),{type:'move',move:'freezedry',target:1});assert.ok(next.teams.flat().find(m=>m.boxId==='water').hp<water.hp);assert.deepEqual(next.owners,c.owners);
 }
});
