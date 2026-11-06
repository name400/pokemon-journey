import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {magentaCanalRouteMap} from '../lib/cloud-adventure/adventure-magenta-canal-route.mjs';
test('Zone 7 to canal and Zone 14 keeps gates, water and save',()=>{
 const start={area:3,district:'lumiose-zone7',interior:null,x:1,y:8,facing:'left',zaRoyaleRank:'F'};
 const route=stepField(start,'left');assert.equal(route.district,'lumiose-magenta-canal-route');assert.ok(fieldPath(magentaCanalRouteMap(),route,{x:10,y:1}).length);assert.equal(magentaCanalRouteMap()[3][18],'~');
 const restored=restoreAdventurePosition(storeAdventurePosition({...start,...route},4),4);assert.equal(restored.district,'lumiose-magenta-canal-route');assert.equal(stepField({...start,...route},'right').district,'lumiose-zone7');
 const gate={...start,...route,x:10,y:1,facing:'up'};assert.equal(stepField(gate,'up').blocked,true);
 const zone=stepField({...gate,zaRoyaleRank:'D'},'up');assert.equal(zone.district,'lumiose-zone14');assert.equal(stepField({...gate,...zone},'down').district,'lumiose-magenta-canal-route');
});
