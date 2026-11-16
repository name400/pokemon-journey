import {test} from 'node:test';
import assert from 'node:assert/strict';
import {correctionDuration,directMovementDuration,restartVisualSegment,playerWalkStep} from '../lib/cloud-adventure/field-visual-motion.mjs';

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
 assert.equal(playerWalkStep(.1,true,false,75),4);
 assert.equal(playerWalkStep(.1,true,false,150),2);
});

test('direct updates use the same speed and never cut a corner',()=>{
 assert.equal(directMovementDuration({x:2,y:8},{x:3,y:8},100),100);
 assert.equal(directMovementDuration({x:2.5,y:8},{x:3,y:8},100),50);
 assert.equal(directMovementDuration({x:2,y:8},{x:3,y:8},75),75);
 assert.equal(directMovementDuration({x:2,y:8},{x:3,y:8},150),150);
 assert.equal(directMovementDuration({x:2.5,y:8},{x:3,y:7.5},100),0);
 assert.equal(directMovementDuration({x:2,y:8},{x:4,y:8},100),0);
});

test('a new prediction continues or returns along the displayed segment without cutting a corner',()=>{
 const scene={x:2.5,y:8,startX:2.75,startY:8,targetX:2,targetY:8},origin={x:2,y:8};
 assert.deepEqual(restartVisualSegment(scene,origin,{id:1,x:3,y:8,facing:'right'},100),{targetX:3,targetY:8,step:1,facing:'right',duration:50});
 assert.deepEqual(restartVisualSegment(scene,origin,{id:1,x:2,y:7,facing:'up'},100),{targetX:2,targetY:8,step:-1,facing:null,duration:50});
 assert.equal(restartVisualSegment(scene,{x:1,y:8},{id:1,x:2,y:8},100),null);
 assert.equal(restartVisualSegment({...scene,y:7.9},origin,{id:1,x:3,y:8},100),null);
 assert.equal(restartVisualSegment({...scene,startX:4},origin,{id:1,x:3,y:8},100),null);
 assert.equal(restartVisualSegment({...scene,startY:7},origin,{id:1,x:3,y:8},100),null);
});

test('restarted partial segments can be cancelled or restarted again only on their recorded tile',()=>{
 const scene={x:2.6,y:8,startX:2.4,startY:8,targetX:3,targetY:8,segmentStartX:2,segmentStartY:8,segmentEndX:3,segmentEndY:8};
 assert.ok(Math.abs(correctionDuration(scene,{x:2,y:8},100)-60)<1e-8);
 assert.ok(Math.abs(correctionDuration(scene,{x:3,y:8},100)-40)<1e-8);
 assert.equal(correctionDuration(scene,{x:2,y:7},100),0);
 assert.equal(correctionDuration(scene,{x:1,y:8},100),0);
 assert.equal(correctionDuration({...scene,y:7.9},{x:2,y:8},100),0);
 const restart=restartVisualSegment(scene,{x:2,y:8},{id:3,x:3,y:8,facing:'right'},100);
 assert.equal(restart?.step,3);assert.ok(Math.abs(restart.duration-40)<1e-8);
 const turn=restartVisualSegment(scene,{x:2,y:8},{id:3,x:2,y:7,facing:'up'},100);
 assert.equal(turn?.step,-1);assert.ok(Math.abs(turn.duration-60)<1e-8);
 assert.equal(restartVisualSegment(scene,{x:1,y:8},{id:3,x:2,y:8},100),null);
 assert.equal(correctionDuration({...scene,segmentStartY:7},{x:2,y:8},100),0);
});
