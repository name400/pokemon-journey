import assert from 'node:assert/strict';
import {makeReferenceMon,rogueSpecies} from '../lib/rogue-reference.mjs';
import {rogueFormArt} from '../lib/rogue-form-art.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
for(const shiny of [false,true]){
 const forms=rogueSpecies.get(648).formList,aria=forms.find(f=>f.formKey==='aria'),pirouette=forms.find(f=>f.formKey==='pirouette');
 const mon=makeReferenceMon(648,50,{boxId:'meloetta',moves:['Relic Song'],shiny,...rogueFormArt(aria,shiny)}),run={id:'meloetta-art',wave:50,biome:1,rng:42,party:[mon],modifiers:[],tools:{},encounter:{kind:'wild'},teraCharged:false};
 run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'foe',moves:['Splash']})]);
 for(const [form,native] of [[pirouette,'meloettapirouette'],[aria,'meloetta']]){
  run.combat=playClassicCombat(run,{type:'move',move:'relicsong'});run.party=run.combat.teams[0];const actual=run.party[0],state=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run);assert.equal(state.p1.active[0].species.id,native);assert.equal(actual.sourceImage,shiny?form.sourceShinyImage:form.sourceImage);assert.equal(actual.sourceBackImage,shiny?form.sourceShinyBackImage:form.sourceBackImage);assert.equal(actual.rogueSourceId,648);
 }
}
