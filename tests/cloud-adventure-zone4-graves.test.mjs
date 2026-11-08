import test from 'node:test';
import assert from 'node:assert/strict';
import {ZONE4_GRAVES,fieldMap,fieldPath,storeAdventurePosition,restoreAdventurePosition,walkable} from '../lib/cloud-adventure/adventure-world.mjs';

test('cemetery graves keep entrances reachable and old saved positions recover',()=>{
 const base={area:3,district:'lumiose-zone4',interior:null,x:11,y:1,zaBunnelbyQuest:3,teamIds:['kept']},map=fieldMap(base);
 for(const [x,y] of ZONE4_GRAVES){assert.equal(map[y][x],'%');const old=storeAdventurePosition({...base,x,y},126);old.districtPosition.zone4Layout=1;const saved=restoreAdventurePosition(old,126);assert.equal(saved.district,base.district);assert.ok(walkable(map[saved.y][saved.x]));assert.deepEqual(saved.teamIds,['kept']);assert.equal(saved.zaBunnelbyQuest,3);assert.equal(restoreAdventurePosition(old,127).district,null);}
 for(const target of [{x:11,y:15},{x:1,y:10},{x:21,y:8},{x:15,y:1}])assert.ok(fieldPath(map,base,target).length);
 for(const [x,y] of [[6,10],[10,8],[11,8],[13,9]])assert.equal(map[y][x],'g');
});
