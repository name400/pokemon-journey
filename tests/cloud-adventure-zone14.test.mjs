import test from 'node:test';
import assert from 'node:assert/strict';
import {zone14Map,zone14Encounter,zone14Visible} from '../lib/cloud-adventure/adventure-zone14.mjs';
import {stepField,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('zone fourteen substation gate and saved position',()=>{
 const base={area:3,district:'lumiose-north-boulevard',interior:null,x:12,y:1,facing:'up',zaRoyaleRank:'E'};assert.equal(stepField(base,'up').blocked,true);
 const entered=stepField({...base,zaRoyaleRank:'D'},'up');assert.equal(entered.district,'lumiose-zone14');const s={...base,...entered,zaRoyaleRank:'D'},map=zone14Map(s);assert.ok(fieldPath(map,s,{x:12,y:10}).length);assert.equal(zone14Visible(s,'a').species,304);assert.equal(zone14Visible(s,'e').species,530);assert.equal(zone14Visible({...s,zaZone14Spent:{aron:true}},'a'),null);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:12,y:10},42),42);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone14',12,10]);assert.equal(stepField(s,'up').district,'lumiose-north-boulevard');assert.equal(zone14Encounter(s,()=>0).speciesId,304);
});
