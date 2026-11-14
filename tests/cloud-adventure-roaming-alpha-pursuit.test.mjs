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

test('zone 3 ground alpha pursues without moving ordinary or unknown records',()=>{
 const key='field3:pikachu:25',threat={id:'pikachu',species:25,x:15,y:10},base={area:3,district:'lumiose-zone3',x:13,y:10,zaMission05Complete:true,zaWildVisibleAlphaLevels:{[key]:20},zaWildShinyRolls:{[key]:true}};
 const s=structuredClone(base);assert.equal(stepRoamingAlphaPursuit(s,threat,'day'),true);assert.deepEqual(s.zaZone3FieldPositions.pikachu,{x:14,y:10});assert.deepEqual(zone3FieldMonsters(s,'day').find(p=>p.id==='pikachu').x,14);assert.equal(s.zaWildShinyRolls[key],true);assert.equal(zone3FieldMonsters({...s,zaWildVisibleAlphaLevels:{}},'day').find(p=>p.id==='pikachu').x,15);
 const future={...base,zaZone3FieldPositions:{pikachu:{x:15,y:10,future:true}}},before=structuredClone(future);assert.equal(stepRoamingAlphaPursuit(future,threat,'day'),false);assert.deepEqual(future,before);assert.equal(stepRoamingAlphaPursuit({...base,zaWildVisibleAlphaLevels:{}},threat,'day'),null);
 for(const p of [{id:'pancham',species:674,x:7,y:6,px:9,py:6},{id:'skiddo',species:672,x:8,y:10,px:10,py:10}]){const state={area:3,district:'lumiose-zone3',x:p.px,y:p.py,zaWildVisibleAlphaLevels:{[`field3:${p.id}:${p.species}`]:20}};assert.equal(stepRoamingAlphaPursuit(state,p,'day'),true);const moved=zone3FieldMonsters(state,'day').find(v=>v.id===p.id);assert.equal(Math.abs(moved.x-p.px)+Math.abs(moved.y-p.py),1);}
});

test('Zone 3 alpha Flabébé pursues on the plaza without relocating ordinary or unknown saves',()=>{
 const key='field3:flabebe:669',threat={id:'flabebe',species:669,x:11,y:8};
 const base={area:3,district:'lumiose-zone3',x:11,y:6,zaMission05Complete:true,zaWildVisibleAlphaLevels:{[key]:20},zaWildShinyRolls:{[key]:true},teamIds:['kept']};
 const s=structuredClone(base);assert.equal(stepRoamingAlphaPursuit(s,threat,'day'),true);assert.deepEqual(s.zaZone3FieldPositions.flabebe,{x:11,y:7});
 assert.deepEqual([zone3FieldMonsters(s,'day').find(p=>p.id==='flabebe').x,zone3FieldMonsters(s,'day').find(p=>p.id==='flabebe').y],[11,7]);
 assert.equal(zone3FieldMonsters({...s,zaWildVisibleAlphaLevels:{}},'day').find(p=>p.id==='flabebe').y,8);assert.equal(zone3FieldMonsters(s,'night').some(p=>p.id==='flabebe'),false);
 assert.deepEqual(s.zaWildShinyRolls,{[key]:true});assert.deepEqual(s.teamIds,['kept']);
 const unknown={...base,zaZone3FieldPositions:{flabebe:{x:11,y:8,future:true}}},before=structuredClone(unknown);assert.equal(stepRoamingAlphaPursuit(unknown,threat,'day'),false);assert.deepEqual(unknown,before);
 assert.equal(stepRoamingAlphaPursuit({...base,zaWildVisibleAlphaLevels:{}},threat,'day'),null);
});
