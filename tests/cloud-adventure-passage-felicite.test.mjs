import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
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

test('Passage adds documented north, south and west access with six shops',()=>{
 const passage={area:3,district:'lumiose-passage-felicite',interior:null,x:11,y:8,teamIds:['kept'],zaEmmaMet:true};
 const map=fieldMap(passage);
 for(const [x,y,dir,district,back] of [[11,1,'up','lumiose-bleu6-approach','right'],[11,15,'down','lumiose-bleu-street','left'],[1,6,'left','lumiose-bleu-sector8','right']]){
  assert.ok(fieldPath(map,passage,{x,y}).length);const out=stepField({...passage,x,y},dir);assert.equal(out.district,district);assert.equal(stepField({...passage,...out},back).district,'lumiose-passage-felicite');
 }
 for(const [x,y,name] of [[3,5,'Marché Bleu'],[7,5,'In the Zone'],[11,5,'Équipement'],[3,11,'Kickspin'],[7,11,'Triathlon Bleu'],[11,11,'DEFOG Eyewear']]){
  assert.equal(fieldDialogue({...passage,x,y,facing:'up'}).name,name);
 }
 const saved=restoreAdventurePosition(storeAdventurePosition({...passage,x:11,y:1},73),73);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaEmmaMet],['lumiose-passage-felicite',11,1,['kept'],true]);
 const older=restoreAdventurePosition(storeAdventurePosition({...passage,x:19,y:10},74),74);assert.deepEqual([older.x,older.y],[19,10]);
});
