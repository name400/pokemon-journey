import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Magenta Sector 3 draft rooftop links lift, scaffold and Mission 17 while preserving saves',()=>{
 const street={area:3,district:'lumiose-magenta-sector3',interior:null,x:19,y:9,facing:'up',zaMission15Stage:2,teamIds:['kept']};
 assert.equal(fieldDialogue(street).action,'magenta3Holovator');
 const roof={...street,district:'lumiose-magenta-sector3-roof',x:2,y:13,facing:'down'};
 assert.equal(fieldDialogue(roof).action,'magenta3Holovator');
 const map=fieldMap(roof);assert.equal(map[7][10],',');assert.ok(fieldPath(map,roof,{x:18,y:6}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...roof,x:18,y:6,facing:'up'},85),85);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-magenta-sector3-roof',18,6,['kept']]);
 assert.equal(fieldDialogue(saved).action,'battleMission15Case');
 assert.equal(fieldDialogue({...saved,zaMission17Complete:true,zaMission17RewardPending:true}).action,'claimMission15Stone');
 assert.notEqual(fieldMap({...saved,zaMission17Complete:true})[5][18],'d');
});
