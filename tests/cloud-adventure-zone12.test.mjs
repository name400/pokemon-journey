import test from 'node:test';
import assert from 'node:assert/strict';
import {zone12Map,zone12Encounter,zone12Visible} from '../lib/cloud-adventure/adventure-zone12.mjs';
import {stepField,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('zone twelve snow park gate and saved position',()=>{
 const base={area:3,district:'lumiose-centrico-route',interior:null,x:14,y:15,facing:'down',zaRoyaleRank:'F'};assert.equal(stepField(base,'down').blocked,true);
 const entered=stepField({...base,zaRoyaleRank:'E'},'down');assert.equal(entered.district,'lumiose-zone12');const s={...base,...entered,zaRoyaleRank:'E'},map=zone12Map(s);assert.ok(fieldPath(map,s,{x:6,y:5}).length);assert.equal(zone12Visible(s,'b').species,67);assert.equal(zone12Visible(s,'d').species,712);assert.equal(stepField({...s,x:14,y:7},'right').blocked,true);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:6,y:5},42),42);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone12',6,5]);assert.equal(stepField(s,'left').district,'lumiose-centrico-route');assert.equal(zone12Encounter(s,()=>0).speciesId,225);
});
