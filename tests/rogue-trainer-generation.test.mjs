// Synthetic generation and one-turn coverage; this is not a natural run.
import assert from 'node:assert/strict';
import {classicTrainerEncounter,classicWorldReference} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat} from '../lib/rogue-battle-engine.mjs';

let generated=0;
for(const id of Object.keys(classicWorldReference.trainerConfigs))for(const rng of [1,42,123]){
 const run={id:'trainer-generation',wave:199,biome:0,rng,party:[makeReferenceMon(1,100)],modifiers:[],tools:{},seed:'fixture'};
 const encounter=classicTrainerEncounter(run,Number(id),{kind:'trainer'});
 assert.ok(encounter.team.length,`trainer ${id}, seed ${rng}: empty team`);
 for(const mon of encounter.team)assert.ok(mon.ability&&mon.moves.length&&mon.maxHp>0,`trainer ${id}, seed ${rng}: invalid member`);
 if(rng===42){run.party=[makeReferenceMon(151,100,{boxId:'player',moves:['Protect']})];run.encounter=encounter;run.combat=createClassicCombat(run,encounter.team,{trainer:true});assert.ok(run.combat.requests[0],`trainer ${id}: no player request`);const next=playClassicCombat(run,{type:'move',move:'protect'});assert.ok(next.turn>=1,`trainer ${id}: no combat turn`);}
 generated++;
}
assert.equal(generated,Object.keys(classicWorldReference.trainerConfigs).length*3);
console.log(`${generated} trainer teams generated across three seeds; one seed per trainer plays one turn. This is not a full playthrough.`);
