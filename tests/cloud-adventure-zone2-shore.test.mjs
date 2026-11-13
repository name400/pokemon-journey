import test from 'node:test';
import assert from 'node:assert/strict';
import {lumioseZone2Map,fieldPath,restoreAdventurePosition,storeAdventurePosition,walkable,ZONE2_NORTH_ISLAND_WATER} from '../lib/cloud-adventure/adventure-world.mjs';

test('east shore is reached over northeast bridge, then through the rock',()=>{
 const start={x:11,y:15},before=lumioseZone2Map({}),bridge=before.map((row,y)=>y>=3&&y<=6?row.slice(0,15)+'#'+row.slice(16):row);
 assert.ok(fieldPath(before,start,{x:18,y:12}).length);
 assert.equal(fieldPath(bridge,start,{x:18,y:12}).length,0);
 assert.equal(fieldPath(before,start,{x:20,y:11}).length,0);
 assert.ok(fieldPath(lumioseZone2Map({zaZone2RockCleared:true}),start,{x:20,y:11}).length);
});

test('old shoreline positions and saved Budew relocate without losing state',()=>{
 const old=storeAdventurePosition({area:3,district:'lumiose-zone2',interior:null,x:15,y:3,facing:'up',teamIds:['kept'],zaZone2RockCleared:true,zaZone2Budew:{x:15,y:4,alert:2,custom:'kept'}},80);
 old.districtPosition.zone2Layout=6;
 const restored=restoreAdventurePosition(old,80);assert.equal(restored.district,'lumiose-zone2');
 assert.ok(walkable(lumioseZone2Map(restored)[restored.y][restored.x]));
 assert.deepEqual([restored.teamIds,restored.zaZone2RockCleared,restored.zaZone2Budew.alert,restored.zaZone2Budew.custom],[['kept'],true,2,'kept']);
 assert.ok(walkable(lumioseZone2Map(restored)[restored.zaZone2Budew.y][restored.zaZone2Budew.x]));
 const other=storeAdventurePosition({area:3,district:'lumiose-zone2',interior:null,x:12,y:8,teamIds:['kept']},81);other.districtPosition.zone2Layout=6;
 const unchanged=restoreAdventurePosition(other,81);assert.deepEqual([unchanged.x,unchanged.y],[12,8]);
});


test('new northern shore safely migrates matching player and Budew saves',()=>{
 for(const y of [1,2,3]){
  const state={area:3,district:'lumiose-zone2',interior:null,x:15,y,teamIds:['kept'],zaZone2Budew:{x:15,y,alert:2,custom:'kept'}};
  const old=storeAdventurePosition(state,96);old.districtPosition.zone2Layout=7;
  const restored=restoreAdventurePosition(structuredClone(old),96),map=lumioseZone2Map(restored);
  assert.equal(restored.district,state.district);assert.ok(walkable(map[restored.y][restored.x]));assert.ok(walkable(map[restored.zaZone2Budew.y][restored.zaZone2Budew.x]));
  assert.deepEqual([restored.teamIds,restored.zaZone2Budew.alert,restored.zaZone2Budew.custom],[['kept'],2,'kept']);
  assert.equal(restoreAdventurePosition(structuredClone(old),97).district,null);
 }
});

test('Zone 2 bank trees keep bridges, lookout and old player and Budew saves safe',async()=>{
 const {ZONE2_BANK_TREES,fieldMap,fieldDialogue,stepField}=await import('../lib/cloud-adventure/adventure-world.mjs');
 const base={area:3,district:'lumiose-zone2',interior:null,x:11,y:15,teamIds:['kept'],zaZone2RockCleared:true};const map=fieldMap(base);
 for(const [x,y] of ZONE2_BANK_TREES){assert.equal(map[y][x],'^');const old=storeAdventurePosition({...base,x,y,zaZone2Budew:{x,y,alert:2,custom:'kept'}},103);old.districtPosition.zone2Layout=8;const restored=restoreAdventurePosition(old,103);assert.ok(walkable(map[restored.y][restored.x]));assert.ok(walkable(map[restored.zaZone2Budew.y][restored.zaZone2Budew.x]));assert.equal(restored.zaZone2Budew.custom,'kept');assert.deepEqual(restored.teamIds,['kept']);}
 for(const target of [{x:4,y:1},{x:3,y:4},{x:8,y:10},{x:11,y:8},{x:15,y:6},{x:20,y:11},{x:21,y:5}])assert.ok(fieldPath(map,base,target).length,JSON.stringify(target));
 assert.equal(fieldDialogue({...base,x:3,y:4,facing:'up'}).action,'zone2Overlook');assert.equal(stepField({...base,x:8,y:11},'up').x,8);
});

