import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldThrowTarget,alphaNoticesPlayer,waryWildNoticesPlayer} from '../lib/adventure-field-throw.mjs';
import {cityWildMap} from '../lib/adventure-city.mjs';
import {activeGardenSpooks,gardenWildResolved} from '../lib/adventure-visible-wild.mjs';

test('aimed throws require a nearby visible target and a clear path',()=>{
 const world={interior:'citywild',x:1,y:2},open=['.......','.......','....a..','.......','.......'];
 assert.deepEqual(fieldThrowTarget(world,open,{x:4,y:2}),{ok:true,tile:'a'});
 assert.match(fieldThrowTarget({...world,x:0},open,{x:4,y:2}).reason,/가까이/);
 assert.match(fieldThrowTarget(world,open,{x:3,y:2}).reason,/포켓몬/);
 assert.equal(fieldThrowTarget(world,open,{x:4.2,y:2}).ok,false);
 assert.equal(fieldThrowTarget({...world,interior:null},open,{x:4,y:2}).ok,false);
 const blocked=['.......','.......','..#.a..','.......','.......'];
 assert.match(fieldThrowTarget(world,blocked,{x:4,y:2}).reason,/장애물/);
});
test('a visible alpha notices only close, unobstructed players who are not sneaking',()=>{
 const world={interior:'citywild',x:14,y:3},map=cityWildMap();assert.equal(alphaNoticesPlayer(world,map),true);
 assert.equal(alphaNoticesPlayer({...world,x:13},map),false);assert.equal(alphaNoticesPlayer({...world,pcSneaking:true},map),false);
 const rows=[...map];rows[3]=rows[3].slice(0,15)+'#'+rows[3].slice(16);assert.equal(alphaNoticesPlayer(world,rows),false);
 assert.equal(alphaNoticesPlayer(world,cityWildMap({pcGardenWild:['e']})),false);
});
test('wary wild Pokémon return after a temporary fright and ignore sneaking players',()=>{
 const world={interior:'citywild',x:3,y:5},map=cityWildMap();assert.equal(waryWildNoticesPlayer(world,map),'a');
 assert.equal(waryWildNoticesPlayer({...world,x:2},map),null);assert.equal(waryWildNoticesPlayer({...world,pcSneaking:true},map),null);
 const spooked={pcGardenSpooked:{a:2000}};assert.equal(gardenWildResolved(spooked,'a',1000),true);assert.equal(gardenWildResolved(spooked,'a',2000),false);
 assert.deepEqual(activeGardenSpooks({pcGardenSpooked:{a:2000,b:1000}},1000),{a:2000});assert.deepEqual(activeGardenSpooks({pcGardenSpooked:'invalid'},1000),{});
 assert.equal(waryWildNoticesPlayer(world,cityWildMap({pcGardenSpooked:{a:Date.now()+30000}})),null);
});
