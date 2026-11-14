import test from 'node:test';
import assert from 'node:assert/strict';
import {side97Available,side97Spot,side97Point,advanceSide97} from '../lib/cloud-adventure/adventure-side97.mjs';
import {fieldMap,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {pendingAdventureQuests,trackedAdventureLocalTarget} from '../lib/cloud-adventure/adventure-pending-quests.mjs';

test('runaway Whirlipede advances safely and persists its own versioned location',()=>{
 const s={area:3,district:'lumiose-south-boulevard',interior:null,x:5,y:7,teamIds:['kept'],zaSide97Stage:1,zaSide97MotionV1:{version:1,index:0,tick:0},zaTrackedQuestId:'97'};
 assert.deepEqual(side97Point(s),[11,7]);assert.equal(advanceSide97(s),false);assert.equal(advanceSide97(s),true);assert.deepEqual(side97Point(s),[12,7]);
 assert.deepEqual(trackedAdventureLocalTarget({...s,map:fieldMap(s)}),{x:12,y:7});assert.ok(pendingAdventureQuests(s).some(q=>q.id==='97'));
 const near={...s,x:11,y:7,zaSide97MotionV1:{...s.zaSide97MotionV1,tick:1}};assert.equal(advanceSide97(near),false);assert.deepEqual(side97Point(near),[12,7]);assert.equal(fieldDialogue({...near,facing:'right'}).action,'side97Battle');
 const saved=restoreAdventurePosition(storeAdventurePosition(s,22),22);assert.deepEqual(saved.zaSide97MotionV1,s.zaSide97MotionV1);assert.deepEqual(saved.teamIds,['kept']);
 const future={...s,zaSide97MotionV1:{version:2,index:3,tick:0}};assert.equal(side97Point(future),null);assert.equal(advanceSide97(future),false);assert.deepEqual(future.zaSide97MotionV1,{version:2,index:3,tick:0});
 assert.equal(side97Point({...s,zaVert7RoofUpper:true}),null);assert.equal(side97Spot({...s,zaVert7RoofUpper:true},{x:20,y:5,tile:'.'}),null);
 assert.equal(side97Available({...s,zaSide97Stage:99,zaMission35Started:true}),false);assert.equal(side97Spot(s,{x:20,y:5,tile:'.'}),'rouland');
});
