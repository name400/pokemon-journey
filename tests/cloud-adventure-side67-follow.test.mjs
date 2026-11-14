import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceSide67VisualTrail} from '../lib/cloud-adventure/adventure-side67-follow.mjs';

test('visual followers trail turns without changing movement or saved state',()=>{
 const map=['#######','#.....#','#.....#','#..~..#','#######'],before=structuredClone(map);
 let trail=advanceSide67VisualTrail(null,map,{x:3,y:1},'upper','right');assert.deepEqual(trail.tail,[{x:2,y:1},{x:1,y:1}]);
 trail=advanceSide67VisualTrail(trail,map,{x:4,y:1},'upper','right');assert.deepEqual(trail.tail,[{x:3,y:1},{x:2,y:1}]);
 trail=advanceSide67VisualTrail(trail,map,{x:4,y:2},'upper','down');assert.deepEqual(trail.tail,[{x:4,y:1},{x:3,y:1}]);
 const same=advanceSide67VisualTrail(trail,map,{x:4,y:2},'upper','left');assert.equal(same,trail);
 trail=advanceSide67VisualTrail(trail,map,{x:4,y:1},'upper','up');assert.ok(trail.tail.every(p=>p.x!==4||p.y!==1));for(let i=1;i<trail.tail.length;i++)assert.equal(Math.abs(trail.tail[i].x-trail.tail[i-1].x)+Math.abs(trail.tail[i].y-trail.tail[i-1].y),1);assert.deepEqual(map,before);
});
test('layer changes, invalid tiles and distant corrections cannot leave ghost followers',()=>{
 const map=['#####','#...#','#.~.#','#...#','#####'];let trail=advanceSide67VisualTrail(null,map,{x:1,y:1},'upper');
 trail=advanceSide67VisualTrail(trail,map,{x:3,y:3},'upper');assert.deepEqual(trail.player,{x:3,y:3});assert.ok(trail.tail.every(p=>Math.abs(p.x-3)+Math.abs(p.y-3)<=2));
 const other=advanceSide67VisualTrail(trail,map,{x:1,y:3},'lower');assert.equal(other.layer,'lower');assert.ok(other.tail.every(p=>map[p.y][p.x]!== '~'));
 assert.equal(advanceSide67VisualTrail(other,map,{x:2,y:2},'lower'),null);
});
