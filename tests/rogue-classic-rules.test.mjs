import assert from 'node:assert/strict';
import {classicBaseLevel,classicLevelCap,classicWildLevel,classicTrainerLevel,classicStoryEvent,classicWaveMoney,classicRerollCost,classicRewardTier,classicExperienceShares} from '../lib/rogue-classic-rules.mjs';
const originalCaps=[10,16,24,32,38,48,56,64,74,84,94,104,114,126,138,150,162,174,188,200];
for(let i=0;i<20;i++){const wave=i*10+1;assert.equal(classicLevelCap(wave,{userLimit:false}),originalCaps[i]);assert.equal(classicLevelCap(wave),originalCaps[i]);}
assert.equal(classicWildLevel(1,()=>.5),2);assert.equal(classicWildLevel(200,()=>.5,{userLimit:false}),200);assert.equal(classicWildLevel(200,()=>.5),200);
assert.equal(classicBaseLevel(100),67);assert.equal(classicTrainerLevel(20,3),14);
for(const gymStart of [20,30])assert.equal(Array.from({length:200},(_,i)=>classicStoryEvent({gymStart,wave:i+1})).filter(e=>e.kind==='gym').length,6);
assert.deepEqual(classicStoryEvent({wave:8}),{kind:'rival',phase:1});assert.deepEqual(classicStoryEvent({wave:182}),{kind:'elite',member:0});assert.equal(classicStoryEvent({wave:190}).kind,'champion');assert.equal(classicStoryEvent({wave:200}).key,'eternatus');
assert.equal(classicWaveMoney(1),180);assert.equal(Math.round(classicWaveMoney(1)*.2),36);assert.equal(classicWaveMoney(8),250);
assert.equal(classicRerollCost(1),250);assert.equal(classicRerollCost(11),500);assert.equal(classicRerollCost(1,2),1000);assert.equal(classicRerollCost(1,0,{lockedTiers:[0,0,0]}),150);
const tier=roll=>classicRewardTier((()=>{let first=true;return()=>first?(first=false,roll/1024):.99;})());assert.equal(tier(0),4);assert.equal(tier(12),3);assert.equal(tier(60),2);assert.equal(tier(255),1);assert.equal(tier(256),0);
const party=[{boxId:'a',hp:10,level:5},{boxId:'b',hp:10,level:5},{boxId:'c',hp:10,level:5},{boxId:'dead',hp:0,level:5}];
assert.deepEqual(classicExperienceShares(party,['a','b'],100,1),[50,50,0,0]);assert.deepEqual(classicExperienceShares(party,['a','b'],100,1,{expShare:1}),[50,50,10,0]);
console.log('Pinned classic level/cap/money/tier/EXP formulas, six gyms, six rivals, league and final boss schedule with original source level progression: passed');
