import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureCaptureShakes} from '../lib/adventure-capture.mjs';

test('field and battle capture rules honor health, status and four shakes',()=>{
 const full={maxHp:100,hp:100,captureRate:45};
 assert.equal(adventureCaptureShakes(full,()=>0),4);
 assert.equal(adventureCaptureShakes(full,()=>.5),0);
 assert.equal(adventureCaptureShakes({...full,hp:1,status:'잠듦'},()=>.5),4);
 assert.equal(adventureCaptureShakes(full,()=>.4),4);
 assert.equal(adventureCaptureShakes({...full,isAlpha:true},()=>.4),0);
 let rolls=[0,0,.999];assert.equal(adventureCaptureShakes(full,()=>rolls.shift()),2);
});
