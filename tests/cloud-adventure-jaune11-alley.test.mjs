import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Jaune 11 north alley opens through the existing footprint without blocking old routes',()=>{
 const s={area:3,district:'lumiose-jaune-sector11',interior:null,x:5,y:2,teamIds:['kept'],steps:42},map=fieldMap(s);
 for(let y=3;y<=6;y++)assert.equal(map[y][5],',');
 for(const x of [3,4,6,7])for(let y=3;y<=6;y++)assert.equal(map[y][x],'#');
 assert.ok(fieldPath(map,s,{x:5,y:7}).length);
 for(const target of [{x:1,y:8},{x:21,y:8},{x:11,y:1},{x:11,y:15}])assert.ok(fieldPath(map,s,target).length);
 const mid={...s,x:5,y:4},r=restoreAdventurePosition(storeAdventurePosition(mid,56),56);assert.deepEqual([r.district,r.x,r.y,r.teamIds,r.steps],[s.district,5,4,['kept'],42]);
 const zone=stepField({...s,x:11,y:15},'down');assert.equal(zone.district,'lumiose-zone6');assert.equal(stepField({...s,...zone},'up').district,s.district);
});
