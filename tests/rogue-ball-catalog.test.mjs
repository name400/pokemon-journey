import assert from 'node:assert/strict';
import {CLASSIC_BALLS,classicBall} from '../lib/rogue-ball-catalog.mjs';
import {classicCaptureOdds,attemptClassicCapture} from '../lib/rogue-classic-capture.mjs';
const target={hp:50,maxHp:100,captureRate:60,status:null,shiny:false};
assert.equal(CLASSIC_BALLS.length,5);assert.equal(new Set(CLASSIC_BALLS.map(b=>b.id)).size,5);
for(const ball of CLASSIC_BALLS){assert.ok(ball.name&&ball.description);assert.equal(classicBall(ball.id),ball);assert.equal(classicCaptureOdds(target,ball.id).multiplier,ball.multiplier);}
const values=CLASSIC_BALLS.slice(0,4).map(ball=>classicCaptureOdds(target,ball.id).value);assert.ok(values.every((value,i)=>i===0||value>values[i-1]));
assert.equal(attemptClassicCapture(target,'masterball',{},()=>.99999).caught,true);
assert.equal(classicBall('constructor'),undefined);assert.throws(()=>classicCaptureOdds(target,'constructor'));
console.log('Classic ball UI catalog and server catch multipliers agree; master ball roll is guaranteed.');
