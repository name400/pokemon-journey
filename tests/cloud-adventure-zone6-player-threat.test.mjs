import test from 'node:test';import assert from 'node:assert/strict';
import {zone6PlayerThreat,zone6PlayerNear} from '../lib/cloud-adventure/adventure-zone6.mjs';
import {playerRecoverySafe} from '../lib/cloud-adventure/adventure-player-vitals.mjs';
import {predictCloudStep} from '../lib/cloud-adventure/adventure-prediction.mjs';
test('zone 6 threats respect layers, spent status and unknown saves',()=>{const base={area:3,district:'lumiose-zone6',x:9,y:4};assert.equal(zone6PlayerThreat(base).id,'houndoom-alpha');assert.equal(zone6PlayerNear(base),true);assert.equal(zone6PlayerNear({...base,zaFieldCrouched:true}),false);assert.equal(zone6PlayerThreat({...base,x:8,y:3}),null);assert.equal(zone6PlayerThreat({...base,zaZone6Spent:{'houndoom-alpha':true}}),null);assert.equal(zone6PlayerThreat({...base,zaZone6Layer:'roof'}),null);assert.equal(zone6PlayerThreat({...base,zaZone6Layer:'canal'}).id,'binacle-alpha');assert.equal(zone6PlayerThreat({...base,zaZone6Layer:'high'}).id,'pikachu-alpha');assert.equal(zone6PlayerThreat({...base,zaZone6Layer:'future'}),null);assert.equal(zone6PlayerThreat({...base,zaZone6AlphaRoarAlertV1:{version:2}}),null);assert.equal(playerRecoverySafe({...base,zaZone6AlphaRoarAlertV1:'houndoom-alpha'}),false);assert.equal(playerRecoverySafe({...base,zaZone6AlphaRoarAlertV1:'houndoom-alpha',zaZone6Spent:{'houndoom-alpha':true}}),true);assert.equal(predictCloudStep(base,'up'),null);assert.equal(predictCloudStep(base,'up',{allowHazard:true})?.predictedHazard,true);});

test('new Zone 6 Houndoom sleeps until contact while old and unknown saves survive',async()=>{
 const {enterZone6Houndoom,wakeZone6Houndoom,zone6HoundoomAsleep}=await import('../lib/cloud-adventure/adventure-zone6.mjs');
 const s={area:3,district:'lumiose-zone6',x:9,y:3,zaWildShinyRolls:{'zone6:houndoom-alpha:229':true}};
 assert.equal(zone6PlayerThreat(s).id,'houndoom-alpha');
 enterZone6Houndoom(s);assert.equal(zone6HoundoomAsleep(s),true);assert.equal(zone6PlayerThreat(s),null);assert.equal(predictCloudStep(s,'left'),null);
 const restored=JSON.parse(JSON.stringify(s));assert.equal(zone6HoundoomAsleep(restored),true);restored.x=8;restored.zaFieldCrouched=true;assert.equal(wakeZone6Houndoom(restored),false);restored.zaFieldCrouched=false;assert.equal(wakeZone6Houndoom(restored),true);restored.x=9;assert.equal(zone6PlayerThreat(restored).id,'houndoom-alpha');assert.equal(restored.zaWildShinyRolls['zone6:houndoom-alpha:229'],true);
 const future={...s,zaZone6HoundoomAwakeV1:{version:2}};enterZone6Houndoom(future);assert.deepEqual(future.zaZone6HoundoomAwakeV1,{version:2});assert.equal(zone6PlayerThreat({...s,zaZone6Layer:'canal'}).id,'binacle-alpha');
});
