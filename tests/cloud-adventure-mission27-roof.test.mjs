import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Mission 27 lift and ice bridges preserve progress and legacy encounter',()=>{
 const street={area:3,district:'lumiose-bleu-sector3',interior:null,x:10,y:9,facing:'up',zaMission20Stage:5,zaMission26Stage:3,teamIds:['kept']};
 assert.equal(fieldDialogue({...street,zaMission20Stage:4}).action,undefined);
 assert.equal(fieldDialogue(street).action,'mission61Battle');
 assert.equal(fieldDialogue({...street,zaMission61Won:true}).action,'mission27Holovator');
 const roof={...street,district:'lumiose-mission27-roof',x:2,y:12,facing:'down',zaMission61Won:true};
 assert.equal(fieldDialogue(roof).action,'mission27Holovator');
 assert.ok(fieldPath(fieldMap(roof),roof,{x:6,y:8}).length);
 assert.equal(fieldDialogue({...roof,x:6,y:8,facing:'right'}).action,'mission27IceBridge');
 assert.equal(fieldPath(fieldMap(roof),roof,{x:18,y:6}).length,0);
 const west={...roof,zaMission27Bridges:['west']};
 assert.ok(fieldPath(fieldMap(west),west,{x:13,y:8}).length);
 assert.equal(fieldDialogue({...west,x:13,y:8,facing:'right'}).action,'mission27IceBridge');
 const both={...west,zaMission27Bridges:['west','east']};
 assert.ok(fieldPath(fieldMap(both),both,{x:18,y:6}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...both,x:18,y:6,facing:'up'},92),92);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaMission27Bridges],['lumiose-mission27-roof',18,6,['kept'],['west','east']]);
 assert.equal(fieldDialogue(saved).action,'mission26CaseBattle');
 assert.equal(fieldDialogue({...saved,zaMission27Complete:true,zaMission27RewardPending:true}).action,'mission26ClaimStone');
 assert.equal(fieldDialogue({...street,district:'lumiose-rooftop',x:15,y:7,facing:'up'}).action,'mission26CaseBattle');
});
