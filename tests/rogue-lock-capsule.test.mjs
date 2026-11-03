import assert from 'node:assert/strict';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {applyClassicAction,classicGameView} from '../lib/rogue-classic-game.mjs';

const doc={coins:100,collection:[]},state=ensureClassicState(doc),hero=makeReferenceMon(151,80,{boxId:'hero',moves:['Seismic Toss']}),foe=makeReferenceMon(19,1,{boxId:'foe',moves:['Splash']});foe.hp=1;
const run={id:'lock-capsule',wave:165,biome:1,rng:42,party:[hero],modifiers:[],tools:{},teraCharged:false,encounter:{kind:'evil',trainer:{id:1,moneyMultiplier:1}},screen:'battle',money:100000,balls:{pokeball:5},participants:[],awardedFoes:[],pendingMoves:[],rerolls:0};state.slots[0]=run;run.combat=createClassicCombat(run,[foe],{trainer:true});
assert.throws(()=>applyClassicAction(doc,{action:'setRewardTierLock',locked:true}),/잠금캡슐/);
applyClassicAction(doc,{action:'turn',command:{type:'move',move:'seismictoss'}});
while(run.screen==='learn'){const p=run.pendingMoves[0];applyClassicAction(doc,{action:'learn',boxId:p.boxId,move:p.move,slot:null});}
assert.equal(run.screen,'reward');assert.equal(run.tools.lockCapsule,true);assert.match(run.fixedRewardNotice,/잠금캡슐/);
// Synthetic tiers exercise the rarity-weighted cost even if the battle's
// random reward roll happened to contain only common items.
run.rewards.forEach((reward,i)=>reward.tier=[0,1,2][i]);
const unlockedPrice=classicGameView(doc).run.rerollCost;assert.equal(unlockedPrice,4250);
applyClassicAction(doc,{action:'setRewardTierLock',locked:true});const lockedPrice=classicGameView(doc).run.rerollCost;assert.equal(lockedPrice,(50+125+300)*17);
const money=run.money,choices=run.rewards.map(r=>r.rewardId);assert.throws(()=>applyClassicAction(doc,{action:'reroll',expectedPrice:unlockedPrice}),/가격|금액/);assert.equal(run.money,money);assert.deepEqual(run.rewards.map(r=>r.rewardId),choices);
const coinsAfterVictory=doc.coins,saved=JSON.parse(JSON.stringify(doc)),savedRun=ensureClassicState(saved).slots[0];assert.equal(savedRun.lockRewardTiers,true);
applyClassicAction(saved,{action:'reroll',expectedPrice:lockedPrice});assert.equal(savedRun.money,money-lockedPrice);assert.deepEqual(savedRun.rewards.map(r=>r.tier),[0,1,2]);assert.ok(savedRun.rewards.every(r=>!choices.includes(r.rewardId)));assert.equal(savedRun.rerolls,1);
applyClassicAction(saved,{action:'setRewardTierLock',locked:false});assert.equal(classicGameView(saved).run.rerollCost,8500);assert.equal(saved.coins,coinsAfterVictory);assert.equal(doc.coins,coinsAfterVictory);assert.deepEqual(doc.collection,[]);
const legacy=JSON.parse(JSON.stringify(saved));delete ensureClassicState(legacy).slots[0].tools.lockCapsule;assert.throws(()=>applyClassicAction(legacy,{action:'setRewardTierLock',locked:true}),/잠금캡슐/);
console.log('Wave 165 lock capsule, saved rarity lock, server cost validation and existing data passed.');
