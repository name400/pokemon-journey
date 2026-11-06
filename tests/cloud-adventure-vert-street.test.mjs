import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {vertStreetRouteMap} from '../lib/cloud-adventure/adventure-vert-street-route.mjs';
test('hotel to Vert Street and Zone 17 keeps gate and save',()=>{
 const hotel={area:3,district:'lumiose',interior:null,x:19,y:1,facing:'up',zaRoyaleRank:'D'};
 const street=stepField(hotel,'up');assert.equal(street.district,'lumiose-vert-street-route');assert.ok(fieldPath(vertStreetRouteMap(),street,{x:18,y:1}).length);
 const restored=restoreAdventurePosition(storeAdventurePosition({...hotel,...street},4),4);assert.equal(restored.district,'lumiose-vert-street-route');assert.equal(stepField({...hotel,...street},'left').district,'lumiose');
 const gate={...hotel,...street,x:18,y:1,facing:'up'};assert.equal(stepField(gate,'up').blocked,true);
 const zone=stepField({...gate,zaRoyaleRank:'C'},'up');assert.equal(zone.district,'lumiose-zone17');assert.equal(stepField({...gate,...zone},'left').district,'lumiose-vert-street-route');
});
