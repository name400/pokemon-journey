import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Jaune 3 scaffold approach and each saved floor remain accessible',()=>{
 const base={area:3,district:'lumiose-mission12-jaune3',interior:null,teamIds:['kept'],zaMission12WorkerWon:true};
 const ground={...base,zaMission12Layer:'ground',x:17,y:8,facing:'up'};
 assert.ok(fieldPath(fieldMap(ground),{x:11,y:15},{x:17,y:8}).length);
 assert.equal(fieldDialogue(ground,fieldMap(ground)).action,'mission12Scaffold');
 for(const [layer,x,y] of [['ground',17,8],['scaffold',17,11],['roof',5,11]]){
  const saved=storeAdventurePosition({...base,zaMission12Layer:layer,x,y},17),restored=restoreAdventurePosition(saved,17);
  assert.deepEqual([restored.district,restored.zaMission12Layer,restored.x,restored.y,restored.teamIds],[base.district,layer,x,y,['kept']]);
 }
});
