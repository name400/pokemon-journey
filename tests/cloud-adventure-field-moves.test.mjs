import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMove} from '../lib/cloud-adventure/adventure-field-moves.mjs';

test('field actions resolve localized names and English move IDs with identical rules',()=>{
 for(const [korean,english,id] of [['화염방사','Flamethrower','flamethrower'],['바위깨기','Rock Smash','rocksmash'],['10만볼트','Thunderbolt','thunderbolt'],['냉동빔','Ice Beam','icebeam']]){
  assert.equal(fieldMove(english)?.key,id);assert.equal(fieldMove(id)?.key,id);assert.deepEqual(fieldMove(english),fieldMove(korean));
 }
 assert.equal(fieldMove('Swords Dance')?.category,'Status');assert.equal(fieldMove('not a move'),undefined);assert.equal(fieldMove('__proto__'),undefined);assert.equal(fieldMove(null),undefined);
});
