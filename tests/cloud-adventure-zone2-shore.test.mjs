import test from 'node:test';
import assert from 'node:assert/strict';
import {lumioseZone2Map,fieldPath,restoreAdventurePosition,storeAdventurePosition,walkable} from '../lib/cloud-adventure/adventure-world.mjs';

test('east shore is reached over northeast bridge, then through the rock',()=>{
 const start={x:11,y:15},before=lumioseZone2Map({}),bridge=before.map((row,y)=>y===6?row.slice(0,15)+'#'+row.slice(16):row);
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

test('irregular island expands only water and preserves existing paths, spawns and old saved positions',async()=>{
 const {zone2FieldMonsters}=await import('../lib/cloud-adventure/adventure-world.mjs');const {zone2BankTint}=await import('../lib/cloud-adventure/adventure-zone2-visual.mjs');
 const old=['####W##################','#...:..........~......#','#...:g......^..~......#','#..h:g.........~..^...#','#...,,g;;;ggggg~g.....#','#.^..,gg=~~~~~=~g.....X','#....,g~=~~g~~==g,,,,,#','#..^.,g~=ggggg=~g...^.#','#....,g~~ggggg~~~.....#','#...^,g~==gggg~~~.....#','#.....g~=~~g~~~~~..~~~#','#.....gg=~~~~~~g~..~g~#','#....^gg=ggggggg~..rw~#','#......,,gg.....~~.~~~#','#........gg,.....~~...#','#..........,......~...#','###########E###########'];
 const s={area:3,district:'lumiose-zone2',interior:null,x:11,y:15,teamIds:['kept'],zaZone2RockCleared:false,zaZone2FieldPositions:{staryu:{x:8,y:8}}},map=lumioseZone2Map(s);
 for(let y=0;y<old.length;y++)for(let x=0;x<old[y].length;x++)if(walkable(old[y][x]))assert.ok(walkable(map[y][x]),`${x},${y}`);
 for(const [x,y] of [[10,6],[12,6],[13,6],[10,10],[12,10],[13,10]])assert.equal(map[y][x],'g');
 for(const [x,y] of [[8,5],[8,6],[8,7],[14,5],[14,6],[14,7],[15,6],[8,9],[8,10],[8,11],[8,12],[9,9]])assert.equal(map[y][x],'=');
 for(const target of [{x:4,y:1},{x:8,y:10},{x:11,y:8},{x:15,y:6},{x:21,y:5}])assert.ok(fieldPath(map,s,target).length);
 assert.equal(zone2FieldMonsters(s,'night',map).find(p=>p.id==='staryu').x,8);assert.equal(zone2FieldMonsters(s,'night',map).find(p=>p.id==='staryu').y,8);
 const saved=storeAdventurePosition({...s,x:12,y:8},128),restored=restoreAdventurePosition(saved,128);assert.deepEqual([restored.x,restored.y],[12,8]);assert.deepEqual(restored.teamIds,['kept']);assert.deepEqual(restored.zaZone2FieldPositions,s.zaZone2FieldPositions);
 assert.equal(zone2BankTint(11,8),true);assert.equal(zone2BankTint(0,0),false);
});
