import test from 'node:test';
import assert from 'node:assert/strict';
import {zone5Map,zone5Encounter} from '../lib/cloud-adventure/adventure-zone5.mjs';
import {stepField,storeAdventurePosition,restoreAdventurePosition,fieldPath,fieldMap} from '../lib/cloud-adventure/adventure-world.mjs';

test('zone five preserves separate ground and rooftop, entrances and saved locations',()=>{
 const state={area:3,district:'lumiose-centrico-route',interior:null,x:18,y:15,facing:'down'};
 const south=stepField(state,'down');assert.equal(south.district,'lumiose-zone5');assert.deepEqual([south.x,south.y],[11,15]);
 const z={...state,...south};assert.equal(zone5Map(z)[16][11],'X');assert.ok(fieldPath(zone5Map(z),z,{x:4,y:5}).length);
 const back=stepField(z,'down');assert.equal(back.district,'lumiose-centrico-route');assert.deepEqual([back.x,back.y],[18,15]);
 const west=stepField({...state,x:16,y:15},'down');assert.deepEqual([west.district,west.x,west.y],['lumiose-zone5',1,8]);
 const w={...state,...west};assert.equal(stepField(w,'left').district,'lumiose-centrico-route');
 const upper={...z,x:4,y:5,zaZone5Upper:true};assert.equal(zone5Map(upper)[4][4],'l');assert.ok(fieldPath(zone5Map(upper),upper,{x:19,y:4}).length);
 const saved=storeAdventurePosition(upper,44),restored=restoreAdventurePosition(saved,44);assert.deepEqual([restored.district,restored.x,restored.y,restored.zaZone5Upper],['lumiose-zone5',4,5,true]);
 assert.equal(restoreAdventurePosition(saved,45).district,null);
 assert.equal(zone5Encounter(()=>0).speciesId,16);assert.equal(zone5Encounter(()=>.999).speciesId,661);
});
test('Zone 5 underground route has two barriers and connects back to the sewer approach',()=>{
 const ground={area:3,district:'lumiose-zone5',interior:null,x:6,y:3,zaZone5Upper:false};
 assert.equal(zone5Map(ground)[2][6],'r');
 assert.equal(zone5Map({...ground,zaZone5DrainFirstCleared:true})[2][6],'s');
 const drain={...ground,district:'lumiose-zone5-drain',x:11,y:5};
 assert.equal(stepField(drain,'right').blocked,true);
 const open={...drain,zaZone5DrainSecondCleared:true};
 assert.ok(fieldPath(fieldMap(open),open,{x:21,y:4}).length);
 const approach=stepField({...open,x:21,y:4},'right');assert.equal(approach.district,'lumiose-bleu3-sewer-approach');
 const back=stepField({...open,...approach},'up');assert.equal(back.district,'lumiose-zone5-drain');
 const saved=restoreAdventurePosition(storeAdventurePosition({...open,x:8,y:11,teamIds:['kept']},8),8);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone5-drain',8,11,['kept']]);
 assert.equal(stepField({...open,x:1,y:12},'left').district,'lumiose-zone5');
});
