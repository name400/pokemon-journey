import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {fixture as persistentFixture} from './fixtures/dna-persistent.mjs';
import {stageClassicDnaFusion} from '../lib/rogue-dna-fusion-stage.mjs';
import {CLASSIC_REWARD_REGISTRY,classicRewardView,addClassicModifier,transferClassicModifier,applyClassicTrashDig} from '../lib/rogue-classic-rewards.mjs';
import {applyClassicAction,activeClassicRun} from '../lib/rogue-classic-game.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {classicHeldItemCount} from '../lib/rogue-held-item-cap.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
const items=['leftovers','shellbell'];
function fixture(primaryItem='shellbell',donorItem='shellbell'){
 const result=persistentFixture([makeReferenceMon(151,50,{boxId:'primary',moves:['Seismic Toss','Splash'],item:primaryItem}),makeReferenceMon(7,50,{boxId:'donor',moves:['Splash'],item:donorItem})]);
 result.run.rewards=[{...CLASSIC_REWARD_REGISTRY.find(row=>row.id==='dnasplicers'),rewardId:'healing-items'}];return result;
}
test('all four reviewed healing native pairs fuse through reward, save and unsplice without lost copies',async()=>{
 for(const primaryItem of items)for(const donorItem of items){let {doc,run}=fixture(primaryItem,donorItem);assert.ok(classicRewardView(run)[0].fusionPairs.some(pair=>pair.primaryBoxId==='primary'&&pair.donorBoxId==='donor'));
  applyClassicAction(doc,{action:'reward',rewardId:'healing-items',boxId:'primary',donorBoxId:'donor',confirmFusion:true});doc=await decodeGameData(await encodeGameData(doc));run=activeClassicRun(doc);assert.equal(run.party.length,1);assert.equal(run.party[0].item,primaryItem);assert.equal(run.modifiers.find(row=>row.id===donorItem).count,1);assert.equal(run.party[0].rogueFusion.donor.item,donorItem);
  run.screen='interlude';delete run.combat;applyClassicAction(doc,{action:'unsplice',boxId:'primary',confirm:true});doc=await decodeGameData(await encodeGameData(doc));run=activeClassicRun(doc);assert.equal(run.party.length,1);assert.equal(run.party[0].item,primaryItem);assert.equal(run.modifiers.find(row=>row.id===donorItem).count,1);assert.deepEqual(doc.adventure,{safe:true});assert.equal(doc.coins,37);
 }
});
test('two Shell Bells heal after real damage on consecutive restored turns',async()=>{
 let {run}=fixture();run=stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}).run;run.party[0].hp=1;run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'foe',moves:['Splash']})]);
 for(let i=0;i<2;i++){run=(await decodeGameData(await encodeGameData({run}))).run;const battle=restoreClassicNativeBattle(run.combat,run),hp=battle.p1.active[0].hp;run.combat=playClassicCombat(run,{type:'move',move:'seismictoss'});run.party=run.combat.teams[0];assert.equal(run.party[0].hp,hp+12);assert.equal(classicHeldItemCount('shellbell',run.modifiers,'primary',run.party[0].item),2);}
});
test('Life Orb and a reviewed healing item preserve both effects through fusion, battle and unsplice',async()=>{
 for(const healingItem of items)for(const lifeOrbOnDonor of [false,true]){
  let {doc,run}=fixture(lifeOrbOnDonor?healingItem:'lifeorb',lifeOrbOnDonor?'lifeorb':healingItem);const before=structuredClone(run);
  assert.ok(classicRewardView(run)[0].fusionPairs.some(pair=>pair.primaryBoxId==='primary'&&pair.donorBoxId==='donor'));
  assert.deepEqual(run,before);
  applyClassicAction(doc,{action:'reward',rewardId:'healing-items',boxId:'primary',donorBoxId:'donor',confirmFusion:true});
  doc=await decodeGameData(await encodeGameData(doc));run=activeClassicRun(doc);
  assert.equal(run.party[0].item,'lifeorb');assert.equal(run.modifiers.find(row=>row.id===healingItem)?.count,1);
  assert.equal(run.party[0].rogueFusion.donor.item,lifeOrbOnDonor?'lifeorb':healingItem);
  run.party[0].hp=50;const max=run.party[0].maxHp;
  run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'foe',moves:['Splash']})]);
  doc=await decodeGameData(await encodeGameData(doc));run=activeClassicRun(doc);
  run.combat=playClassicCombat(run,{type:'move',move:'seismictoss'});run.party=run.combat.teams[0];
  assert.equal(run.party[0].hp,50-Math.floor(max/10)+(healingItem==='leftovers'?Math.floor(max/16):Math.floor(50/8)));
  run.screen='interlude';delete run.combat;applyClassicAction(doc,{action:'unsplice',boxId:'primary',confirm:true});
  doc=await decodeGameData(await encodeGameData(doc));run=activeClassicRun(doc);
  assert.equal(run.party[0].item,'lifeorb');assert.equal(run.modifiers.find(row=>row.id===healingItem)?.count,1);
  assert.deepEqual(doc.adventure,{safe:true});assert.equal(doc.coins,37);
 }
});
test('Life Orb and healing item fusion rejects bound and ambiguous donor records atomically',()=>{
 for(const mutate of [r=>{r.party[1].rogueNativeItemNontransferable=true;},r=>r.modifiers.push({id:'shellbell',boxId:'donor',count:1,active:false}),r=>r.modifiers.push({id:'shellbell',boxId:'primary',count:4})]){
  const {run}=fixture('lifeorb','shellbell');mutate(run);const before=structuredClone(run);
  assert.throws(()=>stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}));assert.deepEqual(run,before);
 }
});
test('native Wide Lens and a reviewed healing item retain distinct effects through fusion and restore',async()=>{
 for(const healingItem of items)for(const lensOnDonor of [false,true]){
  let {doc,run}=fixture(lensOnDonor?healingItem:'widelens',lensOnDonor?'widelens':healingItem);
  const before=structuredClone(run);
  assert.ok(classicRewardView(run)[0].fusionPairs.some(pair=>pair.primaryBoxId==='primary'&&pair.donorBoxId==='donor'));
  assert.deepEqual(run,before);
  applyClassicAction(doc,{action:'reward',rewardId:'healing-items',boxId:'primary',donorBoxId:'donor',confirmFusion:true});
  doc=await decodeGameData(await encodeGameData(doc));run=activeClassicRun(doc);
  assert.equal(run.party[0].item,'widelens');assert.equal(run.modifiers.find(row=>row.id===healingItem)?.count,1);
  assert.ok(!run.modifiers.some(row=>row.id==='widelens'));
  assert.equal(run.party[0].rogueFusion.donor.item,lensOnDonor?'widelens':healingItem);
  run.party[0].hp=50;const max=run.party[0].maxHp;
  run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'foe',moves:['Splash']})]);
  doc=await decodeGameData(await encodeGameData(doc));run=activeClassicRun(doc);
  const battle=restoreClassicNativeBattle(run.combat,run),p=battle.p1.active[0],foe=battle.p2.active[0];
  // Native Wide Lens multiplies 70 by 1.1; source Wide Lens would add 5.
  assert.equal(battle.runEvent('ModifyAccuracy',foe,p,battle.dex.moves.get('thunder'),70),77);
  run.combat=playClassicCombat(run,{type:'move',move:'seismictoss'});run.party=run.combat.teams[0];
  assert.equal(run.party[0].hp,50+(healingItem==='leftovers'?Math.floor(max/16):Math.floor(50/8)));
  run.screen='interlude';delete run.combat;applyClassicAction(doc,{action:'unsplice',boxId:'primary',confirm:true});
  doc=await decodeGameData(await encodeGameData(doc));run=activeClassicRun(doc);
  assert.equal(run.party[0].item,'widelens');assert.equal(run.modifiers.find(row=>row.id===healingItem)?.count,1);
  assert.ok(!run.modifiers.some(row=>row.id==='widelens'));assert.deepEqual(doc.adventure,{safe:true});assert.equal(doc.coins,37);
 }
});
test('Wide Lens and healing item fusion rejects nontransferable or ambiguous records without mutation',()=>{
 for(const lensOnDonor of [false,true])for(const mutate of [r=>{r.party[1].rogueNativeItemNontransferable=true;},r=>r.modifiers.push({id:'shellbell',boxId:'donor',count:1,active:false}),r=>r.modifiers.push({id:'shellbell',boxId:'primary',count:4})]){
  const {run}=fixture(lensOnDonor?'shellbell':'widelens',lensOnDonor?'widelens':'shellbell');mutate(run);const before=structuredClone(run);
  assert.throws(()=>stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}));assert.deepEqual(run,before);
 }
});
test('native and source Wide Lenses remain separately effective when the native lens is removed',()=>{
 let {run}=fixture('widelens','leftovers');run.modifiers.push({id:'widelens',boxId:'donor',count:1,typeBoost:null});
 run=stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}).run;
 run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'foe',moves:['Splash']})]);
 const battle=restoreClassicNativeBattle(run.combat,run),p=battle.p1.active[0],foe=battle.p2.active[0],move=battle.dex.moves.get('thunder');
 assert.equal(battle.runEvent('ModifyAccuracy',foe,p,move,70),82);
 assert.equal(p.takeItem(foe)?.id,'widelens');
 assert.equal(battle.runEvent('ModifyAccuracy',foe,p,move,70),75);
 assert.equal(run.combat.modifiers.find(row=>row.id==='widelens')?.count,1);
 assert.equal(run.combat.modifiers.find(row=>row.id==='leftovers')?.count,1);
});
test('Shell Bell caps include the native slot for fusion, reward, direct grant, transfer and automatic allocation',()=>{
 const {run}=fixture();run.modifiers=[{id:'shellbell',boxId:'primary',count:2,typeBoost:null}];const staged=stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}).run;
 staged.rewards=[{...CLASSIC_REWARD_REGISTRY.find(row=>row.id==='shellbell'),rewardId:'bell'}];assert.equal(classicRewardView(staged)[0].targets[0].eligible,false);const before=structuredClone(staged);assert.throws(()=>addClassicModifier(staged,'shellbell',{boxId:'primary'}));assert.deepEqual(staged,before);
 staged.party.push(makeReferenceMon(7,50,{boxId:'other',moves:['Splash'],item:'shellbell'}));staged.modifiers.push({id:'shellbell',boxId:'other',count:1,typeBoost:null});assert.throws(()=>transferClassicModifier(staged,{fromBoxId:'other',toBoxId:'primary',kind:'modifier',id:'shellbell'}));assert.equal(applyClassicTrashDig(staged).find(plan=>plan.id==='shellbell').boxId,'other');
 const oversized=fixture().run;oversized.modifiers=[{id:'shellbell',boxId:'primary',count:3,typeBoost:null}];const saved=structuredClone(oversized);assert.throws(()=>stageClassicDnaFusion(oversized,{primaryBoxId:'primary',donorBoxId:'donor'}));assert.deepEqual(oversized,saved);
});
