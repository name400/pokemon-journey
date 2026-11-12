import test from 'node:test';
import assert from 'node:assert/strict';
import {zone2FieldMonsters,zone2FieldTarget} from '../lib/cloud-adventure/adventure-world.mjs';
test('shared zone two field encounters respect habitat, time, distance and spent state',()=>{
 const s={district:'lumiose-zone2',x:12,y:8};
 assert.deepEqual(zone2FieldMonsters(s,'day').map(m=>m.id),['patrat','patrat2','binacle','magikarp']);
 assert.equal(zone2FieldTarget(s,'day','patrat').distance,1);
 assert.equal(zone2FieldTarget(s,'day','staryu'),null);
 assert.ok(zone2FieldTarget({ ...s,x:7,y:8 },'night','staryu'));
 assert.equal(zone2FieldTarget({...s,zaZone2FieldSpent:{patrat:true}},'night','patrat'),null);
 assert.deepEqual(zone2FieldMonsters({...s,interior:'hotel'},'night'),[]);
 assert.equal(zone2FieldTarget(s,'day','__proto__'),null);
});

test('bridge reaction moves Magikarp to the bridge and restores the water position',async()=>{
 const {stepZone2Field}=await import('../lib/cloud-adventure/adventure-world.mjs');
 const s={district:'lumiose-zone2',x:8,y:11};
 assert.equal(stepZone2Field(s,'day'),true);
 let fish=zone2FieldMonsters(s,'day').find(m=>m.id==='magikarp');
 assert.deepEqual([fish.x,fish.y,fish.water],[8,10,false]);
 assert.ok(zone2FieldTarget(s,'day','magikarp'));
 assert.deepEqual(JSON.parse(JSON.stringify(s.zaZone2FieldPositions)).magikarp,{x:8,y:10,ttl:3});
 s.x=13;s.y=9;for(let i=0;i<3;i++)stepZone2Field(s,'day');
 fish=zone2FieldMonsters(s,'day').find(m=>m.id==='magikarp');assert.deepEqual([fish.x,fish.y,fish.water],[7,10,true]);
 assert.equal(stepZone2Field({...s,zaZone2FieldSpent:{magikarp:true},x:8,y:11},'day'),false);
});


test('Patrat and Staryu move within their habitats and contact is detected',async()=>{
 const {stepZone2Field,zone2FieldContact}=await import('../lib/cloud-adventure/adventure-world.mjs');
 const s={district:'lumiose-zone2',x:14,y:12,steps:3};assert.equal(zone2FieldContact(s,'night'),null);stepZone2Field(s,'night');
 const group=zone2FieldMonsters(s,'night'),first=group.find(m=>m.id==='patrat'),second=group.find(m=>m.id==='patrat2'),star=group.find(m=>m.id==='staryu');
 assert.notDeepEqual([first.x,first.y],[11,8]);assert.notDeepEqual([star.x,star.y],[8,8]);assert.notDeepEqual([first.x,first.y],[second.x,second.y]);
 s.x=first.x;s.y=first.y;assert.equal(zone2FieldContact(s,'night').id,'patrat');s.zaZone2FieldSpent={patrat:true};assert.equal(zone2FieldContact(s,'night'),null);
});

test('Zone 2 reused terrain preserves individual positions and later terrain changes',async()=>{
 const {lumioseZone2Map}=await import('../lib/cloud-adventure/adventure-world.mjs');
 const state={district:'lumiose-zone2',x:3,y:10,steps:3,zaZone2FieldPositions:{patrat:{x:11,y:8},patrat2:{x:10,y:7},magikarp:{x:8,y:9,ttl:2},staryu:{x:8,y:8}}};
 assert.deepEqual(zone2FieldMonsters(state,'night',lumioseZone2Map(state)),zone2FieldMonsters(state,'night'));
 const next={...state,zaZone2RockCleared:true,zaZone2FieldSpent:{patrat:true},zaZone2FieldPositions:{...state.zaZone2FieldPositions,magikarp:{x:7,y:10}}};
 assert.deepEqual(zone2FieldMonsters(next,'night',lumioseZone2Map(next)),zone2FieldMonsters(next,'night'));
 assert.ok(!zone2FieldMonsters(next,'night').some(p=>p.id==='patrat'));
});
