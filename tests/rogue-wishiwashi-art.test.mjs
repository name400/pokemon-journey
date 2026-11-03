import assert from 'node:assert/strict';
import {makeReferenceMon,rogueSpecies} from '../lib/rogue-reference.mjs';
import {rogueFormArt} from '../lib/rogue-form-art.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
for(const shiny of [false,true]){
 const forms=rogueSpecies.get(746).formList,base=forms.find(f=>f.formKey===''),school=forms.find(f=>f.formKey==='school'),mon=makeReferenceMon(746,50,{boxId:'fish',moves:['Splash'],shiny,...rogueFormArt(base,shiny)}),run={id:'school-art',wave:50,biome:1,rng:42,party:[mon],modifiers:[],tools:{},encounter:{kind:'wild'},teraCharged:false};
 run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'foe',moves:['Splash']})]);let native=restoreClassicNativeBattle(run.combat,run);assert.equal(native.p1.active[0].species.id,'wishiwashischool');assert.equal(run.combat.teams[0][0].sourceImage,rogueFormArt(school,shiny).sourceImage);assert.equal(run.combat.teams[0][0].sourceBackImage,rogueFormArt(school,shiny).sourceBackImage);
 native.p1.active[0].hp=Math.floor(native.p1.active[0].maxhp/4);run.combat.snapshot=snapshotClassicNativeBattle(native);run.combat=playClassicCombat(run,{type:'move',move:'splash'});run.party=run.combat.teams[0];native=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run);assert.equal(native.p1.active[0].species.id,'wishiwashi');assert.equal(run.party[0].sourceImage,rogueFormArt(base,shiny).sourceImage);assert.equal(run.party[0].sourceBackImage,rogueFormArt(base,shiny).sourceBackImage);
}
