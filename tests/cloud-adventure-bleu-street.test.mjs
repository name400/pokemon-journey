import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Bleu Street connects plaza, South Boulevard, and Sector 7 with safe saves',()=>{
 const city={area:3,district:'lumiose-bleu-plaza-route',interior:null,x:5,y:15,teamIds:['kept']};
 const street=stepField(city,'down');assert.deepEqual([street.district,street.x,street.y],['lumiose-bleu-street',11,1]);
 assert.equal(stepField({...city,...street},'up').district,'lumiose-bleu-plaza-route');
 assert.ok(fieldPath(fieldMap({...city,...street}),street,{x:11,y:15}).length);
 assert.ok(fieldPath(fieldMap({...city,...street}),street,{x:21,y:8}).length);
 const south=stepField({...city,...street,x:11,y:15},'down');assert.equal(south.district,'lumiose-south-boulevard');
 assert.equal(stepField({...city,...south},'up').district,'lumiose-bleu-street');
 const east=stepField({...city,...street,x:21,y:8},'right');assert.equal(east.district,'lumiose-bleu-sector7');
 assert.equal(stepField({...city,...east},'left').district,'lumiose-bleu-street');
 const saved=restoreAdventurePosition(storeAdventurePosition({...city,...street,x:11,y:8},8),8);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-bleu-street',11,8,['kept']]);
 assert.equal(stepField({...city,x:1,y:8},'left').district,'lumiose-bleu6-approach');
});