test('irregular island retains earlier paths outside the revised north water and preserves spawns',async()=>{
 const {zone2FieldMonsters}=await import('../lib/cloud-adventure/adventure-world.mjs');const {zone2BankTint}=await import('../lib/cloud-adventure/adventure-zone2-visual.mjs');
 const old=['####W##################','#...:..........~......#','#...:g......^..~......#','#..h:g.........~..^...#','#...,,g;;;ggggg~g.....#','#.^..,gg=~~~~~=~g.....X','#....,g~=~~g~~==g,,,,,#','#..^.,g~=ggggg=~g...^.#','#....,g~~ggggg~~~.....#','#...^,g~==gggg~~~.....#','#.....g~=~~g~~~~~..~~~#','#.....gg=~~~~~~g~..~g~#','#....^gg=ggggggg~..rw~#','#......,,gg.....~~.~~~#','#........gg,.....~~...#','#..........,......~...#','###########E###########'];
 const s={area:3,district:'lumiose-zone2',interior:null,x:11,y:15,teamIds:['kept'],zaZone2RockCleared:false,zaZone2FieldPositions:{staryu:{x:8,y:8}}},map=lumioseZone2Map(s);
 for(let y=0;y<old.length;y++)for(let x=0;x<old[y].length;x++)if(walkable(old[y][x])&&!ZONE2_NORTH_ISLAND_WATER.some(([a,b])=>a===x&&b===y))assert.ok(walkable(map[y][x]),`${x},${y}`);
 for(const [x,y] of [[10,6],[12,6],[13,6],[10,10],[12,10],[13,10]])assert.equal(map[y][x],'g');
 for(const [x,y] of [[8,5],[8,6],[8,7],[14,5],[14,6],[14,7],[15,6],[8,9],[8,10],[8,11],[8,12],[9,9]])assert.equal(map[y][x],'=');
 for(const target of [{x:4,y:1},{x:8,y:10},{x:11,y:8},{x:15,y:6},{x:21,y:5}])assert.ok(fieldPath(map,s,target).length);
 assert.equal(zone2FieldMonsters(s,'night',map).find(p=>p.id==='staryu').x,8);assert.equal(zone2FieldMonsters(s,'night',map).find(p=>p.id==='staryu').y,8);
 const saved=storeAdventurePosition({...s,x:12,y:8},128),restored=restoreAdventurePosition(saved,128);assert.deepEqual([restored.x,restored.y],[12,8]);assert.deepEqual(restored.teamIds,['kept']);assert.deepEqual(restored.zaZone2FieldPositions,s.zaZone2FieldPositions);
 assert.equal(zone2BankTint(11,8),true);assert.equal(zone2BankTint(0,0),false);
});

