import test from 'node:test';
import assert from 'node:assert/strict';
import {zone12Map,zone12Encounter,zone12WildMoves,zone12Visible,zone12Item,ZONE12_PARK_TREES} from '../lib/cloud-adventure/adventure-zone12.mjs';
import {stepField,fieldPath,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
function reachable(s,target){const q=[s],seen=new Set([`${s.x},${s.y}`]);for(let i=0;i<q.length;i++){const p=q[i];if(p.x===target.x&&p.y===target.y)return true;for(const dir of ['up','down','left','right']){const n=stepField(p,dir),key=`${n.x},${n.y}`;if(!n.blocked&&!n.transitioned&&!seen.has(key)){seen.add(key);q.push({...p,...n});}}}return false;}
test('Zone 12 pond-side grass can yield Vanillite while preserving its route and save',()=>{
 const s={area:3,district:'lumiose-zone12',interior:null,x:9,y:11,zaRoyaleRank:'E',teamIds:['kept']},map=zone12Map(s);
 assert.equal(map[s.y][s.x],'g');assert.ok(fieldPath(map,{x:10,y:11},s).length);
 assert.deepEqual(zone12Encounter(s,()=>.999),{speciesId:582,level:36});
 assert.notEqual(zone12Encounter({...s,x:13,y:8},()=>.999).speciesId,582);
 const saved=restoreAdventurePosition(storeAdventurePosition(s,31),31);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[s.district,9,11,['kept']]);
});
test('new Zone 12 Vanillite learns Ice Beam at 35 without mutating existing moves',()=>{
 const mon={speciesId:582,level:35,moves:['하나','둘','셋','넷']};
 assert.deepEqual(zone12WildMoves(mon).moves,['둘','셋','넷','냉동빔']);assert.deepEqual(mon.moves,['하나','둘','셋','넷']);
 const lower={...mon,level:34};assert.equal(zone12WildMoves(lower),lower);
 const other={...mon,speciesId:225};assert.equal(zone12WildMoves(other),other);
});
test('draft Bleu 5 waterside entrance preserves ground gates and lower-layer saves',()=>{
 const city={area:3,district:'lumiose-bleu-sector5',interior:null,x:21,y:14,zaRoyaleRank:'E',teamIds:['kept']};
 assert.equal(stepField({...city,zaRoyaleRank:'F'},'right').blocked,true);
 const entered=stepField(city,'right');assert.deepEqual([entered.district,entered.x,entered.y,entered.zaZone12PondLower],['lumiose-zone12',1,13,true]);
 const lower={...city,...entered},map=zone12Map(lower);assert.ok(fieldPath(map,lower,{x:6,y:11}).length);assert.equal(map[12][6],'v');
 assert.equal(reachable(lower,{x:9,y:13}),false);
 const saved=restoreAdventurePosition(storeAdventurePosition(lower,77),77);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaZone12PondLower,saved.teamIds],['lumiose-zone12',1,13,true,['kept']]);
 const exit=stepField(saved,'left');assert.deepEqual([exit.district,exit.x,exit.y],['lumiose-bleu-sector5',21,14]);
 assert.deepEqual([stepField({...city,y:12},'right').district,stepField({...city,y:12},'right').y],['lumiose-zone12',9]);
});
test('zone twelve snow park gate and saved position',()=>{
 const base={area:3,district:'lumiose-centrico-route',interior:null,x:14,y:15,facing:'down',zaRoyaleRank:'F'};assert.equal(stepField(base,'down').blocked,true);
 const entered=stepField({...base,zaRoyaleRank:'E'},'down');assert.equal(entered.district,'lumiose-zone12');const s={...base,...entered,zaRoyaleRank:'E'},map=zone12Map(s);assert.ok(fieldPath(map,s,{x:7,y:6}).length);assert.equal(zone12Visible(s,'b').species,67);assert.equal(zone12Visible(s,'d').species,712);assert.equal(stepField({...s,x:7,y:11},'down').blocked,true);assert.equal(zone12Visible(s,'v').level,55);assert.equal(zone12Item(s,'i').kind,'super_potions');assert.equal(zone12Item({...s,zaZone12Items:['south-super']},'i'),null);
 const legacy=storeAdventurePosition({...s,x:5,y:12},41);delete legacy.districtPosition.zone12Layout;const moved=restoreAdventurePosition(legacy,41);assert.deepEqual([moved.district,moved.x,moved.y],['lumiose-zone12',8,13]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:7,y:6},42),42);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone12',7,6]);assert.equal(stepField(s,'left').district,'lumiose-centrico-route');assert.equal(zone12Encounter(s,()=>0).speciesId,225);
});

