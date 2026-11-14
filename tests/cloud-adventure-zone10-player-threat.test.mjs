import test from 'node:test';import assert from 'node:assert/strict';
import {zone10PlayerThreat,zone10PlayerNear} from '../lib/cloud-adventure/adventure-zone10.mjs';
import {playerRecoverySafe} from '../lib/cloud-adventure/adventure-player-vitals.mjs';
import {predictCloudStep} from '../lib/cloud-adventure/adventure-prediction.mjs';
test('zone 10 alphas threaten only their own layer and preserve unknown saves',()=>{
 const roof={area:3,district:'lumiose-zone10',zaZone10Upper:true,x:6,y:4};assert.equal(zone10PlayerThreat(roof).id,'arbok-alpha');assert.equal(zone10PlayerNear(roof),true);assert.equal(zone10PlayerThreat({...roof,x:15,y:3}).id,'watchog-alpha');assert.equal(zone10PlayerNear({...roof,x:7,y:5}),false);assert.equal(zone10PlayerNear({...roof,zaFieldCrouched:true}),false);
 const bank={area:3,district:'lumiose-zone10',zaZone10Upper:false,zaZone10LowerBank:true,x:17,y:6};assert.equal(zone10PlayerThreat(bank).id,'sharpedo-alpha');assert.equal(zone10PlayerThreat({...bank,zaZone10LowerBank:false}),null);assert.equal(zone10PlayerThreat({...bank,zaZone10Upper:true}),null);
 for(const extra of [{zaZone10Spent:{version:2}},{zaZone10Spent:{'arbok-alpha':{version:2}}},{zaZone10Spent:'future'},{zaZone10AlphaRoarAlertV1:{version:2}},{zaZone10Upper:'future'},{zaZone10LowerBank:'future'},{interior:'future'}])assert.equal(zone10PlayerThreat({...roof,...extra}),null);
 assert.equal(playerRecoverySafe({...roof,zaZone10AlphaRoarAlertV1:'arbok-alpha'}),false);assert.equal(playerRecoverySafe({...roof,zaZone10AlphaRoarAlertV1:'arbok-alpha',zaZone10Spent:{'arbok-alpha':true}}),true);assert.equal(predictCloudStep(roof,'right'),null);assert.equal(predictCloudStep(roof,'right',{allowHazard:true,allowGrass:true})?.predictedHazard,true);
});
