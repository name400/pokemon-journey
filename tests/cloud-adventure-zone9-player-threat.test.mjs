import test from 'node:test';import assert from 'node:assert/strict';
import {zone9PlayerThreat,zone9PlayerNear} from '../lib/cloud-adventure/adventure-zone9.mjs';
import {playerRecoverySafe} from '../lib/cloud-adventure/adventure-player-vitals.mjs';
import {predictCloudStep} from '../lib/cloud-adventure/adventure-prediction.mjs';
test('zone 9 rooftop threats preserve unknown saves and respect proximity and floors',()=>{
 const base={area:3,district:'lumiose-zone9',zaZone9Upper:true,x:5,y:3};assert.equal(zone9PlayerThreat(base).id,'manectric-alpha');assert.equal(zone9PlayerNear(base),true);assert.equal(zone9PlayerNear({...base,zaFieldCrouched:true}),false);assert.equal(zone9PlayerNear({...base,x:4,y:4}),false);assert.equal(zone9PlayerThreat({...base,zaZone9Upper:false}),null);assert.equal(zone9PlayerThreat({...base,zaZone9Upper:'future'}),null);
 assert.equal(zone9PlayerThreat({...base,x:11,y:5}).id,'meowstic-alpha');assert.equal(zone9PlayerNear({...base,zaZone9Spent:{'manectric-alpha':true}}),false);
 for(const extra of [{zaZone9Spent:{version:2}},{zaZone9Spent:{'meowstic-alpha':{version:2}}},{zaZone9Spent:'future'},{zaZone9AlphaRoarAlertV1:{version:2}},{interior:'future'}])assert.equal(zone9PlayerThreat({...base,...extra}),null);
 assert.equal(playerRecoverySafe({...base,zaZone9AlphaRoarAlertV1:'manectric-alpha'}),false);assert.equal(playerRecoverySafe({...base,zaZone9AlphaRoarAlertV1:'manectric-alpha',zaZone9Spent:{'manectric-alpha':true}}),true);assert.equal(predictCloudStep(base,'right'),null);assert.equal(predictCloudStep(base,'right',{allowHazard:true})?.predictedHazard,true);
});
