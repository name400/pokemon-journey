import test from 'node:test';
import assert from 'node:assert/strict';
import {fixedAlphaAlertKnown,fixedAlphaPlayerThreat,fixedAlphaPlayerNear} from '../lib/cloud-adventure/adventure-fixed-alpha-threat.mjs';
import {playerRecoverySafe} from '../lib/cloud-adventure/adventure-player-vitals.mjs';
import {predictCloudStep} from '../lib/cloud-adventure/adventure-prediction.mjs';
const base={area:3,district:'lumiose-zone17',x:16,y:6,zaZone17Upper:false};
test('fixed alpha threats honor floors, spent records, current occupancy and hidden versions',()=>{
 assert.equal(fixedAlphaPlayerThreat(base)?.id,'pyroar-alpha');assert.ok(fixedAlphaPlayerNear(base));
 assert.equal(fixedAlphaPlayerThreat({...base,zaZone17Upper:true,x:13,y:7})?.id,'mawile-alpha');
 assert.equal(fixedAlphaPlayerThreat({...base,zaZone17Spent:{'pyroar-alpha':true}}),null);
 assert.equal(fixedAlphaPlayerThreat({...base,x:17,y:6}),null);
 assert.equal(fixedAlphaPlayerThreat({...base,zaFixedAlphaAlertV1:{version:2}}),null);
 const opaque={...base,zaFixedAlphaAlertV1:'lumiose-zone17:pyroar-alpha',zaZone17Spent:{version:2}};assert.equal(fixedAlphaAlertKnown(opaque),false);assert.equal(fixedAlphaPlayerThreat(opaque),null);
 assert.equal(fixedAlphaPlayerThreat({...base,district:'lumiose-zone11',zaZone11Upper:true}),null);
 assert.equal(fixedAlphaPlayerThreat({...base,district:'lumiose-zone11',zaZone11Upper:false,x:15,y:5})?.id,'slowbro-alpha');
});
test('alert suspends recovery and blocks movement prediction near a visible alpha',()=>{
 const w={...base,zaFixedAlphaAlertV1:'lumiose-zone17:pyroar-alpha'};
 assert.equal(playerRecoverySafe(w),false);assert.equal(playerRecoverySafe({...w,zaZone17Spent:{'pyroar-alpha':true}}),true);
 assert.equal(predictCloudStep(w,'left'),null);
});
