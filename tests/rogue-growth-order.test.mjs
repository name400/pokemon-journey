import assert from 'node:assert/strict';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {CLASSIC_REWARD_REGISTRY} from '../lib/rogue-classic-rewards.mjs';
import {createClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {classicExpToNext} from '../lib/rogue-classic-growth.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';

function fixture(mon,order='source-v1'){
 const doc={coins:33,collection:[{id:'keep'}]},state=ensureClassicState(doc);
 const run={id:'growth-order',growthOrder:order,wave:100,biome:1,rng:42,party:[mon],modifiers:[],tools:{},teraCharged:false,encounter:{kind:'wild'},screen:'reward',money:1000,balls:{pokeball:5},participants:[],awardedFoes:[],pendingMoves:[],rerolls:0};state.slots[0]=run;
 return {doc,run};
}
function candy(doc,run){run.screen='reward';run.rewards=[{...CLASSIC_REWARD_REGISTRY.find(r=>r.id==='rarecandy'),rewardId:'candy'}];return applyClassicAction(doc,{action:'reward',rewardId:'candy',boxId:run.party[0].boxId});}

// Tangela learns Ancient Power at level 33; upstream checks evolution before
// teaching that level's move, so that move enables evolution on a later level.
const source=fixture(makeReferenceMon(114,32,{boxId:'tangela',moves:['Tackle']}));candy(source.doc,source.run);assert.equal(source.run.party[0].level,33);assert.ok(source.run.party[0].moves.includes('원시의힘'));assert.equal(source.run.screen,'advance');
const saved=JSON.parse(JSON.stringify(source.doc)),savedRun=ensureClassicState(saved).slots[0];candy(saved,savedRun);assert.equal(savedRun.screen,'evolution');assert.equal(savedRun.pendingEvolution.targetName,'덩쿠림보');applyClassicAction(saved,{action:'resolveEvolution',decision:'evolve'});assert.equal(savedRun.party[0].rogueSourceId,465);assert.equal(saved.coins,33);assert.deepEqual(saved.collection,[{id:'keep'}]);

// A pre-existing run continues using its original learning-first queue.
const legacy=fixture(makeReferenceMon(114,32,{boxId:'legacy',moves:['Tackle']}),undefined);delete legacy.run.growthOrder;candy(legacy.doc,legacy.run);assert.equal(legacy.run.screen,'evolution');assert.ok(legacy.run.party[0].moves.includes('원시의힘'));

// Three levels from one candy: evolution decision comes before the level-18
// move. The pending move is restored after evolve or cancel, with a full set.
const multi=fixture(makeReferenceMon(1,15,{boxId:'bulb',moves:['Tackle','Growl','Vine Whip','Leech Seed']}));multi.run.modifiers=[{id:'candyjar',count:2,boxId:null}];candy(multi.doc,multi.run);assert.equal(multi.run.party[0].level,18);assert.equal(multi.run.screen,'evolution');assert.ok(!multi.run.party[0].moves.includes('돌진'));assert.ok(multi.run.pendingEvolution.growthLearned.includes('돌진'));
for(const decision of ['evolve','cancel','pause']){const copy=JSON.parse(JSON.stringify(multi.doc)),r=ensureClassicState(copy).slots[0];applyClassicAction(copy,{action:'resolveEvolution',decision});assert.equal(r.screen,'learn');assert.equal(r.pendingMoves[0].move,'돌진');applyClassicAction(copy,{action:'learn',boxId:'bulb',move:'돌진',slot:0});assert.ok(r.party[0].moves.includes('돌진'));assert.equal(r.party[0].rogueSourceId,decision==='evolve'?2:1);if(decision==='pause')assert.equal(r.party[0].pauseEvolutions,true);}
const evolutionMove=fixture(makeReferenceMon(153,31,{boxId:'bayleef',moves:['Tackle','Growl','Vine Whip','Leech Seed']}));candy(evolutionMove.doc,evolutionMove.run);assert.equal(evolutionMove.run.screen,'evolution');applyClassicAction(evolutionMove.doc,{action:'resolveEvolution',decision:'evolve'});assert.equal(evolutionMove.run.screen,'learn');assert.deepEqual(evolutionMove.run.pendingMoves.map(move=>move.move),['꽃잎댄스','달콤한향기']);

// Actual battle EXP follows the same order and survives the battle snapshot.
const battler=makeReferenceMon(114,32,{boxId:'battle-tangela',moves:['Seismic Toss']});battler.experience=classicExpToNext(battler)-1;const battle=fixture(battler),foe=makeReferenceMon(19,1,{boxId:'foe',moves:['Splash']});foe.hp=1;battle.run.screen='battle';battle.run.combat=createClassicCombat(battle.run,[foe]);applyClassicAction(battle.doc,{action:'turn',command:{type:'move',move:'seismictoss'}});assert.equal(battle.run.party[0].level,33);assert.notEqual(battle.run.screen,'evolution');assert.ok(battle.run.party[0].moves.includes('원시의힘'));assert.equal(JSON.parse(JSON.stringify(battle.doc)).classic.slots[0].party[0].level,33);
console.log('Source growth order checks evolution before same-level moves; legacy queues, candy and battle restore passed.');
