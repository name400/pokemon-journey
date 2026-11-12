import test from 'node:test';
import assert from 'node:assert/strict';
import {activeRoyaleZones,royaleNightIndex,ROYALE_ZONES} from '../lib/cloud-adventure/adventure-royale-zones.mjs';

test('nightly zones remain stable over midnight and change for the next night',()=>{
 const s={zaRoyaleRank:'V'},hour=50000,night=18*hour;
 assert.equal(ROYALE_ZONES.length,11);
 assert.deepEqual(activeRoyaleZones(s,night),activeRoyaleZones(s,24*hour+5*hour));
 assert.notEqual(royaleNightIndex(s,night),royaleNightIndex(s,24*hour+6*hour));
 assert.notEqual(activeRoyaleZones(s,night)[0].id,activeRoyaleZones(s,42*hour)[0].id);
 assert.deepEqual(activeRoyaleZones({...s,zaClockOffsetHours:24},night),activeRoyaleZones(s,night+24*hour));
});
test('infinite royale has three distinct zones and earlier ranks have one',()=>{
 assert.equal(activeRoyaleZones({zaRoyaleRank:'A'},0).length,1);
 const zones=activeRoyaleZones({zaRoyaleRank:'A',zaMission39Started:true},0);
 assert.equal(zones.length,3);assert.equal(new Set(zones.map(z=>z.id)).size,3);
 assert.deepEqual(activeRoyaleZones({zaRoyaleRank:'A',zaMission39Started:true},0),zones);
});
