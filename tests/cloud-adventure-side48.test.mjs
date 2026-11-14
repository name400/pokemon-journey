import test from 'node:test';
import assert from 'node:assert/strict';
import {side48Available} from '../lib/cloud-adventure/adventure-side48.mjs';
import {fieldMap,fieldDialogue,fieldPath,walkable} from '../lib/cloud-adventure/adventure-world.mjs';
import {pendingAdventureQuests} from '../lib/cloud-adventure/adventure-pending-quests.mjs';
test('rescue is accessible without blocking any existing saved walking tile',()=>{
 const s={area:3,district:'lumiose-rouge-sector5',interior:null,x:14,y:10,facing:'right'},old=fieldMap(s),ready={...s,zaMission19Stage:1},map=fieldMap(ready);assert.equal(side48Available(s),false);assert.equal(old[10][15],'#');assert.equal(map[10][15],'^');assert.equal(walkable(map[10][15]),false);assert.ok(fieldPath(map,{x:11,y:8},{x:14,y:10}).length);assert.equal(fieldDialogue(ready,map).action,'side48Start');assert.equal(fieldDialogue({...ready,zaSide48Stage:1},map).action,'side48Rescue');assert.equal(fieldDialogue({...ready,zaSide48Stage:2},map).action,'side48Reward');assert.equal(fieldDialogue({...ready,zaSide48Stage:4},map).action,undefined);assert.ok(pendingAdventureQuests({...ready,zaSide48Stage:1}).some(q=>q.id==='48'));assert.equal(side48Available({zaSide48Stage:2}),true);
});
