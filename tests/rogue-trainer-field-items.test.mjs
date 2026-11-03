import assert from 'node:assert/strict';
import {classicTrainerEncounter} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
function fixture(id,modern=true){const run={id:'rock',wave:199,biome:0,rng:42,party:[makeReferenceMon(151,100,{boxId:'player',moves:['Protect']})],modifiers:[],tools:{},seed:'fixture',trainerTraitsRule:'source-v1',...(modern?{trainerFieldItemsRule:'source-v1'}:{})};const encounter=classicTrainerEncounter(run,id,{kind:'champion'});run.encounter=encounter;run.combat=createClassicCombat(run,encounter.team,{trainer:true});return run;}
for(const [id,weather,species] of [[353,'sandstorm',526],[354,'raindance',279]]){
 const run=fixture(id),native=restoreClassicNativeBattle(run.combat,run);assert.equal(run.encounter.team[0].rogueSourceId,species);assert.equal(native.field.weather,weather);assert.equal(native.field.weatherState.duration,7);assert.equal(run.combat.modifiers.find(m=>m.id==='mysticalrock').count,1);
 run.combat=playClassicCombat(run,{type:'move',move:'protect'});const resumed=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run);assert.equal(resumed.field.weatherState.duration,6);
 const legacy=restoreClassicNativeBattle(fixture(id,false).combat);assert.equal(legacy.field.weatherState.duration,5);
}
// The source modifier extends both terrain and weather caused by its holder,
// stacks twice, and does not extend a different Pokémon's field effect.
const run=fixture(354),native=restoreClassicNativeBattle(run.combat,run),holder=native.p2.active[0],other=native.p1.active[0];
assert.equal(native.field.setTerrain('electricterrain',holder),true);assert.equal(native.field.terrainState.duration,7);
assert.equal(native.field.setTerrain('electricterrain',holder),false);assert.equal(native.field.terrainState.duration,7);
assert.equal(native.field.setTerrain('grassyterrain',other),true);assert.equal(native.field.terrainState.duration,5);
holder.addVolatile('embargo');assert.equal(native.field.setTerrain('psychicterrain',holder),true);assert.equal(native.field.terrainState.duration,5);
const doubled=fixture(354);doubled.combat.modifiers.find(m=>m.id==='mysticalrock').count=2;const again=restoreClassicNativeBattle(doubled.combat,doubled),owner=again.p2.active[0];assert.equal(again.field.setTerrain('mistyterrain',owner),true);assert.equal(again.field.terrainState.duration,9);
const steal=fixture(354);steal.modifiers.push({id:'miniblackhole',boxId:'player',count:1});steal.combat=createClassicCombat(steal,steal.encounter.team,{trainer:true});steal.combat=playClassicCombat(steal,{type:'move',move:'protect'});assert.equal(steal.modifiers.find(m=>m.id==='mysticalrock'&&m.boxId==='player')?.count,1);const postSteal=restoreClassicNativeBattle(steal.combat,steal);assert.equal(postSteal.field.setTerrain('electricterrain',postSteal.p1.active[0]),true);assert.equal(postSteal.field.terrainState.duration,7);
console.log('Trainer Mystical Rock: switch-in weather, terrain, stacking, ownership, saved duration and legacy passed.');
// The field duration wrapper must compose with the existing fog-clearing wrapper.
const fogRun={id:'fog-rock',wave:10,biome:0,rng:42,party:[makeReferenceMon(151,100,{boxId:'p',moves:['Protect']})],modifiers:[{id:'mysticalrock',boxId:'p',count:1}],tools:{},seed:'fog'};
fogRun.combat=createClassicCombat(fogRun,[makeReferenceMon(1,5,{boxId:'foe'})],{weather:'fog'});const fog=restoreClassicNativeBattle(fogRun.combat,fogRun);assert.equal(fog.rogueFog,true);assert.equal(fog.field.setWeather('raindance',fog.p1.active[0]),true);assert.equal(fog.rogueFog,false);assert.equal(fog.field.weatherState.duration,7);
