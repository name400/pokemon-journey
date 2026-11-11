import test from 'node:test';
import assert from 'node:assert/strict';
import {zone12Map,zone12Encounter,zone12Visible,zone12Item} from '../lib/cloud-adventure/adventure-zone12.mjs';
import {stepField,fieldPath,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
function reachable(s,target){const q=[s],seen=new Set([`${s.x},${s.y}`]);for(let i=0;i<q.length;i++){const p=q[i];if(p.x===target.x&&p.y===target.y)return true;for(const dir of ['up','down','left','right']){const n=stepField(p,dir),key=`${n.x},${n.y}`;if(!n.blocked&&!n.transitioned&&!seen.has(key)){seen.add(key);q.push({...p,...n});}}}return false;}
test('draft Bleu 5 waterside entrance preserves ground gates and lower-layer saves',()=>{
 const city={area:3,district:'lumiose-bleu-sector5',interior:null,x:21,y:14,zaRoyaleRank:'E',teamIds:['kept']};
 assert.equal(stepField({...city,zaRoyaleRank:'F'},'right').blocked,true);
 const entered=stepField(city,'right');assert.deepEqual([entered.district,entered.x,entered.y,entered.zaZone12PondLower],['lumiose-zone12',1,13,true]);
 const lower={...city,...entered},map=zone12Map(lower);assert.ok(fieldPath(map,lower,{x:6,y:11}).length);assert.equal(map[12][6],'v');
 assert.equal(reachable(lower,{x:9,y:13}),false);
 const saved=restoreAdventurePosition(storeAdventurePosition(lower,77),77);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaZone12PondLower,saved.teamIds],['lumiose-zone12',1,13,true,['kept']]);
 const exit=stepField(saved,'left');assert.deepEqual([exit.district,exit.x,exit.y],['lumiose-bleu-sector5',21,14]);
 assert.deepEqual([stepField({...city,y:12},'right').district,stepField({...city,y:12},'right').y],['lumiose-zone12',12]);
});
test('zone twelve snow park gate and saved position',()=>{
 const base={area:3,district:'lumiose-centrico-route',interior:null,x:14,y:15,facing:'down',zaRoyaleRank:'F'};assert.equal(stepField(base,'down').blocked,true);
 const entered=stepField({...base,zaRoyaleRank:'E'},'down');assert.equal(entered.district,'lumiose-zone12');const s={...base,...entered,zaRoyaleRank:'E'},map=zone12Map(s);assert.ok(fieldPath(map,s,{x:7,y:6}).length);assert.equal(zone12Visible(s,'b').species,67);assert.equal(zone12Visible(s,'d').species,712);assert.equal(stepField({...s,x:7,y:11},'down').blocked,true);assert.equal(zone12Visible(s,'v').level,55);assert.equal(zone12Item(s,'i').kind,'super_potions');assert.equal(zone12Item({...s,zaZone12Items:['south-super']},'i'),null);
 const legacy=storeAdventurePosition({...s,x:5,y:12},41);delete legacy.districtPosition.zone12Layout;const moved=restoreAdventurePosition(legacy,41);assert.deepEqual([moved.district,moved.x,moved.y],['lumiose-zone12',8,13]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:7,y:6},42),42);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone12',7,6]);assert.equal(stepField(s,'left').district,'lumiose-centrico-route');assert.equal(zone12Encounter(s,()=>0).speciesId,225);
});

test('the court Machop remains reachable and its encounter state survives saves',()=>{
 const s={area:3,district:'lumiose-zone12',interior:null,x:7,y:6,facing:'up',teamIds:['kept']};
 assert.equal(zone12Map(s)[5][7],'m');assert.equal(zone12Visible(s,'m').species,66);
 assert.equal(fieldDialogue(s).action,'zone12Wild-machop');
 assert.ok(fieldPath(zone12Map(s),s,{x:1,y:5}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,zaZone12Spent:{machop:true}},91),91);
 assert.equal(zone12Visible(saved,'m'),null);assert.equal(zone12Map(saved)[5][7],',');
 assert.deepEqual(saved.teamIds,['kept']);
});