test('northeast crossing extends toward northern bank without closing old paths',async()=>{
 const {ZONE2_NORTHEAST_BRIDGE,zone2FieldMonsters}=await import('../lib/cloud-adventure/adventure-world.mjs');
 const state={area:3,district:'lumiose-zone2',x:11,y:15,teamIds:['kept'],zaZone2FieldPositions:{staryu:{x:8,y:8}}},map=lumioseZone2Map(state);
 assert.deepEqual(ZONE2_NORTHEAST_BRIDGE,[[15,3],[15,4],[15,5],[15,6]]);for(const [x,y] of ZONE2_NORTHEAST_BRIDGE)assert.equal(map[y][x],'=');
 for(const target of [{x:4,y:1},{x:8,y:4},{x:8,y:10},{x:11,y:8},{x:15,y:3},{x:16,y:3},{x:21,y:5}])assert.ok(fieldPath(map,state,target).length,JSON.stringify(target));
 assert.deepEqual(zone2FieldMonsters(state,'night',map).find(p=>p.id==='staryu')?.x,8);assert.deepEqual(zone2FieldMonsters(state,'night',map).find(p=>p.id==='staryu')?.y,8);
 const saved=storeAdventurePosition({...state,x:15,y:3},128);saved.districtPosition.zone2Layout=7;const restored=restoreAdventurePosition(saved,128);assert.deepEqual([restored.x,restored.y,restored.teamIds],[15,3,['kept']]);
});

test('Zone 2 west connections preserve unaffected walkability and saved roaming-water positions',async()=>{
 const {ZONE2_WEST_CONNECTIONS,ZONE2_ISLAND_NORTH_EDGE,zone2FieldMonsters}=await import('../lib/cloud-adventure/adventure-world.mjs');
 const old=['####W##################','#...:..........~......#','#...:g......^..~......#','#..h:g.........=..^...#','#...,,g;;;ggggg=g.....#','#.^..,gg=~~~~~==g.....X','#....,g~=~gggg==g,,,,,#','#..^.,g~=ggggg=~g...^.#','#....,g~~ggggg~~~.....#','#...^,g~==gggg~~~.....#','#.....g~=~gggg~~~..~~~#','#.....gg=~~~~~~g~..~g~#','#....^gg=ggggggg~..rw~#','#......,,gg.....~~.~~~#','#........gg,.....~~...#','#..........,......~...#','###########E###########'];
 const base={area:3,district:'lumiose-zone2',x:11,y:15,teamIds:['kept'],zaZone2RockCleared:false},map=lumioseZone2Map(base);
 for(let y=0;y<old.length;y++)for(let x=0;x<old[y].length;x++){
  if(walkable(old[y][x])&&!ZONE2_NORTH_ISLAND_WATER.some(([a,b])=>a===x&&b===y))assert.ok(walkable(map[y][x]),`old walkable ${x},${y}`);
  if(old[y][x]==='~'&&Math.abs(x-8)+Math.abs(y-8)<=3)assert.equal(map[y][x],'~',`saved Staryu water ${x},${y}`);
 }
 for(const [x,y] of ZONE2_WEST_CONNECTIONS){assert.equal(old[y][x],'~');assert.equal(map[y][x],'=');}
 for(const [x,y] of ZONE2_ISLAND_NORTH_EDGE){assert.equal(old[y][x],'~');assert.equal(map[y][x],'g');}
 for(const [x,y] of [[7,6],[9,10],[8,8]]){const state={...base,zaZone2FieldPositions:{staryu:{x,y,custom:'kept'}}},saved=storeAdventurePosition(state,99),restored=restoreAdventurePosition(saved,99),staryu=zone2FieldMonsters(restored,'night',map).find(p=>p.id==='staryu');assert.deepEqual([staryu.x,staryu.y],[x,y]);assert.equal(restored.zaZone2FieldPositions.staryu.custom,'kept');}
 for(const target of [{x:4,y:1},{x:7,y:5},{x:10,y:5},{x:10,y:10},{x:8,y:11},{x:11,y:14},{x:15,y:3},{x:21,y:5}])assert.ok(fieldPath(map,base,target).length,JSON.stringify(target));
});

