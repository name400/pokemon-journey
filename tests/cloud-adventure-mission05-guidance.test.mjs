import test from 'node:test';
import assert from 'node:assert/strict';
import {royaleDialogue,joseeAction} from '../lib/cloud-adventure/adventure-royale.mjs';

test('rank Y reception directs each unfinished main-story step without changing progress',()=>{
 const cases=[
  [{zaMission05Stage:1},/호텔 Z 로비/],
  [{zaMission05Stage:2},/옥상에서 동료/],
  [{zaMission05Stage:3},/메가결정을 부수/],
  [{zaMission05Stage:4},/야생 구역 2/],
  [{zaMission05Stage:5,zaMission05CafePending:true},/누보 카페/],
  [{zaMission05Stage:5,zaMission05CafePending:false},/야생 구역 3.*Josée/],
  [{},/야생 구역 3.*Josée/],
 ];
 for(const [phase,expected] of cases){
  const state={zaRoyaleRank:'Y',zaJoseeRequired:true,zaJoseeComplete:false,...phase,zaUnknownProgress:{preserve:true}},before=structuredClone(state);
  const dialogue=royaleDialogue(state);assert.match(dialogue.text,expected);assert.doesNotMatch(dialogue.text,/준비 중/);assert.equal(dialogue.action,undefined);
  assert.equal(Boolean(joseeAction(state)),!state.zaMission05CafePending&&!(state.zaMission05Stage>=1&&state.zaMission05Stage<5));
  assert.deepEqual(state,before);
 }
});

test('completed Josée battle retains the Emma gate and later Royale access',()=>{
 const state={zaRoyaleRank:'Y',zaJoseeRequired:false,zaJoseeComplete:true,zaMission05Stage:7,zaEmmaMegaSeen:false};
 assert.match(royaleDialogue(state).text,/Emma/);assert.equal(royaleDialogue(state).action,undefined);
 assert.equal(royaleDialogue({...state,zaMission05Stage:8,zaEmmaMegaSeen:true}).action,'enterRoyaleZone');
});