test('court rocks gate Ice Beam and old court positions migrate safely',()=>{
 const s={area:3,district:'lumiose-zone12',interior:null,x:4,y:4,facing:'right',teamIds:['kept']};
 const map=zone12Map(s);assert.equal(map[5][6],'r');assert.equal(map[5][5],'t');
 assert.equal(fieldDialogue(s).action,'zone12CourtRock');assert.equal(fieldPath(map,s,{x:5,y:5}).length,0);
 const opened={...s,zaZone12CourtRocks:['5,4']};assert.ok(fieldPath(zone12Map(opened),opened,{x:5,y:5}).length);
 assert.equal(zone12Item(opened,'t').kind,'za-tm013');
 const old=storeAdventurePosition({...s,x:5,y:5},93);old.districtPosition.zone12Layout=1;
 const migrated=restoreAdventurePosition(old,93);assert.deepEqual([migrated.district,migrated.x,migrated.y,migrated.teamIds],['lumiose-zone12',7,6,['kept']]);
 assert.equal(restoreAdventurePosition(old,94).district,null);
 const saved=restoreAdventurePosition(storeAdventurePosition({...opened,x:5,y:5},94),94);
 assert.deepEqual([saved.x,saved.y,saved.zaZone12CourtRocks],[5,5,['5,4']]);
});

test('southwest pond steps keep the existing southern access',()=>{
 const map=zone12Map({});assert.equal(map[13][8],'l');assert.equal(map[13][9],':');assert.equal(map[13][7],'~');
 assert.ok(fieldPath(map,{x:12,y:15},{x:8,y:13}).length);
});


test('pond stairs expose a separate lower bank without moving old saves or water encounters',()=>{
 const base={area:3,district:'lumiose-zone12',interior:null,x:9,y:13,facing:'left',zaRoyaleRank:'E',teamIds:['kept']};
 assert.equal(fieldDialogue(base).action,'zone12PondSteps');
 const old=restoreAdventurePosition(storeAdventurePosition(base,60),60);assert.deepEqual([old.x,old.y,old.zaZone12PondLower],[9,13,undefined]);
 const lower={...base,zaZone12PondLower:true},map=zone12Map(lower);
 assert.equal(fieldDialogue(lower).action,'zone12PondSteps');assert.equal(map[12][6],'v');assert.equal(map[12][7],'d');
 assert.equal(stepField({...lower,x:8,y:12},'left').blocked,true);
 const saved=restoreAdventurePosition(storeAdventurePosition(lower,61),61);assert.deepEqual([saved.x,saved.y,saved.zaZone12PondLower,saved.teamIds],[9,13,true,['kept']]);
 assert.equal(restoreAdventurePosition(storeAdventurePosition(lower,61),62).district,null);
 assert.equal(zone12Map({...lower,zaZone12Spent:{'avalugg-alpha':true}})[12][6],'~');
});


test('draft icicle becomes a traversable bridge while water encounters remain blocked',()=>{
 const base={area:3,district:'lumiose-zone12',interior:null,x:8,y:14,facing:'left',zaZone12PondLower:true,teamIds:['kept']};
 assert.equal(zone12Map(base)[14][7],'r');assert.equal(fieldDialogue(base).action,'zone12IceBridge');assert.equal(stepField(base,'left').blocked,true);
 const open={...base,zaZone12IceBridge:true};for(let x=4;x<=7;x++)assert.equal(zone12Map(open)[13][x],'=');
 assert.ok(fieldPath(zone12Map(open),open,{x:4,y:13}).length);assert.equal(stepField({...open,x:7,y:13},'up').blocked,true);
 assert.equal(reachable(base,{x:3,y:13}),false);
 assert.ok(fieldPath(zone12Map(open),open,{x:3,y:13}).length);
 assert.equal(stepField({...open,x:3,y:13},'right').x,4);
 const saved=restoreAdventurePosition(storeAdventurePosition({...open,x:5,y:13},71),71);assert.deepEqual([saved.x,saved.y,saved.zaZone12PondLower,saved.zaZone12IceBridge,saved.teamIds],[5,13,true,true,['kept']]);
 const landing=restoreAdventurePosition(storeAdventurePosition({...open,x:3,y:13},72),72);assert.deepEqual([landing.x,landing.y,landing.zaZone12PondLower,landing.zaZone12IceBridge,landing.teamIds],[3,13,true,true,['kept']]);
});
