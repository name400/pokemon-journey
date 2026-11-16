import test from 'node:test';
import assert from 'node:assert/strict';
import {CRYSTAL_POSITIONS,clearedCrystals} from '../lib/cloud-adventure/adventure-mission20-jobs.mjs';
import {lumioseCrystalSewerMap,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('all 27 crystal positions have reachable adjacent tiles and retain saved progress',()=>{
 assert.equal(CRYSTAL_POSITIONS.length,27);const map=lumioseCrystalSewerMap();
 for(const {x,y} of CRYSTAL_POSITIONS){assert.equal(map[y][x],'c');assert.ok(fieldPath(map,{x:11,y:14},{x,y:y+1}).length,`${x},${y}`);}
 const state={area:3,district:'lumiose-crystal-sewer',interior:null,x:11,y:14,facing:'up',regionId:6,districtReturnRegion:1,zaMission20Stage:9,zaMission20Crystals:['3,4','3,4','bogus'],activeId:'owned',teamIds:['owned']};
 assert.deepEqual(clearedCrystals(state),['3,4']);const restored=restoreAdventurePosition(storeAdventurePosition(state,8),8);assert.equal(restored.district,'lumiose-crystal-sewer');assert.equal(restored.zaMission20Stage,9);assert.deepEqual(restored.teamIds,['owned']);assert.equal(lumioseCrystalSewerMap(restored)[4][3],'.');
});

test('new crystal sewer pillars keep all 27 crystals reachable and preserve legacy layouts',()=>{
 const base={area:3,district:'lumiose-crystal-sewer',interior:null,x:11,y:14,zaMission20Stage:9,teamIds:['owned']};
 const old=lumioseCrystalSewerMap(base),fresh=lumioseCrystalSewerMap({...base,zaMission20PillarsV1:true});
 const pillars=[[4,6],[7,6],[15,6],[18,6],[4,10],[7,10],[15,10],[18,10]];
 for(const [x,y] of pillars){assert.equal(old[y][x],'g');assert.equal(fresh[y][x],'#');}
 for(const {x,y} of CRYSTAL_POSITIONS)assert.ok(fieldPath(fresh,base,{x,y:y+1}).length,`unreachable ${x},${y}`);
 const legacy={...base,x:4,y:6};const restored=restoreAdventurePosition(storeAdventurePosition(legacy,12),12);assert.deepEqual([restored.x,restored.y],[4,6]);assert.deepEqual(restored.teamIds,['owned']);assert.equal(restored.zaMission20PillarsV1,undefined);
 const active={...base,zaMission20PillarsV1:true,zaMission20Crystals:['3,4']};const resumed=restoreAdventurePosition(storeAdventurePosition(active,13),13);assert.equal(resumed.zaMission20PillarsV1,true);assert.equal(lumioseCrystalSewerMap(resumed)[4][3],'.');assert.deepEqual(resumed.teamIds,['owned']);
});

test('new sewer layout preserves mission access and restores its selected layout',()=>{
 const state={area:3,district:'lumiose-crystal-sewer',interior:null,x:11,y:14,facing:'up',regionId:6,districtReturnRegion:1,zaMagentaSewerLayout:2,zaMission20Stage:9,zaMission20PillarsV1:true,zaMission20Crystals:[],activeId:'owned',teamIds:['owned']};
 const legacy=lumioseCrystalSewerMap({...state,zaMagentaSewerLayout:undefined});
 assert.equal(legacy[10][14],'.');
 let map=lumioseCrystalSewerMap(state);
 assert.equal(map[10][14],'~');
 assert.equal(map[7][4],'#');
 assert.equal(map[3][8],'.');
 assert.equal(map[11][8],'.');
 // Clear only crystals approachable from the entrance, as the player can.
 for(let i=0;i<27;i++){
  map=lumioseCrystalSewerMap(state);
  const next=CRYSTAL_POSITIONS.find(p=>!state.zaMission20Crystals.includes(p.key)&&[[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>fieldPath(map,state,{x:p.x+dx,y:p.y+dy}).length));
  assert.ok(next,`crystal ${i+1} is inaccessible`);
  state.zaMission20Crystals.push(next.key);
 }
 map=lumioseCrystalSewerMap(state);
 for(const p of [{x:4,y:5},{x:18,y:5},{x:4,y:11},{x:18,y:11},{x:2,y:1},{x:11,y:15}])assert.ok(fieldPath(map,state,p).length,`unreachable ${p.x},${p.y}`);
 const restored=restoreAdventurePosition(storeAdventurePosition(state,17),17);
 assert.equal(restored.zaMagentaSewerLayout,2);
 assert.deepEqual(restored.zaMission20Crystals,state.zaMission20Crystals);
 assert.deepEqual(lumioseCrystalSewerMap(restored),map);
 const old={...state,zaMagentaSewerLayout:undefined,x:14,y:10};
 const oldRestored=restoreAdventurePosition(storeAdventurePosition(old,18),18);
 assert.deepEqual([oldRestored.x,oldRestored.y],[14,10]);
 assert.equal(lumioseCrystalSewerMap(oldRestored)[10][14],'.');
});
