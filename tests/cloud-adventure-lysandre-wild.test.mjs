import test from 'node:test';import assert from 'node:assert/strict';
import {lysandreMazeMap,lysandreVisibleWild,lysandreWild} from '../lib/cloud-adventure/adventure-lysandre-maze.mjs';
import {fieldPath} from '../lib/cloud-adventure/adventure-world.mjs';
test('lab wings place documented wild species without blocking their powered paths',()=>{
 for(const [wing,ids] of [['a',[228,229,309]],['b',[310,714,715]],['e',[374,375,24,23,679,680]]]){
  const s={area:3,district:'lumiose-lysandre-lab',zaMission35Stage:4,zaLysandreMazeV2:true,zaLysandreWing:wing,x:4,y:11},map=lysandreMazeMap(s),visible=lysandreVisibleWild(s);assert.deepEqual(visible.map(p=>p.species),ids);for(const p of visible){assert.equal(map[p.y][p.x],p.tile);assert.equal(lysandreWild(s,p)?.id,p.id);assert.ok(fieldPath(map,p.x>=13?{...s,x:15,y:8}:s,p).length,p.id);}assert.ok(fieldPath(map,s,{x:5,y:5}).length);
 }
});
test('old lab saves keep their existing three encounters and no basement-two encounters',()=>{
 const s={district:'lumiose-lysandre-lab',zaMission35Stage:8};assert.deepEqual(lysandreVisibleWild(s).map(p=>p.id),['beldum','metang','arbok-alpha']);assert.deepEqual(lysandreVisibleWild({...s,zaLysandreFloor:2}),[]);assert.deepEqual(lysandreVisibleWild({...s,zaLysandreMazeV2:true,zaLysandreWing:'hub'}),[]);assert.equal(lysandreVisibleWild({...s,zaLysandreWildSpent:{beldum:true}}).some(p=>p.id==='beldum'),false);
});
