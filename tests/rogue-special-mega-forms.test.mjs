import assert from 'node:assert/strict';
import appearance from '../data/pokemon-appearance.json' with {type:'json'};
import {makeReferenceMon,rogueSpecies} from '../lib/rogue-reference.mjs';
import {classicFormOptions,classicTransformationItems,applyClassicForm,revertClassicForm} from '../lib/rogue-transformations.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
for(const [species,index,item,expected,art,ability] of [[801,1,'magearnite','magearnaoriginalmega',10318,'soulheart'],[978,0,'tatsugirinite','tatsugiricurlymega',10322,'stormdrain'],[978,1,'tatsugirinite','tatsugiridroopymega',10323,'stormdrain'],[978,2,'tatsugirinite','tatsugiristretchymega',10324,'stormdrain']]){
 const form=rogueSpecies.get(species).formList.find(f=>f.formIndex===index),mon=makeReferenceMon(species,50,{boxId:'hero',rogueFormIndex:index,rogueFormKey:form.formKey,rogueBattleSpecies:form.nativeSpecies,rogueBaseStats:form.baseStats,rogueTypes:form.types,types:form.types,moves:['Protect'],terastallized:'Water'});
 const run={id:'special-mega',wave:60,biome:0,rng:42,party:[mon],modifiers:[],tools:{megaBracelet:false,teraOrb:true},teraCharged:false,formItems:{hero:[item]},encounter:{kind:'wild'}};
 assert.equal(classicFormOptions(mon,run).length,0);assert.throws(()=>applyClassicForm(mon,run,item));run.tools.megaBracelet=true;assert.equal(classicFormOptions(mon,run)[0].appearance,expected);
 run.formItems.hero=[];assert.ok(classicTransformationItems(mon,run,{rare:true}).some(x=>x.key===item));run.formItems.hero=[item];run.party[0]=applyClassicForm(mon,run,item);assert.equal(run.party[0].mega,true);assert.equal(run.party[0].terastallized,null);assert.equal(appearance.artByBattleKey[expected],art);
 run.teraCharged=true;run.combat=createClassicCombat(run,[makeReferenceMon(143,60,{boxId:'foe',moves:['Splash']})]);let native=restoreClassicNativeBattle(run.combat,run);assert.equal(native.p1.active[0].species.id,expected);assert.equal(native.p1.active[0].ability,ability);assert.equal(run.combat.teams[0][0].mega,true);assert.ok(!run.combat.requests[0].specials.some(x=>x.key==='terastallize'));
 run.combat=playClassicCombat(run,{type:'move',move:'protect'});run.party=run.combat.teams[0];native=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run);assert.equal(native.p1.active[0].species.id,expected);assert.equal(native.p1.active[0].ability,ability);assert.equal(run.combat.teams[0][0].mega,true);
 const reverted=revertClassicForm(run.party[0],run);assert.equal(reverted.rogueFormIndex,index);assert.equal(reverted.mega,false);
}
