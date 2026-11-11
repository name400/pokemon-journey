import test from 'node:test';
import assert from 'node:assert/strict';
import {lumioseZone2Map,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {zone2WaterEdges,zone2BridgeAxis,zone2BridgeRails} from '../lib/cloud-adventure/adventure-zone2-visual.mjs';

test('Zone 2 shoreline and bridge details use the existing map without mutating it',()=>{
 const state={area:3,district:'lumiose-zone2',interior:null,x:8,y:6,teamIds:['kept']};
 const map=lumioseZone2Map(state),before=JSON.stringify(map);
 assert.equal(zone2BridgeAxis(map,8,6),'vertical');
 assert.equal(zone2BridgeAxis(['..===..'],3,0),'horizontal');
 assert.deepEqual(zone2WaterEdges(['ggg','g~g','g~g'],1,1),{north:true,east:true,south:false,west:true});
 assert.deepEqual(zone2WaterEdges(['~~~','~=~','~~~'],0,1),{north:false,east:false,south:false,west:true});
 assert.equal(zone2BridgeRails(map,14,6).east,false);
 assert.equal(zone2BridgeRails(map,14,6).west,true);
 assert.equal(zone2BridgeRails(map,8,9).east,false);
 assert.equal(zone2BridgeRails(map,8,6).east,true);
 assert.equal(JSON.stringify(map),before);
 const restored=restoreAdventurePosition(storeAdventurePosition(state,14),14);
 assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds],['lumiose-zone2',8,6,['kept']]);
 assert.ok(fieldPath(map,{x:8,y:6},{x:8,y:4}).length);
});
