import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';

const party=Array.from({length:6},(_,index)=>({...makeReferenceMon(129,5,{boxId:`player-${index}`,moves:['Splash']}),hp:index===0?1:0}));
const run={id:'fainted-party',wave:8,biome:0,rng:42,party,modifiers:[],tools:{},seed:'fixture',encounter:{kind:'rival'},teraCharged:false};
run.combat=createClassicCombat(run,[makeReferenceMon(151,100,{boxId:'foe',moves:['Night Shade']})],{trainer:true});
assert.equal(restoreClassicNativeBattle(run.combat,run).p1.pokemonLeft,1);
// A snapshot created by an older build can contain the overcount; repair it without changing the saved party.
run.combat.snapshot.sides[0].pokemonLeft=6;
assert.equal(restoreClassicNativeBattle(run.combat,run).p1.pokemonLeft,1);
const after=playClassicCombat(run,{type:'move',move:'splash'});
assert.equal(after.ended,true);assert.equal(after.winner,1);assert.ok(after.teams[0].every(mon=>mon.hp===0));
console.log('Initially fainted party members and legacy snapshot counters produce a proper defeat.');
