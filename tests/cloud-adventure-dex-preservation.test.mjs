import test from 'node:test';import assert from 'node:assert/strict';
import {adventureDexEntries,registerAdventureDex,lumioseDexProgress} from '../lib/cloud-adventure/adventure-dex.mjs';

test('registration preserves unrecognized dex records without inventing points',()=>{
 const future={version:2,opaque:['keep']},world={adventureDexSpecies:[25,2000,future,25]};
 assert.equal(registerAdventureDex(world,152,25),1);assert.deepEqual(world.adventureDexSpecies,[25,2000,future,25,152]);assert.deepEqual(adventureDexEntries(world),[25,152]);assert.equal(lumioseDexProgress(world).registered,2);assert.equal(registerAdventureDex(world,152),0);assert.deepEqual(world.adventureDexSpecies,[25,2000,future,25,152]);
});

test('registration refuses unknown container while retaining legacy and canonical saves',()=>{
 const world={adventureDexSpecies:{version:2,opaque:['keep']}},before=structuredClone(world);assert.throws(()=>registerAdventureDex(world,1),/도감/);assert.deepEqual(world,before);
 const old={};assert.equal(registerAdventureDex(old,25,1,25),2);assert.deepEqual(old.adventureDexSpecies,[1,25]);assert.equal(registerAdventureDex({adventureDexSpecies:null},1),1);
});
