import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,rotoGlideLanding,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Mission 16 rooftop preserves two web gates, return path and saved state',()=>{
 const entry={area:3,district:'lumiose-rooftop',interior:null,x:21,y:8,zaMission15Stage:2,teamIds:['kept']};
 const next=stepField(entry,'right');assert.deepEqual([next.district,next.x,next.y],['lumiose-mission16-roof',1,8]);
 const s={...entry,...next};assert.equal(stepField({...s,x:6,y:8},'right').blocked,true);assert.equal(fieldDialogue({...s,x:6,y:8,facing:'right'}).action,'mission16OpenWeb');
 const opened={...s,zaMission16Webs:['west']};assert.ok(fieldPath(fieldMap(opened),opened,{x:13,y:8}).length);assert.equal(stepField({...opened,x:13,y:8},'right').blocked,true);
 const complete={...opened,zaMission16Webs:['west','east']};assert.ok(fieldPath(fieldMap(complete),complete,{x:18,y:6}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...complete,x:18,y:6,facing:'up'},86),86);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaMission16Webs,saved.teamIds],['lumiose-mission16-roof',18,6,['west','east'],['kept']]);assert.equal(fieldDialogue(saved).action,'battleMission15Case');
 assert.equal(stepField({...s,x:1,y:8},'left').district,'lumiose-rooftop');
});
test('Roto-Glide reaches the rooftop web approach after its existing unlock',()=>{
 const s={area:3,district:'lumiose-rooftop',interior:null,x:8,y:10,zaMission15Stage:2,zaRooftopCrystalCleared:true,teamIds:['kept']};
 assert.equal(rotoGlideLanding({...s,zaMission15Stage:1}),null);assert.equal(rotoGlideLanding({...s,zaRooftopCrystalCleared:false}),null);
 const landing=rotoGlideLanding(s);assert.deepEqual(landing,{x:8,y:8,facing:'up'});
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,...landing},87),87);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-rooftop',8,8,['kept']]);
 assert.ok(fieldPath(fieldMap(saved),saved,{x:21,y:8}).length);assert.equal(stepField({...saved,x:21,y:8},'right').district,'lumiose-mission16-roof');
});
