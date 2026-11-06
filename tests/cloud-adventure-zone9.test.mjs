import test from 'node:test';
import assert from 'node:assert/strict';
import {zone9Map,zone9Encounter,zone9Visible} from '../lib/cloud-adventure/adventure-zone9.mjs';
import {stepField,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('zone nine entry and rooftop keep saved positions',()=>{
 const base={area:3,district:'lumiose-centrico-route',interior:null,x:2,y:1,facing:'up',zaRoyaleRank:'V'};
 assert.equal(stepField(base,'up').blocked,true);const entered=stepField({...base,zaRoyaleRank:'F'},'up');assert.equal(entered.district,'lumiose-zone9');
 const s={...base,...entered,zaRoyaleRank:'F'},ground=zone9Map(s);assert.ok(fieldPath(ground,s,{x:5,y:6}).length);assert.equal(zone9Visible(s,'a').species,302);
 const roof={...s,zaZone9Upper:true,x:5,y:6},map=zone9Map(roof);assert.ok(fieldPath(map,roof,{x:17,y:12}).length);assert.equal(zone9Visible(roof,'b').species,303);assert.equal(zone9Visible(roof,'d').species,703);
 const restored=restoreAdventurePosition(storeAdventurePosition(roof,42),42);assert.deepEqual([restored.district,restored.zaZone9Upper,restored.x,restored.y],['lumiose-zone9',true,5,6]);assert.equal(stepField(s,'down').district,'lumiose-centrico-route');assert.equal(zone9Encounter(roof,()=>0).speciesId,703);
});
