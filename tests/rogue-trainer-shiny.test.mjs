import assert from 'node:assert/strict';
import {classicTrainerShiny} from '../lib/rogue-wild-variants.mjs';
import {classicTrainerEncounter,classicEncounter} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
const seq=(...values)=>()=>values.shift()??0;
assert.deepEqual(classicTrainerShiny(235,seq(1/1024)),{shiny:false,variant:0});
for(const [roll,variant] of [[0,2],[.1,1],[.4,0]])assert.deepEqual(classicTrainerShiny(235,seq(0,roll)),{shiny:true,variant});
function fixture(enabled,modifiers=[]){const run={id:'artist',wave:90,biome:0,rng:1121,party:[makeReferenceMon(151,100,{boxId:'p',moves:['Splash']})],modifiers,tools:{},seed:'fixture',...(enabled?{trainerShinyRule:'source-v1'}:{})};run.encounter=classicTrainerEncounter(run,3,{kind:'trainer'});return run;}
for(const mods of [[],[{id:'shinycharm',count:4}]]){const run=fixture(true,mods),mon=run.encounter.team[0];assert.equal(mon.rogueSourceId,235);assert.equal(mon.shiny,true);assert.equal(mon.variant,1);const combat=createClassicCombat(run,run.encounter.team,{trainer:true});assert.equal(restoreClassicNativeBattle(JSON.parse(JSON.stringify(combat)),run).p2.active[0].set.shiny,true);assert.equal(JSON.parse(JSON.stringify(combat)).teams[1][0].variant,1);}
assert.equal(fixture(false).encounter.team[0].shiny,false);
for(const wave of [145,195]){const run={id:'rival',wave,biome:0,rng:42,gymStart:20,party:[makeReferenceMon(151,100,{boxId:'p'})],modifiers:[],tools:{},seed:'fixture',trainerShinyRule:'source-v1'},ray=classicEncounter(run).team[5];assert.equal(ray.rogueSourceId,384);assert.equal(ray.shiny,true);assert.equal(ray.variant,1);}
console.log('Trainer shiny rates, charm independence, actual encounter, restore and legacy passed.');
