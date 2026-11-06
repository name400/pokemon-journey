import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Jaune Sector 9 shares the Mission 18 encounter and preserves pending rewards',()=>{
 const s={area:3,district:'lumiose-jaune-sector9',interior:null,x:14,y:9,facing:'up',zaMission15Stage:2,teamIds:['kept']};
 assert.equal(fieldMap(s)[8][14],'d');assert.equal(fieldDialogue(s).action,'battleMission15Case');assert.ok(fieldPath(fieldMap(s),{x:11,y:1},s).length);
 const pending={...s,zaMission18Complete:true,zaMission18RewardPending:true};
 const restored=restoreAdventurePosition(storeAdventurePosition(pending,88),88);assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds],['lumiose-jaune-sector9',14,9,['kept']]);assert.equal(fieldDialogue(restored).action,'claimMission15Stone');
 assert.notEqual(fieldMap({...pending,zaMission18RewardPending:false})[8][14],'d');
 const legacy={...pending,district:'lumiose-site',x:7,y:11};assert.equal(fieldDialogue(legacy).action,'claimMission15Stone');
});
