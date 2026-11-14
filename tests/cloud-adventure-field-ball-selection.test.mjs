import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldBallSelection} from '../lib/cloud-adventure/adventure-balls.mjs';

test('field ball fallback never silently chooses the master or rare balls',()=>{
 const stock={pokeball:0,quickball:1,masterball:1,friendball:1},count=id=>stock[id]||0;
 assert.equal(fieldBallSelection('pokeball',count),'quickball');
 assert.equal(fieldBallSelection('friendball',count),'friendball');
 assert.equal(fieldBallSelection('masterball',count),'masterball');
 stock.quickball=0;
 assert.equal(fieldBallSelection('pokeball',count),'pokeball');
 assert.equal(fieldBallSelection('friendball',count),'friendball');
 stock.friendball=0;
 assert.equal(fieldBallSelection('friendball',count),'friendball');
});
