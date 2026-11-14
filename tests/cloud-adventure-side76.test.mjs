import test from 'node:test';import assert from 'node:assert/strict';
import {fieldMap,fieldDialogue,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {side76Available,SIDE76_QUESTIONS} from '../lib/cloud-adventure/adventure-side76.mjs';
import {trackedAdventureLocalTarget,pendingAdventureQuests} from '../lib/cloud-adventure/adventure-pending-quests.mjs';
test('academy classroom is reachable without changing old terrain and follows saved stages',()=>{
 const base={area:3,district:'lumiose-rouge-sector6',zaAcademyCourtyard:true,x:6,y:5,facing:'up',teamIds:['saved']},map=fieldMap(base);assert.equal(side76Available(base),false);assert.equal(fieldDialogue(base)?.action,undefined);const s={...base,zaMission26Started:true};assert.deepEqual(fieldMap(s),map);assert.ok(fieldPath(map,{x:11,y:15},{x:6,y:5}).length);assert.equal(fieldDialogue(s).action,'side76Start');
 const old=restoreAdventurePosition(storeAdventurePosition(s,5),5);assert.deepEqual([old.x,old.y,old.teamIds],[6,5,['saved']]);
 for(let i=1;i<=5;i++){const current={...s,zaSide76Stage:i,zaTrackedQuestId:'76'},dialogue=fieldDialogue(current);assert.equal(dialogue.actions.length,3);assert.equal(SIDE76_QUESTIONS[i-1].options.length,3);assert.ok(pendingAdventureQuests(current).some(q=>q.id==='76'));assert.deepEqual(trackedAdventureLocalTarget({...current,map:fieldMap(current)}),{x:6,y:4});}
 const pending={...base,zaSide76Stage:6,zaTrackedQuestId:'76'};assert.equal(fieldDialogue(pending).action,'side76Reward');assert.deepEqual(trackedAdventureLocalTarget({...pending,map:fieldMap(pending)}),{x:6,y:4});assert.equal(trackedAdventureLocalTarget({...pending,zaSide76Complete:true,map:fieldMap(pending)}),null);
});
