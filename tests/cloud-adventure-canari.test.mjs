import test from 'node:test';
import assert from 'node:assert/strict';
import {canariBattleExperience} from '../lib/cloud-adventure/adventure-canari.mjs';

test('Red Canari Plush applies five percent to each existing battle experience share',()=>{
 assert.equal(canariBattleExperience(100,true,false),100);
 assert.equal(canariBattleExperience(100,true,true),105);
 assert.equal(canariBattleExperience(100,false,true),52);
 assert.equal(canariBattleExperience(19,true,true),19);
 assert.equal(canariBattleExperience(100,true,undefined),100);
});
