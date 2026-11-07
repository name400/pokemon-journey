import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,rotoGlideLanding,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Vert 2 rooftop gap offers fixed box crossing and unlocked glide only at its endpoints',()=>{
 const roof={area:3,district:'lumiose-vert2',interior:null,x:9,y:8,facing:'right',zaVert2RoofUpper:true,zaMission15Stage:1,teamIds:['kept']},map=fieldMap(roof);
 assert.equal(map[8][9],'j');assert.equal(map[8][13],'j');assert.equal(fieldPath(map,roof,{x:13,y:8}).length,0);assert.equal(fieldDialogue(roof).action,'vert2RoofGap');
 assert.equal(rotoGlideLanding(roof),null);assert.deepEqual(rotoGlideLanding({...roof,zaMission15Stage:2}),{x:13,y:8,facing:'right'});
 assert.deepEqual(rotoGlideLanding({...roof,x:13,zaMission15Stage:2}),{x:9,y:8,facing:'left'});assert.equal(rotoGlideLanding({...roof,x:8,zaMission15Stage:2}),null);
 const saved=restoreAdventurePosition(storeAdventurePosition({...roof,x:13},51),51);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaVert2RoofUpper,saved.teamIds],[roof.district,13,8,true,['kept']]);
});
