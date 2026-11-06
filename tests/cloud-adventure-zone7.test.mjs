import test from 'node:test';
import assert from 'node:assert/strict';
import {zone7Map,zone7Unlocked,zone7Encounter} from '../lib/cloud-adventure/adventure-zone7.mjs';
import {stepField,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('zone seven gate, plaza and stored location',()=>{
 const base={area:3,district:'lumiose-centrico-route',interior:null,x:5,y:1,facing:'up',zaRoyaleRank:'V'};
 assert.equal(stepField(base,'up').blocked,true);const entered=stepField({...base,zaRoyaleRank:'F'},'up');assert.equal(entered.district,'lumiose-zone7');
 const s={...base,...entered,zaRoyaleRank:'F'},map=zone7Map();assert.ok(fieldPath(map,s,{x:10,y:10}).length);assert.equal(map[8][11],'#');
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:10,y:10},42),42);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone7',10,10]);
 assert.equal(stepField(s,'down').district,'lumiose-centrico-route');assert.equal(zone7Encounter('day',()=>0).speciesId,449);assert.equal(zone7Encounter('night',()=>0).speciesId,353);
});
