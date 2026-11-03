import assert from 'node:assert/strict';
import {makeReferenceMon,rogueSpecies} from '../lib/rogue-reference.mjs';
import {classicFormOptions,classicTransformationItems,applyClassicForm,revertClassicForm} from '../lib/rogue-transformations.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';

for (const [index,expected,base] of [[0,'urshifugmax','urshifu'],[1,'urshifurapidstrikegmax','urshifurapidstrike']]) {
 const form=rogueSpecies.get(892).formList.find(f=>f.formIndex===index);
 const mon=makeReferenceMon(892,50,{boxId:'hero',rogueFormIndex:index,rogueFormKey:form.formKey,rogueBattleSpecies:base,rogueBaseStats:form.baseStats,rogueTypes:form.types,types:form.types,moves:['Protect'],terastallized:'Water'});
 const run={id:'urshifu',wave:60,biome:0,rng:42,party:[mon],modifiers:[],tools:{dynamaxBand:false,teraOrb:true},teraCharged:false,formItems:{hero:['maxmushrooms']},encounter:{kind:'wild'}};
 assert.equal(classicFormOptions(mon,run).length,0);
 assert.throws(()=>applyClassicForm(mon,run,'maxmushrooms'));
 run.tools.dynamaxBand=true;assert.equal(classicFormOptions(mon,run)[0].appearance,expected);
 run.formItems.hero=[];assert.ok(classicTransformationItems(mon,run,{rare:true}).some(x=>x.key==='maxmushrooms'));
 run.formItems.hero=['maxmushrooms'];run.party[0]=applyClassicForm(mon,run,'maxmushrooms');
 assert.equal(run.party[0].battleAppearance,expected);assert.equal(run.party[0].terastallized,null);assert.equal(run.party[0].gigantamax,true);
 run.combat=createClassicCombat(run,[makeReferenceMon(143,60,{boxId:'foe',moves:['Splash']})]);
 let native=restoreClassicNativeBattle(run.combat,run);assert.equal(native.p1.active[0].species.id,expected);assert.equal(native.p1.active[0].weighthg,9999);assert.equal(run.combat.requests[0].specials.some(x=>x.key==='terastallize'),false);
 run.combat=playClassicCombat(run,{type:'move',move:'protect'});run.party=run.combat.teams[0];native=restoreClassicNativeBattle(run.combat,run);assert.equal(native.p1.active[0].species.id,expected);
 const reverted=revertClassicForm(run.party[0],run);assert.equal(reverted.battleAppearance,base);assert.equal(reverted.gigantamax,false);
}
