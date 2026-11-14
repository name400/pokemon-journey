import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu,combatView} from '../lib/party-battle.mjs';
import {createMission10DoubleSnapshot,playMission10MultiTurn,mission10MultiView} from '../lib/cloud-adventure/adventure-mission10-double.mjs';
import {createMission37TripleSnapshot,playMission37TriplePrototype,mission37TripleView} from '../lib/cloud-adventure/adventure-mission37-triple.mjs';
const mon=(id,boxId,moves)=>({...makeMon(id,50),boxId,moves,pp:{}});
const flags=c=>({...c,adventurePlusGaugeV1:{charge:1,max:3},adventurePlusStatusV1:true,adventurePlusWishV1:true,disableCpuTera:true});

test('Wish waits one turn and preserves old battle healing',()=>{
 const player={...mon(133,'p',['희망사항','튀어오르기']),hp:20,adventurePlusMastered:['wish']},foe=mon(143,'foe',['튀어오르기']),old={...createCombat([player],[foe]),adventurePlusGaugeV1:{charge:1,max:3},adventurePlusStatusV1:true,disableCpuTera:true},fresh={...old,adventurePlusWishV1:true};
 assert.equal(combatView(fresh).requests[0].moves[0].plusReady,true);assert.equal(combatView(old).requests[0].moves[0].plusReady,false);assert.throws(()=>playCpu(old,{type:'move',move:'희망사항',plus:true}));
 for(const [state,plus,rate] of [[old,false,5],[fresh,false,3],[fresh,true,4]]){
  let next=playCpu(state,{type:'move',move:'희망사항',...(plus?{plus:true}:{})});assert.equal(next.teams[0][0].hp,20);assert.equal(next.snapshot.sides[0].slotConditions[0].wish.hp,Math.floor(player.maxHp*rate/10));next=playCpu(JSON.parse(JSON.stringify(next)),{type:'move',move:'튀어오르기'});assert.equal(next.teams[0][0].hp,20+Math.floor(player.maxHp*rate/10));
 }
});

test('Wish Plus heals the replacement in the same slot after reconnect',()=>{
 const p={...mon(133,'p',['희망사항']),hp:20,adventurePlusMastered:['wish']},backup={...mon(143,'backup',['튀어오르기']),hp:30},foe=mon(143,'foe',['튀어오르기']);let c=flags(createCombat([p,backup],[foe]));c=playCpu(c,{type:'move',move:'희망사항',plus:true});assert.equal(c.adventurePlusGaugeV1.charge,0);c=playCpu(JSON.parse(JSON.stringify(c)),{type:'switch',slot:2});assert.equal(c.teams[0][1].hp,30+Math.floor(p.maxHp*4/10));assert.equal(c.teams[0][0].hp,20);
});

test('Wish Plus is owned and retained through multi and triple snapshots',()=>{
 const p={...mon(133,'p',['희망사항','튀어오르기']),hp:20,adventurePlusMastered:['wish']},ally=mon(25,'ally',['튀어오르기']),ally2=mon(25,'ally2',['튀어오르기']),foes=[mon(143,'e1',['튀어오르기']),mon(143,'e2',['튀어오르기']),mon(143,'e3',['튀어오르기'])];
 for(const [snapshot,view,play] of [[flags(createMission10DoubleSnapshot([p],[ally],foes.slice(0,2))),mission10MultiView,playMission10MultiTurn],[flags(createMission37TripleSnapshot([p],[ally],[ally2],foes)),mission37TripleView,playMission37TriplePrototype]]){
  assert.equal(view(snapshot).requests[0].actors[0].moves.find(m=>m.id==='wish').plusReady,true);let next=play(snapshot,{type:'move',move:'wish',plus:true});assert.equal(next.teams[0][0].hp,20);assert.equal(next.adventurePlusGaugeV1.charge,0);next=play(JSON.parse(JSON.stringify(next)),{type:'move',move:'splash'});assert.equal(next.teams[0][0].hp,20+Math.floor(p.maxHp*4/10));assert.deepEqual(next.owners,snapshot.owners);
 }
});

test('Mega Wish uses the Plus amount and failed repeated Wish keeps the original',()=>{
 const p={...mon(282,'p',['희망사항','튀어오르기']),hp:20,item:'gardevoirite'},foe=mon(143,'foe',['튀어오르기']);let mega={...flags(createCombat([p],[foe])),adventurePlusGaugeV1:{charge:3,max:3}};mega=playCpu(mega,{type:'move',move:'희망사항',special:'mega'});assert.equal(mega.teams[0][0].mega,true);assert.equal(mega.snapshot.sides[0].slotConditions[0].wish.hp,Math.floor(p.maxHp*4/10));mega=playCpu(JSON.parse(JSON.stringify(mega)),{type:'move',move:'튀어오르기'});assert.equal(mega.teams[0][0].hp,20+Math.floor(p.maxHp*4/10));
 const mastered={...p,item:'',adventurePlusMastered:['wish']};let c=flags(createCombat([mastered],[foe]));c=playCpu(c,{type:'move',move:'희망사항'});c=playCpu(JSON.parse(JSON.stringify(c)),{type:'move',move:'희망사항',plus:true});assert.equal(c.teams[0][0].hp,20+Math.floor(p.maxHp*3/10));
});
