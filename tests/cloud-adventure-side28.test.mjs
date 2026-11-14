import test from 'node:test';
import assert from 'node:assert/strict';
import {side28Available,side28Spot} from '../lib/cloud-adventure/adventure-side28.mjs';
import {fieldMap,fieldPath,fieldDialogue} from '../lib/cloud-adventure/adventure-world.mjs';
import {trackedAdventureLocalTarget} from '../lib/cloud-adventure/adventure-pending-quests.mjs';

test('Marnole appears on a previously blocked tile without changing the approach',()=>{
 const s={area:3,district:'lumiose-bleu-sector7',interior:null,x:6,y:10,facing:'down',zaMission10Stage:9,zaRoyaleRank:'F'};
 assert.equal(side28Available(s),false);assert.equal(fieldMap(s)[11][6],'#');
 const ready={...s,zaMission10Stage:10};const map=fieldMap(ready);assert.equal(map[11][6],'t');assert.ok(fieldPath(map,{x:1,y:11},{x:6,y:10}).length);assert.equal(fieldDialogue(ready,map).action,'side28Battle');
 const pending={...ready,zaSide28Won:true,zaSide28RewardPending:true,zaTrackedQuestId:'28-reward',map};assert.equal(fieldDialogue(pending,map).action,'side28Reward');assert.deepEqual(trackedAdventureLocalTarget(pending),{x:6,y:11});assert.equal(trackedAdventureLocalTarget({...pending,zaBleu7Upper:true}),null);assert.equal(side28Spot({...pending,zaBleu7Upper:true},{tile:'t',x:6,y:11}),false);
 assert.equal(side28Available({zaSide28Won:true}),true);assert.equal(side28Available({zaRoyaleRank:'E'}),true);
});
