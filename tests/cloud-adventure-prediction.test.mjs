import test from 'node:test';import assert from 'node:assert/strict';import {predictCloudStep} from '../lib/cloud-adventure/adventure-prediction.mjs';test('safe step predicts display only without changing world or predicting encounters and exits',()=>{const w={area:0,x:3,y:8,facing:'down',badges:[]},copy=structuredClone(w);assert.deepEqual(predictCloudStep(w,'right'),{x:4,y:8,facing:'right'});assert.deepEqual(w,copy);assert.equal(predictCloudStep({...w,x:22,y:8},'right'),null);assert.equal(predictCloudStep({...w,x:6,y:2},'right'),null);assert.equal(predictCloudStep({...w,zaWildAlphaAlert:true},'right'),null);});

test('held prediction is bounded, stops before hazards, and requires server confirmation',async()=>{
 const {createCloudMoveBuffer}=await import('../lib/cloud-adventure/adventure-prediction.mjs');
 const w={area:3,district:'lumiose',x:3,y:8,facing:'right',badges:[]},first=predictCloudStep(w,'right'),buffer=createCloudMoveBuffer(w,first,'right');
 for(let i=0;i<4;i++)assert.ok(buffer.push());assert.equal(buffer.push(),null);assert.deepEqual(buffer.path,['right','right','right','right']);
 assert.equal(buffer.matches({world:{...w,...first},battle:null}),true);
 for(const result of [{world:{...w,...first,x:3}},{world:{...w,...first,district:'other'}},{world:{...w,...first,adventureCatchWindow:{}}},{world:{...w,...first},battle:{}}])assert.equal(buffer.matches(result),false);
 const unsafe=createCloudMoveBuffer({area:0,x:5,y:2,badges:[]},{x:6,y:2,facing:'right'},'right');assert.equal(unsafe.push(),null);
 assert.equal(createCloudMoveBuffer({...w,district:'lumiose-wild'},first,'right').push(),null);
});
