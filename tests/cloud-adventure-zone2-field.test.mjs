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
