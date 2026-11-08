import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,rotoGlideLanding,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Vert 6 isolated ladder roof and Racine roof preserve ground access and saved landing',()=>{
 const ground={area:3,district:'lumiose-vert-sector6',interior:null,x:18,y:3,facing:'up',zaMission15Stage:2,teamIds:['kept']},map=fieldMap(ground);
 assert.equal(map[2][18],'l');assert.equal(fieldDialogue(ground)?.action,'vert6RoofLadder');assert.ok(fieldPath(map,{x:1,y:8},ground).length);
 const old=restoreAdventurePosition(storeAdventurePosition({...ground,x:18,y:2},111),111);assert.deepEqual([old.district,old.x,old.y,old.teamIds],[ground.district,18,2,['kept']]);
 const roof={...ground,district:'lumiose-vert6-roof',x:18,y:9,facing:'down'},roofMap=fieldMap(roof);assert.equal(fieldDialogue(roof)?.action,'vert6RoofLadder');assert.ok(fieldPath(roofMap,roof,{x:13,y:8}).length);assert.equal(fieldPath(roofMap,roof,{x:9,y:8}).length,0);
 const launch={...roof,x:13,y:8};assert.equal(rotoGlideLanding({...launch,zaMission15Stage:1}),null);assert.deepEqual(rotoGlideLanding(launch),{x:9,y:8,facing:'left'});
 const landing={...launch,...rotoGlideLanding(launch)},saved=restoreAdventurePosition(storeAdventurePosition(landing,112),112);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-vert6-roof',9,8,['kept']]);assert.deepEqual(rotoGlideLanding(saved),{x:13,y:8,facing:'right'});
 assert.equal(stepField({...ground,x:1,y:8},'left').district,'lumiose-south-boulevard');
});
