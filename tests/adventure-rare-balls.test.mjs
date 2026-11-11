import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {afterCapture} from '../lib/capture.mjs';
import {adventureBall,adventureCaptureAttempt,adventureCaptureRate} from '../lib/cloud-adventure/adventure-balls.mjs';
import {RARE_ADVENTURE_BALLS,rareBallContext,rareBallModifier,heavyBallRate,adventureAfterCapture} from '../lib/cloud-adventure/adventure-rare-balls.mjs';

test('rare ball conditions and thresholds follow their intended context',()=>{
 for(const id of RARE_ADVENTURE_BALLS)assert.ok(adventureBall(id));
 const fast=makeMon(25,20),c=rareBallContext(fast,null);assert.equal(rareBallModifier('fastball',fast,{...c,baseSpeed:99}),1);assert.equal(rareBallModifier('fastball',fast,{...c,baseSpeed:100}),4);
 for(const [lv,expected] of [[20,1],[21,2],[40,4],[80,8]])assert.equal(rareBallModifier('levelball',fast,{lead:{level:lv}}),expected);
 assert.equal(rareBallModifier('levelball',fast,{}),1);assert.equal(rareBallModifier('lureball',fast,{inWater:true}),3.5);assert.equal(rareBallModifier('lureball',fast,{}),1);
 const target={...fast,gender:'F'},lead={speciesId:25,gender:'M'};assert.equal(rareBallModifier('loveball',target,{lead}),8);assert.equal(rareBallModifier('loveball',target,{lead:{...lead,speciesId:26}}),1);assert.equal(rareBallModifier('loveball',target,{lead:{...lead,gender:'N'}}),1);
 const nidorina=makeMon(30,20);assert.equal(rareBallModifier('moonball',nidorina,rareBallContext(nidorina,null)),4);assert.equal(rareBallModifier('moonball',fast,c),1);
 assert.deepEqual([99.9,100,199.9,200,299.9,300].map(w=>heavyBallRate(45,w)),[25,45,45,65,65,75]);assert.equal(heavyBallRate(10,1),1);
 const caught=adventureAfterCapture(fast,'friendball',afterCapture);assert.equal(caught.friendship,150);assert.equal(caught.originBall,'friendball');
 const a=adventureCaptureAttempt(fast,'fastball',{rareMultiplier:4},()=>0);assert.equal(a.multiplier,4);assert.equal(adventureCaptureRate(fast),190);
});
