import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu,combatView} from '../lib/party-battle.mjs';
import {createMission10DoubleSnapshot,playMission10MultiTurn,mission10MultiView} from '../lib/cloud-adventure/adventure-mission10-double.mjs';
import {createMission37TripleSnapshot,playMission37TriplePrototype,mission37TripleView} from '../lib/cloud-adventure/adventure-mission37-triple.mjs';
const mon=(id,boxId,move,level=50)=>({...makeMon(id,level),boxId,moves:[move],pp:{}});
const flags=c=>({...c,adventurePlusGaugeV1:{charge:1,max:3},adventurePlusProtectV1:true,disableCpuTera:true});

test('Plus attacks pass through Protect and Detect at a quarter of boosted damage, old saves remain blocked',()=>{
 for(const defense of ['방어','판별']){
  const p={...mon(1,'p','몸통박치기'),adventurePlusMastered:['tackle']},foe=mon(143,'foe',defense,80),old={...createCombat([p],[foe]),adventurePlusGaugeV1:{charge:1,max:3},disableCpuTera:true},fresh={...old,adventurePlusProtectV1:true};old.snapshot.prng='1,2,3,4';const normal=playCpu(fresh,{type:'move',move:'몸통박치기'}),plus=playCpu(fresh,{type:'move',move:'몸통박치기',plus:true}),legacy=playCpu(old,{type:'move',move:'몸통박치기',plus:true});
  assert.equal(normal.teams[1][0].hp,foe.hp);assert.equal(legacy.teams[1][0].hp,foe.hp);const loss=foe.hp-plus.teams[1][0].hp;assert.ok(loss>0);assert.equal(plus.adventurePlusGaugeV1.charge,0);assert.ok(plus.events.some(e=>e.kind==='damage'&&e.targetBoxId==='foe'));assert.equal(combatView(JSON.parse(JSON.stringify(plus))).adventurePlusProtectV1,true);
  const open=flags(createCombat([p],[{...foe,moves:['튀어오르기']} ]));open.snapshot.prng='1,2,3,4';const full=playCpu(open,{type:'move',move:'몸통박치기',plus:true}),fullLoss=foe.hp-full.teams[1][0].hp;assert.ok(Math.abs(loss/fullLoss-.25)<.08,`${defense}: ${loss}/${fullLoss}`);
 }
});

test('Plus cannot bypass type immunity or unrelated King’s Shield',()=>{
 const p={...mon(1,'p','몸통박치기'),adventurePlusMastered:['tackle']},ghost=mon(92,'ghost','방어',80),guard=mon(681,'guard','킹실드',80);
 for(const foe of [ghost,guard]){const c=flags(createCombat([p],[foe]));const result=playCpu(c,{type:'move',move:'몸통박치기',plus:true});assert.equal(result.teams[1][0].hp,foe.hp);}
});

test('Plus attacks reach a protected selected target in multi and triple without weakening the other',()=>{
 const p={...mon(1,'p','몸통박치기'),adventurePlusMastered:['tackle']},ally=mon(25,'a','튀어오르기'),ally2=mon(25,'b','튀어오르기'),foes=[mon(143,'e1','방어',80),mon(143,'e2','방어',80),mon(143,'e3','방어',80)];
 for(const [combat,view,play,indices] of [[flags(createMission10DoubleSnapshot([p],[ally],foes.slice(0,2))),mission10MultiView,playMission10MultiTurn,[1,3]],[flags(createMission37TripleSnapshot([p],[ally],[ally2],foes)),mission37TripleView,playMission37TriplePrototype,[1,1]]]){
  combat.snapshot.prng='1,2,3,4';assert.equal(view(combat).adventurePlusProtectV1,true);const next=play(combat,{type:'move',move:'tackle',target:2,plus:true}),v=view(JSON.parse(JSON.stringify(next)));assert.ok(next.teams[indices[1]][indices[1]===1?1:0].hp<foes[1].hp);assert.equal(next.adventurePlusGaugeV1.charge,0);assert.equal(v.adventurePlusProtectV1,true);assert.deepEqual(next.owners,combat.owners);assert.ok(next.events.some(e=>e.kind==='damage'&&e.targetBoxId==='e2'));
 }
});

test('both player and opponent Mega attacks pierce Protect in new battles only',()=>{
 const player={...mon(6,'p','화염방사'),item:'charizarditex'},foe=mon(143,'foe','방어',80),legacy={...createCombat([player],[foe]),adventurePlusGaugeV1:{charge:3,max:3},disableCpuTera:true},fresh={...legacy,adventurePlusProtectV1:true},action={type:'move',move:'화염방사',special:'mega'};
 const blocked=playCpu(legacy,action),pierced=playCpu(fresh,action);assert.equal(blocked.teams[1][0].hp,foe.hp);assert.ok(pierced.teams[1][0].hp<foe.hp);assert.equal(pierced.adventurePlusGaugeV1.charge,0);
 const defender=mon(143,'def','방어',80),opponent={...mon(6,'megafoe','화염방사'),item:'charizarditex'},against=flags(createCombat([defender],[opponent]));const result=playCpu(against,{type:'move',move:'방어'});assert.equal(result.teams[1][0].mega,true);assert.ok(result.teams[0][0].hp<defender.hp);
});
