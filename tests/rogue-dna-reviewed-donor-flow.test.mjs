import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon,rogueSpecies} from '../lib/rogue-reference.mjs';
import {configure} from '../lib/pokemon-config.mjs';
import {reviewedClassicDnaDonorForm,validatedClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';
import {classicRewardView,chooseClassicReward,CLASSIC_REWARD_REGISTRY} from '../lib/rogue-classic-rewards.mjs';
import {stageClassicDnaFusion} from '../lib/rogue-dna-fusion-stage.mjs';
import {createClassicCombat,restoreClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {ensureClassicState,startClassicRun} from '../lib/rogue-classic-state.mjs';
import {starterCatalog} from '../lib/rogue-starter-system.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
const forms=[...rogueSpecies.values()].flatMap(s=>s.formList.filter(f=>reviewedClassicDnaDonorForm(s.sourceId,f.formIndex,f.formKey,f.pokemonId||s.pokemonId)).map(f=>({s,f})));
function donor({s,f}){return configure({...makeReferenceMon(s.sourceId,50,{boxId:'donor',moves:['Splash']}),id:f.pokemonId||s.pokemonId,rogueFormIndex:f.formIndex,rogueFormKey:f.formKey,rogueBattleSpecies:f.nativeSpecies||null,rogueBaseStats:{...f.baseStats},rogueTypes:[...f.types],types:[...f.types],type:f.types[0],ability:f.abilities[0].key,rogueAbilitySlot:f.abilities[0].slot,gender:s.sourceId===678?'F':'M',shiny:true,variant:1});}
function fixture(row){const doc={coins:17,adventure:{keep:true}},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(e=>e.id===1);const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{seed:'donor-flow'});Object.assign(run,{screen:'reward',wave:21,party:[makeReferenceMon(151,50,{boxId:'primary',moves:['Splash']}),donor(row),makeReferenceMon(25,50,{boxId:'reserve',moves:['Splash']})],combat:null,pendingMoves:[],pendingGrowth:[],modifiers:[{id:'quickclaw',boxId:'donor',count:1,typeBoost:null}]});state.slots[1]={id:'other',safe:true};run.rewards=[{...CLASSIC_REWARD_REGISTRY.find(r=>r.effect==='dnafusion'),rewardId:'dna'}];return {doc,state,run};}
test('all reviewed donor forms are selectable rewards and survive actual battle, codec and confirmed unsplice',async()=>{
 assert.equal(forms.length,15);
 for(const row of forms){let {doc,state,run}=fixture(row);const before=structuredClone(run),original=structuredClone(run.party[1]),reserve=structuredClone(run.party[2]);const view=classicRewardView(run,state.system).find(r=>r.id==='dna');assert.ok(view.fusionPairs.some(p=>p.primaryBoxId==='primary'&&p.donorBoxId==='donor'),`${row.s.sourceId}:${row.f.formKey}`);chooseClassicReward(run,{rewardId:'dna',boxId:'primary',donorBoxId:'donor',confirmFusion:true},state.system);assert.equal(run.party.length,2);assert.deepEqual(run.party[1],reserve);assert.deepEqual(run.party[0].rogueFusion.donor,original);assert.equal(run.party[0].ability,original.ability);assert.ok(validatedClassicDnaFusion(run.party[0]));assert.equal(run.modifiers[0].boxId,'primary');assert.equal(run.pendingMoves.length,0);
 doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);run=state.slots[0];run.encounter={kind:'wild'};run.combat=createClassicCombat(run,[makeReferenceMon(143,50,{boxId:'foe',moves:['Splash']})]);const b=restoreClassicNativeBattle(run.combat,run);assert.equal(b.p1.active[0].ability,original.ability);run.combat=playClassicCombat(run,{type:'move',move:'splash'});assert.ok(run.combat.turn>=2||run.combat.ended);run.party=run.combat.teams[0];run.screen='reward';applyClassicAction(doc,{action:'unsplice',boxId:'primary',confirm:true});assert.equal(run.party[0].fusionSpecies,undefined);assert.equal(run.party[0].ability,before.party[0].ability);assert.equal(run.party.length,2);assert.ok(!run.party.some(p=>p.boxId==='donor'));assert.deepEqual(state.slots[1],{id:'other',safe:true});assert.deepEqual(doc.adventure,{keep:true});assert.equal(doc.coins,17);
 }
});
test('reviewed identity cannot authorize mismatched forms, stats or abilities and rejected fusion is atomic',()=>{
 for(const mutate of [p=>p.rogueFormKey='unknown',p=>p.rogueFormIndex=999,p=>p.id=999,p=>p.rogueBaseStats.atk++,p=>p.ability='blaze',p=>p.rogueBattleSpecies='charizard',p=>p.mega=true]){const {run}=fixture(forms.find(r=>r.s.sourceId===849));mutate(run.party[1]);const before=structuredClone(run);assert.throws(()=>stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}));assert.deepEqual(run,before);}
 const {run}=fixture(forms[0]);run.formItems={donor:['untransferred-form-item']};const before=structuredClone(run);assert.throws(()=>stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}));assert.deepEqual(run,before);
});
