import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Mission 16 rooftop preserves two web gates, return path and saved state',()=>{
 const entry={area:3,district:'lumiose-rooftop',interior:null,x:21,y:8,zaMission15Stage:2,teamIds:['kept']};
 const next=stepField(entry,'right');assert.deepEqual([next.district,next.x,next.y],['lumiose-mission16-roof',1,8]);
 const s={...entry,...next};assert.equal(stepField({...s,x:6,y:8},'right').blocked,true);assert.equal(fieldDialogue({...s,x:6,y:8,facing:'right'}).action,'mission16OpenWeb');
 const opened={...s,zaMission16Webs:['west']};assert.ok(fieldPath(fieldMap(opened),opened,{x:13,y:8}).length);assert.equal(stepField({...opened,x:13,y:8},'right').blocked,true);
 const complete={...opened,zaMission16Webs:['west','east']};assert.ok(fieldPath(fieldMap(complete),complete,{x:18,y:6}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...complete,x:18,y:6,facing:'up'},86),86);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaMission16Webs,saved.teamIds],['lumiose-mission16-roof',18,6,['west','east'],['kept']]);assert.equal(fieldDialogue(saved).action,'battleMission15Case');
 assert.equal(stepField({...s,x:1,y:8},'left').district,'lumiose-rooftop');
});
