import test from 'node:test';
import assert from 'node:assert/strict';
import {zone2FieldMonsters,zone2FieldTarget} from '../lib/cloud-adventure/adventure-world.mjs';
test('shared zone two field encounters respect habitat, time, distance and spent state',()=>{
 const s={district:'lumiose-zone2',x:12,y:8};
 assert.deepEqual(zone2FieldMonsters(s,'day').map(m=>m.id),['patrat','binacle','magikarp']);
 assert.equal(zone2FieldTarget(s,'day','patrat').distance,1);
 assert.equal(zone2FieldTarget(s,'day','staryu'),null);
 assert.ok(zone2FieldTarget({ ...s,x:7,y:8 },'night','staryu'));
 assert.equal(zone2FieldTarget({...s,zaZone2FieldSpent:{patrat:true}},'night','patrat'),null);
 assert.deepEqual(zone2FieldMonsters({...s,interior:'hotel'},'night'),[]);
 assert.equal(zone2FieldTarget(s,'day','__proto__'),null);
});

test('bridge reaction moves Magikarp to the bridge and restores the water position',async()=>{
 const {stepZone2Field}=await import('../lib/cloud-adventure/adventure-world.mjs');
 const s={district:'lumiose-zone2',x:14,y:11};
 assert.equal(stepZone2Field(s,'day'),true);
 let fish=zone2FieldMonsters(s,'day').find(m=>m.id==='magikarp');
 assert.deepEqual([fish.x,fish.y,fish.water],[14,10,false]);
 assert.ok(zone2FieldTarget(s,'day','magikarp'));
 assert.deepEqual(JSON.parse(JSON.stringify(s.zaZone2FieldPositions)).magikarp,{x:14,y:10,ttl:3});
 s.x=13;s.y=9;for(let i=0;i<3;i++)stepZone2Field(s,'day');
 fish=zone2FieldMonsters(s,'day').find(m=>m.id==='magikarp');assert.deepEqual([fish.x,fish.y,fish.water],[15,10,true]);
 assert.equal(stepZone2Field({...s,zaZone2FieldSpent:{magikarp:true},x:14,y:11},'day'),false);
});
