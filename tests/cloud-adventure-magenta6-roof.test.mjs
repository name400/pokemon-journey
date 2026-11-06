import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Magenta Sector 6 draft ladder and scaffold reach the shared Mission 21 encounter',()=>{
 const street={area:3,district:'lumiose-magenta-sector6',interior:null,x:2,y:6,facing:'up',zaMission20Stage:5,teamIds:['kept']};
 assert.equal(fieldDialogue(street).action,'magenta6Ladder');
 const roof={...street,district:'lumiose-magenta-sector6-roof',x:2,y:13,facing:'down'};assert.equal(fieldDialogue(roof).action,'magenta6Ladder');
 assert.equal(fieldMap(roof)[7][10],',');assert.ok(fieldPath(fieldMap(roof),roof,{x:18,y:6}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...roof,x:18,y:6,facing:'up'},90),90);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-magenta-sector6-roof',18,6,['kept']]);
 assert.equal(fieldDialogue(saved).action,'mission20CaseBattle');assert.equal(fieldDialogue({...saved,zaMission21Complete:true,zaMission21RewardPending:true}).action,'mission20ClaimStone');
 assert.notEqual(fieldMap({...saved,zaMission21Complete:true})[5][18],'m');
});
