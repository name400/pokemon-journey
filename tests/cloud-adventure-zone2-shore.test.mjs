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
