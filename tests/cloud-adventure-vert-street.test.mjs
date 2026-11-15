import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {vertStreetRouteMap} from '../lib/cloud-adventure/adventure-vert-street-route.mjs';
import {southBoulevardMap} from '../lib/cloud-adventure/adventure-south-boulevard.mjs';
test('Vert Street meets Centrico without bypassing the Mission 3 detour',()=>{
 const street={area:3,district:'lumiose-vert-street-route',interior:null,x:8,y:1,teamIds:['kept'],money:731};
 assert.ok(fieldPath(fieldMap(street),{x:10,y:15},street).length);
 assert.equal(stepField({...street,zaMission03Stage:2,zaMission03DetourRequired:true},'up').blocked,true);
 const plaza=stepField(street,'up');assert.deepEqual([plaza.district,plaza.x,plaza.y],['lumiose-centrico-route',13,15]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...street,...plaza},163),163);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.money],['lumiose-centrico-route',13,15,['kept'],731]);
 assert.ok(fieldPath(fieldMap(saved),saved,{x:19,y:8}).length);
 assert.equal(stepField({...saved,zaMission03Stage:2,zaMission03DetourRequired:true},'down').blocked,true);
 const back=stepField(saved,'down');assert.deepEqual([back.district,back.x,back.y],['lumiose-vert-street-route',8,1]);
 assert.equal(stepField({...street,x:3},'up').district,'lumiose-vert-sector1');
});
test('Vert Street meets Vert Plaza while retaining the Zone 2 gate and Mission 3 detour',()=>{
 const street={area:3,district:'lumiose-vert-street-route',interior:null,x:1,y:10,teamIds:['kept'],money:731};
 assert.ok(fieldPath(fieldMap(street),{x:10,y:15},street).length);
 assert.equal(stepField({...street,zaMission03Stage:2,zaMission03DetourRequired:true},'left').blocked,true);
 const plaza=stepField(street,'left');assert.deepEqual([plaza.district,plaza.x,plaza.y],['lumiose-vert-plaza',1,5]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...street,...plaza},159),159);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.money],['lumiose-vert-plaza',1,5,['kept'],731]);
 assert.ok(fieldPath(fieldMap(saved),saved,{x:11,y:8}).length);
 assert.equal(stepField({...saved,zaMission03Stage:2,zaMission03DetourRequired:true},'left').blocked,true);
 const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-vert-street-route',1,10]);
 assert.equal(stepField({...saved,x:21,y:8},'right').district,'lumiose-zone2');
});
test('Vert Street and Sector 7 connect while preserving the mission 3 detour',()=>{
 const street={area:3,district:'lumiose-vert-street-route',interior:null,x:21,y:14,teamIds:['kept']};
 assert.ok(fieldPath(vertStreetRouteMap(),{x:10,y:15},street).length);
 assert.equal(stepField({...street,zaMission03Stage:2,zaMission03DetourRequired:true},'right').blocked,true);
 const sector=stepField(street,'right');assert.deepEqual([sector.district,sector.x,sector.y],['lumiose-vert-sector7',1,12]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...street,...sector},49),49);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-vert-sector7',1,12,['kept']]);
 assert.ok(fieldPath(fieldMap(saved),saved,{x:11,y:15}).length);
 assert.equal(stepField({...saved,zaMission03Stage:2,zaMission03DetourRequired:true},'left').blocked,true);
 const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-vert-street-route',21,14]);
});
test('hotel to Vert Street and Zone 17 keeps gate and save',()=>{
 const hotel={area:3,district:'lumiose',interior:null,x:19,y:1,facing:'up',zaRoyaleRank:'D'};
 const street=stepField(hotel,'up');assert.equal(street.district,'lumiose-vert-street-route');assert.ok(fieldPath(vertStreetRouteMap(),street,{x:18,y:1}).length);
 const restored=restoreAdventurePosition(storeAdventurePosition({...hotel,...street},4),4);assert.equal(restored.district,'lumiose-vert-street-route');assert.equal(stepField({...hotel,...street},'left').district,'lumiose');
 const gate={...hotel,...street,x:18,y:1,facing:'up'};assert.equal(stepField(gate,'up').blocked,true);
 const zone=stepField({...gate,zaRoyaleRank:'C'},'up');assert.equal(zone.district,'lumiose-zone17');assert.equal(stepField({...gate,...zone},'left').district,'lumiose-vert-street-route');
});

test('Vert Street and South Boulevard intersection works both ways after restore',()=>{
 const road={area:3,district:'lumiose-vert-street-route',interior:null,x:10,y:15,teamIds:['kept']};
 assert.ok(fieldPath(vertStreetRouteMap(),{x:1,y:8},{x:10,y:15}).length);
 const south=stepField(road,'down');assert.deepEqual([south.district,south.x,south.y],['lumiose-south-boulevard',16,1]);
 assert.ok(fieldPath(southBoulevardMap(),south,{x:11,y:8}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...road,...south},47),47);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-south-boulevard',16,1,['kept']]);
 const back=stepField(saved,'up');assert.deepEqual([back.district,back.x,back.y],['lumiose-vert-street-route',10,15]);
});

test('Vert Pokémon Center uses the existing healing action near the road junction',()=>{
 const s={area:3,district:'lumiose-vert-street-route',interior:null,x:10,y:13,facing:'up',teamIds:['kept']};
 assert.ok(fieldPath(vertStreetRouteMap(),{x:10,y:15},{x:10,y:13}).length);
 assert.ok(fieldDialogue(s).actions.some(a=>a.action==='heal'));
 const saved=restoreAdventurePosition(storeAdventurePosition(s,48),48);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-vert-street-route',10,13,['kept']]);
 assert.ok(fieldDialogue(saved).actions.some(a=>a.action==='heal'));
});

test('station footprint faces the center without blocking the existing intersection',()=>{
 const map=vertStreetRouteMap(),road={area:3,district:'lumiose-vert-street-route',interior:null,x:8,y:6,facing:'up',teamIds:['kept']};
 assert.equal(map[5][8],'u');assert.equal(map[13][10],'H');assert.equal(stepField(road,'up').blocked,true);assert.ok(fieldDialogue(road).actions.some(a=>a.action==='stationLeave'));
 assert.ok(fieldPath(map,{x:1,y:8},{x:10,y:15}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(road,73),73);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-vert-street-route',8,6,['kept']]);
});
