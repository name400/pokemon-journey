import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('South Boulevard connects Bleu Sector 7 and the existing research lab approach',()=>{
 const city={area:3,district:'lumiose-bleu-sector7',interior:null,x:11,y:15,zaRoyaleRank:'E',teamIds:['kept']};
 const street=stepField(city,'down');assert.deepEqual([street.district,street.x,street.y],['lumiose-south-boulevard',8,1]);
 assert.equal(stepField({...city,...street},'up').district,'lumiose-bleu-sector7');
 assert.ok(fieldPath(fieldMap({...city,...street}),street,{x:21,y:8}).length);
 const lab=stepField({...city,...street,x:21,y:8},'right');assert.equal(lab.district,'lumiose-floral');
 assert.equal(stepField({...city,...lab},'left').district,'lumiose-south-boulevard');
 const saved=restoreAdventurePosition(storeAdventurePosition({...city,...street,x:11,y:8},8),8);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-south-boulevard',11,8,['kept']]);
 const old={...city,district:'lumiose-floral',x:21,y:8};assert.equal(stepField(old,'right').district,'lumiose-zone1');
});
