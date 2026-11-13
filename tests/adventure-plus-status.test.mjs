import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu,combatView} from '../lib/party-battle.mjs';
import {createMission10DoubleSnapshot,playMission10MultiTurn,mission10MultiView} from '../lib/cloud-adventure/adventure-mission10-double.mjs';
import {createMission37TripleSnapshot,playMission37TriplePrototype,mission37TripleView} from '../lib/cloud-adventure/adventure-mission37-triple.mjs';
const mon=(id,boxId,move)=>({...makeMon(id,50),boxId,moves:[move],pp:{}});
const withFlags=c=>({...c,adventurePlusGaugeV1:{charge:1,max:3},adventurePlusStatusV1:true,disableCpuTera:true});

test('Recover Plus heals 40% instead of 30%, with old snapshots retaining half HP',()=>{
 const player={...mon(137,'player','HP회복'),adventurePlusMastered:['recover']};player.hp=20;const foe=mon(143,'foe','튀어오르기'),old=createCombat([player],[foe]),fresh=withFlags(old),req=combatView(fresh).requests[0];
 assert.equal(req.moves[0].plusReady,true);assert.match(req.moves[0].description,/30%.*40%/);assert.throws(()=>playCpu(old,{type:'move',move:'HP회복',plus:true}));
 const ordinary=playCpu(fresh,{type:'move',move:'HP회복'}),plus=playCpu(fresh,{type:'move',move:'HP회복',plus:true}),legacy=playCpu(old,{type:'move',move:'HP회복'}),max=plus.teams[0][0].maxHp;
 assert.equal(ordinary.teams[0][0].hp-20,Math.floor(max*3/10));assert.equal(plus.teams[0][0].hp-20,Math.floor(max*2/5));assert.equal(legacy.teams[0][0].hp-20,Math.floor(max/2));assert.equal(plus.adventurePlusGaugeV1.charge,0);assert.equal(ordinary.adventurePlusGaugeV1.charge,2);
 const loaded=JSON.parse(JSON.stringify(plus));assert.throws(()=>playCpu(loaded,{type:'move',move:'HP회복',plus:true}));assert.equal(combatView(loaded).adventurePlusGauge.charge,0);
});

test('Recover Plus is restricted to owned mastered moves in multi and triple',()=>{
 const player={...mon(137,'player','HP회복'),adventurePlusMastered:['recover']};player.hp=20;const ally=mon(25,'ally','튀어오르기'),ally2=mon(25,'ally2','튀어오르기'),foes=[mon(143,'foe1','튀어오르기'),mon(143,'foe2','튀어오르기'),mon(143,'foe3','튀어오르기')];
 for(const [snapshot,view,play] of [[withFlags(createMission10DoubleSnapshot([player],[ally],foes.slice(0,2))),mission10MultiView,playMission10MultiTurn],[withFlags(createMission37TripleSnapshot([player],[ally],[ally2],foes)),mission37TripleView,playMission37TriplePrototype]]){
  const req=view(snapshot).requests[0].actors[0];assert.equal(req.moves.find(m=>m.id==='recover').plusReady,true);const ordinary=play(snapshot,{type:'move',move:'recover'}),plus=play(snapshot,{type:'move',move:'recover',plus:true});
  const own=p=>p.teams[0].find(m=>m.boxId==='player');assert.equal(own(ordinary).hp-20,Math.floor(own(ordinary).maxHp*3/10));assert.equal(own(plus).hp-20,Math.floor(own(plus).maxHp*2/5));assert.equal(plus.adventurePlusGaugeV1.charge,0);assert.deepEqual(plus.owners,snapshot.owners);assert.throws(()=>play(JSON.parse(JSON.stringify(plus)),{type:'move',move:'recover',plus:true}));
  const next=play(JSON.parse(JSON.stringify(plus)),{type:'move',move:'recover'});assert.equal(own(next).hp-own(plus).hp,Math.floor(own(next).maxHp*3/10));assert.equal(next.adventurePlusGaugeV1.charge,1);assert.equal(next.snapshot.events,null);
 }
});

test('Recover requires mastery and an opted-in snapshot; Mega applies its Plus effect',()=>{
 const player={...mon(65,'mega','HP회복'),item:'alakazite'};player.hp=20;const foe=mon(143,'foe','튀어오르기'),legacy=createCombat([player],[foe]),fresh={...withFlags(legacy),adventurePlusGaugeV1:{charge:3,max:3}};
 assert.throws(()=>playCpu(fresh,{type:'move',move:'HP회복',plus:true}));assert.throws(()=>playCpu({...legacy,adventurePlusGaugeV1:{charge:1,max:3},teams:[[ {...legacy.teams[0][0],adventurePlusMastered:['recover']} ],legacy.teams[1]]},{type:'move',move:'HP회복',plus:true}));
 const result=playCpu(fresh,{type:'move',move:'HP회복',special:'mega'}),max=result.teams[0][0].maxHp;assert.equal(result.teams[0][0].mega,true);assert.equal(result.teams[0][0].hp-20,Math.floor(max*2/5));assert.equal(result.adventurePlusGaugeV1.charge,0);
});
