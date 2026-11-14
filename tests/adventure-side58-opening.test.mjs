import test from 'node:test';import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';import {createCombat,playCpu} from '../lib/party-battle.mjs';
const mon=(species,level,boxId,moves)=>({...makeMon(species,level),boxId,moves});
test('new Claire battle opens with a legal Detect for each opponent and preserves old battles',()=>{
 const hero=mon(150,100,'hero',['튀어오르기','사이코브레이크']),foes=[447,67,308].map((n,i)=>mon(n,5,`foe${i}`,['판별','박치기']));
 let c=createCombat([hero],foes),legacy=structuredClone(c);c.cpuOpeningMoveV1='detect';
 for(let i=0;i<3;i++){
  c=playCpu(JSON.parse(JSON.stringify(c)),{type:'move',move:i===0?'사이코브레이크':'튀어오르기'});assert.equal(c.events.find(e=>e.kind==='move'&&e.side===1)?.moveId,'detect');
  if(i===0)assert.equal(c.teams[1][0].hp,foes[0].hp);
  if(i<2)c=playCpu(JSON.parse(JSON.stringify(c)),{type:'move',move:'사이코브레이크'});
 }
 legacy=playCpu(legacy,{type:'move',move:'튀어오르기'});assert.notEqual(legacy.events.find(e=>e.kind==='move'&&e.side===1)?.moveId,'detect');
});
test('disabled Detect uses ordinary AI and never selects an illegal move',()=>{
 const hero=mon(150,100,'hero',['튀어오르기']),foe=mon(447,5,'foe',['판별','박치기']);foe.pp={detect:0};let c=createCombat([hero],[foe]);c.cpuOpeningMoveV1='detect';c=playCpu(c,{type:'move',move:'튀어오르기'});assert.equal(c.events.find(e=>e.kind==='move'&&e.side===1)?.moveId,'headbutt');
});
