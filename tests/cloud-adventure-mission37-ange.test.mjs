import test from 'node:test';
import assert from 'node:assert/strict';
import {mission37AngeProgress,mission37RecordFlowers,mission37RecordZygarde} from '../lib/cloud-adventure/adventure-mission37-ange.mjs';

test('flower and Zygarde damage progresses once per phase and survives reload',()=>{
 let s={zaMission37FinalPhase:0};
 for(const [phase,start,afterFlowers,afterAttack] of [[0,100,90,70],[2,70,60,40],[4,40,30,0]]){
  assert.equal(mission37AngeProgress(s).hp,start);
  assert.deepEqual(mission37RecordFlowers(s,[{boxId:'ange-red',hp:0},{boxId:'ange-blue',hp:10}]),['ange-red']);
  s=JSON.parse(JSON.stringify(s));assert.equal(mission37AngeProgress(s).hp,start-5);
  assert.deepEqual(mission37RecordFlowers(s,[{boxId:'ange-red',hp:0}]),[]);assert.equal(mission37AngeProgress(s).hp,start-5);
  assert.deepEqual(mission37RecordFlowers(s,[{boxId:'ange-red',hp:0},{boxId:'ange-blue',hp:0}]),['ange-blue']);assert.equal(mission37AngeProgress(s).hp,afterFlowers);
  s.zaMission37FinalPhase=phase+1;assert.equal(mission37AngeProgress(s).hp,afterFlowers);assert.equal(mission37RecordZygarde(s),afterAttack);s.zaMission37FinalPhase++;assert.equal(mission37AngeProgress(s).hp,afterAttack);
 }
});

test('legacy and malformed checkpoints derive safely from the saved phase',()=>{
 for(const [phase,hp] of [[0,100],[1,90],[2,70],[3,60],[4,40],[5,30],[6,0],[7,0]])assert.equal(mission37AngeProgress({zaMission37FinalPhase:phase}).hp,hp);
 const s={zaMission37FinalPhase:2,zaMission37AngeV1:{phase:2,hp:0,flowers:['ange-red','ange-red']}};assert.equal(mission37AngeProgress(s).hp,70);assert.equal(mission37RecordZygarde(s),null);
});
