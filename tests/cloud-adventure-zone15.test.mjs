import test from 'node:test';
import assert from 'node:assert/strict';
import {zone15Map,zone15Encounter,zone15Visible} from '../lib/cloud-adventure/adventure-zone15.mjs';
import {stepField,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('zone fifteen gate, day/night encounters and saved position',()=>{
 const base={area:3,district:'lumiose-north-boulevard',interior:null,x:19,y:1,facing:'up',zaRoyaleRank:'E'};assert.equal(stepField(base,'up').blocked,true);
 const entered=stepField({...base,zaRoyaleRank:'D'},'up');assert.equal(entered.district,'lumiose-zone15');const s={...base,...entered,zaRoyaleRank:'D'},map=zone15Map(s);assert.ok(fieldPath(map,s,{x:11,y:9}).length);assert.equal(zone15Visible({...s,zaZone15Period:'day'},'b').species,545);assert.equal(zone15Visible({...s,zaZone15Period:'night'},'b').species,353);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:9},42),42);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone15',11,9]);assert.equal(stepField(s,'left').district,'lumiose-north-boulevard');assert.equal(zone15Encounter('day',()=>.3).speciesId,545);assert.equal(zone15Encounter('night',()=>.4).speciesId,353);
});
