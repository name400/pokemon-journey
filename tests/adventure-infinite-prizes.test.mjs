import test from 'node:test';
import assert from 'node:assert/strict';
import {INFINITE_PRIZES,drawInfinitePrize} from '../lib/cloud-adventure/adventure-infinite-royale.mjs';

test('infinite reward draw covers each original weighted slot',()=>{
 assert.equal(INFINITE_PRIZES.reduce((sum,p)=>sum+p.weight,0),145);
 const actual=new Map();for(let slot=0;slot<145;slot++){const prize=drawInfinitePrize(()=>(slot+.5)/145);actual.set(prize.id,(actual.get(prize.id)||0)+1);}
 for(const prize of INFINITE_PRIZES)assert.equal(actual.get(prize.id),prize.weight,prize.id);
 assert.deepEqual(INFINITE_PRIZES.find(p=>p.id==='bottlecap').quantity,3);
 assert.deepEqual(INFINITE_PRIZES.find(p=>p.id==='hpup').quantity,5);
 assert.throws(()=>drawInfinitePrize(()=>1));
});
