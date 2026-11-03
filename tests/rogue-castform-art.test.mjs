import assert from 'node:assert/strict';
import {makeReferenceMon,rogueSpecies} from '../lib/rogue-reference.mjs';
import {rogueFormArt} from '../lib/rogue-form-art.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
for(const shiny of [false,true]){
 const forms=rogueSpecies.get(351).formList,base=forms.find(f=>f.formKey===''),mon=makeReferenceMon(351,50,{boxId:'castform',moves:['Sunny Day','Rain Dance','Hail','Sandstorm'],shiny,...rogueFormArt(base,shiny)}),run={id:'castform-art',wave:50,biome:1,rng:42,party:[mon],modifiers:[],tools:{},encounter:{kind:'wild'},teraCharged:false};
 run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'foe',moves:['Splash']})]);
 for(const [move,key,type] of [['sunnyday','sunny','Fire'],['raindance','rainy','Water'],['hail','snowy','Ice'],['sandstorm','','Normal']]){
  run.combat=playClassicCombat(run,{type:'move',move});run.party=run.combat.teams[0];const state=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run),form=forms.find(f=>f.formKey===key),art=rogueFormArt(form,shiny);assert.equal(state.p1.active[0].species.id,'castform'+key);assert.deepEqual(state.p1.active[0].getTypes(),[type]);assert.equal(run.party[0].sourceImage,art.sourceImage);assert.equal(run.party[0].sourceBackImage,art.sourceBackImage);
 }
}
