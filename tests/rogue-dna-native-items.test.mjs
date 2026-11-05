import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {stageClassicDnaFusion} from '../lib/rogue-dna-fusion-stage.mjs';
import {CLASSIC_REWARD_REGISTRY,classicRewardView,addClassicModifier,transferClassicModifier,applyClassicTrashDig} from '../lib/rogue-classic-rewards.mjs';
import {applyClassicAction,activeClassicRun,classicGameView} from '../lib/rogue-classic-game.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
import {fixture as persistentFixture} from './fixtures/dna-persistent.mjs';
function fixture(){
 const result=persistentFixture([1,7].map((id,i)=>({...makeReferenceMon(id,30,{boxId:['primary','donor'][i],moves:['Splash']}),item:'leftovers'})));
 result.run.rewards=[{...CLASSIC_REWARD_REGISTRY.find(reward=>reward.id==='dnasplicers'),rewardId:'duplicate-leftovers'}];
 result.state.slots[1]={id:'other',party:[{untouched:true}]};return result;
}
const total=run=>run.party.filter(mon=>mon.item==='leftovers').length+run.modifiers.filter(row=>row.id==='leftovers').reduce((sum,row)=>sum+row.count,0);
const fuse=doc=>applyClassicAction(doc,{action:'reward',rewardId:'duplicate-leftovers',boxId:'primary',donorBoxId:'donor',confirmFusion:true});
test('duplicate native Leftovers preserve both copies and existing stacks up to the source cap',()=>{
 for(const count of [0,1,2]){
  const {run}=fixture();for(let i=0;i<count;i++)run.modifiers.push({id:'leftovers',boxId:i?'donor':'primary',count:1});
  run.party.push(makeReferenceMon(4,30,{boxId:'unrelated',moves:['Splash']}));run.modifiers.push({id:'quickclaw',boxId:'unrelated',count:1});
  const before=structuredClone(run),staged=stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}).run;
  assert.deepEqual(run,before);assert.equal(total(staged),count+2);assert.equal(staged.party[0].item,'leftovers');assert.equal(staged.modifiers.find(row=>row.id==='leftovers').count,count+1);
  assert.deepEqual(staged.party[0].rogueFusion.donor,before.party[1]);assert.deepEqual(staged.party[1],before.party[2]);assert.deepEqual(staged.modifiers.find(row=>row.id==='quickclaw'),before.modifiers.at(-1));assert.ok(!staged.modifiers.some(row=>row.boxId==='donor'));
 }
});
test('real DNA reward candidates and confirmed action retain duplicate Leftovers across the save codec',async()=>{
 let {doc,run}=fixture();assert.ok(classicRewardView(run,ensureClassicState(doc).system)[0].fusionPairs.some(pair=>pair.primaryBoxId==='primary'&&pair.donorBoxId==='donor'));
 const party=structuredClone(run.party);assert.throws(()=>applyClassicAction(doc,{action:'reward',rewardId:'duplicate-leftovers',boxId:'primary',donorBoxId:'donor'}));assert.deepEqual(run.party,party);
 fuse(doc);doc=await decodeGameData(await encodeGameData(doc));run=activeClassicRun(doc);assert.equal(total(run),2);assert.equal(run.party.length,1);assert.equal(run.party[0].item,'leftovers');assert.equal(run.screen,'battle');
 const inventory=classicGameView(doc).run.modifierInventory;assert.equal(inventory.filter(row=>row.key.startsWith('native:leftovers:')||row.key.startsWith('modifier:leftovers:')).reduce((sum,row)=>sum+row.count,0),2);
 const saved=structuredClone(doc);assert.throws(()=>fuse(doc));saved.classic.slots[0].updatedAt=doc.classic.slots[0].updatedAt;assert.deepEqual(doc,saved);assert.deepEqual(doc.adventure,{safe:true});assert.equal(doc.coins,37);assert.deepEqual(doc.classic.slots[1],{id:'other',party:[{untouched:true}]});
});
test('both retained healing effects run after battle restore and remain owned after unsplice',async()=>{
 let {doc}=fixture();fuse(doc);let run=activeClassicRun(doc);run.party[0].hp=1;run.initialSwitchSlots=[];run.screen='battle';run.combat=createClassicCombat(run,[makeReferenceMon(129,30,{boxId:'foe',moves:['Splash']})]);
 for(let turn=0;turn<2;turn++){
  doc=await decodeGameData(await encodeGameData(doc));run=activeClassicRun(doc);const battle=restoreClassicNativeBattle(run.combat,run),mon=battle.p1.active[0],hp=mon.hp,healing=2*Math.floor(mon.baseMaxhp/16);
  assert.equal(mon.item,'leftovers');assert.equal(run.combat.modifiers.find(row=>row.id==='leftovers').count,1);applyClassicAction(doc,{action:'turn',command:{type:'move',move:'splash'}});
  assert.equal(run.party[0].hp,hp+healing);assert.equal(total(run),2);
 }
 run.screen='interlude';delete run.combat;applyClassicAction(doc,{action:'unsplice',boxId:'primary',confirm:true});doc=await decodeGameData(await encodeGameData(doc));run=activeClassicRun(doc);
 assert.equal(run.party.length,1);assert.equal(run.party[0].fusionSpecies,undefined);assert.equal(run.party[0].item,'leftovers');assert.equal(total(run),2);assert.ok(!run.modifiers.some(row=>row.boxId==='donor'));assert.deepEqual(doc.adventure,{safe:true});assert.equal(doc.coins,37);
});
test('overflow and ambiguous held metadata refuse the whole fusion without consuming items or reward',()=>{
 const variants=[
  run=>run.modifiers.push({id:'leftovers',boxId:'primary',count:3}),
  run=>run.modifiers.push({id:'leftovers',boxId:'donor',count:0}),
  run=>run.modifiers.push({id:'leftovers',boxId:'donor',count:1,active:false}),
  run=>run.modifiers.push({id:'leftovers',boxId:'primary',count:1,transferable:false}),
  run=>run.modifiers.push({id:'leftovers',boxId:'primary',count:1,typeBoost:'Water'}),
  run=>{run.party[1].rogueNativeItemNontransferable=true;},
  run=>run.modifiers.push({id:'unknown-held',boxId:'donor',count:1}),
 ];
 for(const mutate of variants){const {run,doc}=fixture();mutate(run);const before=structuredClone(run);assert.throws(()=>stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}));assert.deepEqual(run,before);assert.ok(!classicRewardView(run,ensureClassicState(doc).system)[0].fusionPairs.some(pair=>pair.primaryBoxId==='primary'&&pair.donorBoxId==='donor'));assert.throws(()=>fuse(doc));assert.deepEqual(run.party,before.party);assert.deepEqual(run.modifiers,before.modifiers);assert.deepEqual(run.rewards,before.rewards);}
});
test('empty-slot native transfers and unreviewed native conflicts keep their existing behavior',()=>{
 const empty=fixture().run;empty.party[0].item='';const transferred=stageClassicDnaFusion(empty,{primaryBoxId:'primary',donorBoxId:'donor'}).run;assert.equal(transferred.party[0].item,'leftovers');assert.equal(transferred.modifiers.length,0);
 for(const item of ['shellbell','oranberry','charizarditex']){const {run}=fixture();run.party[1].item=item;const before=structuredClone(run);assert.throws(()=>stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}));assert.deepEqual(run,before);}
});

