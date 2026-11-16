import test from 'node:test';
import assert from 'node:assert/strict';
import {createAdventureClockTabClient} from '../lib/cloud-adventure/adventure-clock-tab-client.mjs';
const settle=()=>new Promise(resolve=>setTimeout(resolve,0));
test('rapid reopen releases obsolete owner and hidden tab does not reacquire',async()=>{
 const calls=[];let release,timer,number=0;
 const client=createAdventureClockTabClient({send:async(action,extra)=>{calls.push([action,extra]);if(action==='clockLeaseOpen'){number++;if(number===1)await new Promise(resolve=>release=resolve);return {clockLease:{owner:`owner${number}`,generation:number}};}if(action==='clockLeaseRenew')return null;return {};},setTimer:fn=>{timer=fn;return 1;},clearTimer:()=>{timer=null;}});
 client.setOpen(true);await settle();client.setOpen(false);client.setOpen(true);release();await settle();await settle();assert.deepEqual(calls.map(x=>x[0]),['clockLeaseOpen','clockLeaseClose','clockLeaseOpen']);assert.equal(calls[1][1].owner,'owner1');assert.ok(timer);client.suspend();await settle();assert.equal(timer,null);assert.equal(calls.at(-1)[1].owner,'owner2');client.setOpen(true);await settle();assert.equal(calls.filter(x=>x[0]==='clockLeaseOpen').length,2);client.dispose();
});
test('failed renewal is not retried or reopened',async()=>{const calls=[];let timer;const c=createAdventureClockTabClient({send:async action=>{calls.push(action);return action==='clockLeaseOpen'?{clockLease:{owner:'a',generation:1}}:null;},setTimer:fn=>{timer=fn;return 1;},clearTimer:()=>{timer=null;}});c.setOpen(true);await settle();timer();await settle();assert.equal(timer,null);c.setOpen(true);await settle();assert.deepEqual(calls,['clockLeaseOpen','clockLeaseRenew']);c.dispose();});
