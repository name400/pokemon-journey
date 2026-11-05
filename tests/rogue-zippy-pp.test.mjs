import test from 'node:test';import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,classicCombatView,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {classicMaxPP,classicRemainingPP,classicServices,restoreClassicParty} from '../lib/rogue-classic-services.mjs';
import {CLASSIC_REWARD_REGISTRY,chooseClassicReward} from '../lib/rogue-classic-rewards.mjs';
import {queueClassicMoves,learnClassicPendingMove} from '../lib/rogue-classic-growth.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture(modern=true){const hero=makeReferenceMon(151,50,{boxId:'hero',moves:['Zippy Zap']}),foe=makeReferenceMon(242,100,{boxId:'foe',moves:['Splash']});hero.pp={zippyzap:7};const run={id:'zippy-pp',wave:21,rng:42,screen:'reward',party:[hero],modifiers:[],tools:{},balls:{},money:10000,encounter:{kind:'trainer'},...(modern?{zippyPpRule:'source-v1',zippyZapRule:'source-v1'}:{})};run.combat=createClassicCombat(run,[foe],{trainer:true});return run;}
test('source PP and PP Ups scale correctly without changing existing stored values',()=>{
 const run=fixture(),hero=run.party[0];for(const [stages,max] of [[0,15],[1,18],[2,21],[3,24]]){hero.roguePPUps={zippyzap:stages};assert.equal(classicMaxPP(hero,0,run),max);assert.equal(classicRemainingPP(hero,0,run),7);}
 assert.equal(classicMaxPP(hero,0),16);assert.equal(hero.pp.zippyzap,7);hero.roguePPMax={zippyzap:19};assert.equal(classicMaxPP(hero,0,run),19);
});
test('actual battle, displayed PP and save recovery use the selected run rule',async()=>{
 for(const modern of [true,false]){let run=fixture(modern);const before=structuredClone(run.party[0]);assert.equal(classicCombatView(run.combat).requests[0].moves[0].maxPp,modern?15:10);const b=restoreClassicNativeBattle(run.combat,run);b.makeChoices('move zippyzap','move splash');assert.equal(b.p1.active[0].moveSlots[0].pp,6);run.combat.snapshot=snapshotClassicNativeBattle(b);
  const saved=await decodeGameData(await encodeGameData({run,other:{keep:true}}));run=saved.run;const restored=restoreClassicNativeBattle(run.combat,run);assert.equal(restored.p1.active[0].moveSlots[0].pp,6);assert.equal(restored.p1.active[0].moveSlots[0].maxpp,modern?15:10);assert.deepEqual(run.party[0],before);assert.deepEqual(saved.other,{keep:true});}
});
test('PP services show and restore to the correct maximum without touching the original',()=>{
 const run=fixture(),before=structuredClone(run.party);const ether=classicServices(run).find(s=>s.id==='ether');assert.equal(ether.targets[0].moves[0].maxPp,15);
 const result=restoreClassicParty(run.party,'ether',{boxId:'hero',moveIndex:0,run});assert.equal(result[0].pp.zippyzap,15);assert.deepEqual(run.party,before);
 const old=fixture(false),legacy=restoreClassicParty(old.party,'ether',{boxId:'hero',moveIndex:0,run:old});assert.equal(legacy[0].pp.zippyzap,10);
});
test('PP Up preserves spent PP while increasing the maximum',()=>{
 const run=fixture(),def=CLASSIC_REWARD_REGISTRY.find(r=>r.id==='ppup');run.rewards=[{...def,rewardId:'pp-test'}];chooseClassicReward(run,{rewardId:'pp-test',boxId:'hero',moveIndex:0});
 assert.equal(run.party[0].roguePPUps.zippyzap,1);assert.equal(classicMaxPP(run.party[0],0,run),18);assert.equal(run.party[0].pp.zippyzap,10);
});
test('PP Max and move relearner use the source maximum',()=>{
 const run=fixture(),def=CLASSIC_REWARD_REGISTRY.find(r=>r.id==='ppmax');run.rewards=[{...def,rewardId:'max-test'}];chooseClassicReward(run,{rewardId:'max-test',boxId:'hero',moveIndex:0});
 assert.equal(run.party[0].roguePPUps.zippyzap,3);assert.equal(classicMaxPP(run.party[0],0,run),24);assert.equal(run.party[0].pp.zippyzap,16);
 const mon=run.party[0];mon.moves=['Splash'];mon.pp={splash:2};mon.rogueMoveHistory=['Zippy Zap'];const result=restoreClassicParty(run.party,'memorymushroom',{boxId:'hero',moveName:'Zippy Zap',run});assert.equal(result[0].pp.zippyzap,15);assert.equal(result[0].pp.splash,2);
});
test('zero PP remains unavailable until restored and a battle is re-created',()=>{
 const run=fixture();run.party[0].pp.zippyzap=0;const foe=makeReferenceMon(242,100,{boxId:'foe',moves:['Splash']});run.combat=createClassicCombat(run,[foe],{trainer:true});let view=classicCombatView(run.combat).requests[0];assert.equal(view.displayMoves.find(m=>m.id==='zippyzap').disabled,true);
 run.party=restoreClassicParty(run.party,'ether',{boxId:'hero',moveIndex:0,run});run.combat=createClassicCombat(run,[foe],{trainer:true});view=classicCombatView(run.combat).requests[0];assert.equal(view.moves.find(m=>m.id==='zippyzap').pp,10);assert.equal(view.moves.find(m=>m.id==='zippyzap').maxPp,15);
});
test('new starts set PP rule without altering other saved slots',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs');const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};
 const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'zippy-pp',seed:'zippy-pp'});assert.equal(run.zippyPpRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});
});
test('automatic and replacement learning grant 15 PP in new games and 10 in old games',()=>{
 for(const modern of [true,false]){const run=fixture(modern),hero=run.party[0];hero.moves=['Splash'];hero.pp={splash:3};queueClassicMoves(run,hero,['Zippy Zap']);assert.equal(hero.pp.zippyzap,modern?15:10);
  hero.moves=['Splash','Tackle','Growl','Protect'];hero.pp={splash:3};run.pendingMoves=[{boxId:'hero',move:'Zippy Zap'}];learnClassicPendingMove(run,{boxId:'hero',move:'Zippy Zap',slot:1});assert.equal(hero.pp.zippyzap,modern?15:10);assert.equal(hero.pp.splash,3);}
});
