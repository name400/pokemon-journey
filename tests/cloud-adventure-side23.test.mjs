import test from 'node:test';
import assert from 'node:assert/strict';
import {side23Available} from '../lib/cloud-adventure/adventure-side23.mjs';
import {fieldMap,fieldDialogue} from '../lib/cloud-adventure/adventure-world.mjs';

test('Terra becomes available after the Mission 10 rival battle and preserves old progress',()=>{
 const base={area:3,district:'lumiose-vernal',x:3,y:1,facing:'up'};
 for(const state of [{},{zaMission10Stage:1,zaRoyaleRank:'V'}]){const s={...base,...state};assert.equal(side23Available(s),false);assert.notEqual(fieldDialogue(s,fieldMap(s))?.action,'side23Start');}
 const after={...base,zaMission10Stage:2},copy=structuredClone(after);assert.equal(side23Available(after),true);assert.equal(fieldDialogue(after,fieldMap(after)).action,'side23Start');assert.deepEqual(after,copy);
 for(const state of [{zaMission10Complete:true},{zaRoyaleRank:'F'},{zaMission37Complete:true},{zaSide23Stage:1},{zaSide23Stage:2},{zaSide23Stage:3}])assert.equal(side23Available(state),true);
 const saved={...base,zaSide23Stage:1};assert.equal(fieldDialogue(saved,fieldMap(saved)).action,'side23Battle');
});
