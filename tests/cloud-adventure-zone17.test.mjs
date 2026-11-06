import test from 'node:test';
import assert from 'node:assert/strict';
import {stepField,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {zone17Map,zone17Visible,zone17Encounter} from '../lib/cloud-adventure/adventure-zone17.mjs';
test('zone seventeen gate, field and save migration',()=>{
 const base={area:3,district:'lumiose-vert2',interior:null,x:1,y:5,facing:'left',zaRoyaleRank:'D'};
 assert.equal(stepField(base,'left').blocked,true);
 const entered=stepField({...base,zaRoyaleRank:'C'},'left');assert.equal(entered.district,'lumiose-zone17');
 const s={...base,...entered,zaRoyaleRank:'C'};assert.ok(fieldPath(zone17Map(s),s,{x:11,y:8}).length);
 assert.equal(zone17Visible(s,'a').species,650);assert.equal(zone17Encounter(s,()=>0).speciesId,650);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:8},2),2);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone17',11,8]);assert.equal(stepField(s,'down').district,'lumiose-vert2');
});