test('Zone 2 southeast dry rim no longer traps saved positions and preserves both gates',async()=>{
 const {stepField,zone2FieldMonsters}=await import('../lib/cloud-adventure/adventure-world.mjs');
 const {zone2BankTint}=await import('../lib/cloud-adventure/adventure-zone2-visual.mjs');
 for(const cleared of [false,true]){
  const base={area:3,district:'lumiose-zone2',interior:null,x:19,y:15,facing:'left',teamIds:['kept'],zaZone2RockCleared:cleared,zaZone2FieldPositions:{staryu:{x:9,y:10,custom:'kept'}}},map=lumioseZone2Map(base);
  assert.equal(map[15][18],'.');assert.equal(zone2BankTint(19,15),false);assert.equal(zone2BankTint(18,15),false);
  for(const [x,y] of [[19,14],[20,14],[21,14],[19,15],[20,15],[21,15]]){assert.equal(map[y][x],'.');assert.ok(fieldPath(map,{x,y},{x:11,y:15}).length);if(x!==base.x||y!==base.y)assert.ok(fieldPath(map,base,{x,y}).length);}
  assert.deepEqual([stepField(base,'left').x,stepField(base,'left').y],[18,15]);assert.equal(stepField({...base,x:19,y:14},'left').blocked,true);assert.equal(stepField({...base,x:21,y:15},'right').blocked,true);
  assert.equal(stepField({...base,x:4,y:1},'up').district,'lumiose-vert2');assert.equal(stepField({...base,x:11,y:15},'down').district,'lumiose-vert-plaza');
  const old=storeAdventurePosition(base,77);old.districtPosition.zone2Layout=9;const restored=restoreAdventurePosition(old,77);assert.deepEqual([restored.x,restored.y,restored.teamIds],[19,15,['kept']]);const star=zone2FieldMonsters(restored,'night',map).find(p=>p.id==='staryu');assert.deepEqual([star.x,star.y],[9,10]);assert.equal(restored.zaZone2FieldPositions.staryu.custom,'kept');
 }
});


test('north island water closes land bypass, preserves bridges and restores player and Budew',async()=>{
 const {zone2FieldMonsters,stepField}=await import('../lib/cloud-adventure/adventure-world.mjs');
 const s={area:3,district:'lumiose-zone2',interior:null,x:11,y:15,teamIds:['kept'],zaZone2FieldPositions:{patrat2:{x:10,y:4,custom:'kept'},staryu:{x:8,y:8,custom:'kept'}},zaZone2Budew:{x:12,y:4,alert:2,custom:'kept'},zaZone2FieldSpent:{binacle:true}},map=lumioseZone2Map(s);
 const closed=map.map(row=>row.replaceAll('=','~'));for(const start of [{x:4,y:1},{x:11,y:15},{x:21,y:5}])assert.equal(fieldPath(closed,start,{x:11,y:8}).length,0);
 const groups=[[[8,5],[8,6],[8,7],[9,5],[10,5]],[[14,5],[14,6],[14,7],[15,3],[15,4],[15,5],[15,6]],[[8,9],[8,10],[8,11],[8,12],[9,9],[9,11],[10,11]]];
 for(const group of groups){const selective=map.map((row,y)=>[...row].map((v,x)=>v==='='&&!group.some(([a,b])=>a===x&&b===y)?'~':v).join(''));assert.ok(fieldPath(selective,{x:4,y:1},{x:11,y:8}).length);}
 for(const [x,y] of ZONE2_NORTH_ISLAND_WATER){assert.equal(map[y][x],'~');const old=storeAdventurePosition({...s,x,y},410);delete old.districtPosition.zone2NorthIslandLayout;const r=restoreAdventurePosition(old,410);assert.ok(walkable(map[r.y][r.x]));assert.ok(walkable(map[r.zaZone2Budew.y][r.zaZone2Budew.x]));assert.deepEqual([r.teamIds,r.zaZone2Budew.alert,r.zaZone2Budew.custom,r.zaZone2FieldPositions,r.zaZone2FieldSpent],[['kept'],2,'kept',s.zaZone2FieldPositions,{binacle:true}]);assert.deepEqual([zone2FieldMonsters(r,'night',map).find(p=>p.id==='patrat2').x,zone2FieldMonsters(r,'night',map).find(p=>p.id==='staryu').y],[10,8]);}
 assert.equal(stepField({...s,x:12,y:3},'down').blocked,true);const old=storeAdventurePosition({...s,x:12,y:4},411);delete old.districtPosition.zone2NorthIslandLayout;assert.equal(restoreAdventurePosition(old,412).district,null);
});
