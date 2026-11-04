import test from 'node:test';
import assert from 'node:assert/strict';
import {CLASSIC_REWARD_REGISTRY,classicRewardView,chooseClassicReward} from '../lib/rogue-classic-rewards.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {classicMaxPP,classicRemainingPP} from '../lib/rogue-classic-services.mjs';
test('a free Memory Mushroom reward works before shop unlock, appends a fourth move and spends no money',()=>{
 const mon=makeReferenceMon(1,30,{boxId:'learner',moves:['Tackle','Growl','Leech Seed']}),reward={...CLASSIC_REWARD_REGISTRY.find(d=>d.id==='memorymushroom'),rewardId:'memory-free'};
 const run={id:'memory-reward',wave:22,screen:'reward',party:[mon],modifiers:[],tools:{},money:1000,rewards:[reward]};
 const view=classicRewardView(run,null)[0],target=view.targets.find(t=>t.boxId==='learner'),before=[...mon.moves];assert.equal(view.requiresNewMove,true);assert.equal(target.eligible,true);assert.ok(target.learnableMoves.length);
 const moveName=target.learnableMoves[0];chooseClassicReward(run,{rewardId:'memory-free',boxId:'learner',moveName,replaceIndex:0},null);
 assert.equal(run.money,1000);assert.deepEqual(run.party[0].moves.slice(0,3),before);assert.equal(run.party[0].moves[3],moveName);assert.equal(classicRemainingPP(run.party[0],3),classicMaxPP(run.party[0],3));
});
test('invalid memory reward move or replacement preserves the party and money',()=>{
 const mon=makeReferenceMon(1,30,{boxId:'learner',moves:['Tackle','Growl','Leech Seed','Vine Whip']}),reward={...CLASSIC_REWARD_REGISTRY.find(d=>d.id==='memorymushroom'),rewardId:'memory-invalid'},run={wave:22,screen:'reward',party:[mon],modifiers:[],tools:{},money:1000,rewards:[reward]};
 const before=JSON.stringify(run.party);assert.throws(()=>chooseClassicReward(run,{rewardId:'memory-invalid',boxId:'learner',moveName:'없는 기술',replaceIndex:0},null));assert.equal(JSON.stringify(run.party),before);assert.equal(run.money,1000);
});
