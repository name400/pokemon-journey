import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {coulantRouteMap} from '../lib/cloud-adventure/adventure-coulant-route.mjs';
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
