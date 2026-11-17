import test from 'node:test';
import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import {moves} from '../lib/game.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {queueClassicMoves,recordClassicLevelGrowth,classicExpToNext} from '../lib/rogue-classic-growth.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {applyClassicAction,classicGameView} from '../lib/rogue-classic-game.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
import {fixture} from './fixtures/dna-persistent.mjs';
const id=name=>Dex.moves.get(moves[name]?.key||name).id;

test('new move offers use known move identities without restoring PP or replacing data',()=>{
 const mon=makeReferenceMon(1,10,{boxId:'a',moves:['Vine Whip','Tackle'],pp:{vinewhip:2,tackle:7}}),run={party:[mon],pendingMoves:[]};
 const before=structuredClone(mon);queueClassicMoves(run,mon,['덩굴채찍','몸통박치기']);assert.deepEqual(mon,before);assert.deepEqual(run.pendingMoves,[]);
 mon.moves.push('Growl','Protect');run.pendingMoves=[{boxId:'a',move:'Sleep Powder',level:10}];queueClassicMoves(run,mon,['수면가루','몸통박치기']);assert.deepEqual(run.pendingMoves,[{boxId:'a',move:'Sleep Powder',level:10}]);
 queueClassicMoves(run,mon,['unrecognized-one','unrecognized-two']);assert.deepEqual(run.pendingMoves.slice(-2).map(entry=>entry.move),['unrecognized-one','unrecognized-two']);
});

test('real victory and level gain do not relearn an existing alias or reset its PP',async()=>{
 const hero=makeReferenceMon(1,3,{boxId:'hero',moves:['Vine Whip','Seismic Toss'],pp:{vinewhip:2,seismictoss:19}}),{doc,run}=fixture([hero]);hero.experience=classicExpToNext(hero)-1;run.wave=21;run.screen='battle';run.encounter={kind:'wild'};const foe=makeReferenceMon(19,1,{boxId:'foe',moves:['Splash']});foe.hp=1;run.combat=createClassicCombat(run,[foe]);run.party=run.combat.teams[0];run.initialSwitchSlots=[];
 applyClassicAction(doc,{action:'turn',command:{type:'move',move:'seismictoss'}});const saved=await decodeGameData(await encodeGameData(doc)),resumed=ensureClassicState(saved).slots[0],p=resumed.party[0];assert.equal(p.level,4);assert.equal(p.moves.filter(name=>id(name)==='vinewhip').length,1);assert.equal(p.pp.vinewhip,2);assert.ok(!(resumed.pendingMoves||[]).some(entry=>id(entry.move)==='vinewhip'));assert.deepEqual(saved.adventure,{safe:true});assert.deepEqual(saved.classic.slots[1],{id:'other'});
 resumed.wave++;resumed.screen='battle';resumed.combat=createClassicCombat(resumed,[makeReferenceMon(143,50,{boxId:'next',moves:['Splash']})]);assert.equal(restoreClassicNativeBattle(resumed.combat,resumed).p1.pokemon[0].moveSlots.filter(slot=>slot.id==='vinewhip').length,1);
});

test('new queued growth retains identity policy through evolution and saved data',async()=>{
 const mon=makeReferenceMon(10,9,{boxId:'bug',moves:['Bug Bite','Tackle']}),{doc,run}=fixture([mon]);recordClassicLevelGrowth(run,mon,[9],['벌레먹기']);assert.equal(classicGameView(doc).run.screen,'evolution');assert.equal(run.pendingEvolution.moveIdentityRule,'canonical-v1');const saved=await decodeGameData(await encodeGameData(doc));applyClassicAction(saved,{action:'resolveEvolution',decision:'cancel'});const updated=ensureClassicState(saved).slots[0];assert.equal(updated.party[0].moves.filter(name=>id(name)==='bugbite').length,1);assert.ok(!(updated.pendingMoves||[]).some(entry=>id(entry.move)==='bugbite'));assert.deepEqual(saved.adventure,{safe:true});
});

test('old pending decisions, randomized slots and Sketch slots are not silently deduplicated',()=>{
 const mon=makeReferenceMon(1,10,{boxId:'a',moves:['Vine Whip','Tackle','Growl','Protect']}),{doc,run}=fixture([mon]);run.pendingMoves=[{boxId:'a',move:'덩굴채찍',level:10}];run.screen='learn';run.afterLearn='reward';classicGameView(doc);assert.deepEqual(run.pendingMoves,[{boxId:'a',move:'덩굴채찍',level:10}]);assert.equal(run.screen,'learn');
 const old=fixture([makeReferenceMon(1,10,{boxId:'old',moves:['Vine Whip','Tackle','Growl','Protect']})]);old.run.pendingGrowth=[{boxId:'old',level:10,learned:['덩굴채찍']}];classicGameView(old.doc);assert.equal(old.run.screen,'learn');assert.equal(old.run.pendingMoves[0].move,'덩굴채찍');
 const prior=fixture([makeReferenceMon(10,9,{boxId:'bug',moves:['Bug Bite','Tackle','Growl','Protect']})]);prior.run.screen='evolution';prior.run.afterEvolution='reward';prior.run.pendingEvolution={boxId:'bug',evolutionKey:'10:0',level:9,growthLearned:['벌레먹기']};applyClassicAction(prior.doc,{action:'resolveEvolution',decision:'cancel'});assert.equal(prior.run.screen,'learn');assert.equal(prior.run.pendingMoves[0].move,'벌레먹기');
 for(const patch of [{rogueMovesetSeed:'random'}, {rogueSketchRule:'source-v1',rogueSketchPP:[2]}]){const p=makeReferenceMon(1,10,{boxId:'p',moves:['Vine Whip'],...patch}),r={party:[p],pendingMoves:[]};queueClassicMoves(r,p,['덩굴채찍']);assert.equal(p.moves.filter(name=>id(name)==='vinewhip').length,2);}
});
