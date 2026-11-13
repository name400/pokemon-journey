import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createMission10DoubleSnapshot,createSoloMultiFoeSnapshot,mission10MultiView,playMission10MultiTurn} from '../lib/cloud-adventure/adventure-mission10-double.mjs';

const mon=(id,level,boxId,moves)=>({...makeMon(id,level),boxId,moves,pp:{}});

test('four-sided turns expose move, hit and previous HP with the correct visual slots',()=>{
 const a=mon(25,40,'player',['몸통박치기']),b=mon(25,40,'ally',['몸통박치기']),c=mon(25,40,'foe-1',['몸통박치기']),d=mon(25,40,'foe-2',['몸통박치기']);
 const start=createMission10DoubleSnapshot([a],[b],[c,d]);
 const next=playMission10MultiTurn(start,{type:'move',move:'tackle',target:1}),view=mission10MultiView(next);
 assert.deepEqual(view.beforeActiveBySide,[[0,1],[0,1]]);
 for(const id of ['player','ally','foe-1','foe-2'])assert.ok(view.events.some(event=>event.kind==='move'&&event.actorBoxId===id),id);
 const running=new Map(view.before.flat().map(p=>[p.boxId,p.hp]));
 for(const event of view.events.filter(e=>e.kind==='damage')){
  assert.equal(event.beforeHp,running.get(event.targetBoxId));running.set(event.targetBoxId,event.hp);
  assert.equal(event.activeSlot,['ally','foe-2'].includes(event.targetBoxId)?1:0);
 }
 for(const [id,hp] of running)assert.equal(view.teams.flat().find(p=>p.boxId===id).hp,hp,id);
 assert.deepEqual(mission10MultiView(JSON.parse(JSON.stringify(next))).events,view.events);
});

test('spread attacks and a terminal hit retain both opposing targets',()=>{
 const player=mon(150,100,'player',['스피드스타']),foes=[mon(129,1,'one',['튀어오르기']),mon(129,1,'two',['튀어오르기'])];
 const start=createSoloMultiFoeSnapshot([player],foes),next=playMission10MultiTurn(start,{type:'move',move:'swift'}),view=mission10MultiView(next);
 assert.equal(view.ended,true);assert.equal(view.winner,0);
 const damage=view.events.filter(e=>e.kind==='damage'&&e.actorBoxId==='player');
 assert.deepEqual(new Set(damage.map(e=>e.targetBoxId)),new Set(['one','two']));
 assert.deepEqual(new Set(damage.map(e=>e.activeSlot)),new Set([0,1]));
 assert.deepEqual(new Set(view.events.filter(e=>e.kind==='faint').map(e=>e.targetBoxId)),new Set(['one','two']));
});

test('a spread attack also identifies friendly fire on the companion',()=>{
 const player=mon(120,30,'player',['파도타기']),ally=mon(25,70,'ally',['튀어오르기']),foes=[mon(25,70,'one',['튀어오르기']),mon(25,70,'two',['튀어오르기'])];
 const next=playMission10MultiTurn(createMission10DoubleSnapshot([player],[ally],foes),{type:'move',move:'surf'});
 const hit=next.events.find(e=>e.kind==='damage'&&e.actorBoxId==='player'&&e.targetBoxId==='ally');
 assert.ok(hit);assert.equal(hit.targetSide,0);assert.equal(hit.activeSlot,1);assert.equal(hit.hit,true);
});

test('a player switch keeps the outgoing active in the before view and supplies the switch event',()=>{
 const lead=mon(25,40,'lead',['몸통박치기']),reserve=mon(25,40,'reserve',['몸통박치기']),ally=mon(25,40,'ally',['몸통박치기']),foes=[mon(25,40,'one',['몸통박치기']),mon(25,40,'two',['몸통박치기'])];
 const next=playMission10MultiTurn(createMission10DoubleSnapshot([lead,reserve],[ally],foes),{type:'switch',slot:2}),view=mission10MultiView(next);
 assert.equal(view.before[0][view.beforeActiveBySide[0][0]].boxId,'lead');
 assert.equal(view.teams[0][view.activeBySide[0][0]].boxId,'reserve');
 assert.ok(view.events.some(e=>e.kind==='switch'&&e.targetBoxId==='reserve'&&e.activeSlot===0));
});
