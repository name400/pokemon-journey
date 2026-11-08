import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Vert Sector 3 northeast courtyard has a fountain and preserves nearby exits',()=>{
 const s={area:3,district:'lumiose-vert-sector3',interior:null,x:17,y:6,teamIds:['kept']},map=fieldMap(s);
 assert.equal(map[4][16],'~');assert.equal(map[5][17],',');assert.ok(fieldPath(map,s,{x:18,y:3}).length);assert.equal(stepField({...s,x:16,y:3},'down').blocked,true);
 for(const [x,y] of [[17,5],[18,3],[21,4],[21,7],[21,10]]){assert.ok(fieldPath(map,s,{x,y}).length);const saved=restoreAdventurePosition(storeAdventurePosition({...s,x,y},134),134);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[s.district,x,y,['kept']]);}
 for(const y of [4,7,10])assert.equal(stepField({...s,x:21,y},'right').district,'lumiose-coulant-route');
});
