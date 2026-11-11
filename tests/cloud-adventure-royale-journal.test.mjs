import test from 'node:test';
import assert from 'node:assert/strict';
import {laterRoyaleProgress} from '../lib/cloud-adventure/adventure-royale-journal.mjs';

test('journal reports the engine counters only for active later rank phases',()=>{
 const cases=[
  [{zaRoyaleRank:'V',zaMission10Stage:4,zaRoyaleVPoints:1500},1500,6000],
  [{zaRoyaleRank:'F',zaMission14Stage:1,zaRoyaleFPoints:12000},12000,32000],
  [{zaRoyaleRank:'E',zaMission19Stage:1,zaRoyaleEPoints:35000},35000,35000],
  [{zaRoyaleRank:'D',zaMission20Complete:true,zaRoyaleDPoints:3000},3000,38000],
  [{zaRoyaleRank:'C',zaMission30Started:true,zaRoyaleCPoints:4000},4000,41000],
  [{zaRoyaleRank:'B',zaMission35Started:true,zaMission35Stage:7,zaRoyaleBPoints:5000},5000,45000],
  [{zaRoyaleRank:'A',zaMission39Started:true,zaInfinitePoints:6000},6000,50000],
 ];
 for(const [world,points,goal] of cases){const before=structuredClone(world);assert.deepEqual(laterRoyaleProgress(world),{points,goal});assert.deepEqual(world,before);}
 for(const world of [{zaRoyaleRank:'V',zaMission10Stage:3},{zaRoyaleRank:'F',zaMission14Stage:2},{zaRoyaleRank:'D',zaMission20Complete:true,zaMission24Complete:true},{zaRoyaleRank:'B',zaMission35Started:true,zaMission35Stage:6},{zaRoyaleRank:'A'}])assert.equal(laterRoyaleProgress(world),null);
 assert.deepEqual(laterRoyaleProgress({zaRoyaleRank:'F',zaMission14Stage:1,zaRoyaleFPoints:-2}),{points:0,goal:32000});
});
