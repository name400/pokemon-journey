import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {fixture} from './fixtures/dna-persistent.mjs';
import {CLASSIC_REWARD_REGISTRY,classicRewardView,addClassicModifier,transferClassicModifier} from '../lib/rogue-classic-rewards.mjs';
import {classicCanReceiveHeldItem,classicHeldItemCount,classicTypeBoosterCount} from '../lib/rogue-held-item-cap.mjs';
import {stageClassicDnaFusion} from '../lib/rogue-dna-fusion-stage.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

test('named legacy held items count towards rewards, transfers and type limits after reload',async()=>{
 const holder=makeReferenceMon(151,50,{boxId:'holder',item:'Scope Lens'}),donor=makeReferenceMon(7,50,{boxId:'donor'}),{doc,run}=fixture([holder,donor]);
 run.modifiers=[{id:'scopelens',boxId:'donor',count:1,typeBoost:null}];run.rewards=[{...CLASSIC_REWARD_REGISTRY.find(r=>r.id==='scopelens'),rewardId:'lens'}];
 const restored=await decodeGameData(await encodeGameData(doc)),saved=restored.classic.slots[0],before=structuredClone(restored);
 assert.equal(classicHeldItemCount('scopelens',saved.modifiers,'holder',saved.party[0].item),1);
 assert.equal(classicRewardView(saved)[0].targets.find(t=>t.boxId==='holder').eligible,false);
 assert.throws(()=>addClassicModifier(saved,'scopelens',{boxId:'holder'}));
 assert.throws(()=>transferClassicModifier(saved,{fromBoxId:'donor',toBoxId:'holder',id:'scopelens',kind:'modifier'}));
 assert.deepEqual(restored,before);assert.equal(saved.party[0].item,'Scope Lens');assert.deepEqual(restored.classic.slots[1],{id:'other'});assert.deepEqual(restored.adventure,{safe:true});
 assert.equal(classicHeldItemCount('focusband',[],'holder','Focus Band'),1);
 assert.equal(classicTypeBoosterCount([{id:'typebooster',boxId:'holder',typeBoost:'Fire',count:98}],'holder','Fire','Charcoal'),99);
 assert.equal(classicCanReceiveHeldItem('typebooster',[{id:'typebooster',boxId:'holder',typeBoost:'Fire',count:98}],'holder','Charcoal',1,'Fire'),false);
});

test('fusion counts and preserves named native items rather than bypassing stack caps',async()=>{
 const mons=(first,second)=>[makeReferenceMon(151,50,{boxId:'primary',item:first}),makeReferenceMon(7,50,{boxId:'donor',item:second})];
 const blocked=fixture(mons('Scope Lens','scopelens')).run,before=structuredClone(blocked);
 assert.throws(()=>stageClassicDnaFusion(blocked,{primaryBoxId:'primary',donorBoxId:'donor'}),/중첩/);assert.deepEqual(blocked,before);
 const {doc,run}=fixture(mons('Focus Band','focusband')),original=structuredClone(run);
 const fused=stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}).run;
 assert.deepEqual(run,original);assert.equal(classicHeldItemCount('focusband',fused.modifiers,'primary',fused.party[0].item),2);
 assert.equal(fused.party[0].rogueFusion.donor.item,'focusband');doc.classic.slots[0]=fused;
 const restored=await decodeGameData(await encodeGameData(doc));assert.equal(classicHeldItemCount('focusband',restored.classic.slots[0].modifiers,'primary',restored.classic.slots[0].party[0].item),2);assert.deepEqual(restored.classic.slots[1],{id:'other'});assert.deepEqual(restored.adventure,{safe:true});
});

test('fusion handles legacy named healing and type items without dropping either owner',()=>{
 for(const [a,b,id,type] of [['Leftovers','leftovers','leftovers',null],['Mystic Water','mysticwater','typebooster','Water']]){
  const {run}=fixture([makeReferenceMon(151,50,{boxId:'primary',item:a}),makeReferenceMon(7,50,{boxId:'donor',item:b})]),before=structuredClone(run);
  const fused=stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}).run;assert.deepEqual(run,before);assert.equal(fused.party[0].rogueFusion.donor.item,b);
  const count=id==='typebooster'?classicTypeBoosterCount(fused.modifiers,'primary',type,fused.party[0].item):classicHeldItemCount(id,fused.modifiers,'primary',fused.party[0].item);assert.equal(count,2);
 }
});
