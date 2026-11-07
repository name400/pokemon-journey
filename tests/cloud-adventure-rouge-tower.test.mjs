import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Rouge stone building has reachable internal stairs and preserves both floor saves',()=>{
 const ground={area:3,district:'lumiose-zone3',interior:null,x:7,y:6,facing:'down',teamIds:['kept']};
 assert.equal(fieldDialogue(ground).action,'zone3TowerUp');
 const room={...ground,district:'lumiose-rouge-tower-interior',zaZone3TowerUpper:false,x:11,y:12,facing:'down'};
 assert.equal(fieldDialogue(room).action,'zone3TowerDown');
 assert.ok(fieldPath(fieldMap(room),room,{x:11,y:6}).length);
 const stairs={...room,x:11,y:6,facing:'up'};assert.equal(fieldDialogue(stairs).action,'zone3TowerUp');
 const saved=restoreAdventurePosition(storeAdventurePosition({...stairs,zaZone3Tm022:true},63),63);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.zaZone3Tm022,saved.teamIds],['lumiose-rouge-tower-interior',11,6,true,['kept']]);
 const oldRoof={...ground,zaZone3TowerUpper:true,x:11,y:10,facing:'up'};
 const roofSave=restoreAdventurePosition(storeAdventurePosition(oldRoof,64),64);
 assert.equal(fieldDialogue(roofSave).action,'zone3TowerDown');assert.deepEqual(roofSave.teamIds,['kept']);
 assert.equal(restoreAdventurePosition(storeAdventurePosition(room,63),64).district,null);
});
