import test from 'node:test';
import assert from 'node:assert/strict';
import {protectMap} from '../lib/cloud-adventure/adventure-mission37.mjs';
import {fieldPath,walkable} from '../lib/cloud-adventure/adventure-world.mjs';
import {descentGuideTargets} from '../lib/cloud-adventure/adventure-descent-guides.mjs';

test('rooftop guides stay on the route ahead without occupying the player tile',()=>{
 const map=protectMap({zaMission36DescentPending:true,zaMission36RooftopRoute:true,zaMission36AtPlaza:false,zaMission37Stage:1});
 for(const player of [{x:11,y:14},{x:10,y:9},{x:5,y:5}]){
  const positions=descentGuideTargets(map,player);assert.ok(positions.length>0);assert.equal(new Set(positions.map(p=>`${p.x},${p.y}`)).size,positions.length);
  for(const p of positions){assert.ok(walkable(map[p.y][p.x]));assert.notDeepEqual([p.x,p.y],[player.x,player.y]);assert.ok(fieldPath(map,p,{x:4,y:4}).length<fieldPath(map,player,{x:4,y:4}).length);}
 }
 assert.deepEqual(descentGuideTargets(map,{x:4,y:4}),[]);assert.deepEqual(descentGuideTargets(null,{x:1,y:1}),[]);
});
