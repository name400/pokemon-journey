import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {magentaSector8RouteMap} from '../lib/cloud-adventure/adventure-magenta-sector8-route.mjs';
test('North Boulevard to Magenta Sector 8 and Zone 18 keeps gate and saves',()=>{
 const start={area:3,district:'lumiose-north-boulevard',interior:null,x:8,y:1,facing:'up',zaRoyaleRank:'C'};
 const route=stepField(start,'up');assert.equal(route.district,'lumiose-magenta-sector8-route');assert.ok(fieldPath(magentaSector8RouteMap(),route,{x:21,y:8}).length);
 const restored=restoreAdventurePosition(storeAdventurePosition({...start,...route},4),4);assert.equal(restored.district,'lumiose-magenta-sector8-route');assert.equal(stepField({...start,...route},'down').district,'lumiose-north-boulevard');
 const gate={...start,...route,x:21,y:8,facing:'right'};assert.equal(stepField(gate,'right').blocked,true);
 const zone=stepField({...gate,zaRoyaleRank:'B'},'right');assert.equal(zone.district,'lumiose-zone18');assert.equal(stepField({...gate,...zone},'right').district,'lumiose-magenta-sector8-route');
});

test('Magenta Sector 8 links the canal street and nearby healing point',()=>{
 const s={area:3,district:'lumiose-magenta-sector8-route',interior:null,x:1,y:8,zaRoyaleRank:'C',teamIds:['kept']};
 const canal=stepField(s,'left');assert.deepEqual([canal.district,canal.x,canal.y],['lumiose-magenta-canal-route',21,12]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,...canal},65),65);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-magenta-canal-route',21,12,['kept']]);
 assert.equal(stepField(saved,'right').district,'lumiose-magenta-sector8-route');
 const center={...s,x:12,y:14,facing:'up'};assert.equal(fieldDialogue(center).action,'heal');
 assert.ok(fieldPath(magentaSector8RouteMap(),{x:11,y:15},{x:12,y:14}).length);
 assert.equal(stepField({...s,x:21,y:8},'right').blocked,true);
});
