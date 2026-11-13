import test from 'node:test';
import assert from 'node:assert/strict';
import {createVisualMovementRequests} from '../lib/cloud-adventure/adventure-visual-request.mjs';
const world=()=>({area:3,district:'lumiose',interior:null,x:4,y:8,facing:'right',steps:20,activeId:'mon'});
const reply=(w,extra={})=>({revision:8,world:{...w,x:5,y:8,facing:'right',steps:21},...extra});
test('request owns its exact prefix and ordered predicted suffix',()=>{
 const q=createVisualMovementRequests(),w=world(),token=q.begin(w,['right'],7);assert.ok(token);assert.equal(q.begin(w,['right'],7),null);assert.equal(q.append(token,['up','left']),true);
 const snap=q.snapshot();assert.deepEqual(snap.steps.map(p=>[p.x,p.y]),[[5,8],[5,7],[4,7]]);snap.steps[0].x=999;w.x=99;
 const settled=q.settle(token,reply(world()));assert.equal(settled.kind,'confirmed');assert.deepEqual(settled.confirmed.map(p=>[p.x,p.y]),[[5,8]]);assert.deepEqual(settled.pending.map(p=>[p.x,p.y]),[[5,7],[4,7]]);assert.equal(q.snapshot(),null);assert.deepEqual(q.settle(token,reply(world())),{kind:'ignored'});
});
test('interrupted or mismatched response discards all speculative steps',()=>{
 for(const bad of [r=>({...r,battle:{}}),r=>({...r,world:{...r.world,encounter:{}}}),r=>({...r,world:{...r.world,adventureCatchWindow:{}}}),r=>({...r,world:{...r.world,steps:20}}),r=>({...r,world:{...r.world,x:4}}),r=>({...r,revision:9})]){
  const q=createVisualMovementRequests(),w=world(),token=q.begin(w,['right'],7);assert.equal(q.append(token,['up']),true);assert.equal(q.settle(token,bad(reply(w))).kind,'reset');assert.equal(q.snapshot(),null);
 }
});
test('reset and old acknowledgements cannot alter a newer request',()=>{
 const q=createVisualMovementRequests(),w=world(),old=q.begin(w,['right'],7);q.reset();const current=q.begin(w,['right'],7);assert.notEqual(old,current);
 assert.deepEqual(q.settle(old,reply(w)),{kind:'ignored'});assert.equal(q.snapshot().token,current);assert.equal(q.settle(current,reply(w)).kind,'confirmed');
});
test('invalid paths and transitions never become speculative requests',()=>{
 const q=createVisualMovementRequests(),w=world();assert.equal(q.begin(w,['not-a-direction'],7),null);assert.equal(q.begin({...w,x:1,y:1},['up'],7),null);
 const t=q.begin(w,['right'],7),before=q.snapshot();assert.equal(q.append(t,['not-a-direction']),false);assert.deepEqual(q.snapshot(),before);
 q.reset();assert.equal(q.begin({...w,zaWildAlphaAlert:true},['right'],7),null);
 assert.equal(q.begin({area:3,district:'lumiose-vernal',interior:null,x:21,y:4,facing:'right',steps:1},['right'],7),null);
});

test('queued preview replacement preserves sent identity without duplicating consumed turns',()=>{
 const q=createVisualMovementRequests(),w=world(),t=q.begin(w,['right'],7);
 assert.equal(q.preview(t,['right','up']),true);
 assert.equal(q.preview(t,['right','up']),true);
 assert.deepEqual(q.snapshot().steps.map(p=>[p.x,p.y]),[[5,8],[6,8],[6,7]]);
 assert.equal(q.preview(t,['left','right']),true);
 assert.deepEqual(q.settle(t,reply(w)).pending.map(p=>[p.x,p.y]),[[4,8],[5,8]]);
});

test('partial, collision and encounter resets are distinguished',()=>{
 for(const [reason,change] of [['collision',{x:4,y:8,steps:20}],['partial',{x:5,y:8,steps:21}],['encounter',{x:5,y:8,steps:21,encounter:{}}]]){
  const q=createVisualMovementRequests(),w=world(),t=q.begin(w,['right','right'],7);
  assert.deepEqual(q.settle(t,{revision:8,world:{...w,...change}}),{kind:'reset',reason});
 }
});
