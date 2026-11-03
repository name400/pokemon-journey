import assert from 'node:assert/strict';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {classicEvolutionOptions} from '../lib/rogue-evolution.mjs';

// Both Sliggoo forms require rain, fog or heavy rain at level 50. An
// explicitly empty active weather must override the biome's starting rain.
for (const id of [705,6705]) {
 const mon=makeReferenceMon(id,50,{boxId:`sliggoo-${id}`});
 const run={party:[mon],modifiers:[],biome:1,wave:100,weather:'raindance'};
 const ready=()=>classicEvolutionOptions(mon,run,{}).some(option=>option.ready);
 assert.equal(ready(),true,'legacy snapshots without combat weather fall back to biome');
 run.combat={weather:''};assert.equal(ready(),false,'expired rain does not return');
 run.combat.weather='sunnyday';assert.equal(ready(),false,'sun replaces biome rain');
 for(const weather of ['raindance','fog','primordialsea']) {run.combat.weather=weather;assert.equal(ready(),true,weather);}
}

function battle(initialWeather,weatherMove) {
 const doc={coins:42,collection:[]},state=ensureClassicState(doc),hero=makeReferenceMon(705,49,{boxId:'hero',moves:[weatherMove,'Seismic Toss']}),foe=makeReferenceMon(242,100,{boxId:'foe',moves:['Splash']});foe.hp=1;
 const run={id:'weather-evolution',wave:100,biome:1,weather:initialWeather,rng:42,party:[hero],modifiers:[],tools:{},teraCharged:false,encounter:{kind:'wild'},screen:'battle',money:1000,balls:{pokeball:5},participants:[],awardedFoes:[],pendingMoves:[]};state.slots[0]=run;run.combat=createClassicCombat(run,[foe],{weather:initialWeather});
 applyClassicAction(doc,{action:'turn',command:{type:'move',move:weatherMove}});
 // Restore between changing the weather and earning the level.
 const saved=JSON.parse(JSON.stringify(doc)),restored=ensureClassicState(saved).slots[0];
 applyClassicAction(saved,{action:'turn',command:{type:'move',move:'seismictoss'}});
 while(restored.screen==='learn'){const p=restored.pendingMoves[0];applyClassicAction(saved,{action:'learn',boxId:p.boxId,move:p.move,slot:null});}
 return {saved,run:restored};
}
const rain=battle('','raindance');assert.equal(rain.run.combat.weather,'raindance');assert.equal(rain.run.screen,'evolution');
const restored=JSON.parse(JSON.stringify(rain.saved));const result=applyClassicAction(restored,{action:'resolveEvolution',decision:'evolve'});assert.equal(result.evolutionResult.after.rogueSourceId,706);assert.equal(restored.coins,rain.saved.coins);assert.deepEqual(restored.collection,[]);
const sun=battle('raindance','sunnyday');assert.equal(sun.run.combat.weather,'sunnyday');assert.notEqual(sun.run.screen,'evolution');assert.equal(sun.run.party[0].rogueSourceId,705);
console.log('Weather evolution uses the saved active weather, including changed or expired weather.');
