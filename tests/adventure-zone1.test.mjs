import test from 'node:test';
import assert from 'node:assert/strict';
import {ZONE1_SPECIES,zone1Encounter,zone1Research} from '../lib/adventure-zone1.mjs';
import {researchSummary} from '../lib/adventure-research.mjs';

test('verified zone one species and 7-species research objective',()=>{
 assert.deepEqual(ZONE1_SPECIES,[13,16,172,179,659,661,664]);
 assert.deepEqual(ZONE1_SPECIES.map((_,i)=>zone1Encounter(()=>i/7).speciesId),ZONE1_SPECIES);
 assert.equal(zone1Encounter(()=>.999).level,5);
 const s={adventureDexSpecies:ZONE1_SPECIES.slice(0,6)};assert.deepEqual(zone1Research(s),{count:6,total:7,points:0});
 s.adventureDexSpecies=ZONE1_SPECIES;assert.deepEqual(zone1Research(s),{count:7,total:7,points:1000});assert.equal(researchSummary(s).points,1100);
});
