import test from 'node:test';
import assert from 'node:assert/strict';
import {ZONE2_SPECIES,zone2Encounter,zone2Research} from '../lib/adventure-zone2.mjs';
import {researchSummary} from '../lib/adventure-research.mjs';

test('zone two research and night-only Staryu use documented species',()=>{
 assert.deepEqual(ZONE2_SPECIES,[14,504,688,129,406,120]);
 const day=Array.from({length:5},(_,i)=>zone2Encounter('day',()=>i/5).speciesId),night=Array.from({length:6},(_,i)=>zone2Encounter('night',()=>i/6).speciesId);
 assert.ok(!day.includes(120));assert.deepEqual(night,ZONE2_SPECIES);assert.equal(zone2Encounter('night',()=>.999).level,6);
 const s={adventureDexSpecies:ZONE2_SPECIES.slice(0,5)};assert.deepEqual(zone2Research(s),{count:5,total:6,points:0});
 s.adventureDexSpecies=ZONE2_SPECIES;assert.deepEqual(zone2Research(s),{count:6,total:6,points:1000});assert.equal(researchSummary(s).points,1100);
});
