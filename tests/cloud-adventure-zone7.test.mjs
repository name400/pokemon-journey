import test from 'node:test';
import assert from 'node:assert/strict';
import {zone7Map,zone7Unlocked,zone7Encounter} from '../lib/cloud-adventure/adventure-zone7.mjs';
import {stepField,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('zone seven gate, plaza and stored location',()=>{
 const base={area:3,district:'lumiose-centrico-route',interior:null,x:5,y:1,facing:'up',zaRoyaleRank:'V'};
 assert.equal(stepField(base,'up').blocked,true);const entered=stepField({...base,zaRoyaleRank:'F'},'up');assert.equal(entered.district,'lumiose-zone7');
 const s={...base,...entered,zaRoyaleRank:'F'},map=zone7Map();assert.ok(fieldPath(map,s,{x:10,y:10}).length);assert.equal(map[8][11],'a');assert.equal(zone7Map({zaZone7AlphaSpent:true})[8][11],'#');
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:10,y:10},42),42);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone7',10,10]);
 assert.equal(stepField(s,'down').district,'lumiose-centrico-route');assert.equal(zone7Encounter('day',()=>0).speciesId,449);assert.equal(zone7Encounter('night',()=>0).speciesId,353);
});

test('Magenta Sector 3 reaches Zone 7 without bypassing its rank gate',()=>{
 const city={area:3,district:'lumiose-magenta-sector3',interior:null,x:4,y:1,zaRoyaleRank:'V',teamIds:['kept']};
 assert.equal(stepField(city,'up').blocked,true);
 const zone=stepField({...city,zaRoyaleRank:'F'},'up');assert.deepEqual([zone.district,zone.x,zone.y],['lumiose-zone7',17,15]);
 const state={...city,...zone,zaRoyaleRank:'F'};assert.ok(fieldPath(zone7Map(state),state,{x:10,y:10}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(state,71),71);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone7',17,15,['kept']]);
 const back=stepField(saved,'down');assert.deepEqual([back.district,back.x,back.y],['lumiose-magenta-sector3',4,1]);
 for(const [district,x,y,safeY] of [['lumiose-zone7',17,0,1],['lumiose-magenta-sector3',12,16,15]]){
  const old=restoreAdventurePosition(storeAdventurePosition({...city,district,x,y},72),72);assert.deepEqual([old.district,old.x,old.y,old.teamIds],[district,x,safeY,['kept']]);
 }
});
