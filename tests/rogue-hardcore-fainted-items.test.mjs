import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {CLASSIC_REWARD_REGISTRY,classicRewardView,chooseClassicReward,generateClassicRewardsWithTiers,transferClassicModifier} from '../lib/rogue-classic-rewards.mjs';
import {classicServices,buyClassicService} from '../lib/rogue-classic-services.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
function setup(hardcore=true){const dead=makeReferenceMon(7,20,{boxId:'dead',moves:['Tackle']}),alive=makeReferenceMon(129,20,{boxId:'alive',moves:['Splash']});dead.hp=0;dead.pp={tackle:0};const data=fixture([dead,alive]);data.run.challenges=hardcore?[{id:9,value:1}]:[];data.run.wave=81;return data;}
for(const [label,reward] of [['held item',{...CLASSIC_REWARD_REGISTRY.find(x=>x.id==='soothebell'),rewardId:'test'}],['technical machine',{...CLASSIC_REWARD_REGISTRY.find(x=>x.id==='tm2'),rewardId:'test',moveName:'파도타기'}]])test(`hardcore rejects ${label} on fainted party member without consuming reward`,()=>{
 const {run,state}=setup();run.rewards=[reward];const before=structuredClone(run);const row=classicRewardView(run,state.system)[0].targets.find(t=>t.boxId==='dead');assert.equal(row.eligible,false);assert.throws(()=>chooseClassicReward(run,{rewardId:'test',boxId:'dead'},state.system));assert.deepEqual(run,before);
});
test('hardcore rejects PP restoration on fainted party member without charging',()=>{
 const {run,state}=setup();const ether=classicServices(run,{system:state.system}).find(s=>s.id==='ether');assert.equal(ether.targets.find(t=>t.boxId==='dead').eligible,false);const before=structuredClone(run);assert.throws(()=>buyClassicService(run,{itemId:'ether',boxId:'dead',moveIndex:0,expectedPrice:ether.price},{system:state.system}));assert.deepEqual(run,before);
});
test('ordinary play still permits held rewards and PP restoration on fainted party members',()=>{
 const {run,state}=setup(false);run.rewards=[{...CLASSIC_REWARD_REGISTRY.find(x=>x.id==='soothebell'),rewardId:'test'}];assert.equal(classicRewardView(run,state.system)[0].targets.find(t=>t.boxId==='dead').eligible,true);chooseClassicReward(run,{rewardId:'test',boxId:'dead'},state.system);assert.equal(run.modifiers.find(m=>m.id==='soothebell').boxId,'dead');run.screen='reward';const ether=classicServices(run,{system:state.system}).find(s=>s.id==='ether');assert.equal(ether.targets.find(t=>t.boxId==='dead').eligible,true);buyClassicService(run,{itemId:'ether',boxId:'dead',moveIndex:0,expectedPrice:ether.price},{system:state.system});assert.equal(run.party[0].hp,0);assert.equal(run.party[0].pp.tackle,10);
});
test('hardcore generates technical machines for at least one usable party member',()=>{
 const {run,state}=setup();run.party[1]=makeReferenceMon(25,20,{boxId:'alive',moves:['Tackle']});let seen=0;
 for(let i=0;i<300;i++){const item=generateClassicRewardsWithTiers(run,[2],state.system)[0];if(item.effect!=='tm')continue;seen++;const targets=classicRewardView(run,state.system)[0].targets;assert.equal(targets.find(t=>t.boxId==='dead').eligible,false);assert.equal(targets.find(t=>t.boxId==='alive').eligible,true);}
 assert.ok(seen,'the reward generator must offer representative TMs');
});
test('hardcore generates Z crystals only for living targets',()=>{
 const {run,state}=setup();run.tools.zRing=true;let seen=0;
 for(let i=0;i<300;i++){const item=generateClassicRewardsWithTiers(run,[2],state.system)[0];if(item.id!=='zcrystal')continue;seen++;assert.equal(item.boxId,'alive');assert.equal(classicRewardView(run,state.system)[0].targets.find(t=>t.boxId==='dead').eligible,false);}
 assert.ok(seen,'the reward generator must offer representative Z crystals');
});
test('hardcore retains existing party-held item transfers',()=>{
 const {run}=setup();run.modifiers=[{id:'soothebell',boxId:'dead',count:1}];transferClassicModifier(run,{fromBoxId:'dead',toBoxId:'alive',id:'soothebell',kind:'modifier',quantity:1});assert.equal(run.modifiers.find(m=>m.id==='soothebell').boxId,'alive');
});
test('hardcore still allows a living target and preserves unrelated saves',async()=>{
 const {doc,run,state}=setup();run.rewards=[{...CLASSIC_REWARD_REGISTRY.find(x=>x.id==='soothebell'),rewardId:'test'}];chooseClassicReward(run,{rewardId:'test',boxId:'alive'},state.system);const saved=await decodeGameData(await encodeGameData(doc)),restored=ensureClassicState(saved).slots[0];assert.equal(restored.modifiers.find(m=>m.id==='soothebell').boxId,'alive');assert.equal(restored.party.find(p=>p.boxId==='dead').hp,0);assert.deepEqual(saved.adventure,{safe:true});assert.equal(saved.classic.slots[1].id,'other');
});
