import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Mission 23 draft roof connects lift, scaffold and upper ladder encounter',()=>{
 const street={area:3,district:'lumiose-rouge-north',interior:null,x:20,y:8,facing:'up',zaMission20Stage:5,zaMission23GwynnWon:true,teamIds:['kept']};
 assert.equal(fieldDialogue(street).action,'mission23Holovator');
 const roof={...street,district:'lumiose-mission23-roof',x:2,y:13,facing:'down'};assert.equal(fieldDialogue(roof).action,'mission23Holovator');
 assert.equal(fieldMap(roof)[11][10],',');assert.ok(fieldPath(fieldMap(roof),roof,{x:17,y:9}).length);assert.equal(fieldDialogue({...roof,x:17,y:9,facing:'up'}).action,'mission23RoofLadder');
 const upper={...roof,x:17,y:5,facing:'down'};assert.equal(fieldDialogue(upper).action,'mission23RoofLadder');assert.ok(fieldPath(fieldMap(upper),upper,{x:18,y:4}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...upper,x:18,y:4,facing:'up'},92),92);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-mission23-roof',18,4,['kept']]);assert.equal(fieldDialogue(saved).action,'mission20CaseBattle');assert.equal(fieldDialogue({...saved,zaMission23Complete:true,zaMission23RewardPending:true}).action,'mission20ClaimStone');
});
