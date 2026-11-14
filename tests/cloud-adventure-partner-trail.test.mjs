import test from 'node:test';
import assert from 'node:assert/strict';
import {partnerTrail,partnerTrailPosition} from '../lib/cloud-adventure/adventure-partner-trail.mjs';
const map=['#####','#...#','#...#','#...#','#####'];
const passable=tile=>tile==='.';
test('follower trails successive turns without changing world data',()=>{
 const snapshot=JSON.stringify(map);
 let t=partnerTrail(null,map,{x:2,y:2},'ground','right',passable);
 assert.deepEqual(t.to,{x:1,y:2});
 t=partnerTrail(t,map,{x:3,y:2},'ground','right',passable);
 assert.deepEqual(partnerTrailPosition(t,.5),{x:1.5,y:2});
 t=partnerTrail(t,map,{x:3,y:1},'ground','up',passable);
 assert.deepEqual(t.to,{x:3,y:2});
 assert.equal(JSON.stringify(map),snapshot);
});
test('map layers, discontinuous corrections and blocked tiles reset the trail safely',()=>{
 let t=partnerTrail(null,map,{x:2,y:2},'ground','right',passable);
 t=partnerTrail(t,map,{x:1,y:1},'ground','up',passable);
 assert.ok(passable(map[t.to.y][t.to.x]));
 t=partnerTrail(t,map,{x:2,y:2},'roof','down',passable);
 assert.equal(t.layer,'roof');
 assert.equal(partnerTrail(t,map,{x:0,y:0},'roof','up',passable),null);
 assert.equal(partnerTrail(null,['###','#.#','###'],{x:1,y:1},'room','up',passable),null);
});
