import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Jaune 6 eastern alley preserves salon, lift and existing street access',()=>{
 const base={area:3,district:'lumiose-jaune-sector6',interior:null,x:17,y:10,teamIds:['kept'],steps:42},old=fieldMap(base);
 for(let y=11;y<=14;y++)assert.equal(old[y][17],',');
 assert.ok(fieldPath(old,base,{x:17,y:15}).length);
 for(const goal of [{x:1,y:8},{x:21,y:8},{x:21,y:12},{x:11,y:15}])assert.ok(fieldPath(old,base,goal).length);
 const ready={...base,zaMission19Stage:1,zaMission20Started:true,zaSide47Stage:1},map=fieldMap(ready);
 assert.equal(map[11][15],'^');assert.equal(map[11][16],'^');assert.equal(map[12][15],'j');assert.ok(fieldPath(map,ready,{x:17,y:15}).length);
 assert.equal(fieldDialogue({...ready,x:14,y:11,facing:'right'},map)?.name,'Mirte');
 const r=restoreAdventurePosition(storeAdventurePosition({...ready,x:17,y:12},59),59);assert.deepEqual([r.district,r.x,r.y,r.teamIds,r.steps,r.zaSide47Stage],[base.district,17,12,['kept'],42,1]);
});
