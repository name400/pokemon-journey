import {test} from 'node:test';
import assert from 'node:assert/strict';
import {appendRoyaleSessionWin} from '../lib/cloud-adventure/adventure-royale.mjs';

test('royale wins retain unknown session entries and reject unknown container formats',()=>{
 const future={version:2,id:'unknown'},prior=['known','future-id',future];
 assert.deepEqual(appendRoyaleSessionWin(prior,'new'),['known','future-id',future,'new']);
 assert.deepEqual(prior,['known','future-id',future]);
 assert.deepEqual(appendRoyaleSessionWin(prior,'known'),prior);
 assert.deepEqual(appendRoyaleSessionWin(undefined,'new'),['new']);
 for(const data of [null,{},'future'])assert.throws(()=>appendRoyaleSessionWin(data,'new'),/승리 기록/);
});