test('the court Machop remains reachable and its encounter state survives saves',()=>{
 const s={area:3,district:'lumiose-zone12',interior:null,x:12,y:5,facing:'up',teamIds:['kept']};
 assert.equal(zone12Map(s)[4][12],'m');assert.equal(zone12Visible(s,'m').species,66);
 assert.equal(fieldDialogue(s).action,'zone12Wild-machop');
 assert.ok(fieldPath(zone12Map(s),s,{x:1,y:5}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,zaZone12Spent:{machop:true}},91),91);
 assert.equal(zone12Visible(saved,'m'),null);assert.equal(zone12Map(saved)[4][12],',');
 assert.deepEqual(saved.teamIds,['kept']);
});

test('court rocks gate Ice Beam and old court progress survives relocation',()=>{
 const s={area:3,district:'lumiose-zone12',interior:null,x:9,y:3,facing:'right',teamIds:['kept']};
 const map=zone12Map(s);assert.equal(map[4][11],'r');assert.equal(map[4][10],'t');
 assert.equal(fieldDialogue(s).action,'zone12CourtRock');assert.equal(fieldPath(map,s,{x:10,y:4}).length,0);
 const opened={...s,zaZone12CourtRocks:['5,4']};assert.ok(fieldPath(zone12Map(opened),opened,{x:10,y:4}).length);
 assert.equal(zone12Item(opened,'t').kind,'za-tm013');
 const old=storeAdventurePosition({...s,x:10,y:3},93);delete old.districtPosition.zone12CourtLayout;
 const migrated=restoreAdventurePosition(old,93);assert.notDeepEqual([migrated.x,migrated.y],[10,3]);assert.deepEqual(migrated.teamIds,['kept']);
 assert.equal(restoreAdventurePosition(old,94).district,null);
 const saved=restoreAdventurePosition(storeAdventurePosition({...opened,x:10,y:3},94),94);
 assert.deepEqual([saved.x,saved.y,saved.zaZone12CourtRocks],[10,3,['5,4']]);
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


test('snow park gates remain connected and old saves on new trees recover safely',()=>{
 const base={area:3,district:'lumiose-zone12',interior:null,zaRoyaleRank:'E',teamIds:['kept'],money:713,zaZone12Items:['south-super']};
 const map=zone12Map(base);
 for(const [x,y] of ZONE12_PARK_TREES){
  assert.equal(map[y][x],'^');
  assert.equal(stepField({...base,x:x-1,y},'right').blocked,true);
  const old=storeAdventurePosition({...base,x,y},117);delete old.districtPosition.zone12ParkLayout;
  const restored=restoreAdventurePosition(old,117);
  assert.notDeepEqual([restored.x,restored.y],[x,y]);
  assert.deepEqual([restored.district,restored.teamIds,restored.money,restored.zaZone12Items],['lumiose-zone12',['kept'],713,['south-super']]);
  assert.ok(fieldPath(map,restored,{x:9,y:13}).length);
  assert.equal(restoreAdventurePosition(old,118).district,null);
 }
 for(const [x,y] of [[6,1],[16,1],[1,5],[1,12],[21,8],[12,15]]){
  assert.ok(fieldPath(map,{x,y},{x:7,y:6}).length,`court from ${x},${y}`);
  assert.ok(fieldPath(map,{x,y},{x:9,y:13}).length,`pond from ${x},${y}`);
 }
 const lower={...base,x:9,y:13,zaZone12PondLower:true,zaZone12IceBridge:true};
 const restored=restoreAdventurePosition(storeAdventurePosition(lower,119),119);
 assert.deepEqual([restored.x,restored.y,restored.zaZone12PondLower,restored.zaZone12IceBridge],[9,13,true,true]);
});

test('lower pond north bank remains separated from the staircase until the ice bridge opens',()=>{
 const base={area:3,district:'lumiose-zone12',interior:null,x:1,y:13,zaRoyaleRank:'E',zaZone12PondLower:true,teamIds:['kept'],zaZone12Spent:{delibird:true}};const map=zone12Map(base);
 assert.ok(fieldPath(map,base,{x:5,y:7}).length);assert.equal(map[8][7],'~');assert.equal(stepField({...base,x:5,y:8},'right').blocked,true);assert.equal(reachable(base,{x:9,y:13}),false);
 const saved=restoreAdventurePosition(storeAdventurePosition({...base,x:5,y:7},83),83);assert.deepEqual([saved.x,saved.y,saved.zaZone12PondLower,saved.zaZone12Spent.delibird],[5,7,true,true]);
 const open={...saved,zaZone12IceBridge:true};assert.equal(reachable(open,{x:9,y:13}),true);assert.equal(zone12Visible(open,'v').species,713);
});

test('expanded southwest pond restores old shore positions and preserves park routes',()=>{
 const base={area:3,district:'lumiose-zone12',interior:null,zaRoyaleRank:'E',teamIds:['kept'],zaZone12Items:['south-super'],zaZone12Spent:{gogoat:true}};
 const map=zone12Map(base),water=[[4,9],[5,9],[6,9],[5,10],[6,10],[5,11]];
 for(const [x,y] of water){
  assert.equal(map[y][x],'~');const previous=storeAdventurePosition({...base,x,y},140);delete previous.districtPosition.zone12ShoreLayout;
  const loaded=restoreAdventurePosition(previous,140);assert.notDeepEqual([loaded.x,loaded.y],[x,y]);assert.notEqual(map[loaded.y][loaded.x],'~');assert.deepEqual([loaded.teamIds,loaded.zaZone12Items,loaded.zaZone12Spent],[['kept'],['south-super'],{gogoat:true}]);assert.ok(fieldPath(map,loaded,{x:9,y:13}).length);assert.equal(restoreAdventurePosition(previous,141).district,null);
 }
 for(const [x,y] of [[6,1],[16,1],[1,5],[1,12],[21,8],[12,15]]){assert.ok(fieldPath(map,{x,y},{x:7,y:6}).length);assert.ok(fieldPath(map,{x,y},{x:9,y:13}).length);}
 assert.equal(stepField({...base,x:7,y:9},'left').blocked,true);
 const lower={...base,zaZone12PondLower:true,x:5,y:9},saved=restoreAdventurePosition(storeAdventurePosition(lower,141),141);assert.deepEqual([saved.x,saved.y,saved.zaZone12PondLower],[5,9,true]);
});

test('eastern and southeastern approaches retain older exits and saved positions',()=>{
 const base={area:3,district:'lumiose-zone12',interior:null,zaRoyaleRank:'E',teamIds:['kept'],zaZone12Items:['south-super'],zaZone12Spent:{gogoat:true}};
 const map=zone12Map(base);assert.equal(map[4][22],'E');assert.equal(map[16][20],'X');assert.equal(map[8][22],'E');assert.equal(map[16][12],'X');
 for(const [x,y,dir,to] of [[21,4,'right','lumiose-vernal'],[21,8,'right','lumiose-vernal'],[20,15,'down','lumiose-bleu-sector7'],[12,15,'down','lumiose-bleu-sector7']]){
  assert.ok(fieldPath(map,{x,y},{x:9,y:13}).length);assert.equal(stepField({...base,x,y},dir).district,to);
  const saved=restoreAdventurePosition(storeAdventurePosition({...base,x,y},201),201);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaZone12Items],['lumiose-zone12',x,y,['kept'],['south-super']]);
 }
 const eastern=stepField({...base,district:'lumiose-vernal',x:1,y:3},'left');assert.deepEqual([eastern.district,eastern.x,eastern.y],['lumiose-zone12',21,4]);
 const south=stepField({...base,district:'lumiose-bleu-sector7',x:16,y:1},'up');assert.deepEqual([south.district,south.x,south.y],['lumiose-zone12',20,15]);
 assert.equal(stepField({...base,district:'lumiose-vernal',zaRoyaleRank:'F',x:1,y:3},'left').blocked,true);assert.equal(stepField({...base,district:'lumiose-bleu-sector7',zaRoyaleRank:'F',x:16,y:1},'up').blocked,true);
});

