import assert from 'node:assert/strict';
import {classicEncounter} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon,rogueSpecies} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';

for(const [wave,bars,instant] of [[8,0,false],[95,0,true],[145,2,true],[195,3,true]]){
 const run={id:'rival-traits',wave,biome:0,rng:42,gymStart:20,party:[makeReferenceMon(151,100,{boxId:'player',moves:['Protect']})],modifiers:[],tools:{},seed:'fixture',teraCharged:false};
 const encounter=classicEncounter(run),lead=encounter.team[0],record=rogueSpecies.get(lead.rogueSourceId);assert.equal(encounter.kind,'rival');assert.equal(lead.ability,record.abilities.find(a=>a.slot==='primary').key);assert.equal(lead.rogueBossSegments,bars);assert.equal(!!lead.rogueInstantTera,instant);
 run.encounter=encounter;run.combat=createClassicCombat(run,encounter.team,{trainer:true});const next=playClassicCombat(run,{type:'move',move:'protect'});assert.equal(next.teams[1][0].terastallized,instant?lead.teraType:null);const native=restoreClassicNativeBattle(next,run).p2.pokemon[0];assert.equal(native.getAbility().id,lead.ability);if(instant)assert.deepEqual(native.getTypes(),[lead.teraType]);
}
console.log('Rival starter primary ability, boss segments and configured Tera across four fights: passed.');
