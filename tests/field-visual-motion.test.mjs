import {test} from 'node:test';
import assert from 'node:assert/strict';
import {correctionDuration,playerWalkStep} from '../lib/cloud-adventure/field-visual-motion.mjs';

test('prediction correction only retraces the current cardinal segment',()=>{
 const s={x:3.4,y:8,startX:3,startY:8,targetX:4,targetY:8};
 assert.ok(Math.abs(correctionDuration(s,{x:3,y:8},100)-40)<1e-8);
 assert.ok(Math.abs(correctionDuration(s,{x:4,y:8},100)-60)<1e-8);
 assert.equal(correctionDuration(s,{x:3,y:7},100),0);
 assert.equal(correctionDuration(s,{x:2,y:8},100),0);
 assert.equal(correctionDuration({...s,y:7.9},{x:3,y:8},100),0);
 assert.equal(correctionDuration({...s,targetX:4,targetY:7},{x:3,y:8},100),0);
 assert.equal(correctionDuration({...s,x:4.1},{x:3,y:8},100),0);
});

test('player foot phase follows distance, stops when idle or motion is reduced',()=>{
 assert.equal(playerWalkStep(.1,true,false),3);
 assert.equal(playerWalkStep(.6,true,false),-3);
 assert.equal(playerWalkStep(1.1,true,false),3);
 assert.equal(playerWalkStep(.6,false,false),0);
 assert.equal(playerWalkStep(.6,true,true),0);
});
