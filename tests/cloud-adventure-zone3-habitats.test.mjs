import test from 'node:test';
import assert from 'node:assert/strict';
import {zone3Habitat,zone3Encounter,ZONE3_SPECIES} from '../lib/cloud-adventure/adventure-zone3.mjs';
import {lumioseZone3Map,fieldPath} from '../lib/cloud-adventure/adventure-world.mjs';
test('Rouge gardens select documented habitats while preserving unmapped fallback',()=>{
 const cases=[['northwest',{x:8,y:6},[667,674]],['northeast',{x:14,y:6},[677]],['southwest',{x:8,y:10},[672,674]],['southeast',{x:14,y:10},[25]],['center',{x:11,y:8},[669]]],map=lumioseZone3Map();
 for(const [name,pos,ids] of cases){assert.equal(map[pos.y][pos.x],'g');assert.ok(fieldPath(map,{x:11,y:9},pos).length);assert.equal(zone3Habitat(pos),name);for(let i=0;i<ids.length;i++)assert.deepEqual(zone3Encounter('day',()=>i/ids.length,pos),{speciesId:ids[i],level:7});}
 assert.ok(!Array.from({length:5},(_,i)=>zone3Encounter('night',()=>i/5,{x:11,y:8}).speciesId).includes(669));assert.equal(zone3Habitat({x:NaN,y:1}),null);assert.equal(zone3Encounter('day',()=>0,{x:0,y:0}).speciesId,ZONE3_SPECIES[0]);
});