test('relocated court keeps every prior rock key and pond alpha approach',()=>{
 const base={area:3,district:'lumiose-zone12',interior:null,x:6,y:11,facing:'down',zaZone12CourtRocks:['4,5','6,5','5,4','5,6'],zaZone12Items:['court-tm013'],teamIds:['kept']};
 const map=zone12Map(base);for(const [x,y] of [[9,4],[11,4],[10,3],[10,5]])assert.notEqual(map[y][x],'r');assert.notEqual(map[4][10],'t');
 assert.equal(map[11][6],'.');assert.equal(fieldDialogue(base).action,'zone12Wild-avalugg-alpha');
 for(const [x,y] of [[8,2],[11,3],[12,4],[10,4],[9,4],[11,4],[10,3],[10,5]]){const old=storeAdventurePosition({...base,zaZone12CourtRocks:[],x,y},210);delete old.districtPosition.zone12CourtLayout;const restored=restoreAdventurePosition(old,210);assert.notDeepEqual([restored.x,restored.y],[x,y]);assert.deepEqual([restored.teamIds,restored.zaZone12Items],[['kept'],['court-tm013']]);assert.ok(fieldPath(zone12Map({...base,zaZone12CourtRocks:[]}),restored,{x:9,y:13}).length);}
});

test('six principal park gates and older north/west exits preserve routes and saves',()=>{
 const base={area:3,district:'lumiose-zone12',interior:null,zaRoyaleRank:'E',teamIds:['kept'],zaZone12CourtRocks:['5,4'],zaZone12Items:['court-tm013'],zaZone12IceBridge:true};const map=zone12Map(base);
 for(const [x,y,dir,district] of [[8,1,'up','lumiose-bleu-sector3'],[16,1,'up','lumiose-bleu-sector3'],[1,4,'left','lumiose-bleu-sector5'],[1,9,'left','lumiose-bleu-sector5'],[21,4,'right','lumiose-vernal'],[20,15,'down','lumiose-bleu-sector7'],[6,1,'up','lumiose-bleu-sector3'],[1,5,'left','lumiose-bleu-sector5'],[1,12,'left','lumiose-bleu-sector5']]){
  assert.ok(fieldPath(map,{x,y},{x:9,y:13}).length,`pond from ${x},${y}`);const saved=restoreAdventurePosition(storeAdventurePosition({...base,x,y},220),220);assert.deepEqual([saved.x,saved.y,saved.teamIds,saved.zaZone12CourtRocks,saved.zaZone12Items,saved.zaZone12IceBridge],[x,y,['kept'],['5,4'],['court-tm013'],true]);assert.equal(stepField(saved,dir).district,district);
 }
 const cases=[['lumiose-bleu-sector3',6,15,'down',8,1],['lumiose-bleu-sector3',16,15,'down',16,1],['lumiose-bleu-sector5',21,5,'right',1,4],['lumiose-bleu-sector5',21,12,'right',1,9]];
 for(const [district,x,y,dir,px,py] of cases){const r=stepField({...base,district,x,y},dir);assert.deepEqual([r.district,r.x,r.y],['lumiose-zone12',px,py]);assert.equal(stepField({...base,district,x,y,zaRoyaleRank:'F'},dir).blocked,true);}
});
