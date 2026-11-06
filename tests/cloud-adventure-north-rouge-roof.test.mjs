import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,restoreAdventurePosition,storeAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('North Boulevard Holovator and Sector 3 roof preserve saved progress',()=>{
 const street={area:3,district:'lumiose-north-boulevard',interior:null,x:8,y:6,facing:'up',teamIds:['kept'],zaMission13Complete:true};
 assert.equal(fieldDialogue(street).action,'northRougeHolovator');
 const roof={...street,district:'lumiose-north-rouge-roof',x:3,y:13,facing:'down'};
 assert.equal(fieldDialogue(roof).action,'northRougeHolovator');
 const map=fieldMap(roof);assert.ok(fieldPath(map,roof,{x:18,y:3}).length);
 assert.deepEqual([map[11][9],map[5][14],map[3][14]],['b','n','l']);
 assert.match(fieldDialogue({...roof,x:18,y:3}).name,/높은 옥상/);
 const saved=restoreAdventurePosition(storeAdventurePosition({...roof,x:18,y:3},65),65);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.zaMission13Complete,saved.teamIds],['lumiose-north-rouge-roof',18,3,true,['kept']]);
 const old=restoreAdventurePosition(storeAdventurePosition({...street,x:8,y:5},66),66);assert.deepEqual([old.district,old.x,old.y],['lumiose-north-boulevard',8,5]);
});
