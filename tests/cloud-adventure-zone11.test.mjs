import test from 'node:test';
import assert from 'node:assert/strict';
import {zone11Map,zone11Unlocked,zone11Encounter,ZONE11_WEST_FORK,ZONE11_SOUTHWEST_STAIRS} from '../lib/cloud-adventure/adventure-zone11.mjs';
import {stepField,storeAdventurePosition,restoreAdventurePosition,fieldPath,fieldMap,fieldDialogue} from '../lib/cloud-adventure/adventure-world.mjs';

test('Zone 11 northwest ledge preserves the old entrance and its saved position',()=>{
 const road={area:3,district:'lumiose-jaune-sector10',interior:null,x:21,y:9,facing:'right',zaRoyaleRank:'E',teamIds:['kept']};
 assert.equal(stepField({...road,zaRoyaleRank:'F'},'right').blocked,true);
 const entered=stepField(road,'right');assert.deepEqual([entered.district,entered.x,entered.y],['lumiose-zone11-nw-ledge',1,5]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...road,...entered},129),129);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[entered.district,1,5,['kept']]);
 assert.deepEqual([stepField(saved,'left').district,stepField(saved,'left').x,stepField(saved,'left').y],[road.district,21,9]);
 assert.ok(fieldPath(fieldMap(saved),saved,{x:8,y:6}).length);
 assert.equal(fieldDialogue({...saved,x:8,y:6,facing:'right'}).action,'zone11NorthwestDrop');
 const old=stepField({...road,y:8},'right');assert.deepEqual([old.district,old.x,old.y],['lumiose-zone11',1,4]);
 const lower={...saved,district:'lumiose-zone11',x:3,y:3};assert.equal(fieldMap(lower)[3][3],'.');assert.equal(fieldPath(fieldMap(lower),lower,{x:15,y:12}).length,0);
});

test('Zone 11 east gate returns west from Vert Sector 6 without losing legacy access',()=>{
 const zone={area:3,district:'lumiose-zone11',interior:null,x:21,y:12,zaRoyaleRank:'E',regionId:6,districtReturnRegion:1,teamIds:['kept']};
 const exit=stepField(zone,'right');assert.deepEqual([exit.district,exit.x,exit.y],['lumiose-vert-sector6',1,12]);
 const sector={...zone,...exit},saved=restoreAdventurePosition(storeAdventurePosition(sector,19),19);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-vert-sector6',1,12,['kept']]);
 const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-zone11',21,12]);
 assert.equal(stepField({...saved,zaRoyaleRank:'F'},'left').blocked,true);
 assert.equal(stepField({...saved,x:21,y:12},'right').district,'lumiose-zone11');
});

test('zone eleven has gated and separately saved canal banks',()=>{
 const city={area:3,district:'lumiose-vert2',interior:null,x:17,y:1,facing:'up'};
 assert.equal(zone11Unlocked(city),false);assert.equal(stepField({...city,x:17,y:15},'down').blocked,true);assert.equal(stepField({...city,district:'lumiose-zone6',x:11,y:15},'down').blocked,true);
 const open={...city,zaRoyaleRank:'E'},north=stepField({...open,district:'lumiose-zone6',x:11,y:15},'down');assert.deepEqual([north.district,north.x,north.y],['lumiose-zone11',5,1]);
 const n={...open,...north},map=zone11Map(n);assert.ok(fieldPath(map,n,{x:17,y:3}).length);assert.equal(fieldPath(map,n,{x:15,y:12}).length,0);assert.equal(stepField({...n,x:11,y:6},'down').blocked,true);
 assert.equal(stepField(n,'up').district,'lumiose-zone6');
 const south=stepField({...open,x:17,y:15},'down');assert.deepEqual([south.district,south.x,south.y],['lumiose-zone11',11,15]);
 assert.ok(fieldPath(zone11Map({...open,...south}),south,{x:15,y:12}).length);
 for(const p of [{...n,x:17,y:3},{...open,...south,x:15,y:12}]){const stored=storeAdventurePosition(p,7),restored=restoreAdventurePosition(stored,7);assert.deepEqual([restored.district,restored.x,restored.y],['lumiose-zone11',p.x,p.y]);assert.equal(restoreAdventurePosition(stored,8).district,null);}
 assert.equal(zone11Map({...n,zaMission40Stage:2})[3][11],'0');assert.equal(zone11Encounter({...n,y:3},()=>0).speciesId,79);assert.equal(zone11Encounter({...n,y:12},()=>0).speciesId,676);
});

