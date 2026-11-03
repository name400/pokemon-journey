import assert from 'node:assert/strict';
import {classicTrainerShiny} from '../lib/rogue-trainer-generation.mjs';
import {classicTrainerEncounter,classicEncounter} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
const rng=(...v)=>()=>{assert.ok(v.length,'unexpected RNG call');return v.shift();};
assert.deepEqual(classicTrainerShiny(235,rng(1/1024)),{shiny:false,variant:0});
for(const [r,variant] of [[.0,2],[.1,1],[.3,1],[.4,0],[.9,0]])assert.deepEqual(classicTrainerShiny(235,rng(0,r)),{shiny:true,variant});
function artist(seed,modern=true,modifiers=[]){let run={id:'artist',wave:90,biome:0,rng:seed,party:[makeReferenceMon(151,100,{boxId:'player',moves:['Splash']})],modifiers,tools:{},seed:'fixture',...(modern?{trainerGenerationRule:'source-v1'}:{})};const encounter=classicTrainerEncounter(run,3,{kind:'trainer'});run.encounter=encounter;return {run,encounter};}
for(const mods of [[],[{id:'shinycharm',count:4}]]){const {run,encounter}=artist(1121,true,mods),mon=encounter.team[0];assert.equal(mon.rogueSourceId,235);assert.equal(mon.shiny,true);assert.equal(mon.variant,1);assert.deepEqual(mon.moves,['스케치','스케치','스케치','스케치']);run.combat=createClassicCombat(run,[mon],{trainer:true});let native=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run);assert.equal(native.p2.active[0].set.shiny,true);assert.deepEqual(native.p2.active[0].baseMoveSlots.map(s=>s.id),Array(4).fill('sketch'));run.combat=playClassicCombat(run,{type:'move',move:'splash'});native=restoreClassicNativeBattle(run.combat,run);assert.ok(native.p2.active[0].moves.includes('splash'));}
const old=artist(1121,false).encounter.team[0];assert.equal(old.shiny,false);assert.notDeepEqual(old.moves,['스케치','스케치','스케치','스케치']);
for(const wave of [145,195]){const run={id:'rival-ray',wave,biome:0,rng:42,gymStart:20,party:[makeReferenceMon(151,100,{boxId:'player'})],modifiers:[],tools:{},seed:'fixture',trainerGenerationRule:'source-v1'},ray=classicEncounter(run).team[5];assert.equal(ray.rogueSourceId,384);assert.equal(ray.shiny,true);assert.equal(ray.variant,1);}
console.log('Trainer shiny boundaries, charm independence, actual Sketch and fixed rival shiny variant passed.');
