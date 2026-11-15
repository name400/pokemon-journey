import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Zone 6 lower stone banks retain the underpass, encounters and old saved coordinates',()=>{
 const s={area:3,district:'lumiose-zone6',interior:null,zaZone6Layer:'canal',x:3,y:7,teamIds:['kept'],steps:42},map=fieldMap(s);
 assert.equal(map[7][3],',');assert.equal(map[12][13],',');assert.ok(fieldPath(map,s,{x:11,y:7}).length);assert.ok(fieldPath(map,{x:11,y:7},{x:11,y:12}).length);
 assert.equal(map[8][11],'w');assert.equal(map[8][12],'a');assert.equal(stepField({...s,x:12,y:7},'down').blocked,true);
 for(const [x,y] of [[3,7],[13,12],[11,10]]){const r=restoreAdventurePosition(storeAdventurePosition({...s,x,y},60),60);assert.deepEqual([r.district,r.zaZone6Layer,r.x,r.y,r.teamIds,r.steps],[s.district,'canal',x,y,['kept'],42]);}
 const above=fieldMap({...s,zaZone6Layer:'ground'});assert.equal(above[10][11],';');
});
