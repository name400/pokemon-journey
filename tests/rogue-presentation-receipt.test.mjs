import test from 'node:test';
import assert from 'node:assert/strict';
import {PresentationReceipt} from '../lib/rogue-presentation-receipt.mjs';
test('only painted and fully elapsed matching frames are recorded',()=>{
 const r=new PresentationReceipt('run:turn',3);r.complete(0,'a');r.paint(0,'a');r.complete(0,'other');r.complete(0,'a');r.paint(1,'b');assert.deepEqual(r.snapshot(),{version:1,key:'run:turn',complete:false,events:[0]});r.complete(1,'b');r.paint(2,'c');r.complete(2,'c');assert.equal(r.snapshot().complete,true);
});
test('hidden, timeout, cancellation or skip invalidates the whole attempt',()=>{
 for(const reason of ['hidden','timeout','cancel','skip']){const r=new PresentationReceipt(reason,2);r.paint(0,'a');r.complete(0,'a');r.invalidate();r.paint(1,'b');r.complete(1,'b');assert.equal(r.snapshot().complete,false);assert.deepEqual(r.snapshot().events,[0]);}
});
test('empty and out of range frames cannot produce a receipt',()=>{
 const r=new PresentationReceipt('empty',0);r.paint(0,'a');r.complete(0,'a');assert.equal(r.snapshot().complete,false);assert.deepEqual(r.snapshot().events,[]);
});
test('missing frame identity cannot count as a painted and completed event',()=>{
 const r=new PresentationReceipt('run:turn',1);r.complete(0,undefined);assert.equal(r.snapshot().complete,false);assert.deepEqual(r.snapshot().events,[]);
});
test('a replacement frame must itself complete before an event is confirmed',()=>{
 const r=new PresentationReceipt('run:turn',1);r.paint(0,'a');r.complete(0,'a');r.paint(0,'b');assert.equal(r.snapshot().complete,false);r.complete(0,'a');assert.equal(r.snapshot().complete,false);r.complete(0,'b');assert.equal(r.snapshot().complete,true);
});
