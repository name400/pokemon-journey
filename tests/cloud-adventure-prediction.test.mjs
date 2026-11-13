import test from 'node:test';import assert from 'node:assert/strict';import {predictCloudStep,adventureMovementInterval} from '../lib/cloud-adventure/adventure-prediction.mjs';test('safe step predicts display only without changing world or predicting encounters and exits',()=>{const w={area:0,x:3,y:8,facing:'down',badges:[]},copy=structuredClone(w);assert.deepEqual(predictCloudStep(w,'right'),{x:4,y:8,facing:'right'});assert.deepEqual(w,copy);assert.equal(predictCloudStep({...w,x:22,y:8},'right'),null);assert.equal(predictCloudStep({...w,x:6,y:2},'right'),null);assert.equal(predictCloudStep({...w,zaWildAlphaAlert:true},'right'),null);});

test('held prediction is bounded, stops at transitions, and requires server confirmation',async()=>{
 const {createCloudMoveBuffer}=await import('../lib/cloud-adventure/adventure-prediction.mjs');
 const w={area:3,district:'lumiose',x:3,y:8,facing:'right',badges:[]},first=predictCloudStep(w,'right'),buffer=createCloudMoveBuffer(w,first,'right',4);
 for(let i=0;i<4;i++)assert.ok(buffer.push());assert.equal(buffer.push(),null);assert.deepEqual(buffer.path,['right','right','right','right']);
 assert.equal(buffer.matches({world:{...w,...first},battle:null}),true);
 for(const result of [{world:{...w,...first,x:3}},{world:{...w,...first,district:'other'}},{world:{...w,...first,adventureCatchWindow:{}}},{world:{...w,...first},battle:{}}])assert.equal(buffer.matches(result),false);
 const unsafe=createCloudMoveBuffer({area:3,district:'lumiose-zone13',x:20,y:8,badges:[]},{x:21,y:8,facing:'right'},'right');assert.equal(unsafe.push(),null);
 assert.ok(createCloudMoveBuffer({...w,district:'lumiose-wild'},first,'right').push());
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

test('near moving encounters buffered steps require server confirmation',async()=>{
 const {createCloudMoveBuffer}=await import('../lib/cloud-adventure/adventure-prediction.mjs');
 const world={area:0,x:3,y:8,facing:'down',badges:[],zaWildAlphaAlert:true},copy=structuredClone(world);
 assert.equal(predictCloudStep(world,'right'),null);
 const first=predictCloudStep(world,'right',{allowHazard:true});assert.deepEqual(first,{x:4,y:8,facing:'right',predictedHazard:true});assert.deepEqual(world,copy);
 const buffer=createCloudMoveBuffer(world,first,'right');assert.ok(buffer.push());assert.deepEqual(buffer.path,['right']);
 assert.equal(buffer.matches({world:{...world,...first}}),true);assert.equal(buffer.matches({world:{...world,...first},battle:{}}),false);assert.equal(buffer.matches({world:{...world,x:3,y:8}}),false);
});


test('extended preview is limited to quiet city pavement and server batches of twelve',async()=>{
 const {createCloudMoveBuffer}=await import('../lib/cloud-adventure/adventure-prediction.mjs');
 const w={area:3,district:'lumiose',interior:null,x:2,y:8,facing:'right',badges:[]},first=predictCloudStep(w,'right');const buffer=createCloudMoveBuffer(w,first,'right');
 for(let i=0;i<12;i++)assert.ok(buffer.push());assert.equal(buffer.push(),null);assert.equal(buffer.path.length,12);assert.equal(buffer.matches({world:{...w,...first}}),true);assert.equal(buffer.matches({world:{...w,...first},battle:{}}),false);
 const nearLandmark={...w,x:7,y:6};const approaching=createCloudMoveBuffer(nearLandmark,predictCloudStep(nearLandmark,'right'),'right');for(let i=0;i<5;i++)assert.ok(approaching.push());assert.equal(approaching.push(),null);assert.equal(approaching.position.x,13);
 const group=createCloudMoveBuffer({...w,inUnion:true},first,'right');for(let i=0;i<4;i++)assert.ok(group.push());assert.equal(group.push(),null);
 const alert=createCloudMoveBuffer({...w,zaWildAlphaAlert:true},{...first,predictedHazard:true},'right');for(let i=0;i<4;i++)assert.ok(alert.push());assert.equal(alert.push(),null);
});


test('wild zone 1 extends only road preview; grass, moving wildlife and group paths stay bounded',async()=>{
 const {createCloudMoveBuffer}=await import('../lib/cloud-adventure/adventure-prediction.mjs');
 const road={area:3,district:'lumiose-zone1',interior:null,x:2,y:8,facing:'right'},first=predictCloudStep(road,'right');const extended=createCloudMoveBuffer(road,first,'right');for(let i=0;i<8;i++)assert.ok(extended.push());while(extended.push()){}assert.ok(extended.path.length<=12);assert.equal(extended.matches({world:{...road,...first}}),true);assert.equal(extended.matches({world:{...road,...first},battle:{}}),false);
 const grass={...road,x:16,y:8},g=predictCloudStep(grass,'up',{allowGrass:true}),bounded=createCloudMoveBuffer(grass,g,'up');for(let i=0;i<4;i++)assert.ok(bounded.push());assert.equal(bounded.push(),null);
 const group=createCloudMoveBuffer({...road,inUnion:true},first,'right');for(let i=0;i<4;i++)assert.ok(group.push());assert.equal(group.push(),null);
 const zone2={area:3,district:'lumiose-zone2',interior:null,x:10,y:4,facing:'left'},other=predictCloudStep(zone2,'left',{allowGrass:true,allowHazard:true});assert.equal(other.predictedHazard,true);const wildlife=createCloudMoveBuffer(zone2,other,'left');for(let i=0;i<4;i++)assert.ok(wildlife.push());assert.equal(wildlife.push(),null);
});


test('zone 4 and zone 6 ground paths extend, while grass and elevated layers do not',async()=>{
 const {createCloudMoveBuffer}=await import('../lib/cloud-adventure/adventure-prediction.mjs');
 for(const [district,x,y] of [['lumiose-zone4',2,14],['lumiose-zone6',9,8]]){const w={area:3,district,x,y,interior:null},first=predictCloudStep(w,'right');const buffer=createCloudMoveBuffer(w,first,'right');for(let i=0;i<8;i++)assert.ok(buffer.push(),district);while(buffer.push()){}assert.ok(buffer.path.length<=12);assert.equal(buffer.matches({world:{...w,...first},battle:{}}),false);}
 // Zone 6's rooftop lift at (16,7) must stop prediction before interaction.
 {const w={area:3,district:'lumiose-zone6',x:9,y:7,interior:null},first=predictCloudStep(w,'right'),buffer=createCloudMoveBuffer(w,first,'right');for(let i=0;i<5;i++)assert.ok(buffer.push());assert.equal(buffer.push(),null);}
 for(const [district,x,y] of [['lumiose-zone4',10,3],['lumiose-zone6',3,2]]){const w={area:3,district,x,y,interior:null},first=predictCloudStep(w,'down',{allowGrass:true});assert.ok(first,district);const buffer=createCloudMoveBuffer(w,first,'down');for(let i=0;i<4;i++)assert.ok(buffer.push(),district);assert.equal(buffer.push(),null);}
 for(const [layer,x,y] of [['canal',2,3],['roof',4,2],['high',17,1]]){const w={area:3,district:'lumiose-zone6',zaZone6Layer:layer,x,y,interior:null},first=predictCloudStep(w,'down',{allowGrass:true});assert.ok(first,layer);const buffer=createCloudMoveBuffer(w,first,'down');for(let i=0;i<4;i++)assert.ok(buffer.push(),layer);assert.equal(buffer.push(),null);}
});

test('queued directions preview in order and stop at blocked tiles',async()=>{
 const {predictCloudPath}=await import('../lib/cloud-adventure/adventure-prediction.mjs');
 const world={area:3,district:'lumiose',interior:null,x:6,y:8,facing:'right'},before=structuredClone(world);
 assert.deepEqual(predictCloudPath(world,['up','left']),{x:5,y:7,facing:'left'});assert.deepEqual(world,before);
 const boundary={...world,x:1,y:1};assert.equal(predictCloudPath(boundary,['up','right']),null);
 assert.deepEqual(predictCloudPath(boundary,['right','up']),{x:2,y:1,facing:'right'});
});

test('ordered prediction retains distinct intermediate tiles and stops at transitions',async()=>{
 const {predictCloudPath,predictCloudPathSteps}=await import('../lib/cloud-adventure/adventure-prediction.mjs');
 const world={area:3,district:'lumiose',interior:null,x:4,y:8,facing:'right'},before=structuredClone(world);
 const rightUp=predictCloudPathSteps(world,['right','up']),upRight=predictCloudPathSteps(world,['up','right']);
 assert.deepEqual(rightUp.map(p=>[p.x,p.y]),[[5,8],[5,7]]);assert.deepEqual(upRight.map(p=>[p.x,p.y]),[[4,7],[5,7]]);
 assert.deepEqual(predictCloudPath(world,['right','up']),rightUp.at(-1));assert.deepEqual(world,before);
 const blocked={...world,x:1,y:1};assert.deepEqual(predictCloudPathSteps(blocked,['up','right']),[]);assert.deepEqual(predictCloudPathSteps(blocked,['right','up']).map(p=>[p.x,p.y]),[[2,1]]);
 const gate={area:3,district:'lumiose-vernal',interior:null,x:21,y:4,facing:'right'};const steps=predictCloudPathSteps(gate,['right','right'],{allowTransition:true});assert.equal(steps.length,1);assert.equal(steps[0].predictedTransition,true);assert.equal(steps[0].district,'lumiose-vert-sector4');
});

test('confirmed prefix requires the exact request and rejects interruptions or stale responses',async()=>{
 const {predictCloudPathSteps,confirmedCloudPathPrefix}=await import('../lib/cloud-adventure/adventure-prediction.mjs');
 const world={area:3,district:'lumiose',interior:null,x:4,y:8,facing:'right',steps:20,activeId:'kept'},steps=predictCloudPathSteps(world,['right','left','up']);
 const result={revision:8,battle:null,world:{...world,...steps[1],steps:22}};
 assert.deepEqual(confirmedCloudPathPrefix(world,steps,2,7,result),{confirmed:steps.slice(0,2),pending:steps.slice(2)});
 for(const bad of [{...result,revision:7},{...result,revision:9},{...result,battle:{}},{...result,world:{...result.world,steps:21}},{...result,world:{...result.world,x:5}},{...result,world:{...result.world,adventureCatchWindow:{}}},{...result,world:{...result.world,adventurePendingMoves:[1]}},{...result,world:{...result.world,district:'elsewhere'}}])assert.equal(confirmedCloudPathPrefix(world,steps,2,7,bad),null);
 assert.equal(confirmedCloudPathPrefix(world,steps,2,8,result),null,'a duplicate acknowledgement is not accepted');
 assert.equal(confirmedCloudPathPrefix(world,[{...steps[0],predictedHazard:true},...steps.slice(1)],2,7,result),null);
 assert.equal(confirmedCloudPathPrefix(world,steps,0,7,result),null);
});

test('buffer retains held turns in order and requires the earlier server position',async()=>{
 const {createCloudMoveBuffer}=await import('../lib/cloud-adventure/adventure-prediction.mjs');
 const world={area:3,district:'lumiose',interior:null,x:5,y:8,facing:'right'},first=predictCloudStep(world,'right');
 const buffer=createCloudMoveBuffer(world,first,'right');
 assert.deepEqual(buffer.push('up'),{x:6,y:7,facing:'up'});
 assert.deepEqual(buffer.push('left'),{x:5,y:7,facing:'left'});
 assert.deepEqual(buffer.path,['up','left']);
 assert.equal(buffer.matches({world:{...world,...first},battle:null}),true);
 assert.equal(buffer.matches({world:{...world,...first},battle:{}}),false);
 assert.equal(buffer.matches({world:{...world,...first,adventureCatchWindow:{}},battle:null}),false);
 assert.equal(buffer.matches({world:{...world,x:5,y:8},battle:null}),false);
});
