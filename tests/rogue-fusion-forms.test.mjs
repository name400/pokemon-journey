import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {classicFormOptions,classicTransformationItems,applyClassicForm,revertClassicForm} from '../lib/rogue-transformations.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';

// Pinned upstream requires a caught dex entry; the partner is not consumed.
for (const [id,required,item,appearance] of [[646,644,'darkstone','kyuremblack'],[646,643,'lightstone','kyuremwhite'],[800,792,'nlunarizer','necrozmadawnwings'],[800,791,'nsolarizer','necrozmaduskmane'],[898,896,'icyreinsofunity','calyrexice'],[898,897,'shadowreinsofunity','calyrexshadow']]) {
 const mon=makeReferenceMon(id,50,{boxId:'hero',moves:['Protect']}),run={id:'fusion',wave:100,biome:0,rng:42,party:[mon],modifiers:[],tools:{},teraCharged:false,formItems:{hero:[item]},encounter:{kind:'wild'}};
 const system={dex:{}};assert.equal(classicFormOptions(mon,run,{system}).length,0);assert.throws(()=>applyClassicForm(mon,run,item,system));
 system.dex[required]={caught:true};const before=JSON.stringify(system);
 assert.equal(classicFormOptions(mon,run,{system}).find(x=>x.key===item)?.appearance,appearance);
 run.formItems.hero=[];assert.ok(classicTransformationItems(mon,run,{system}).some(x=>x.key===item));run.formItems.hero=[item];
 run.party[0]=applyClassicForm(mon,run,item,system);assert.equal(JSON.stringify(system),before);assert.equal(run.party[0].battleAppearance,appearance);
 run.combat=createClassicCombat(run,[makeReferenceMon(19,2,{boxId:'foe',moves:['Splash']})]);const battle=restoreClassicNativeBattle(run.combat,run);assert.equal(battle.p1.active[0].species.id,appearance);
 if(id===800){run.formItems.hero.push('ultranecroziumz');run.party[0]=applyClassicForm(run.party[0],run,'ultranecroziumz',system);assert.equal(run.party[0].battleAppearance,'necrozmaultra');run.party[0]=revertClassicForm(run.party[0],run);assert.equal(run.party[0].battleAppearance,appearance);}
 assert.equal(revertClassicForm(run.party[0],run).rogueFormIndex,0);
}
