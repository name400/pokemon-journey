import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';
import {createMission10DoubleSnapshot,playMission10MultiTurn} from '../lib/cloud-adventure/adventure-mission10-double.mjs';
import {createMission37TripleSnapshot,playMission37TriplePrototype} from '../lib/cloud-adventure/adventure-mission37-triple.mjs';
const mon=(id,boxId,move,level=50)=>({...makeMon(id,level),boxId,moves:[move],pp:{}});
test('Plus uses the actual move effectiveness for each battle format, preserving old snapshots',()=>{
 const player={...mon(362,'player','프리즈드라이'),adventurePlusMastered:['freezedry']},ally=mon(25,'ally','튀어오르기'),ally2=mon(25,'ally2','튀어오르기'),foes=[mon(79,'foe1','튀어오르기',80),mon(79,'foe2','튀어오르기',80),mon(79,'foe3','튀어오르기',80)];
 for(const [base,play,command,foeIndex] of [
  [createCombat([player],foes.slice(0,1)),playCpu,{type:'move',move:'프리즈드라이',plus:true},1],
  [createMission10DoubleSnapshot([player],[ally],foes.slice(0,2)),playMission10MultiTurn,{type:'move',move:'freezedry',target:1,plus:true},1],
  [createMission37TripleSnapshot([player],[ally],[ally2],foes),playMission37TriplePrototype,{type:'move',move:'freezedry',target:1,plus:true},1],
 ]){
  const old={...base,adventurePlusGaugeV1:{charge:1,max:3},disableCpuTera:true};old.snapshot.prng='1,2,3,4';const fresh={...old,adventurePlusEffectivenessV1:true};
  const legacy=play(old,command),next=play(JSON.parse(JSON.stringify(fresh)),command);
  const find=c=>c.teams.flat().find(m=>m.boxId==='foe1');const oldLoss=foes[0].hp-find(legacy).hp,newLoss=foes[0].hp-find(next).hp;
  assert.ok(newLoss>oldLoss,`${oldLoss} -> ${newLoss}`);assert.equal(next.adventurePlusGaugeV1.charge,0);assert.equal(JSON.parse(JSON.stringify(next)).adventurePlusEffectivenessV1,true);assert.equal(legacy.adventurePlusEffectivenessV1,undefined);
 }
});
