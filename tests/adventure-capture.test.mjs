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
