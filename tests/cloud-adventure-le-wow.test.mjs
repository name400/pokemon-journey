import test from 'node:test';
import assert from 'node:assert/strict';
import {leWowAvailable,leWowCourseTeam,LE_WOW_COURSE_COUNT} from '../lib/cloud-adventure/adventure-le-wow.mjs';
import {storyTm} from '../lib/cloud-adventure/adventure-story-tm.mjs';

test('Le Wow teams and unlock follow the ten course structure',()=>{
 assert.equal(LE_WOW_COURSE_COUNT,10);assert.equal(leWowAvailable({zaRoyaleRank:'B'}),false);assert.equal(leWowAvailable({zaMission31Started:true}),true);assert.equal(leWowAvailable({zaMission30Complete:true}),true);
 const teams=Array.from({length:10},(_,i)=>leWowCourseTeam(i));assert.deepEqual(teams[0].map(p=>p.speciesId),[71,545,569]);assert.deepEqual(teams[9].map(p=>p.speciesId),[780,227,248]);assert.ok(teams.every(team=>team.length===3&&team.every(p=>p.level===55&&p.moves.length===4)));assert.throws(()=>leWowCourseTeam(10));
 const tm=storyTm('za-tm045');assert.equal(tm.move,'탁쳐서떨구기');assert.ok(tm.learners.includes(71));assert.ok(!tm.learners.includes(25));
});
