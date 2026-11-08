import test from 'node:test';import assert from 'node:assert/strict';
import {shouldRenderField,createFieldScheduler,visibleFieldBounds} from '../lib/adventure-render.mjs';

test('field bounds retain offscreen sprite margins and reduce mobile tile drawing',()=>{
 const bounds=visibleFieldBounds(200,160,320,278,32);
 assert.deepEqual(bounds,{left:2,top:1,right:21,bottom:18});
 // A four-tile margin includes tall building anchors outside the viewport.
 assert.ok(bounds.bottom>=Math.floor((160+278)/32)+4);
 const count=(bounds.right-bounds.left+1)*(Math.min(16,bounds.bottom)-Math.max(0,bounds.top)+1);
 assert.ok(count<23*17);
 assert.deepEqual(visibleFieldBounds(-48,-32,800,600,32),{left:-6,top:-5,right:28,bottom:22});
});
test('stationary map skips redundant paints but reacts to motion, state, size, images and accessibility settings',()=>{
 const world={},frame={world,width:375,height:326,images:2,reduced:false};
 assert.equal(shouldRenderField(null,frame,false),true);
 for(let i=0;i<60;i++)assert.equal(shouldRenderField(frame,frame,false),false);
 assert.equal(shouldRenderField(frame,frame,true),true);
 assert.equal(shouldRenderField({...frame,moving:true},frame,false),true);
 for(const change of [{world:{}},{width:812},{height:250},{images:3},{reduced:true},{night:true},{aiming:true}])assert.equal(shouldRenderField(frame,{...frame,...change},false),true);
});
test('field scheduler sleeps when idle, coalesces invalidations, and stops after motion',()=>{
 let nextId=0,frames=0,draws=0,movingFrames=0;const pending=new Map(),cancelled=[];
 const request=callback=>{const id=++nextId;frames++;pending.set(id,callback);return id;};
 const cancel=id=>{cancelled.push(id);pending.delete(id);};
 const scheduler=createFieldScheduler(request,cancel,()=>{draws++;return movingFrames-->0;});
 const tick=()=>{const [id,callback]=pending.entries().next().value;pending.delete(id);callback(draws*16);};
 scheduler.invalidate();scheduler.invalidate();assert.equal(frames,1);tick();assert.equal(draws,1);assert.equal(pending.size,0);
 movingFrames=2;scheduler.invalidate();tick();assert.equal(pending.size,1);tick();assert.equal(pending.size,1);tick();assert.equal(pending.size,0);assert.equal(draws,4);
 scheduler.invalidate();scheduler.dispose();assert.equal(pending.size,0);assert.equal(cancelled.length,1);scheduler.invalidate();assert.equal(pending.size,0);
});
