import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {magentaSector8RouteMap} from '../lib/cloud-adventure/adventure-magenta-sector8-route.mjs';
test('North Boulevard to Magenta Sector 8 and Zone 18 keeps gate and saves',()=>{
 const start={area:3,district:'lumiose-north-boulevard',interior:null,x:8,y:1,facing:'up',zaRoyaleRank:'C'};
 const route=stepField(start,'up');assert.equal(route.district,'lumiose-magenta-sector8-route');assert.ok(fieldPath(magentaSector8RouteMap(),route,{x:21,y:8}).length);
 const restored=restoreAdventurePosition(storeAdventurePosition({...start,...route},4),4);assert.equal(restored.district,'lumiose-magenta-sector8-route');assert.equal(stepField({...start,...route},'down').district,'lumiose-north-boulevard');
 const gate={...start,...route,x:21,y:8,facing:'right'};assert.equal(stepField(gate,'right').blocked,true);
 const zone=stepField({...gate,zaRoyaleRank:'B'},'right');assert.equal(zone.district,'lumiose-zone18');assert.equal(stepField({...gate,...zone},'right').district,'lumiose-magenta-sector8-route');
});
