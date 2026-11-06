import test from 'node:test';
import assert from 'node:assert/strict';
import {zone5Map,zone5Encounter} from '../lib/cloud-adventure/adventure-zone5.mjs';
import {stepField,storeAdventurePosition,restoreAdventurePosition,fieldPath} from '../lib/cloud-adventure/adventure-world.mjs';

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
