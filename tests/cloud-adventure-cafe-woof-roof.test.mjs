import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Café Woof ladder, bridge and brambles preserve state across saves',()=>{
 const street={area:3,district:'lumiose-vernal',interior:null,x:12,y:3,facing:'down',teamIds:['kept'],zaMission61Won:false};
 assert.equal(fieldDialogue(street).action,'cafeWoofRoofLadder');
 const roof={...street,district:'lumiose-cafe-woof-roof',x:4,y:9,facing:'down'};
 assert.equal(fieldDialogue(roof).action,'cafeWoofRoofLadder');
 assert.ok(fieldPath(fieldMap(roof),roof,{x:15,y:8}).length);
 assert.equal(fieldPath(fieldMap(roof),roof,{x:19,y:9}).length,0);
 const opened={...roof,zaCafeWoofBrambleCleared:true};assert.ok(fieldPath(fieldMap(opened),opened,{x:19,y:9}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...opened,x:19,y:8,facing:'down'},61),61);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaMission61Won],['lumiose-cafe-woof-roof',19,8,['kept'],false]);
 assert.equal(fieldDialogue(saved).action,'cafeWoofRoofTm056');
 assert.equal(restoreAdventurePosition(storeAdventurePosition(opened,61),62).district,null);
});
