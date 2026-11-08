import test from 'node:test';
import assert from 'node:assert/strict';
import {zone11Map,zone11Unlocked,zone11Encounter} from '../lib/cloud-adventure/adventure-zone11.mjs';
import {stepField,storeAdventurePosition,restoreAdventurePosition,fieldPath} from '../lib/cloud-adventure/adventure-world.mjs';

test('Zone 11 east gate returns west from Vert Sector 6 without losing legacy access',()=>{
 const zone={area:3,district:'lumiose-zone11',interior:null,x:21,y:12,zaRoyaleRank:'E',regionId:6,districtReturnRegion:1,teamIds:['kept']};
 const exit=stepField(zone,'right');assert.deepEqual([exit.district,exit.x,exit.y],['lumiose-vert-sector6',1,12]);
 const sector={...zone,...exit},saved=restoreAdventurePosition(storeAdventurePosition(sector,19),19);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-vert-sector6',1,12,['kept']]);
 const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-zone11',21,12]);
 assert.equal(stepField({...saved,zaRoyaleRank:'F'},'left').blocked,true);
 assert.equal(stepField({...saved,x:21,y:12},'right').district,'lumiose-zone11');
});

test('zone eleven has gated and separately saved canal banks',()=>{
 const city={area:3,district:'lumiose-vert2',interior:null,x:17,y:1,facing:'up'};
 assert.equal(zone11Unlocked(city),false);assert.equal(stepField({...city,x:17,y:15},'down').blocked,true);assert.equal(stepField({...city,district:'lumiose-zone6',x:11,y:15},'down').blocked,true);
 const open={...city,zaRoyaleRank:'E'},north=stepField({...open,district:'lumiose-zone6',x:11,y:15},'down');assert.deepEqual([north.district,north.x,north.y],['lumiose-zone11',5,1]);
 const n={...open,...north},map=zone11Map(n);assert.ok(fieldPath(map,n,{x:17,y:3}).length);assert.equal(fieldPath(map,n,{x:15,y:12}).length,0);assert.equal(stepField({...n,x:11,y:6},'down').blocked,true);
 assert.equal(stepField(n,'up').district,'lumiose-zone6');
 const south=stepField({...open,x:17,y:15},'down');assert.deepEqual([south.district,south.x,south.y],['lumiose-zone11',11,15]);
 assert.ok(fieldPath(zone11Map({...open,...south}),south,{x:15,y:12}).length);
 for(const p of [{...n,x:17,y:3},{...open,...south,x:15,y:12}]){const stored=storeAdventurePosition(p,7),restored=restoreAdventurePosition(stored,7);assert.deepEqual([restored.district,restored.x,restored.y],['lumiose-zone11',p.x,p.y]);assert.equal(restoreAdventurePosition(stored,8).district,null);}
 assert.equal(zone11Map({...n,zaMission40Stage:2})[3][11],'0');assert.equal(zone11Encounter({...n,y:3},()=>0).speciesId,79);assert.equal(zone11Encounter({...n,y:12},()=>0).speciesId,676);
});
