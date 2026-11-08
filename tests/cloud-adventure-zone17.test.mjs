import test from 'node:test';
import assert from 'node:assert/strict';
import {stepField,fieldPath,fieldMap,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {zone17Map,zone17Visible,zone17Encounter} from '../lib/cloud-adventure/adventure-zone17.mjs';
test('zone seventeen gate, field and save migration',()=>{
 const base={area:3,district:'lumiose-vert2',interior:null,x:1,y:5,facing:'left',zaRoyaleRank:'D'};
 assert.equal(stepField(base,'left').blocked,true);
 const entered=stepField({...base,zaRoyaleRank:'C'},'left');assert.equal(entered.district,'lumiose-zone17');
 const s={...base,...entered,zaRoyaleRank:'C'};assert.ok(fieldPath(zone17Map(s),s,{x:11,y:8}).length);
 assert.equal(zone17Visible(s,'a').species,650);assert.equal(zone17Encounter(s,()=>0).speciesId,650);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:8},2),2);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone17',11,8]);assert.equal(stepField(s,'down').district,'lumiose-vert2');
});

test('Zone 17 draft paths and stairs preserve existing travel and saved positions',()=>{
 const s={area:3,district:'lumiose-zone17',interior:null,x:11,y:10,zaRoyaleRank:'C',teamIds:['kept']};
 const map=zone17Map(s);assert.equal(map[10][11],':');assert.equal(map[3][4],'^');assert.equal(map[3][18],'^');
 assert.ok(fieldPath(map,{x:11,y:15},{x:11,y:1}).length);
 assert.ok(fieldPath(map,{x:6,y:1},{x:16,y:1}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(s,3),3);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone17',11,10,['kept']]);
});

test('Vert Sector 7 leads into Zone 17 with rank gate and preserved saves',()=>{
 const road={area:3,district:'lumiose-vert-sector7',interior:null,x:11,y:1,zaRoyaleRank:'D',teamIds:['kept']};
 assert.equal(stepField(road,'up').blocked,true);
 const zone=stepField({...road,zaRoyaleRank:'C'},'up');assert.deepEqual([zone.district,zone.x,zone.y],['lumiose-zone17',21,8]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...road,...zone,zaRoyaleRank:'C'},44),44);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone17',21,8,['kept']]);
 const back=stepField(saved,'right');assert.deepEqual([back.district,back.x,back.y],['lumiose-vert-sector7',11,1]);
});

test('Vert 6 and 7 bridge stays walkable and keeps saved positions',()=>{
 const six={area:3,district:'lumiose-vert-sector6',interior:null,x:21,y:3,teamIds:['kept']};
 assert.equal(fieldMap(six)[3][21],':');const seven=stepField(six,'right');assert.deepEqual([seven.district,seven.x,seven.y],['lumiose-vert-sector7',1,8]);
 const state={...six,...seven};assert.equal(fieldMap(state)[8][1],':');
 const saved=restoreAdventurePosition(storeAdventurePosition(state,45),45);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-vert-sector7',1,8,['kept']]);
 assert.equal(stepField(saved,'left').district,'lumiose-vert-sector6');
});

test('southern park furniture retains gates and safely restores earlier ground saves',()=>{
 const base={area:3,district:'lumiose-zone17',interior:null,x:4,y:14,regionId:6,districtReturnRegion:1,teamIds:['kept'],zaRoyaleRank:'C'},map=zone17Map(base);
 for(const [x,y] of [[4,14],[6,14],[16,14],[18,14],[19,13]])assert.equal(map[y][x],'^');
 for(const target of [{x:1,y:8},{x:21,y:8},{x:11,y:1},{x:11,y:15}])assert.ok(fieldPath(map,{x:11,y:9},target).length);
 const saved=storeAdventurePosition(base,7);delete saved.districtPosition.zone17Layout;
 const restored=restoreAdventurePosition(structuredClone(saved),7);assert.equal(restored.district,base.district);assert.notEqual(map[restored.y][restored.x],'^');assert.deepEqual(restored.teamIds,['kept']);assert.equal(restoreAdventurePosition(structuredClone(saved),8).district,null);
 const upper={...base,x:6,y:10,zaZone17Upper:true};const roof=restoreAdventurePosition(storeAdventurePosition(upper,9),9);assert.deepEqual([roof.x,roof.y,roof.zaZone17Upper],[6,10,true]);
});

test('Zone 17 split roofs keep the crossing and migrate earlier roof saves',()=>{
 const base={area:3,district:'lumiose-zone17',interior:null,x:11,y:5,zaZone17Upper:true,regionId:6,districtReturnRegion:1,teamIds:['kept']},map=zone17Map(base);
 assert.equal(map[5][11],'#');assert.ok(fieldPath(map,{x:6,y:9},{x:14,y:7}).length);
 const saved=storeAdventurePosition(base,7);delete saved.districtPosition.splitRoofLayout;const restored=restoreAdventurePosition(structuredClone(saved),7);
 assert.equal(restored.district,base.district);assert.equal(restored.zaZone17Upper,true);assert.notEqual(map[restored.y][restored.x],'#');assert.deepEqual(restored.teamIds,['kept']);assert.equal(restoreAdventurePosition(structuredClone(saved),8).district,null);
});

test('Zone 17 southwest lawn entrance connects Vert Street and keeps earlier entrances',()=>{
 const road={area:3,district:'lumiose-vert-street-route',interior:null,x:20,y:1,facing:'up',zaRoyaleRank:'D',teamIds:['kept']};
 assert.equal(stepField(road,'up').blocked,true);const entered=stepField({...road,zaRoyaleRank:'C'},'up');assert.deepEqual([entered.district,entered.x,entered.y],['lumiose-zone17',5,15]);
 const state={...road,...entered,zaRoyaleRank:'C'};assert.ok(fieldPath(zone17Map(state),state,{x:11,y:9}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(state,72),72);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone17',5,15,['kept']]);
 const back=stepField(saved,'down');assert.deepEqual([back.district,back.x,back.y],['lumiose-vert-street-route',20,1]);
 assert.equal(stepField({...state,x:1,y:8},'left').district,'lumiose-vert-street-route');
});

test('north promenade and south approach use walkable paving without replacing grass',()=>{
 const s={area:3,district:'lumiose-zone17',interior:null,zaRoyaleRank:'C'},map=zone17Map(s);
 for(const y of [1,2,3,4,13,14,15])for(const x of [10,11,12])assert.equal(map[y][x],',',`${x},${y}`);
 for(const [x,y] of [[3,5],[4,8],[10,9],[12,9],[18,12]])assert.equal(map[y][x],'g',`${x},${y}`);
 for(const gate of [{x:6,y:1},{x:11,y:1},{x:16,y:1}])assert.ok(fieldPath(map,{x:11,y:14},gate).length);
 const state={...s,regionId:6,districtReturnRegion:1,teamIds:['kept'],x:10,y:14};const restored=restoreAdventurePosition(storeAdventurePosition(state,99),99);assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds],[state.district,10,14,['kept']]);
});
