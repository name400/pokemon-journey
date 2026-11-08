import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {coulantRouteMap} from '../lib/cloud-adventure/adventure-coulant-route.mjs';

test('three western stair approaches link the upper waterway and Vert Sector 3',()=>{
 const sector={area:3,district:'lumiose-vert-sector3',interior:null,x:21,regionId:6,districtReturnRegion:1,teamIds:['kept']};
 for(const [sectorY,canalY] of [[4,2],[7,4],[10,6]]){
  const waterway=stepField({...sector,y:sectorY},'right');assert.deepEqual([waterway.district,waterway.x,waterway.y],['lumiose-coulant-route',1,canalY]);
  const saved=restoreAdventurePosition(storeAdventurePosition({...sector,...waterway},114),114);
  assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[waterway.district,1,canalY,['kept']]);
  const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-vert-sector3',21,sectorY]);
 }
 const lower={area:3,district:'lumiose-coulant-route',interior:null,x:1,y:6,zaCoulantLower:true};
 assert.equal(stepField(lower,'left').district,'lumiose-vert-street-route');
});

test('both lower banks connect to Vert Street and retain the upper connection',()=>{
 const street={area:3,district:'lumiose-vert-street-route',interior:null,x:21,zaRoyaleRank:'E',teamIds:['kept']};
 for(const y of [6,10]){
  const bank=stepField({...street,y},'right');assert.deepEqual([bank.district,bank.x,bank.y,bank.zaCoulantLower],['lumiose-coulant-route',1,y,true]);
  assert.ok(fieldPath(coulantRouteMap({...street,...bank}),bank,{x:19,y}).length);
  const saved=restoreAdventurePosition(storeAdventurePosition({...street,...bank},113),113);
  assert.deepEqual([saved.district,saved.x,saved.y,saved.zaCoulantLower,saved.teamIds],[bank.district,1,y,true,['kept']]);
  const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y,back.zaCoulantLower],['lumiose-vert-street-route',21,y,false]);
 }
 const original=stepField({...street,y:8},'right');assert.deepEqual([original.district,original.x,original.y],['lumiose-coulant-route',1,12]);
});

test('both lower canal banks run under the bridges and remain separated by water',()=>{
 const s={area:3,district:'lumiose-coulant-route',interior:null,zaCoulantLower:true,teamIds:['kept']},lower=coulantRouteMap(s),upper=coulantRouteMap();
 for(const x of [3,19]){assert.equal(lower[11][x],'l');assert.equal(upper[11][x],'l');}
 assert.ok(fieldPath(lower,{x:3,y:10},{x:19,y:10}).length);
 assert.equal(fieldPath(lower,{x:3,y:10},{x:3,y:6}).length,0);
 assert.equal(stepField({...s,x:10,y:10},'up').blocked,true);
 for(const [x,y] of [[3,10],[6,10],[19,10]]){
  const loaded=restoreAdventurePosition(storeAdventurePosition({...s,x,y},111),111);
  assert.deepEqual([loaded.district,loaded.x,loaded.y,loaded.zaCoulantLower,loaded.teamIds],[s.district,x,y,true,['kept']]);
 }
 const old=restoreAdventurePosition(storeAdventurePosition({...s,x:3,y:11,zaCoulantLower:false},112),112);
 assert.deepEqual([old.x,old.y,old.zaCoulantLower],[3,11,false]);
});
test('Coulant route links Vert Street and the south bank of Zone 11',()=>{
 const start={area:3,district:'lumiose-vert-street-route',interior:null,x:21,y:8,facing:'right',zaRoyaleRank:'F'};
 const route=stepField(start,'right');assert.equal(route.district,'lumiose-coulant-route');const s={...start,...route};const map=coulantRouteMap();
 assert.equal(map[8][10],'~');assert.equal(map[8][6],':');assert.equal(map[8][16],':');assert.ok(fieldPath(map,s,{x:10,y:1}).length);
 assert.equal(stepField(s,'left').district,'lumiose-vert-street-route');const gate={...s,x:10,y:1,facing:'up'};assert.equal(stepField(gate,'up').blocked,true);
 const zone=stepField({...gate,zaRoyaleRank:'E'},'up');assert.equal(zone.district,'lumiose-zone11');assert.equal(stepField({...gate,...zone},'down').district,'lumiose-coulant-route');
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:6,y:8,teamIds:['kept']},4),4);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-coulant-route',6,8]);assert.deepEqual(saved.teamIds,['kept']);
});

test('Zone 11 approach steps retain bank paths and earlier positions',()=>{
 const map=coulantRouteMap(),s={area:3,district:'lumiose-coulant-route',interior:null,x:10,y:3,zaRoyaleRank:'E',teamIds:['kept']};
 for(const y of [2,3,4])assert.equal(map[y][10],':');assert.ok(fieldPath(map,{x:10,y:1},{x:6,y:8}).length);assert.ok(fieldPath(map,{x:10,y:1},{x:16,y:8}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(s,62),62);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[s.district,10,3,['kept']]);
 assert.equal(stepField({...s,x:10,y:1},'up').district,'lumiose-zone11');
});

test('Coulant lower bank crosses beneath a bridge and restores its own layer',()=>{
 const s={area:3,district:'lumiose-coulant-route',interior:null,x:3,y:6,zaCoulantLower:true,teamIds:['kept']};
 const lower=coulantRouteMap(s),upper=coulantRouteMap();assert.equal(lower[6][6],',');assert.equal(upper[6][6],':');assert.ok(fieldPath(lower,s,{x:19,y:6}).length);
 assert.equal(stepField({...s,x:5,y:6},'right').x,6);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:6,y:6},24),24);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaCoulantLower,saved.teamIds],[s.district,6,6,true,['kept']]);
 const old={...s,x:3,y:5,zaCoulantLower:false},restored=restoreAdventurePosition(storeAdventurePosition(old,25),25);assert.deepEqual([restored.x,restored.y],[3,5]);
});


test('Zone 17 bridge and lower-bank stairs use separate elevations and retain saves',()=>{
 const base={area:3,district:'lumiose-zone17',interior:null,x:16,y:1,facing:'up',zaRoyaleRank:'C',teamIds:['kept']};
 const steps=stepField(base,'up');assert.deepEqual([steps.district,steps.x,steps.y,steps.zaCoulantLower],['lumiose-coulant-route',16,5,true]);
 const lower={...base,...steps};const saved=restoreAdventurePosition(storeAdventurePosition(lower,92),92);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.zaCoulantLower,saved.teamIds],[lower.district,16,5,true,['kept']]);
 const back=stepField(saved,'up');assert.deepEqual([back.district,back.x,back.y,back.zaCoulantLower],['lumiose-zone17',16,1,false]);
 assert.equal(stepField({...saved,zaRoyaleRank:'D'},'up').blocked,true);
 const bridge=stepField({...base,x:6},'up');assert.deepEqual([bridge.district,bridge.x,bridge.y,bridge.zaCoulantLower],['lumiose-coulant-route',6,15,false]);
 assert.equal(stepField({...base,...bridge},'down').district,'lumiose-zone17');
 // Previously saved upper-bank access remains usable.
 assert.equal(stepField({...base,district:'lumiose-coulant-route',x:16,y:15,zaCoulantLower:false},'down').district,'lumiose-zone17');
});
