import test from 'node:test';
import assert from 'node:assert/strict';
import {alphaCandyDrop,validAlphaCandyPending} from '../lib/cloud-adventure/adventure-alpha-candy.mjs';
test('alpha candy roll validates level, chance and provisional size bands',()=>{
 for(const [level,size] of [[10,'xs'],[25,'s'],[45,'m'],[65,'l']]){const rolls=[.1,.99];assert.deepEqual(alphaCandyDrop(level,()=>rolls.shift()),{item:`za-exp-candy-${size}`,quantity:3});}
 assert.equal(alphaCandyDrop(25,()=>.5),null);assert.equal(alphaCandyDrop(0,()=>.1),null);assert.equal(alphaCandyDrop(25,()=>NaN),null);
 assert.equal(validAlphaCandyPending({'za-exp-candy-s':3}),true);assert.equal(validAlphaCandyPending({version:2}),false);assert.equal(validAlphaCandyPending({'za-exp-candy-s':-1}),false);
});
