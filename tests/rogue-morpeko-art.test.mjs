import assert from 'node:assert/strict';
import {makeReferenceMon,rogueSpecies} from '../lib/rogue-reference.mjs';
import {rogueFormArt} from '../lib/rogue-form-art.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {classicGameView} from '../lib/rogue-classic-game.mjs';
for(const shiny of [false,true]){
 const forms=rogueSpecies.get(877).formList,base=forms.find(f=>f.formKey==='full-belly'),hungry=forms.find(f=>f.formKey==='hangry'),mon=makeReferenceMon(877,50,{boxId:'morpeko',moves:['Splash','Aura Wheel'],shiny,...rogueFormArt(base,shiny)}),run={id:'hunger-art',wave:50,biome:1,rng:42,party:[mon],modifiers:[],tools:{},encounter:{kind:'wild'},teraCharged:false};
 run.combat=createClassicCombat(run,[makeReferenceMon(151,100,{boxId:'foe',moves:['Splash']})]);run.combat=playClassicCombat(run,{type:'move',move:'splash'});run.party=run.combat.teams[0];let native=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run);assert.equal(native.p1.active[0].species.id,'morpekohangry');assert.equal(run.party[0].sourceImage,rogueFormArt(hungry,shiny).sourceImage);assert.equal(run.party[0].sourceBackImage,rogueFormArt(hungry,shiny).sourceBackImage);let wheel=run.combat.requests[0].moves.find(m=>m.id==='aurawheel');assert.equal(wheel.type,'악');assert.equal(wheel.effectiveness,2);
 const document={coins:0,collection:[]};ensureClassicState(document).slots[0]=run;run.screen='advance';assert.equal(classicGameView(document).run.party[0].moveDetails[1].type,'악');
 run.combat=playClassicCombat(run,{type:'move',move:'aurawheel'});run.party=run.combat.teams[0];native=restoreClassicNativeBattle(run.combat,run);assert.ok(run.combat.log.some(line=>line.includes('효과가 굉장')));assert.equal(native.p1.active[0].species.id,'morpeko');assert.equal(run.party[0].sourceImage,rogueFormArt(base,shiny).sourceImage);wheel=run.combat.requests[0].moves.find(m=>m.id==='aurawheel');assert.equal(wheel.type,'전기');
}
