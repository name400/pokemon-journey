import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMove,canClearBramble} from '../lib/cloud-adventure/adventure-field-moves.mjs';

test('field actions resolve localized names and English move IDs with identical rules',()=>{
 for(const [korean,english,id] of [['화염방사','Flamethrower','flamethrower'],['바위깨기','Rock Smash','rocksmash'],['10만볼트','Thunderbolt','thunderbolt'],['냉동빔','Ice Beam','icebeam']]){
  assert.equal(fieldMove(english)?.key,id);assert.equal(fieldMove(id)?.key,id);assert.deepEqual(fieldMove(english),fieldMove(korean));
 }
 assert.equal(fieldMove('Swords Dance')?.category,'Status');assert.equal(fieldMove('not a move'),undefined);assert.equal(fieldMove('__proto__'),undefined);assert.equal(fieldMove(null),undefined);
});

test('brambles accept documented cutting and other attacks while retaining earlier flying compatibility',()=>{
 for(const move of ['시저크로스','X-Scissor','사이코커터','Psycho Cut','잎날가르기','Leaf Blade','Shadow Claw','Super Fang','Draco Meteor','화염방사'])assert.equal(canClearBramble({hp:10,moves:[move]},{legacyFlying:false}),true,move);
 for(const move of ['Surf','Tackle','Swords Dance','not a move'])assert.equal(canClearBramble({hp:10,moves:[move]}),false,move);
 assert.equal(canClearBramble({hp:10,moves:['Wing Attack']}),true);assert.equal(canClearBramble({hp:10,moves:['Wing Attack']},{legacyFlying:false}),false);
 assert.equal(canClearBramble({hp:0,moves:['시저크로스']}),false);assert.equal(canClearBramble(null),false);assert.equal(canClearBramble({hp:10}),false);
});
