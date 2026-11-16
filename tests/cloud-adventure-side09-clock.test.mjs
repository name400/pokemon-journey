import test from 'node:test';
import assert from 'node:assert/strict';
import {side09DisplayDeadline,side09RemainingMs} from '../lib/cloud-adventure/adventure-side09.mjs';

test('delayed same-attempt samples cannot add time; retries and next courses reset',()=>{
 const first=side09DisplayDeadline(null,3,1000,10,5000);
 assert.equal(first.deadline,5010);
 const late=side09DisplayDeadline(first,3,1000,2010,4500);
 assert.equal(late.deadline,5010);assert.deepEqual(first,{stage:3,startedAt:1000,deadline:5010});
 assert.equal(side09DisplayDeadline(late,3,1000,3010,1000).deadline,4010);
 assert.equal(side09DisplayDeadline(late,3,3000,3010,50000).deadline,53010);
 assert.equal(side09DisplayDeadline(late,2,1000,3010,40000).deadline,43010);
});

test('course finish retains its server-side absolute deadline and rejects malformed attempts',()=>{
 const world={district:'lumiose-side09-course',zaSide09Stage:3,zaSide09AttemptV1:{stage:3,startedAt:1000}};
 assert.equal(side09RemainingMs(world,50999),1);assert.equal(side09RemainingMs(world,51000),0);assert.equal(side09RemainingMs(world,52000),0);
 assert.equal(side09RemainingMs({...world,zaSide09AttemptV1:{stage:2,startedAt:1000}},2000),null);
 assert.deepEqual(world.zaSide09AttemptV1,{stage:3,startedAt:1000});
});
