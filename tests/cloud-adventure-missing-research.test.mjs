import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldPath} from '../lib/cloud-adventure/adventure-world.mjs';
import {zone9Map,zone9Encounter} from '../lib/cloud-adventure/adventure-zone9.mjs';
import {zone16Map,zone16Encounter} from '../lib/cloud-adventure/adventure-zone16.mjs';
import {zone17Map,zone17Encounter} from '../lib/cloud-adventure/adventure-zone17.mjs';

test('missing Zone 9, 16 and 17 research species can be encountered in reachable grass',()=>{
 const cases=[
  {name:'Zone 9 rooftop',map:zone9Map({zaZone9Upper:true}),from:{x:5,y:5},pos:{x:9,y:7},roll:.9,encounter:zone9Encounter,state:{zaZone9Upper:true},expected:662},
  {name:'Zone 16 day',map:zone16Map({}),from:{x:11,y:13},pos:{x:10,y:9},roll:.9,encounter:zone16Encounter,period:'day',expected:671},
  {name:'Zone 16 night Barbaracle',map:zone16Map({}),from:{x:11,y:13},pos:{x:10,y:9},roll:.7,encounter:zone16Encounter,period:'night',expected:689},
  {name:'Zone 16 night Starmie',map:zone16Map({}),from:{x:11,y:13},pos:{x:10,y:9},roll:.9,encounter:zone16Encounter,period:'night',expected:121},
  {name:'Zone 17 Skarmory',map:zone17Map({}),from:{x:11,y:13},pos:{x:10,y:12},roll:.9,encounter:zone17Encounter,period:'day',expected:227},
  {name:'Zone 17 night Lampent',map:zone17Map({}),from:{x:11,y:13},pos:{x:10,y:12},roll:.95,encounter:zone17Encounter,period:'night',expected:608},
 ];
 for(const c of cases){
  assert.equal(c.map[c.pos.y][c.pos.x],'g',c.name);assert.ok(fieldPath(c.map,c.from,c.pos).length,c.name);
  assert.equal(c.encounter(c.state||{},()=>c.roll,c.period).speciesId,c.expected,c.name);
 }
 assert.notEqual(zone16Encounter({},()=>.9,'day').speciesId,121);
 assert.notEqual(zone17Encounter({},()=>.95,'day').speciesId,608);
});
