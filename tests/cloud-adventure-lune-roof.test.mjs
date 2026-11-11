import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,rotoGlideLanding,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Galerie scaffolding, ladder and glass dome retain distinct roof areas',()=>{
 const ground={area:3,district:'lumiose-rouge-north',interior:null,x:20,y:12,facing:'down',zaMission15Stage:2,teamIds:['kept'],zaMission41Stage:3};
 assert.equal(fieldMap(ground)[13][20],'h');assert.equal(fieldDialogue(ground)?.action,'luneScaffold');const old=restoreAdventurePosition(storeAdventurePosition({...ground,x:20,y:13},123),123);assert.deepEqual([old.district,old.x,old.y,old.teamIds,old.zaMission41Stage],[ground.district,20,13,['kept'],3]);
 const roof={...ground,district:'lumiose-lune-roof',x:4,y:8,facing:'left'},map=fieldMap(roof);assert.equal(fieldDialogue(roof)?.action,'luneScaffold');assert.ok(fieldPath(map,roof,{x:7,y:8}).length);assert.equal(fieldPath(map,roof,{x:13,y:8}).length,0);
 assert.equal(fieldDialogue({...roof,x:7,y:8,facing:'right'})?.action,'luneRoofLadder');assert.equal(fieldDialogue({...roof,x:13,y:8,facing:'left'})?.action,'luneRoofLadder');
 const launch={...roof,x:17,y:4};assert.equal(fieldPath(map,launch,{x:17,y:2}).length,0);assert.equal(rotoGlideLanding({...launch,zaMission15Stage:1}),null);assert.deepEqual(rotoGlideLanding(launch),{x:17,y:2,facing:'up'});
 const saved=restoreAdventurePosition(storeAdventurePosition({...launch,...rotoGlideLanding(launch)},124),124);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaMission41Stage],['lumiose-lune-roof',17,2,['kept'],3]);assert.deepEqual(rotoGlideLanding(saved),{x:17,y:4,facing:'down'});
});

test('new Mission 41 saves inspect the dome while older stage-three saves keep the encounter',()=>{
 const roof={area:3,district:'lumiose-lune-roof',interior:null,x:17,y:2,facing:'left',zaMission41Stage:3,zaMission15Stage:2,teamIds:['kept']};
 const fresh={...roof,zaMission41DomeInvestigated:false};assert.equal(fieldMap(fresh)[2][16],'z');assert.equal(fieldDialogue(fresh).action,'mission41InspectDome');
 const revealed={...roof,zaMission41DomeInvestigated:true};assert.equal(fieldMap(revealed)[2][16],'0');assert.equal(fieldDialogue(revealed).action,'mission41Yveltal');
 assert.equal(fieldMap(roof)[2][16],'0');assert.equal(fieldDialogue(roof).action,'mission41Yveltal');assert.notEqual(fieldMap({...revealed,zaMission41Complete:true})[2][16],'0');
 const saved=restoreAdventurePosition(storeAdventurePosition(fresh,190),190);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaMission41DomeInvestigated,saved.teamIds],['lumiose-lune-roof',17,2,false,['kept']]);
});
