import assert from 'node:assert/strict';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {CLASSIC_REWARD_REGISTRY,generateClassicRewards,classicRewardView} from '../lib/rogue-classic-rewards.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';

const doc={coins:22,collection:[{id:'preserve'}]},state=ensureClassicState(doc),mon=makeReferenceMon(1,20,{boxId:'one',moves:['Tackle']});state.system.voucherCounts={regular:3,plus:2,premium:4,golden:1};state.system.eggs=[{id:'old-egg',productId:'common'}];
const run={id:'voucher-reward',wave:51,biome:1,rng:42,party:[mon],modifiers:[],tools:{},encounter:{kind:'wild'},screen:'reward',money:1000,balls:{pokeball:5},participants:[],awardedFoes:[],pendingMoves:[],rerolls:0};state.slots[0]=run;
function selectVoucher(id,type){const def=CLASSIC_REWARD_REGISTRY.find(r=>r.id===id);run.screen='reward';run.rewards=[{...def,rewardId:id}];const view=classicRewardView(run,state.system)[0];assert.equal(view.requiresTarget,false);assert.match(view.name,/바우처/);const old=state.system.voucherCounts[type];applyClassicAction(doc,{action:'reward',rewardId:id});assert.equal(state.system.voucherCounts[type],old+1);assert.equal(run.screen,'advance');assert.throws(()=>applyClassicAction(doc,{action:'reward',rewardId:id}),/보상/);}
selectVoucher('voucherplus','plus');selectVoucher('voucherpremium','premium');const saved=JSON.parse(JSON.stringify(doc)),restored=ensureClassicState(saved);assert.deepEqual(restored.system.voucherCounts,{regular:3,plus:3,premium:5,golden:1});assert.deepEqual(restored.system.eggs,[{id:'old-egg',productId:'common'}]);assert.equal(saved.coins,22);assert.deepEqual(saved.collection,[{id:'preserve'}]);
const pulled=applyClassicAction(saved,{action:'pullEgg',mode:'move',voucherKey:'plus'});assert.equal(pulled.gachaResult.pulls,5);assert.equal(restored.system.voucherCounts.plus,2);assert.equal(restored.system.eggs.length,6);assert.ok(restored.system.eggs.some(egg=>egg.id==='old-egg'));

// Fixed seed and locked tier isolate the original source's declining voucher
// weights; no statistical assertion is made about the incomplete overall pool.
run.screen='reward';let seen=new Set();for(let i=0;i<250;i++)for(const r of generateClassicRewards(run,state.system,[3,4,3]))if(r.effect==='voucher')seen.add(r.id);assert.deepEqual(seen,new Set(['voucherplus','voucherpremium']));
for(let n=3;n<=5;n++){run.rerolls=n;for(let i=0;i<80;i++)assert.ok(generateClassicRewards(run,state.system,[3,4,3]).every(r=>r.effect!=='voucher'));}
run.rerolls=2;run.rewards=[{...CLASSIC_REWARD_REGISTRY.find(r=>r.id==='voucherplus'),rewardId:'skip'}];applyClassicAction(doc,{action:'skipReward'});assert.equal(run.rerolls,0,'reroll count cannot leak to the next reward screen');
console.log('Voucher rewards add one account voucher, preserve saved eggs, and follow source reroll weight boundaries.');
