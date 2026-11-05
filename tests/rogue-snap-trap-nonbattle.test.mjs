import test from 'node:test';import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {CLASSIC_REWARD_REGISTRY,boosterTypePool,classicRewardView,chooseClassicReward} from '../lib/rogue-classic-rewards.mjs';
import {planClowningAroundTypes,stageClowningAroundTypes} from '../lib/rogue-clowning-around.mjs';
import {createClassicCombat,classicCombatView,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture(modern=true){const hero=makeReferenceMon(133,50,{boxId:'hero',moves:['Snap Trap']}),def=CLASSIC_REWARD_REGISTRY.find(r=>r.id==='zcrystal');return {id:'snap-outside',wave:50,rng:42,screen:'reward',party:[hero],modifiers:[],tools:{zRing:true},balls:{},money:100,encounter:{kind:'trainer'},rewards:[{...def,rewardId:'z',crystal:modern?'steeliumz':'grassiumz',boxId:'hero'}],...(modern?{snapTrapRule:'source-v1'}:{})};}
test('type booster pool uses Steel for source runs and Grass for legacy runs',()=>{
 const modern=fixture(),old=fixture(false),before=structuredClone(modern);assert.deepEqual(boosterTypePool(modern),['Steel']);assert.deepEqual(boosterTypePool(old),['Grass']);assert.deepEqual(modern,before);
 modern.party[0].ability='normalize';assert.deepEqual(boosterTypePool(modern),['Normal']);
});
test('clown type planning uses source type and survives saved staged results',async()=>{
 for(const modern of [true,false]){const run=fixture(modern),expected=modern?'강철':'풀';assert.equal(planClowningAroundTypes(run.party,()=>0,run)[0].second,expected);
  run.screen='mystery';run.mystery={type:'clowning-around',stage:'confirm',selection:{job:'types'}};const next=stageClowningAroundTypes(run);assert.equal(next.party[0].rogueCustomSecondType,expected);const doc=await decodeGameData(await encodeGameData({run:next,other:{keep:true}}));assert.equal(doc.run.party[0].rogueCustomSecondType,expected);assert.deepEqual(doc.other,{keep:true});}
});
test('matching Z crystal can be awarded and used after selecting the source type',()=>{
 for(const modern of [true,false]){const run=fixture(modern),view=classicRewardView(run)[0];assert.equal(view.targets[0].eligible,true);chooseClassicReward(run,{rewardId:'z',boxId:'hero'});assert.equal(run.party[0].item,modern?'steeliumz':'grassiumz');
  const foe=makeReferenceMon(9,100,{boxId:'foe',moves:['Splash']});run.combat=createClassicCombat(run,[foe],{trainer:true});const move=classicCombatView(run.combat).requests[0].moves[0];assert.equal(move.variants.zmove.disabled,undefined);run.combat=playClassicCombat(run,{type:'move',move:'snaptrap',special:'zmove'});assert.equal(restoreClassicNativeBattle(run.combat,run).p1.zMoveUsed,true);}
});
test('wrong-type crystal is rejected without spending the reward',()=>{
 for(const modern of [true,false]){const run=fixture(modern);run.rewards[0].crystal=modern?'grassiumz':'steeliumz';const before=structuredClone(run);
  assert.equal(classicRewardView(run)[0].targets[0].eligible,false);assert.throws(()=>chooseClassicReward(run,{rewardId:'z',boxId:'hero'}));assert.deepEqual(run,before);}
});
