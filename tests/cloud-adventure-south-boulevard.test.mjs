import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
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

test('Bleu center is reachable from South Boulevard and keeps the existing heal action',()=>{
 const south={area:3,district:'lumiose-south-boulevard',interior:null,x:8,y:1,teamIds:['kept']};
 const sector=stepField(south,'up');assert.equal(sector.district,'lumiose-bleu-sector7');
 const state={...south,...sector};assert.ok(fieldPath(fieldMap(state),state,{x:11,y:13}).length);
 const center={...state,x:11,y:13,facing:'up'};assert.equal(fieldDialogue(center).action,'heal');
 const saved=restoreAdventurePosition(storeAdventurePosition(center,9),9);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-bleu-sector7',11,13,['kept']]);assert.equal(fieldDialogue(saved).action,'heal');
});
