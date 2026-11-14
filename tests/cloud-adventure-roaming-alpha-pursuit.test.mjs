import test from 'node:test';import assert from 'node:assert/strict';
import {stepRoamingAlphaPursuit} from '../lib/cloud-adventure/adventure-roaming-alpha-pursuit.mjs';
import {zone2FieldMonsters,zone3FieldMonsters} from '../lib/cloud-adventure/adventure-world.mjs';

test('known roaming alphas take one valid step without changing identity',()=>{
 const cases=[{district:'lumiose-zone2',x:11,y:10,id:'patrat',species:504,px:11,py:8,field:'zaZone2FieldPositions',find:zone2FieldMonsters},{district:'lumiose-zone3',x:13,y:6,id:'espurr',species:677,px:15,py:6,field:'zaZone3FieldPositions',find:zone3FieldMonsters}];
 for(const c of cases){const s={area:3,district:c.district,x:c.x,y:c.y,zaMission05Complete:true,zaWildShinyRolls:{kept:true}},threat={id:c.id,species:c.species,x:c.px,y:c.py};assert.equal(stepRoamingAlphaPursuit(s,threat,'day'),true);const p=c.find(s,'day').find(p=>p.id===c.id);assert.equal(Math.abs(p.x-c.px)+Math.abs(p.y-c.py),1);assert.equal(Math.abs(p.x-c.x)+Math.abs(p.y-c.y),1);assert.deepEqual(s.zaWildShinyRolls,{kept:true});assert.equal(stepRoamingAlphaPursuit(s,threat,'day'),false);}
});

test('pursuit preserves future position records and ignores unsupported targets',()=>{
 const threat={id:'patrat',species:504,x:11,y:8},s={area:3,district:'lumiose-zone2',x:11,y:10,zaZone2FieldPositions:{patrat:{x:11,y:8,future:true}}},before=structuredClone(s);
 assert.equal(stepRoamingAlphaPursuit(s,threat,'day'),false);assert.deepEqual(s,before);assert.equal(stepRoamingAlphaPursuit(s,{...threat,id:'binacle',species:688},'day'),null);assert.equal(stepRoamingAlphaPursuit(s,threat,'unknown'),null);
});
