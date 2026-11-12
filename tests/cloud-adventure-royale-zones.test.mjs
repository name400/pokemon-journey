import test from 'node:test';
import assert from 'node:assert/strict';
import {activeRoyaleZones,royaleNightIndex,ROYALE_ZONES} from '../lib/cloud-adventure/adventure-royale-zones.mjs';

test('nightly zones remain stable over midnight and change for the next night',()=>{
 const s={zaRoyaleRank:'V'},hour=50000,night=20*hour;
 assert.equal(ROYALE_ZONES.length,11);
 assert.deepEqual(activeRoyaleZones(s,night),activeRoyaleZones(s,24*hour+3*hour));
 assert.notEqual(royaleNightIndex(s,night),royaleNightIndex(s,24*hour+4*hour));
 assert.notEqual(activeRoyaleZones(s,night)[0].id,activeRoyaleZones(s,44*hour)[0].id);
 assert.deepEqual(activeRoyaleZones({...s,zaClockOffsetHours:24},night),activeRoyaleZones(s,night+24*hour));
});
test('infinite royale has three distinct zones and earlier ranks have one',()=>{
 assert.equal(activeRoyaleZones({zaRoyaleRank:'A'},0).length,1);
 const zones=activeRoyaleZones({zaRoyaleRank:'A',zaMission39Started:true},0);
 assert.equal(zones.length,3);assert.equal(new Set(zones.map(z=>z.id)).size,3);
 assert.deepEqual(activeRoyaleZones({zaRoyaleRank:'A',zaMission39Started:true},0),zones);
});

test('all documented field entries preserve walkable old positions and return locations',async()=>{
 const {ROYALE_FIELD_ENTRIES,royaleFieldEntryAt,royaleReturnDestination}=await import('../lib/cloud-adventure/adventure-royale-zones.mjs');
 const {fieldMap,fieldDialogue,storeAdventurePosition,restoreAdventurePosition,walkable}=await import('../lib/cloud-adventure/adventure-world.mjs');
 assert.equal(ROYALE_FIELD_ENTRIES.length,10);
 for(const e of ROYALE_FIELD_ENTRIES){
  const s={area:3,district:e.district,interior:null,x:e.returnX,y:e.returnY,facing:'up',zaRoyaleRank:'V',zaMission10Stage:4,teamIds:['kept']},map=fieldMap(s);
  assert.equal(map[e.y][e.x],'T',e.zone);assert.ok(walkable(map[e.returnY][e.returnX]),e.zone);assert.equal(royaleFieldEntryAt(s,{tile:'T',x:e.x,y:e.y})?.zone,e.zone);assert.ok(fieldDialogue(s),e.zone);
  const restored=restoreAdventurePosition(storeAdventurePosition(s,10),10);assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds],[s.district,s.x,s.y,s.teamIds]);assert.deepEqual(royaleReturnDestination({zaRoyaleReturn:e.zone}),{district:e.district,x:e.returnX,y:e.returnY});
 }
 assert.equal(royaleFieldEntryAt({district:'lumiose-vert-sector1',zaRoyaleRank:'V',interior:'hotel'},{tile:'T',x:2,y:2}),null);
});
