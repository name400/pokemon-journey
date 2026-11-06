import test from 'node:test';
import assert from 'node:assert/strict';
import {zone8Map,zone8Encounter,zone8Visible} from '../lib/cloud-adventure/adventure-zone8.mjs';
import {stepField,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('zone eight gate, central area and saved location',()=>{
 const base={area:3,district:'lumiose-centrico-route',interior:null,x:19,y:1,facing:'up',zaRoyaleRank:'V'};
 assert.equal(stepField(base,'up').blocked,true);const entered=stepField({...base,zaRoyaleRank:'F'},'up');assert.equal(entered.district,'lumiose-zone8');
 const s={...base,...entered,zaRoyaleRank:'F'},map=zone8Map(s);assert.ok(fieldPath(map,s,{x:11,y:8}).length);assert.equal(zone8Visible(s,'b').species,66);assert.equal(zone8Visible({...s,zaZone8Spent:{machop:true}},'b'),null);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:8},42),42);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone8',11,8]);assert.equal(stepField(s,'down').district,'lumiose-centrico-route');
 assert.equal(zone8Encounter({x:11,y:8},()=>0).speciesId,66);assert.equal(zone8Encounter({x:3,y:8},()=>0).speciesId,322);
});
