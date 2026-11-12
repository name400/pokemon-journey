import test from 'node:test';
import assert from 'node:assert/strict';
import {protectMap} from '../lib/cloud-adventure/adventure-mission37.mjs';
import {fieldPath,walkable} from '../lib/cloud-adventure/adventure-world.mjs';
import {zygardeGuideTarget} from '../lib/cloud-adventure/adventure-zygarde-guide.mjs';

test('Zygarde guide leads along walkable tower approach and disappears by the goal',()=>{
 const map=protectMap({zaProtectLayout:5,zaProtectTowerApproachV1:true,zaProtectTowerApproach:true,zaMission37Stage:7});
 for(const player of [{x:3,y:12},{x:8,y:10},{x:15,y:8},{x:17,y:4}]){
  const target=zygardeGuideTarget(map,player);assert.ok(target);assert.ok(walkable(map[target.y][target.x]));assert.ok(fieldPath(map,target,{x:19,y:4}).length<fieldPath(map,player,{x:19,y:4}).length);
 }
 assert.equal(zygardeGuideTarget(map,{x:19,y:4}),null);assert.equal(zygardeGuideTarget(null,{x:1,y:1}),null);
});
