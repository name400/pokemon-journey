import test from 'node:test';import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {fieldMap,fieldDialogue,fieldPath,walkable,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {side39Available,side39Eligible} from '../lib/cloud-adventure/adventure-side39.mjs';
import {pendingAdventureQuests,trackedAdventureLocalTarget} from '../lib/cloud-adventure/adventure-pending-quests.mjs';
test('Quille preserves old sidewalk, unlocks after quiz and distinguishes forms',()=>{
 const base={area:3,district:'lumiose-south-boulevard',x:8,y:10,facing:'down',zaMission14Stage:8},before=fieldMap(base),unlocked={...base,zaMission14Stage:9},after=fieldMap(unlocked);assert.equal(side39Available(base),false);assert.equal(side39Available(unlocked),true);assert.equal(before[11][8],'#');assert.equal(after[11][8],'^');assert.equal(walkable(before[11][8]),walkable(after[11][8]));assert.equal(fieldDialogue(unlocked).action,'side39Start');assert.ok(fieldPath(after,{x:11,y:8},{x:8,y:10}).length);assert.equal(side39Eligible(makeMon(79,30)),true);assert.equal(side39Eligible(makeMon(10164,30)),false);assert.equal(side39Eligible(makeMon(80,30)),false);
 const saved=restoreAdventurePosition(storeAdventurePosition({...unlocked,teamIds:['keep']},7),7);assert.deepEqual([saved.x,saved.y,saved.teamIds],[8,10,['keep']]);const started={...unlocked,zaSide39Started:true,zaTrackedQuestId:'39'};assert.equal(fieldDialogue(started).side39,true);assert.ok(pendingAdventureQuests(started).some(q=>q.id==='39'));assert.deepEqual(trackedAdventureLocalTarget({...started,map:fieldMap(started)}),{x:8,y:11});assert.equal(trackedAdventureLocalTarget({...started,zaSide39Complete:true,map:fieldMap(started)}),null);
});