test('reward and direct grants include the retained native Leftovers in the four-copy cap',()=>{
 const {run}=fixture();run.modifiers.push({id:'leftovers',boxId:'primary',count:2,typeBoost:null});const staged=stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}).run;
 staged.rewards=[{...CLASSIC_REWARD_REGISTRY.find(reward=>reward.id==='leftovers'),rewardId:'leftovers'}];
 assert.equal(classicRewardView(staged)[0].targets[0].eligible,false);const before=structuredClone(staged);assert.throws(()=>addClassicModifier(staged,'leftovers',{boxId:'primary'}),/한도/);assert.deepEqual(staged,before);
 staged.modifiers[0].count=2;assert.equal(classicRewardView(staged)[0].targets[0].eligible,true);addClassicModifier(staged,'leftovers',{boxId:'primary'});assert.equal(total(staged),4);
});
test('manual native and modifier transfers cannot exceed the combined cap',()=>{
 for(const kind of ['native','modifier']){const {run}=fixture();run.party[0].item=kind==='native'?'':'leftovers';run.modifiers=[{id:'leftovers',boxId:'primary',count:kind==='native'?4:3,typeBoost:null},{id:'leftovers',boxId:'donor',count:1,typeBoost:null}];const before=structuredClone(run);assert.throws(()=>transferClassicModifier(run,{fromBoxId:'donor',toBoxId:'primary',id:'leftovers',kind}),/한도|호환/);assert.deepEqual(run,before);run.modifiers[0].count--;transferClassicModifier(run,{fromBoxId:'donor',toBoxId:'primary',id:'leftovers',kind});assert.equal(run.modifiers.filter(row=>row.boxId==='primary').reduce((sum,row)=>sum+row.count,0)+Number(run.party[0].item==='leftovers'),4);}
});
test('automatic grants skip full native-plus-modifier holders and preserve legacy overflow',async()=>{
 let {doc,run}=fixture();run.modifiers=[{id:'leftovers',boxId:'primary',count:4,typeBoost:null}];const before=structuredClone(run.party[0]);assert.equal(total(run),6);assert.throws(()=>addClassicModifier(run,'leftovers',{boxId:'primary'}));
 const plan=applyClassicTrashDig(run);assert.equal(plan.find(row=>row.id==='leftovers').boxId,'donor');assert.equal(run.modifiers.find(row=>row.id==='leftovers'&&row.boxId==='primary').count,4);assert.deepEqual(run.party[0],before);
 doc=await decodeGameData(await encodeGameData(doc));run=activeClassicRun(doc);assert.equal(run.party[0].item,'leftovers');assert.equal(run.modifiers.find(row=>row.id==='leftovers'&&row.boxId==='primary').count,4);
 // Moving one existing copy away is allowed; no retrospective item deletion.
 transferClassicModifier(run,{fromBoxId:'primary',toBoxId:'donor',id:'leftovers',quantity:1,kind:'modifier'});assert.equal(run.modifiers.find(row=>row.id==='leftovers'&&row.boxId==='primary').count,3);assert.equal(total(run),7);
});
