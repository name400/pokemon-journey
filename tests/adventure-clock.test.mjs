import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureClockTime,nextAdventureHourDelay} from '../lib/adventure-clock.mjs';
import {gameTime} from '../lib/evolution.mjs';

test('display clock matches server time at hour, day and moon boundaries',()=>{
 for(const day of [0,13,14,15,27,28])for(let hour=0;hour<24;hour++)for(const offset of [0,49999]){
  const now=day*1200000+hour*50000+offset;assert.deepEqual(adventureClockTime(now),gameTime(now));
 }
 assert.ok(nextAdventureHourDelay(123499)>0);assert.ok(nextAdventureHourDelay(149999)<=150);
});
