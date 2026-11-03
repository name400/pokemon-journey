import test from 'node:test';
import assert from 'node:assert/strict';
import {gymPuzzle} from '../lib/adventure-gym.mjs';

test('gym puzzles preserve old partial and completed saves',()=>{
 for(let area=1;area<=8;area++){
  const fresh=gymPuzzle({area});
  assert.equal(fresh.stage,0);
  assert.equal(gymPuzzle({area,pcGymSwitches:[`${area}:${fresh.order[0]}`]}).stage,1);
  assert.equal(gymPuzzle({area,pcGymSwitches:[`${area}:U`,`${area}:V`]}).ready,true);
  assert.equal(gymPuzzle({area,pcGymSwitches:[`${area}:U`,`${area}:V`],pcGymProgress:{[area]:1}}).stage,1);
 }
 assert.equal(new Set(Array.from({length:8},(_,i)=>gymPuzzle({area:i+1}).order.join(''))).size,8);
});
