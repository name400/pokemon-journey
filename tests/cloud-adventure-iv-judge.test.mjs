import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureJudgeAvailable,adventureJudgeStat,ADVENTURE_IV_STATS} from '../lib/cloud-adventure/adventure-iv-judge.mjs';

test('postgame judge evaluates boundaries and distinguishes hyper training without mutating data',()=>{
 assert.equal(adventureJudgeAvailable({}),false);assert.equal(adventureJudgeAvailable({zaMission37Complete:true}),true);assert.equal(adventureJudgeAvailable({zaMission38Complete:true}),true);assert.equal(adventureJudgeAvailable({zaMission37Complete:'true'}),false);
 const mon={ivs:{hp:0,atk:1,def:15,spa:16,spd:25,spe:26},adventureHyperTrained:{def:true}};const before=structuredClone(mon);
 assert.deepEqual(ADVENTURE_IV_STATS.map(([key])=>adventureJudgeStat(mon,key)),['아쉬움','보통','대단히 단련함','꽤 좋음','꽤 좋음','매우 좋음']);
 for(const [n,label] of [[0,'아쉬움'],[1,'보통'],[15,'보통'],[16,'꽤 좋음'],[25,'꽤 좋음'],[26,'매우 좋음'],[29,'매우 좋음'],[30,'훌륭함'],[31,'최고']])assert.equal(adventureJudgeStat({ivs:{hp:n}},'hp'),label);
 for(const n of [undefined,null,-1,32,1.5,'31'])assert.equal(adventureJudgeStat({ivs:{hp:n},adventureHyperTrained:{hp:true}},'hp'),'기록 확인 불가');
 assert.deepEqual(mon,before);
});
