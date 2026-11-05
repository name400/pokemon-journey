import test from 'node:test';import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {fixture as persistentFixture} from './fixtures/dna-persistent.mjs';
import {classicFormOptions,applyClassicForm} from '../lib/rogue-transformations.mjs';
import {CLASSIC_REWARD_REGISTRY,chooseClassicReward} from '../lib/rogue-classic-rewards.mjs';
import {stageClassicDnaFusion} from '../lib/rogue-dna-fusion-stage.mjs';
import {validatedClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';
import {createClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
const rows=[['sharpmeteorite','attack'],['hardmeteorite','defense'],['smoothmeteorite','speed']];
function fixture(primary=386,donor=151){const f=persistentFixture([makeReferenceMon(primary,50,{boxId:'primary',moves:['Splash']}),makeReferenceMon(donor,50,{boxId:'donor',moves:['Splash']})]);f.run.formItemStateRule='source-v1';return f;}
function reward(f,item,boxId){f.run.rewards=[{...CLASSIC_REWARD_REGISTRY.find(r=>r.id==='rareformitem'),rewardId:'form',boxId,formItem:item}];chooseClassicReward(f.run,{rewardId:'form',boxId},f.state.system);}
for(const [item,form] of rows)test(`Deoxys ${form} item, fusion roles, battle and restore`,async()=>{
 let f=fixture();reward(f,item,'primary');assert.equal(f.run.party[0].rogueFormKey,form);assert.equal(f.run.formItemStates.primary[item],true);let merged=stageClassicDnaFusion(f.run,{primaryBoxId:'primary',donorBoxId:'donor',system:f.state.system}).run;assert.equal(merged.party[0].rogueFormKey,form);assert.ok(validatedClassicDnaFusion(merged.party[0]));merged.party[0]=applyClassicForm(merged.party[0],merged,'reverse:'+item,f.state.system);assert.equal(merged.party[0].rogueFormKey,'normal');assert.ok(validatedClassicDnaFusion(merged.party[0]));merged.party[0]=applyClassicForm(merged.party[0],merged,item,f.state.system);assert.equal(merged.party[0].rogueFormKey,form);
 merged.encounter={kind:'wild'};merged.combat=createClassicCombat(merged,[makeReferenceMon(143,2,{boxId:'foe',moves:['Splash']})]);const restored=await decodeGameData(await encodeGameData({run:merged,other:{safe:true}}));assert.equal(restored.run.combat.teams[0][0].rogueFormKey,form);assert.deepEqual(restored.other,{safe:true});merged.party=merged.combat.teams[0];merged.screen='reward';f.state.slots[0]=merged;applyClassicAction(f.doc,{action:'unsplice',boxId:'primary',confirm:true});assert.equal(f.state.slots[0].party[0].rogueFormKey,form);assert.equal(f.state.slots[0].party[0].fusionSpecies,undefined);assert.equal(f.state.slots[0].formItemStates.primary[item],true);
 f=fixture(151,386);reward(f,item,'donor');const donor=f.run.party[1];assert.equal(donor.rogueFormKey,form);merged=stageClassicDnaFusion(f.run,{primaryBoxId:'primary',donorBoxId:'donor',system:f.state.system}).run;assert.equal(merged.party[0].rogueFusion.donor.rogueFormKey,form);assert.ok(validatedClassicDnaFusion(merged.party[0]));assert.ok(classicFormOptions(merged.party[0],merged).length>0);
});
