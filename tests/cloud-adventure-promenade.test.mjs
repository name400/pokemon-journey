import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,restoreAdventurePosition,storeAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Vernal promenade places boutiques on both sides and preserves mission locations',()=>{
 const street={area:3,district:'lumiose-vernal',interior:null,x:11,y:8,facing:'up',teamIds:['kept'],zaMission25Complete:true};
 const map=fieldMap(street);
 for(const [x,y,name] of [[7,3,'Fresh Fits'],[7,5,'BRAVELY'],[7,7,'Dessert du Moment'],[16,3,'Changing Gears'],[16,7,'미용실']]){
  assert.ok(fieldPath(map,street,{x,y}).length);assert.equal(fieldDialogue({...street,x,y}).name,name);
 }
 assert.equal(fieldDialogue({...street,x:16,y:6,facing:'up'}).action,'mission26Asami');
 assert.equal(fieldDialogue({...street,x:12,y:6,facing:'up'}).action,'mission26Asami');
 assert.notEqual(fieldDialogue({...street,x:16,y:6,facing:'up',zaMission26Stage:1}).action,'mission26Asami');
 const saved=restoreAdventurePosition(storeAdventurePosition({...street,x:7,y:5},72),72);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.zaMission25Complete,saved.teamIds],['lumiose-vernal',7,5,true,['kept']]);
});
