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
