import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {ensureStarterSystem,starterProgress,reduceStarterCost} from '../lib/rogue-starter-system.mjs';
import {addClassicFriendship} from '../lib/rogue-classic-growth.mjs';
import {createClassicCombat,playClassicCombat} from '../lib/rogue-battle-engine.mjs';

const system={initialStarterId:1};ensureStarterSystem(system);
const mon=makeReferenceMon(1,20,{boxId:'hero',moves:['Seismic Toss'],friendship:100});
const progress=starterProgress(system,1);progress.candies=9999;progress.friendshipPoints=70;
const foe=makeReferenceMon(19,1,{boxId:'foe',moves:['Splash']});foe.hp=1;
const run={id:'cap-test',wave:40,biome:1,rng:42,party:[mon],modifiers:[],tools:{},encounter:{kind:'wild'},participants:[],awardedFoes:[]};
run.combat=createClassicCombat(run,[foe],{system});run.combat=playClassicCombat(run,{type:'move',move:'seismictoss'},{system});
assert.equal(progress.candies,9999);assert.equal(progress.friendshipPoints,74,'a full wallet retains progress immediately below the 75 point threshold');
const saved=JSON.parse(JSON.stringify(system));const restored=starterProgress(saved,1);reduceStarterCost(saved,1);assert.equal(restored.candies,9979);
addClassicFriendship(mon,1,saved);assert.equal(restored.candies,9980);assert.equal(restored.friendshipPoints,2);assert.equal(progress.candies,9999,'restored spending does not alter original state');

// Reaching the limit from below is different from already being full: source
// consumes the earned candy and retains the actual remainder on that gain.
restored.candies=9998;restored.friendshipPoints=74;addClassicFriendship(mon,1,saved);assert.equal(restored.candies,9999);assert.equal(restored.friendshipPoints,2);
restored.friendshipPoints=1;addClassicFriendship(mon,1,saved);assert.equal(restored.friendshipPoints,4,'below-threshold progress is not inflated at the cap');
console.log('Candy friendship progress survives a full wallet, save restore and subsequent spending.');
