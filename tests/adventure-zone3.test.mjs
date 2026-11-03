import test from 'node:test';
import assert from 'node:assert/strict';
import {ZONE3_SPECIES,zone3Encounter,zone3Research} from '../lib/adventure-zone3.mjs';
import {researchSummary} from '../lib/adventure-research.mjs';

test('zone three six species and research, with Flabébé during the day',()=>{
 assert.equal(new Set(ZONE3_SPECIES).size,6);
 assert.deepEqual(Array.from({length:6},(_,i)=>zone3Encounter('day',()=>i/6).speciesId),ZONE3_SPECIES);
 assert.ok(!Array.from({length:5},(_,i)=>zone3Encounter('night',()=>i/5).speciesId).includes(669));
 const s={adventureDexSpecies:ZONE3_SPECIES.slice(0,5)};assert.deepEqual(zone3Research(s),{count:5,total:6,points:0});
 s.adventureDexSpecies=ZONE3_SPECIES;assert.deepEqual(zone3Research(s),{count:6,total:6,points:1000});assert.ok(researchSummary(s).points>=1000);
});
