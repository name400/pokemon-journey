import test from 'node:test';
import assert from 'node:assert/strict';
import {ZONE1_SPECIES,zone1RandomAlphaLevel} from '../lib/cloud-adventure/adventure-zone1.mjs';

test('Zone 1 random alpha requires story and survey, with the 5% boundary and documented levels',()=>{
 const base={zaMission05Complete:true,adventureDexSpecies:ZONE1_SPECIES};
 assert.equal(zone1RandomAlphaLevel({...base,zaMission05Complete:false},13,()=>0),null);
 assert.equal(zone1RandomAlphaLevel({...base,adventureDexSpecies:ZONE1_SPECIES.slice(1)},13,()=>0),null);
 assert.equal(zone1RandomAlphaLevel(base,25,()=>0),null);
 assert.equal(zone1RandomAlphaLevel(base,13,()=>.05),null);
 assert.equal(zone1RandomAlphaLevel(base,13,()=>0),15);
 let calls=0;assert.equal(zone1RandomAlphaLevel(base,172,()=>calls++===0?.049:.999),17);
 assert.equal(zone1RandomAlphaLevel({...base,zaMission05Complete:false,zaMission06Started:true},179,()=>0),15);
});