test('draft bank approaches preserve separated canal, encounters and saved positions',()=>{
 const base={area:3,district:'lumiose-zone11',interior:null,zaRoyaleRank:'E',teamIds:['kept']},map=zone11Map(base);
 for(let x=1;x<=21;x++){assert.equal(map[1][x],',');assert.equal(map[15][x],',');}
 for(let y=7;y<=9;y++)for(let x=0;x<=22;x++)assert.equal(map[y][x],'~');
 assert.ok(fieldPath(map,{x:1,y:4},{x:21,y:4}).length);assert.ok(fieldPath(map,{x:21,y:12},{x:5,y:15}).length);
 assert.equal(fieldPath(map,{x:1,y:4},{x:21,y:12}).length,0);
 for(const [x,y] of [[3,4],[14,3],[8,11]])assert.equal(map[y][x],'g');
 for(const [x,y] of [[1,1],[21,1],[5,15],[20,12]]){const saved=restoreAdventurePosition(storeAdventurePosition({...base,x,y},97),97);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[base.district,x,y,['kept']]);}
});


test('Zone 11 southern riverside path connects both gate approaches and preserves encounters',()=>{
 const base={area:3,district:'lumiose-zone11',interior:null,zaRoyaleRank:'E',teamIds:['kept']},map=zone11Map(base);
 for(let x=1;x<=20;x++)assert.equal(map[10][x],',');
 for(const x of [2,19])for(let y=11;y<=14;y++)assert.equal(map[y][x],',');
 assert.equal(map[11][8],'g');assert.equal(map[12][15],'f');assert.equal(map[9][11],'~');
 assert.ok(fieldPath(map,{x:21,y:12},{x:5,y:15}).length);assert.equal(fieldPath(map,{x:11,y:10},{x:11,y:6}).length,0);
 for(const [x,y] of [[2,10],[2,13],[19,11],[11,10]]){const saved=restoreAdventurePosition(storeAdventurePosition({...base,x,y},123),123);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[base.district,x,y,['kept']]);}
});

test('Zone 11 southwest stair artwork stays on walkable non-encounter terrain',()=>{
 const base={area:3,district:'lumiose-zone11',interior:null,zaRoyaleRank:'E',teamIds:['kept']},map=zone11Map(base);
 assert.deepEqual([...new Set(ZONE11_SOUTHWEST_STAIRS.map(([,y])=>y))],[11,13]);
 for(const [x,y] of ZONE11_SOUTHWEST_STAIRS){assert.ok(['.',','].includes(map[y][x]));const saved=restoreAdventurePosition(storeAdventurePosition({...base,x,y},130),130);assert.deepEqual([saved.x,saved.y,saved.teamIds],[x,y,['kept']]);}
 assert.ok(fieldPath(map,{x:5,y:15},{x:2,y:10}).length);
});


test('Zone 11 western water fork retains gates and relocates matching older saves',()=>{
 const base={area:3,district:'lumiose-zone11',interior:null,zaRoyaleRank:'E',teamIds:['kept']},map=zone11Map(base);
 for(const [x,y] of ZONE11_WEST_FORK){assert.equal(map[y][x],'~');if(x===0)continue;const old=storeAdventurePosition({...base,x,y},126);delete old.districtPosition.zone11Layout;const restored=restoreAdventurePosition(structuredClone(old),126);assert.equal(restored.district,base.district);assert.notEqual(map[restored.y][restored.x],'~');assert.deepEqual(restored.teamIds,['kept']);assert.equal(restoreAdventurePosition(structuredClone(old),127).district,null);}
 assert.equal(map[4][0],'X');assert.ok(fieldPath(map,{x:1,y:4},{x:21,y:4}).length);assert.equal(fieldPath(map,{x:1,y:4},{x:21,y:12}).length,0);assert.equal(map[6][3],'g');
 assert.equal(storeAdventurePosition({...base,x:3,y:4},128).districtPosition.zone11Layout,1);
});
