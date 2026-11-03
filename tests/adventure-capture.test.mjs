import test from 'node:test';
import assert from 'node:assert/strict';
import {ballMultiplier,captureAttempt,friendshipGain} from '../lib/capture.mjs';

test('adventure ball effects use turn, current type, night and capture origin',()=>{
 assert.equal(ballMultiplier('quickball',{turn:1}),5);
 assert.equal(ballMultiplier('quickball',{turn:2}),1);
 assert.equal(ballMultiplier('timerball',{turn:20}),4);
 assert.equal(ballMultiplier('netball',{types:['물']}),3.5);
 assert.equal(ballMultiplier('duskball',{night:true}),3);
 const mon={hp:50,maxHp:50,captureRate:3,types:['풀'],currentTypes:['물']};
 assert.equal(captureAttempt(mon,'netball',{},()=>.999).multiplier,3.5);
 assert.equal(captureAttempt(mon,'masterball',{},()=>.999).caught,true);
 assert.equal(friendshipGain({friendship:70,originBall:'luxuryball'},15),86);
 assert.equal(friendshipGain({friendship:255,originBall:'luxuryball'},1),255);
});

test('adventure Z-A modifiers and catalog do not change shared rogue rules',async()=>{
 const {ADVENTURE_BALLS,adventureCaptureAttempt}=await import('../lib/adventure-balls.mjs');
 const mon={hp:20,maxHp:20,captureRate:45,types:['풀']};
 const attempt=(ball,count)=>adventureCaptureAttempt(mon,ball,{moveCount:count},()=>.999);
 assert.equal(attempt('quickball',0).multiplier,3);
 assert.equal(attempt('quickball',1).multiplier,1);
 assert.equal(attempt('timerball',10).multiplier,1);
 assert.equal(attempt('timerball',11).multiplier,2);
 assert.equal(attempt('timerball',21).multiplier,3);
 assert.equal(attempt('timerball',31).multiplier,4);
 assert.equal(adventureCaptureAttempt(mon,'pokeball',{},()=>.5).caught,false);
 assert.equal(adventureCaptureAttempt({...mon,status:'독'},'pokeball',{},()=>.5).caught,true);
 assert.equal(adventureCaptureAttempt({...mon,status:'얼음'},'pokeball',{},()=>.52).caught,true);
 assert.equal(adventureCaptureAttempt({...mon,status:'독'},'pokeball',{},()=>.52).caught,false);
 assert.throws(()=>attempt('quickball',undefined),/이전 전투/);
 assert.equal(ADVENTURE_BALLS.find(x=>x.id==='quickball').price,1000);
 assert.equal(ADVENTURE_BALLS.find(x=>x.id==='healball').price,300);
 assert.equal(ADVENTURE_BALLS.find(x=>x.id==='luxuryball').price,3000);
 assert.equal(ADVENTURE_BALLS.find(x=>x.id==='masterball').sale,false);
 assert.equal(ADVENTURE_BALLS.find(x=>x.id==='ultraball').sale,false);
 assert.equal(ballMultiplier('quickball',{turn:1}),5);
});
