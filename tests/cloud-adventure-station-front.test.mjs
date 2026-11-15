import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {vertStreetRouteMap} from '../lib/cloud-adventure/adventure-vert-street-route.mjs';
import {vertSector6Map} from '../lib/cloud-adventure/adventure-vert-sector6.mjs';

test('Station Front links the station, center, boulevard, Vert 8 and Racine approach',()=>{
 const s={area:3,district:'lumiose-vert-street-route',interior:null,x:8,y:6,zaMission03Stage:3,teamIds:['kept'],zaColorfulScrewsFound:['future-screw']};
 const map=vertStreetRouteMap(s);assert.equal(map[5][8],'u');assert.equal(map[13][10],'H');
 for(const goal of [{x:10,y:14},{x:21,y:12},{x:10,y:15},{x:20,y:15},{x:1,y:12}])assert.ok(fieldPath(map,s,goal).length,JSON.stringify(goal));
 const outside=stepField({...s,x:20,y:15},'down');assert.deepEqual([outside.district,outside.x,outside.y],['lumiose-vert-sector6',16,15]);
 const racine={...s,...outside};assert.ok(fieldPath(vertSector6Map(racine),racine,{x:17,y:14}).length);assert.equal(vertSector6Map(racine)[13][17],'u');
 const saved=restoreAdventurePosition(storeAdventurePosition(racine,81),81);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaColorfulScrewsFound],['lumiose-vert-sector6',16,15,['kept'],['future-screw']]);
 const back=stepField(saved,'down');assert.deepEqual([back.district,back.x,back.y],['lumiose-vert-street-route',20,15]);
 assert.equal(stepField({...s,x:21,y:12},'right').district,'lumiose-vert-sector8');assert.equal(stepField({...s,x:10,y:15},'down').district,'lumiose-south-boulevard');
 const detour={...s,x:20,y:15,zaMission03Stage:2,zaMission03DetourRequired:true};assert.equal(stepField(detour,'down').blocked,true);assert.equal(stepField({...racine,zaMission03Stage:2,zaMission03DetourRequired:true},'down').blocked,true);
 const old=restoreAdventurePosition(storeAdventurePosition({...s,x:20,y:15},82),82);assert.deepEqual([old.district,old.x,old.y],['lumiose-vert-street-route',20,15]);assert.notEqual(fieldMap(old)[15][20],'#');
});
