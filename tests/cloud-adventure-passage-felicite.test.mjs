import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Passage links Bleu Street and Sector 6 while retaining direct exits and saved positions',()=>{
 const street={area:3,district:'lumiose-bleu-street',interior:null,x:1,y:5,teamIds:['kept']};
 const passage=stepField(street,'left');assert.deepEqual([passage.district,passage.x,passage.y],['lumiose-passage-felicite',21,8]);
 assert.equal(stepField({...street,...passage},'right').district,'lumiose-bleu-street');
 assert.ok(fieldPath(fieldMap({...street,...passage}),passage,{x:1,y:8}).length);
 const b6=stepField({...street,...passage,x:1,y:8},'left');assert.equal(b6.district,'lumiose-bleu6-approach');
 assert.equal(stepField({...street,...b6},'right').district,'lumiose-passage-felicite');
 assert.equal(stepField({...street,x:1,y:8},'left').district,'lumiose-bleu6-approach');
 const saved=restoreAdventurePosition(storeAdventurePosition({...street,...passage,x:11,y:8},9),9);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-passage-felicite',11,8,['kept']]);
});
