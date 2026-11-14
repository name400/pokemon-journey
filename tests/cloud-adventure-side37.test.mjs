import test from 'node:test';
import assert from 'node:assert/strict';
import {side37Available} from '../lib/cloud-adventure/adventure-side37.mjs';
import {fieldMap,fieldPath,fieldDialogue,walkable} from '../lib/cloud-adventure/adventure-world.mjs';
import {pendingAdventureQuests} from '../lib/cloud-adventure/adventure-pending-quests.mjs';
test('Barnie is reachable from the canal bank without changing saved walking tiles',()=>{
 const s={area:3,district:'lumiose-magenta-street',interior:null,x:8,y:5,facing:'left'};
 const old=fieldMap(s),ready={...s,zaMission14Stage:1},map=fieldMap(ready);
 assert.equal(side37Available(s),false);assert.equal(old[5][7],'~');assert.equal(map[5][7],'^');assert.equal(walkable(old[5][7]),false);assert.equal(walkable(map[5][7]),false);
 assert.ok(fieldPath(map,{x:11,y:8},{x:8,y:5}).length);assert.equal(fieldDialogue(ready,map).action,'side37Start');
 assert.equal(fieldDialogue({...ready,zaSide37Stage:1},map).action,'side37Battle');assert.equal(fieldDialogue({...ready,zaSide37Stage:2},map).action,'side37Reward');
 assert.ok(pendingAdventureQuests({...ready,zaSide37Stage:1}).some(q=>q.id==='37'));assert.equal(side37Available({zaSide37Stage:2}),true);assert.equal(fieldDialogue({...ready,zaSide37Stage:4},map).action,undefined);
});
