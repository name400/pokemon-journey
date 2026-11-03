import assert from 'node:assert/strict';
import {makeReferenceMon,rogueSpecies} from '../lib/rogue-reference.mjs';
import {rogueFormArt} from '../lib/rogue-form-art.mjs';
import {applyClassicForm} from '../lib/rogue-transformations.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {classicGameView} from '../lib/rogue-classic-game.mjs';
for(const [item,index,nativeId,type,local,foe,stat] of [[null,0,'ogerpontealtera','Grass','풀',7,'spe'],['wellspringmask',1,'ogerponwellspringtera','Water','물',4,'spd'],['hearthflamemask',2,'ogerponhearthflametera','Fire','불꽃',1,'atk'],['cornerstonemask',3,'ogerponcornerstonetera','Rock','바위',16,'def']])for(const shiny of [false,true]){
 const forms=rogueSpecies.get(1017).formList,form=forms.find(f=>f.formIndex===index),tera=forms.find(f=>f.formIndex===index+4),mon=makeReferenceMon(1017,50,{boxId:'oger',moves:['Ivy Cudgel'],shiny,...rogueFormArt(forms[0],shiny)}),run={id:'ogerpon',wave:50,biome:1,rng:42,party:[mon],modifiers:[],tools:{teraOrb:true},teraCharged:true,formItems:{oger:item?[item]:[]},encounter:{kind:'wild'}};
 if(item)run.party[0]=applyClassicForm(mon,run,item);run.combat=createClassicCombat(run,[makeReferenceMon(foe,100,{boxId:'foe',moves:['Splash']})]);let native=restoreClassicNativeBattle(run.combat,run),p=native.p1.active[0];assert.equal(p.teraType,type);assert.equal(run.combat.requests[0].moves[0].type,local);assert.equal(run.combat.requests[0].moves[0].effectiveness,2);assert.equal(run.combat.teams[0][0].sourceImage,rogueFormArt(form,shiny).sourceImage);
 const document={coins:0,collection:[]};ensureClassicState(document).slots[0]=run;run.screen='advance';assert.equal(classicGameView(document).run.party[0].moveDetails[0].type,local);
 run.combat=playClassicCombat(run,{type:'move',move:'ivycudgel',special:'terastallize'});run.party=run.combat.teams[0];native=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run);p=native.p1.active[0];assert.equal(p.species.id,nativeId);assert.equal(p.terastallized,type);assert.ok(p.ability.startsWith('embodyaspect'));assert.equal(p.boosts[stat],1);assert.equal(run.teraCharged,false);assert.equal(run.party[0].sourceImage,rogueFormArt(tera,shiny).sourceImage);assert.equal(run.party[0].sourceBackImage,rogueFormArt(tera,shiny).sourceBackImage);assert.ok(run.combat.log.some(line=>line.includes('효과가 굉장')));
}
