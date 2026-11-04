import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {generateClassicChallengerRewards} from '../lib/rogue-classic-rewards.mjs';
function fixture(bonus=0){return {wave:80,rng:42,party:[makeReferenceMon(151,50,{boxId:'hero',moves:['Tackle']})],modifiers:bonus?[{id:'goldenpokeball',count:bonus}]:[],tools:{},balls:{},money:1000};}
test('challenger rewards preserve guarantees and fill the bonus slots',()=>{
 for(const bonus of [0,1,3])for(const difficulty of ['normal','hard','brutal']){
  const run=fixture(bonus),rewards=generateClassicChallengerRewards(run,difficulty);
  assert.equal(rewards.length,Math.max(difficulty==='normal'?0:4,3+bonus));
  assert.equal(new Set(rewards.map(item=>item.rewardId)).size,rewards.length);
  if(difficulty==='normal'){assert.ok(rewards.some(item=>item.id==='memorymushroom'));}
  else {const tiers=difficulty==='hard'?[2,2,1,1]:[3,3,2,1];assert.ok(rewards.slice(0,4).every((item,index)=>item.tier>=tiers[index]));}
  assert.deepEqual(JSON.parse(JSON.stringify(run.rewards)),run.rewards);
 }
 assert.throws(()=>generateClassicChallengerRewards(fixture(),'unknown'));
});
test('duplicate groups retry within the selected tier and respect the attempt limit',async()=>{
 const {retryChallengerReward}=await import('../lib/rogue-classic-rewards.mjs');
 const existing=[{name:'볼',effect:'balls',tier:1}],seen=[];
 const result=retryChallengerReward(tier=>{seen.push(tier);return seen.length<3?{name:'다른 볼',effect:'balls',tier:2}:{name:'기술머신',effect:'tm',tier:2};},1,existing,10);
 assert.equal(result.effect,'tm');assert.deepEqual(seen,[1,2,2]);
 let calls=0;const fallback=retryChallengerReward(tier=>{calls++;return {name:'같은 볼',effect:'balls',tier};},2,existing,4);assert.equal(calls,4);assert.equal(fallback.effect,'balls');
});
