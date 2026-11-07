import test from 'node:test';import assert from 'node:assert/strict';import {predictCloudStep,adventureMovementInterval} from '../lib/cloud-adventure/adventure-prediction.mjs';test('safe step predicts display only without changing world or predicting encounters and exits',()=>{const w={area:0,x:3,y:8,facing:'down',badges:[]},copy=structuredClone(w);assert.deepEqual(predictCloudStep(w,'right'),{x:4,y:8,facing:'right'});assert.deepEqual(w,copy);assert.equal(predictCloudStep({...w,x:22,y:8},'right'),null);assert.equal(predictCloudStep({...w,x:6,y:2},'right'),null);assert.equal(predictCloudStep({...w,zaWildAlphaAlert:true},'right'),null);});

test('held prediction is bounded, stops before hazards, and requires server confirmation',async()=>{
 const {createCloudMoveBuffer}=await import('../lib/cloud-adventure/adventure-prediction.mjs');
 const w={area:3,district:'lumiose',x:3,y:8,facing:'right',badges:[]},first=predictCloudStep(w,'right'),buffer=createCloudMoveBuffer(w,first,'right');
 for(let i=0;i<4;i++)assert.ok(buffer.push());assert.equal(buffer.push(),null);assert.deepEqual(buffer.path,['right','right','right','right']);
 assert.equal(buffer.matches({world:{...w,...first},battle:null}),true);
 for(const result of [{world:{...w,...first,x:3}},{world:{...w,...first,district:'other'}},{world:{...w,...first,adventureCatchWindow:{}}},{world:{...w,...first},battle:{}}])assert.equal(buffer.matches(result),false);
 const unsafe=createCloudMoveBuffer({area:3,district:'lumiose-zone13',x:20,y:8,badges:[]},{x:21,y:8,facing:'right'},'right');assert.equal(unsafe.push(),null);
 assert.equal(createCloudMoveBuffer({...w,district:'lumiose-wild'},first,'right').push(),null);
});

test('sneaker cadence follows earned state without changing movement validation',()=>{assert.equal(adventureMovementInterval({}),100);assert.equal(adventureMovementInterval({zaMission19Sneakers:true}),75);assert.equal(adventureMovementInterval({zaMission19Sneakers:false}),100);});

test('successive held batches remain bounded and require each server position',async()=>{
 const {createCloudMoveBuffer}=await import('../lib/cloud-adventure/adventure-prediction.mjs');
 const world={area:3,district:'lumiose',x:2,y:8,facing:'right',badges:[]};
 const first=predictCloudStep(world,'right'),buffer=createCloudMoveBuffer(world,first,'right');
 assert.ok(buffer.push());assert.ok(buffer.push());
 assert.equal(buffer.matches({world:{...world,...first}}),true);
 const accepted={...world,...first},next=createCloudMoveBuffer(accepted,buffer.position,'right');
 assert.ok(next.push());assert.ok(next.push());
 assert.equal(next.matches({world:{...accepted,...buffer.position}}),true);
 assert.equal(next.matches({world:{...accepted,x:buffer.position.x-1,y:buffer.position.y}}),false);
 assert.equal(next.matches({world:{...accepted,...buffer.position},battle:{}}),false);
 assert.ok(next.path.length<=4);
});

test('grass preview is bounded and pending steps require server authority',async()=>{
 const {createCloudMoveBuffer}=await import('../lib/cloud-adventure/adventure-prediction.mjs');
 const world={area:3,district:'lumiose-zone13',x:2,y:3,facing:'right',badges:[]},copy=structuredClone(world);
 assert.equal(predictCloudStep(world,'right'),null);
 const first=predictCloudStep(world,'right',{allowGrass:true});assert.deepEqual(first,{x:3,y:3,facing:'right'});assert.deepEqual(world,copy);
 const buffer=createCloudMoveBuffer(world,first,'right');for(let i=0;i<4;i++)assert.ok(buffer.push());assert.equal(buffer.push(),null);assert.deepEqual(buffer.path,['right','right','right','right']);
 assert.equal(buffer.matches({world:{...world,...first},battle:{}}),false);assert.equal(buffer.matches({world:{...world,...first,x:2}}),false);
 const gate={area:3,district:'lumiose-zone13',x:21,y:8,facing:'right'};assert.equal(predictCloudStep(gate,'right',{allowGrass:true}),null);
});

test('transition preview uses the target map and never buffers across the boundary',async()=>{
 const {createCloudMoveBuffer}=await import('../lib/cloud-adventure/adventure-prediction.mjs');
 const world={area:3,district:'lumiose-vernal',interior:null,x:21,y:4,facing:'right',teamIds:['kept']},copy=structuredClone(world);
 assert.equal(predictCloudStep(world,'right'),null);const p=predictCloudStep(world,'right',{allowTransition:true});
 assert.deepEqual([p.district,p.x,p.y,p.predictedTransition],['lumiose-vert-sector4',1,8,true]);assert.equal(p.map[8][0],'X');assert.deepEqual(world,copy);
 const buffer=createCloudMoveBuffer(world,p,'right');assert.equal(buffer.push(),null);assert.deepEqual(buffer.path,[]);assert.equal(buffer.matches({world:{...world,...p}}),false);
 const blocked={area:3,district:'lumiose-vert2',interior:null,x:17,y:15,zaRoyaleRank:'F'};assert.equal(predictCloudStep(blocked,'down',{allowTransition:true}),null);
});
