import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {applyClassicAction,classicGameView,activeClassicRun} from '../lib/rogue-classic-game.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {starterCatalog} from '../lib/rogue-starter-system.mjs';

const party=Array.from({length:6},(_,index)=>({...makeReferenceMon(129,5,{boxId:`player-${index}`,moves:['Splash']}),hp:index===0?1:0}));
const run={id:'fainted-party',wave:8,biome:0,rng:42,party,modifiers:[],tools:{},seed:'fixture',encounter:{kind:'rival'},teraCharged:false};
run.combat=createClassicCombat(run,[makeReferenceMon(151,100,{boxId:'foe',moves:['Night Shade']})],{trainer:true});
assert.equal(restoreClassicNativeBattle(run.combat,run).p1.pokemonLeft,1);
// A snapshot created by an older build can contain the overcount; repair it without changing the saved party.
run.combat.snapshot.sides[0].pokemonLeft=6;
assert.equal(restoreClassicNativeBattle(run.combat,run).p1.pokemonLeft,1);
const after=playClassicCombat(run,{type:'move',move:'splash'});
assert.equal(after.ended,true);assert.equal(after.winner,1);assert.ok(after.teams[0].every(mon=>mon.hp===0));
// Recover an old battle already stalled with no living party, without replacing its data.
const doc={coins:123,collection:[]},state=ensureClassicState(doc,{initialStarterId:1}),starter=starterCatalog(state.system).find(p=>p.id===1);applyClassicAction(doc,{action:'start',selection:[{id:1,ability:starter.abilities[0].key,nature:starter.natures[0].key,gender:starter.genders[0],shiny:false,moves:starter.defaultMoves}]});const stalled=activeClassicRun(doc);stalled.party[0].hp=0;const previous=structuredClone(stalled.party);assert.equal(classicGameView(doc).run.screen,'defeat');assert.deepEqual(stalled.party,previous);assert.equal(doc.coins,123);
console.log('Initially fainted party members and legacy snapshot counters produce a proper defeat.');
