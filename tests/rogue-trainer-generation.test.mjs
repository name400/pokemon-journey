// Generation coverage only; this does not simulate battles or a natural run.
import assert from 'node:assert/strict';
import {classicTrainerEncounter,classicWorldReference} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';

let generated=0;
for(const id of Object.keys(classicWorldReference.trainerConfigs))for(const rng of [1,42,123]){
 const run={id:'trainer-generation',wave:199,biome:0,rng,party:[makeReferenceMon(1,100)],modifiers:[],tools:{},seed:'fixture'};
 const encounter=classicTrainerEncounter(run,Number(id),{kind:'trainer'});
 assert.ok(encounter.team.length,`trainer ${id}, seed ${rng}: empty team`);
 for(const mon of encounter.team)assert.ok(mon.ability&&mon.moves.length&&mon.maxHp>0,`trainer ${id}, seed ${rng}: invalid member`);
 generated++;
}
assert.equal(generated,Object.keys(classicWorldReference.trainerConfigs).length*3);
console.log(`${generated} trainer teams generated across three seeds; this is not a full playthrough.`);
