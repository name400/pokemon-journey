import test from 'node:test';
import assert from 'node:assert/strict';
import {side38Available} from '../lib/cloud-adventure/adventure-side38.mjs';
import {fieldMap,fieldPath,fieldDialogue,walkable} from '../lib/cloud-adventure/adventure-world.mjs';
import {pendingAdventureQuests} from '../lib/cloud-adventure/adventure-pending-quests.mjs';
test('both opponents are accessible without blocking prior saved paths',()=>{
 const s={area:3,district:'lumiose-magenta-street',interior:null,x:15,y:4,facing:'down',zaMission14Stage:8};const old=fieldMap(s),ready={...s,zaMission14Stage:9},map=fieldMap(ready);assert.equal(side38Available(s),false);
 for(const x of [15,17]){assert.equal(old[5][x],'#');assert.equal(map[5][x],'^');assert.equal(walkable(map[5][x]),false);assert.ok(fieldPath(map,{x:11,y:8},{x,y:4}).length);}
 assert.equal(fieldDialogue(ready,map).action,'side38Start');assert.equal(fieldDialogue({...ready,zaSide38Stage:1},map).action,'side38Maxen');assert.equal(fieldDialogue({...ready,x:17,zaSide38Stage:2},map).action,'side38Deb');assert.equal(fieldDialogue({...ready,zaSide38Stage:3},map).action,'side38Reward');assert.equal(fieldDialogue({...ready,zaSide38Stage:5},map).action,undefined);assert.ok(pendingAdventureQuests({...ready,zaSide38Stage:2}).some(q=>q.id==='38'));assert.equal(side38Available({zaSide38Stage:3}),true);
});
