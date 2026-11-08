import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Vert Sector 1 courtyard remains reachable without changing existing exits',()=>{
 const s={area:3,district:'lumiose-vert-sector1',interior:null,x:5,y:7,teamIds:['kept']},map=fieldMap(s);
 for(const [x,y] of [[4,3],[5,3],[6,3],[7,3],[4,4],[5,4],[6,4],[7,4],[5,5]])assert.equal(map[y][x],',');
 assert.ok(fieldPath(map,s,{x:7,y:3}).length);assert.ok(fieldPath(map,s,{x:21,y:7}).length);assert.ok(fieldPath(map,s,{x:11,y:15}).length);
 for(const [x,y] of [[5,3],[5,7],[11,15]]){const saved=restoreAdventurePosition(storeAdventurePosition({...s,x,y},135),135);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[s.district,x,y,['kept']]);}
 assert.equal(stepField({...s,x:21,y:7},'right').district,'lumiose-vert-sector3');
});

test('Vert Sector 5 courtyard and neighbouring street connections remain reachable',()=>{
 const s={area:3,district:'lumiose-vert-sector5',interior:null,x:9,y:5,teamIds:['kept']},map=fieldMap(s);
 for(const [x,y] of [[4,4],[5,4],[6,4],[4,5],[5,5],[6,5],[7,5]])assert.equal(map[y][x],',');
 assert.ok(fieldPath(map,s,{x:4,y:4}).length);assert.ok(fieldPath(map,s,{x:11,y:1}).length);assert.ok(fieldPath(map,s,{x:1,y:8}).length);
 for(const [x,y] of [[4,4],[9,5],[1,8]]){const saved=restoreAdventurePosition(storeAdventurePosition({...s,x,y},136),136);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[s.district,x,y,['kept']]);}
 assert.equal(stepField({...s,x:1,y:8},'left').district,'lumiose-vert-sector4');
});
