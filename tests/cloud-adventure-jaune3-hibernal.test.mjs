import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Jaune 3 links Hibernal at ground level while preserving mission and saved positions',()=>{
 const s={area:3,district:'lumiose-mission12-jaune3',zaMission12Layer:'ground',interior:null,x:1,y:8,zaMission12WorkerWon:false,teamIds:['kept'],steps:42};
 assert.ok(fieldPath(fieldMap(s),s,{x:17,y:8}).length);
 assert.equal(fieldDialogue({...s,x:17,y:8,facing:'up'},fieldMap(s)).action,undefined,'the ladder remains locked');
 const next=stepField(s,'left');assert.deepEqual([next.district,next.x,next.y],['lumiose-hibernal-approach',21,14]);
 const avenue={...s,...next};assert.equal(stepField(avenue,'right').district,s.district);
 assert.equal(stepField({...s,zaMission12Layer:'roof'},'left').transitioned,undefined);
 assert.equal(stepField({...s,x:11,y:1},'up').district,'lumiose-jaune-sector4');
 assert.equal(stepField({...s,x:21,y:12},'right').district,'lumiose-jaune-sector5');
 for(const world of [s,avenue]){const restored=restoreAdventurePosition(storeAdventurePosition(world,52),52);assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds,restored.steps],[world.district,world.x,world.y,['kept'],42]);}
});
