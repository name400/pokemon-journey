import test from 'node:test';
import assert from 'node:assert/strict';
import {zone16Map,zone16Encounter,zone16Visible} from '../lib/cloud-adventure/adventure-zone16.mjs';
import {stepField,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('zone sixteen gate, central monument and saved position',()=>{
 const base={area:3,district:'lumiose-zone5',interior:null,x:17,y:15,facing:'down',zaRoyaleRank:'D'};assert.equal(stepField(base,'down').blocked,true);
 const entered=stepField({...base,zaRoyaleRank:'C'},'down');assert.equal(entered.district,'lumiose-zone16');const s={...base,...entered,zaRoyaleRank:'C'},map=zone16Map(s);assert.ok(fieldPath(map,s,{x:11,y:7}).length);assert.equal(map[8][11],'#');assert.equal(map[4][18],'~');assert.equal(zone16Visible(s,'b').species,870);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:7},42),42);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone16',11,7]);assert.equal(stepField(s,'up').district,'lumiose-zone5');assert.equal(zone16Encounter(s,()=>0).speciesId,180);
});
