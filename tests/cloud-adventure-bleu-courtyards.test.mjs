import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Bleu Sector 4 western courtyard joins the street without moving saved positions',()=>{
 const base={area:3,district:'lumiose-bleu-sector4',interior:null,x:5,y:7,teamIds:['kept'],zaMission20Stage:7},map=fieldMap(base);
 for(const [x,y] of [[4,3],[5,3],[6,3],[4,4],[5,4],[6,4],[5,5]])assert.equal(map[y][x],',');
 assert.ok(fieldPath(map,base,{x:5,y:3}).length);assert.ok(fieldPath(map,base,{x:21,y:8}).length);assert.equal(stepField({...base,x:21,y:8},'right').district,'lumiose-rust');
 for(const [x,y] of [[5,3],[5,7],[11,5]]){const saved=restoreAdventurePosition(storeAdventurePosition({...base,x,y},132),132);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaMission20Stage],[base.district,x,y,['kept'],7]);}
});

test('Bleu Sector 5 western courtyard retains both Aymlis exits',()=>{
 const base={area:3,district:'lumiose-bleu-sector5',interior:null,x:9,y:4,teamIds:['kept'],zaRoyaleRank:'E'},map=fieldMap(base);
 for(const x of [4,5,6])assert.equal(map[4][x],',');assert.ok(fieldPath(map,base,{x:4,y:4}).length);assert.ok(fieldPath(map,base,{x:21,y:5}).length);assert.ok(fieldPath(map,base,{x:21,y:12}).length);
 for(const [x,y] of [[4,4],[9,4],[21,5],[21,12]]){const saved=restoreAdventurePosition(storeAdventurePosition({...base,x,y},133),133);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[base.district,x,y,['kept']]);}
 assert.equal(stepField({...base,x:21,y:5},'right').district,'lumiose-zone12');assert.equal(stepField({...base,x:21,y:12},'right').district,'lumiose-zone12');
});
