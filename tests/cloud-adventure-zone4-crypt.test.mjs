import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Zone 4 south crypt keeps exits and safely restores older saved locations',()=>{
 const z={area:3,district:'lumiose-zone4',interior:null,x:11,y:15,zaSableyeQuest:1,teamIds:['kept']};
 const map=fieldMap(z);assert.equal(map[12][14],'^');assert.equal(stepField({...z,x:13,y:12},'right').blocked,true);
 assert.ok(fieldPath(map,z,{x:18,y:6}).length);assert.equal(stepField(z,'down').district,'lumiose-rouge-north');
 const saved=restoreAdventurePosition(storeAdventurePosition({...z,x:15,y:12},73),73);
 assert.equal(saved.district,'lumiose-zone4');assert.equal(saved.zaSableyeQuest,1);assert.deepEqual(saved.teamIds,['kept']);
 assert.notEqual(fieldMap(saved)[saved.y][saved.x],'^');assert.ok(fieldPath(fieldMap(saved),saved,{x:18,y:6}).length);
});

test('Zone 4 rear building route and old position survive the bramble',async()=>{
 const {fieldDialogue,walkable}=await import('../lib/cloud-adventure/adventure-world.mjs');
 const base={area:3,district:'lumiose-zone4',interior:null,x:16,y:10,facing:'down',zaSableyeQuest:1,teamIds:['kept']};
 const map=fieldMap(base);assert.equal(map[11][16],'r');assert.equal(fieldDialogue(base).action,'zone4RearBrambles');assert.equal(stepField(base,'down').blocked,true);
 for(const target of [{x:11,y:1},{x:1,y:10},{x:11,y:15},{x:21,y:8},{x:18,y:6}])assert.ok(fieldPath(map,base,target).length);
 const old=storeAdventurePosition({...base,x:16,y:11},72);delete old.districtPosition.zone4RearLayout;const restored=restoreAdventurePosition(old,72);assert.ok(walkable(fieldMap(restored)[restored.y][restored.x]));assert.deepEqual(restored.teamIds,['kept']);assert.equal(restored.zaSableyeQuest,1);
 assert.equal(fieldDialogue({...base,zaZone4RearBramblesCleared:true}).action,'zone4RearTm');
 assert.notEqual(fieldMap({...base,zaZone4RearBramblesCleared:true,zaZone4RearTmClaimed:true})[11][16],'t');
});

test('TM072 compatibility accepts confirmed species and Alolan form only',async()=>{
 const {canLearnStoryTm}=await import('../lib/cloud-adventure/adventure-story-tm.mjs');const bag={'za-tm072':1};
 assert.equal(canLearnStoryTm(bag,{id:498,speciesId:498,moves:[]},'za-tm072'),true);
 assert.equal(canLearnStoryTm(bag,{id:10115,speciesId:105,moves:[]},'za-tm072'),true);
 assert.equal(canLearnStoryTm(bag,{id:105,speciesId:105,moves:[]},'za-tm072'),false);
 assert.equal(canLearnStoryTm(bag,{id:152,speciesId:152,moves:[]},'za-tm072'),false);
 assert.equal(canLearnStoryTm(bag,{id:498,speciesId:498,moves:['회오리불꽃']},'za-tm072'),false);
});
