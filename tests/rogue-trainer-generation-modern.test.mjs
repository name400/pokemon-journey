// Synthetic one-turn coverage; this is not a natural 200-wave playthrough.
import assert from 'node:assert/strict';
import {classicTrainerEncounter,classicWorldReference} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
for(const id of Object.keys(classicWorldReference.trainerConfigs)){
 const run={id:'modern-trainer-generation',wave:199,biome:0,rng:42,party:[makeReferenceMon(151,100,{boxId:'player',moves:['Protect']})],modifiers:[],tools:{},seed:'fixture',trainerSketchRule:'source-v1',trainerShinyRule:'source-v1',trainerTraitsRule:'source-v1',trainerItemsRule:'source-v1',trainerFieldItemsRule:'source-v1'};
 const encounter=classicTrainerEncounter(run,Number(id),{kind:'trainer'});assert.ok(encounter.team.length,`trainer ${id}: empty team`);run.encounter=encounter;run.combat=createClassicCombat(run,encounter.team,{trainer:true});run.combat=playClassicCombat(run,{type:'move',move:'protect'});assert.ok(run.combat.turn>=1,`trainer ${id}: no turn`);assert.ok(restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run),`trainer ${id}: restore failed`);
}
console.log('Trainer configurations initialize, play a synthetic turn and restore with the enabled new-run traits and item rules.');
