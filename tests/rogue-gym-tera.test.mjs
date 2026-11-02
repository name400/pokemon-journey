import assert from 'node:assert/strict';
import {classicTrainerEncounter} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat} from '../lib/rogue-battle-engine.mjs';

for(const [id,wave,slot,type] of [[201,20,null,null],[201,120,-1,'Water'],[300,182,1,'Ice']]){
 const run={id:'gym-tera',wave,biome:0,rng:42,party:[makeReferenceMon(151,100,{boxId:'player',moves:['Protect']})],modifiers:[],tools:{},seed:'fixture',teraCharged:false};
 const encounter=classicTrainerEncounter(run,id,{kind:'trainer'}),chosen=encounter.team.filter(mon=>mon.rogueInstantTera);
 if(slot===null){assert.equal(chosen.length,0);continue;}
 assert.equal(chosen.length,1);assert.equal(chosen[0],encounter.team[(slot+encounter.team.length)%encounter.team.length]);assert.equal(chosen[0].teraType,type);
 run.encounter=encounter;run.combat=createClassicCombat(run,[chosen[0]],{trainer:true});const next=playClassicCombat(run,{type:'move',move:'protect'});assert.equal(next.teams[1][0].terastallized,type);
}
console.log('Gym wave threshold and Elite Four specialty Tera are applied in actual battle turns.');
