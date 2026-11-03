import assert from 'node:assert/strict';
import {classicMoneyGain,classicWaveMoney} from '../lib/rogue-classic-rules.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {generateClassicRewards,chooseClassicReward} from '../lib/rogue-classic-rewards.mjs';
import {createClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
const basic={modifiers:[]};assert.equal(classicMoneyGain(basic,123),123);assert.equal(classicMoneyGain({modifiers:[{id:'amuletcoin',count:1}]},123),147);assert.equal(classicMoneyGain({modifiers:[{id:'amuletcoin',count:5}]},123),246);
const hero=makeReferenceMon(151,50,{boxId:'hero',moves:['Seismic Toss']}),doc={coins:99,collection:[],adventure:{untouched:true}},state=ensureClassicState(doc),run={id:'money',seed:'money',rng:7,wave:21,biome:1,screen:'reward',party:[hero],modifiers:[{id:'amuletcoin',boxId:null,count:2}],tools:{},balls:{},money:1000,rerolls:0,encounter:{kind:'wild'},participants:[],awardedFoes:[],expNotices:[],pendingMoves:[],rewards:[{id:'nugget',rewardId:'money-reward',effect:'money',multiplier:1,target:false}]};state.slots[0]=run;
// Reward multiplier affects only in-run money, is applied once, and survives JSON restore.
chooseClassicReward(run,{rewardId:'money-reward'},state.system);assert.equal(run.money,1000+classicMoneyGain(run,classicWaveMoney(21)));assert.equal(doc.coins,99);assert.deepEqual(doc.adventure,{untouched:true});assert.equal(JSON.parse(JSON.stringify(run)).modifiers[0].count,2);assert.throws(()=>chooseClassicReward(run,{rewardId:'money-reward'},state.system));
// Trainer victory pays the same source multiplier through the real game action.
{const foe=makeReferenceMon(19,1,{boxId:'foe',moves:['Splash']});foe.hp=1;run.screen='battle';run.wave=8;run.money=1000;run.encounter={kind:'trainer',trainer:{moneyMultiplier:1}};run.combat=createClassicCombat(run,[foe],{trainer:true});run.party=run.combat.teams[0];const expected=1000+classicMoneyGain(run,classicWaveMoney(8));applyClassicAction(doc,{action:'turn',command:{type:'move',move:'seismictoss'}});assert.equal(run.money,expected);assert.notEqual(run.screen,'battle');assert.throws(()=>applyClassicAction(doc,{action:'turn',command:{type:'move',move:'seismictoss'}}));assert.equal(run.money,expected);}
// The new pool entry cannot appear in legacy or wave 199 runs, and has an acquisition route in new runs.
{let found=false;for(let i=1;i<=1500;i++){const base={...structuredClone(run),rng:i,wave:21,screen:'reward',economyRule:'source-v1',modifiers:[],tools:{},rerolls:0};const fresh=structuredClone(base),old=structuredClone(base),last=structuredClone(base);delete old.economyRule;last.wave=199;generateClassicRewards(fresh);generateClassicRewards(old);generateClassicRewards(last);found ||= fresh.rewards.some(r=>r.id==='amuletcoin');assert.ok(!old.rewards.some(r=>r.id==='amuletcoin'));assert.ok(!last.rewards.some(r=>r.id==='amuletcoin'));}assert.ok(found);}
console.log('Classic Amulet Coin reward, payout, save and legacy pool passed');
// A fully stacked Amulet Coin is not offered again.
for(let i=1;i<=150;i++){const capped={...structuredClone(run),rng:i,wave:21,screen:'reward',economyRule:'source-v1',modifiers:[{id:'amuletcoin',boxId:null,count:5}],tools:{},rerolls:0};generateClassicRewards(capped);assert.ok(!capped.rewards.some(r=>r.id==='amuletcoin'));}
