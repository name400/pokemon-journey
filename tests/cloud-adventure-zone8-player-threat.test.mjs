import test from 'node:test';import assert from 'node:assert/strict';
import {zone8PlayerThreat,zone8PlayerNear} from '../lib/cloud-adventure/adventure-zone8.mjs';
import {playerRecoverySafe} from '../lib/cloud-adventure/adventure-player-vitals.mjs';
import {predictCloudStep} from '../lib/cloud-adventure/adventure-prediction.mjs';
test('Zone 8 visible alpha honors safe saves, collision, recovery and prediction',()=>{
 const base={area:3,district:'lumiose-zone8',x:8,y:12};assert.equal(zone8PlayerThreat(base).id,'camerupt-alpha');assert.equal(zone8PlayerNear(base),true);assert.equal(zone8PlayerNear({...base,zaFieldCrouched:true}),false);assert.equal(zone8PlayerThreat({...base,x:8,y:10}),null);
 for(const update of [{zaZone8Spent:{'camerupt-alpha':true}},{zaZone8Spent:{'camerupt-alpha':{version:2}}},{zaZone8Spent:{version:2}},{zaZone8Spent:'future'},{zaZone8AlphaRoarAlertV1:{version:2}},{interior:'future'}]){assert.equal(zone8PlayerThreat({...base,...update}),null);}
 assert.equal(playerRecoverySafe({...base,zaZone8AlphaRoarAlertV1:'camerupt-alpha'}),false);assert.equal(playerRecoverySafe({...base,zaZone8AlphaRoarAlertV1:'camerupt-alpha',zaZone8Spent:{'camerupt-alpha':true}}),true);assert.equal(predictCloudStep(base,'up'),null);assert.equal(predictCloudStep(base,'up',{allowHazard:true})?.predictedHazard,true);
});
