import assert from 'node:assert/strict';
import {makeReferenceMon,rogueSpecies} from '../lib/rogue-reference.mjs';
import {classicFormOptions,classicTransformationItems,applyClassicForm,revertClassicForm} from '../lib/rogue-transformations.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {classicGameView} from '../lib/rogue-classic-game.mjs';
for(const [id,item,move] of [[493,'flameplate','Judgment'],[773,'firememory','Multi-Attack']]){
 const mon=makeReferenceMon(id,50,{boxId:'hero',moves:[move],item:'leftovers'}),run={id:'typed-form',wave:40,biome:0,rng:42,party:[mon],modifiers:[],tools:{teraOrb:true},teraCharged:true,formItems:{hero:[]},encounter:{kind:'wild'}};
 assert.equal(classicFormOptions(mon,run).length,0);assert.ok(classicTransformationItems(mon,run).some(o=>o.key===item));run.formItems.hero=[item];assert.equal(classicFormOptions({...mon,ability:'pressure'},run).length,0);assert.equal(classicFormOptions({...mon,hp:0},run).length,0);
 const forms=classicFormOptions(mon,run,{includeUnavailable:true});assert.equal(forms.length,17);for(const choice of forms){run.formItems.hero=[choice.key];const next=applyClassicForm(mon,run,choice.key);assert.equal(next.rogueFormIndex,choice.formIndex);assert.equal(next.item,'leftovers');assert.match(next.sourceImage,new RegExp(`-o${choice.formKey}\\.gif$`));assert.match(next.sourceBackImage,/-b\.gif$/);assert.equal(revertClassicForm(next,run).rogueFormKey,'normal');}
 run.formItems.hero=[item];run.party=[applyClassicForm(mon,run,item)];run.combat=createClassicCombat(run,[makeReferenceMon(1,50,{boxId:'foe',moves:['Splash']})]);let native=restoreClassicNativeBattle(run.combat,run);assert.deepEqual(native.p1.active[0].getTypes(),['Fire']);assert.equal(run.combat.requests[0].moves[0].type,'불꽃');assert.equal(run.combat.requests[0].moves[0].effectiveness,2);
 const document={coins:0,collection:[]};ensureClassicState(document).slots[0]=run;run.screen='advance';const detail=classicGameView(document).run.party[0].moveDetails[0];assert.equal(detail.type,'불꽃');assert.equal(detail.typeKey,'fire');
 run.combat=playClassicCombat(run,{type:'move',move:id===493?'judgment':'multiattack'});assert.ok(run.combat.log.some(line=>line.includes('효과가 굉장')));run.party=run.combat.teams[0];native=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run);assert.deepEqual(native.p1.pokemon[0].getTypes(),['Fire']);assert.equal(run.party[0].item,'leftovers');
 assert.equal(rogueSpecies.get(id).formList.filter(f=>f.formKey&&f.formKey!=='normal').length,17);
}
