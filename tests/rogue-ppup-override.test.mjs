import test from 'node:test';import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {CLASSIC_REWARD_REGISTRY,classicRewardView,chooseClassicReward} from '../lib/rogue-classic-rewards.mjs';
import {classicMaxPP} from '../lib/rogue-classic-services.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture(modern=true,id='ppup'){
 const hero=makeReferenceMon(151,50,{boxId:'hero',moves:['Zippy Zap','Tackle']}),ally=makeReferenceMon(1,50,{boxId:'ally',moves:['Splash']});hero.pp={zippyzap:7,tackle:4};hero.roguePPMax={zippyzap:19};
 const def=CLASSIC_REWARD_REGISTRY.find(r=>r.id===id);return {id:'pp-override',wave:21,rng:42,screen:'reward',party:[hero,ally],modifiers:[],tools:{},balls:{},money:100,rewards:[{...def,rewardId:'reward'}],...(modern?{ppUpEligibilityRule:'source-v1',zippyPpRule:'source-v1'}:{})};
}
test('fixed PP is disabled in the view and rejected atomically by the server',async()=>{
 for(const id of ['ppup','ppmax']){const doc=await decodeGameData(await encodeGameData({run:fixture(true,id),other:{keep:true}})),run=doc.run,view=classicRewardView(run)[0],hero=view.targets.find(t=>t.boxId==='hero');
  assert.equal(hero.eligible,true);assert.equal(hero.moves[0].maxPp,19);assert.equal(hero.moves[0].canBoostPP,false);assert.equal(hero.moves[1].canBoostPP,true);
  const before=structuredClone(doc);assert.throws(()=>chooseClassicReward(run,{rewardId:'reward',boxId:'hero',moveIndex:0}));assert.deepEqual(doc,before);
 }
});
test('an eligible second move remains usable and other party data is unchanged',()=>{
 const run=fixture(),oldHero=structuredClone(run.party[0]),ally=structuredClone(run.party[1]);chooseClassicReward(run,{rewardId:'reward',boxId:'hero',moveIndex:1});
 assert.equal(run.party[0].roguePPUps.tackle,1);assert.equal(run.party[0].pp.tackle,11);assert.equal(run.party[0].pp.zippyzap,7);assert.deepEqual(run.party[0].roguePPMax,oldHero.roguePPMax);assert.deepEqual(run.party[1],ally);
});
test('a Pokémon with no eligible move is disabled and legacy rule stays unchanged',()=>{
 const modern=fixture();modern.party[0].moves=['Zippy Zap'];const row=classicRewardView(modern)[0].targets.find(t=>t.boxId==='hero');assert.equal(row.eligible,false);assert.equal(row.moves[0].canBoostPP,false);
 const old=fixture(false),legacy=classicRewardView(old)[0].targets.find(t=>t.boxId==='hero');assert.equal(legacy.moves[0].canBoostPP,true);chooseClassicReward(old,{rewardId:'reward',boxId:'hero',moveIndex:0});assert.equal(old.party[0].roguePPUps.zippyzap,1);assert.equal(classicMaxPP(old.party[0],0),19);
});
test('new starts opt in without changing another save slot',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs');const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};
 const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'ppup-rule',seed:'ppup-rule'});assert.equal(run.ppUpEligibilityRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});
});
