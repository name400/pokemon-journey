import test from 'node:test';import assert from 'node:assert/strict';import {Dex} from '@pkmn/sim';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,classicCombatView,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {SOURCE_CLASSIC_MOVE_PP,classicMoveBasePP,classicMaxPP,classicRemainingPP,restoreClassicParty} from '../lib/rogue-classic-services.mjs';
import {queueClassicMoves,learnClassicPendingMove} from '../lib/rogue-classic-growth.mjs';
import {CLASSIC_REWARD_REGISTRY,chooseClassicReward} from '../lib/rogue-classic-rewards.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

const expected={nightslash:20,beakblast:5,shelltrap:10,spinout:10,protect:5,sandstorm:5,hail:5,wish:5,healorder:5,kingsshield:5,spikyshield:5,banefulbunker:5,strengthsap:5,purify:5,obstruct:5,takeheart:10,snowscape:5};
function fixture(modern=true){const hero=makeReferenceMon(151,50,{boxId:'hero',moves:['Protect','Night Slash']}),foe=makeReferenceMon(242,100,{boxId:'foe',moves:['Splash']});hero.pp={protect:3,nightslash:12};const run={id:'source-pp',wave:21,rng:42,screen:'reward',party:[hero],modifiers:[],tools:{},balls:{},money:10000,encounter:{kind:'trainer'},...(modern?{sourceMovePpRule:'source-v1'}:{})};run.combat=createClassicCombat(run,[foe],{trainer:true});return run;}
test('the 17 reviewed base values match source without mutating the shared Dex',()=>{
 assert.deepEqual(SOURCE_CLASSIC_MOVE_PP,expected);for(const [id,pp] of Object.entries(expected)){const native=Dex.moves.get(id).pp;assert.notEqual(native,pp,id);assert.equal(classicMoveBasePP(id,{sourceMovePpRule:'source-v1'}),pp);assert.equal(classicMoveBasePP(id),native);assert.equal(Dex.moves.get(id).pp,native);}
 assert.equal(classicMoveBasePP('tackle',{sourceMovePpRule:'source-v1'}),Dex.moves.get('tackle').pp);
});
test('actual turn, battle display and recovery retain source and legacy PP separately',async()=>{
 for(const modern of [true,false]){const run=fixture(modern),view=classicCombatView(run.combat).requests[0].moves;assert.equal(view[0].maxPp,modern?5:10);assert.equal(view[1].maxPp,modern?20:15);const b=restoreClassicNativeBattle(run.combat,run);b.makeChoices('move protect','move splash');assert.equal(b.p1.active[0].moveSlots[0].pp,2);run.combat.snapshot=snapshotClassicNativeBattle(b);
  const saved=await decodeGameData(await encodeGameData({run,other:{keep:true}})),again=restoreClassicNativeBattle(saved.run.combat,saved.run);assert.equal(again.p1.active[0].moveSlots[0].pp,2);assert.equal(again.p1.active[0].moveSlots[0].maxpp,modern?5:10);assert.deepEqual(saved.other,{keep:true});}
});
test('PP Ups, restoration and explicit overrides preserve existing PP',()=>{
 const run=fixture(),hero=run.party[0],def=CLASSIC_REWARD_REGISTRY.find(r=>r.id==='ppup');run.rewards=[{...def,rewardId:'up'}];chooseClassicReward(run,{rewardId:'up',boxId:'hero',moveIndex:0});assert.equal(hero.pp.protect,4);assert.equal(classicMaxPP(hero,0,run),6);
 const restored=restoreClassicParty(run.party,'ether',{boxId:'hero',moveIndex:0,run});assert.equal(restored[0].pp.protect,6);assert.equal(hero.pp.protect,4);hero.roguePPMax={protect:9};assert.equal(classicMaxPP(hero,0,run),9);assert.equal(classicRemainingPP(hero,0,run),4);
});
test('automatic, replacement and memory learning use the selected run rule',()=>{
 for(const modern of [true,false]){const run=fixture(modern),hero=run.party[0];hero.moves=['Splash'];hero.pp={splash:2};queueClassicMoves(run,hero,['Protect']);assert.equal(hero.pp.protect,modern?5:10);
  hero.moves=['Splash','Tackle','Growl','Night Slash'];hero.pp={splash:2};run.pendingMoves=[{boxId:'hero',move:'Protect'}];learnClassicPendingMove(run,{boxId:'hero',move:'Protect',slot:1});assert.equal(hero.pp.protect,modern?5:10);
  hero.moves=['Splash'];hero.pp={splash:2};hero.rogueMoveHistory=['Protect'];const next=restoreClassicParty(run.party,'memorymushroom',{boxId:'hero',moveName:'Protect',run});assert.equal(next[0].pp.protect,modern?5:10);assert.equal(next[0].pp.splash,2);}
});
test('new starts select source PP without changing another slot',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs');const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};
 const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'source-pp',seed:'source-pp'});assert.equal(run.sourceMovePpRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});
});
