import test from 'node:test';
import assert from 'node:assert/strict';
import {zone2KakunaPosition,zone2KakunaTarget} from '../lib/cloud-adventure/adventure-world.mjs';
test('tree Kakuna is only targetable nearby while present in zone two',()=>{
 const s={district:'lumiose-zone2',x:2,y:4};assert.deepEqual(zone2KakunaPosition(s),{x:0,y:4});assert.equal(zone2KakunaTarget(s).distance,2);
 assert.equal(zone2KakunaTarget({...s,x:5}),null);assert.equal(zone2KakunaPosition({...s,zaZone2KakunaSpent:true}),null);assert.equal(zone2KakunaTarget({...s,interior:'hotel'}),null);assert.equal(zone2KakunaPosition({...s,district:'lumiose'}),null);
});
