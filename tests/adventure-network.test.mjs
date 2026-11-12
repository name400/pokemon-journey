import test from 'node:test';import assert from 'node:assert/strict';import {adventureJson} from '../lib/adventure-network.mjs';
test('network requests finish normally or time out with a recoverable connection error',async()=>{
 const value={ok:true,json:async()=>({hello:'world'})};assert.deepEqual(await adventureJson('/test',{},50,async()=>value),{response:value,data:{hello:'world'}});
 let aborted=false;const stalled=(_url,{signal})=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>{aborted=true;reject(new Error('aborted'));}));
 await assert.rejects(adventureJson('/test',{},5,stalled),TypeError);assert.equal(aborted,true);
 let bodyAborted=false;const stalledBody=async(_url,{signal})=>({json:()=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>{bodyAborted=true;reject(new Error('body aborted'));}))});
 await assert.rejects(adventureJson('/test',{},5,stalledBody),TypeError);assert.equal(bodyAborted,true);
 const failure=new Error('server failure');await assert.rejects(adventureJson('/test',{},50,async()=>{throw failure;}),error=>error===failure);
});


test('a stalled mutation times out without sending it twice',async()=>{
 let calls=0;const fetcher=(_url,{signal})=>{calls++;return new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}));};
 const start=performance.now();await assert.rejects(adventureJson('/api/world',{method:'POST',body:'move'},25,fetcher),/timed out/);
 assert.equal(calls,1);assert.ok(performance.now()-start<1000,'a stalled request cannot keep the client locked indefinitely');
});
