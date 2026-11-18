import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {previewClassicDnaFusion,validatedClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';
import {gainClassicExperience,classicExpToNext} from '../lib/rogue-classic-growth.mjs';
import {CLASSIC_REWARD_REGISTRY} from '../lib/rogue-classic-rewards.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function setup(known=false){
 const primary=makeReferenceMon(151,6,{boxId:'primary',moves:['Tackle','Growl','Quick Attack',known?'Bubble':'Bite']}),donor=makeReferenceMon(7,6,{boxId:'donor',moves:['Tackle']});primary.pp={tackle:1};
 const fused=previewClassicDnaFusion(primary,donor,{random:()=>0}).fused,result=fixture([fused]);result.run.rewards=[{...CLASSIC_REWARD_REGISTRY.find(r=>r.id==='rarecandy'),rewardId:'candy'}];return result;
}

test('actual candy level-up offers donor move, preserves decision and battle PP after reload',async()=>{
 let {doc,run}=setup();assert.ok(validatedClassicDnaFusion(run.party[0]));applyClassicAction(doc,{action:'reward',rewardId:'candy',boxId:'primary'});
 assert.equal(run.party[0].level,7);assert.equal(run.screen,'learn');assert.deepEqual(run.pendingMoves.map(m=>m.move),['거품']);
 doc=await decodeGameData(await encodeGameData(doc));let state=ensureClassicState(doc);run=state.slots[0];const pending=run.pendingMoves[0];applyClassicAction(doc,{action:'learn',boxId:pending.boxId,move:pending.move,slot:1});
 assert.equal(run.screen,'battle');assert.ok(run.party[0].moves.includes('거품'));assert.equal(run.party[0].pp.tackle,1);assert.equal(run.party[0].fusionSpecies,7);
 doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);run=state.slots[0];const native=restoreClassicNativeBattle(run.combat,run);assert.ok(native.p1.active[0].moveSlots.some(m=>m.id==='bubble'));assert.equal(run.party[0].pp.tackle,1);assert.equal(run.party[0].fusionSpecies,7);assert.deepEqual(doc.adventure,{safe:true});assert.equal(state.slots[1].id,'other');
});

test('known donor move is not offered twice',()=>{
 const {doc,run}=setup(true);run.party[0].pp.bubble=3;applyClassicAction(doc,{action:'reward',rewardId:'candy',boxId:'primary'});assert.equal(run.pendingMoves.length,0);assert.equal(run.party[0].moves.filter(m=>['Bubble','거품'].includes(m)).length,1);assert.equal(run.party[0].pp.bubble,3);
});

test('winning a real battle offers the donor move and preserves the decision through reload',async()=>{
 let {doc,run}=setup();run.party[0].moves[0]='Seismic Toss';run.party[0].experience=classicExpToNext(run.party[0])-1;
 const foe=makeReferenceMon(19,1,{boxId:'weak',moves:['Splash']});foe.hp=1;run.screen='battle';run.initialSwitchSlots=[];run.combat=createClassicCombat(run,[foe]);run.party=run.combat.teams[0];
 applyClassicAction(doc,{action:'turn',command:{type:'move',move:'seismictoss'}});assert.equal(run.screen,'learn');assert.equal(run.party[0].level,7);assert.deepEqual(run.pendingMoves.map(m=>m.move),['거품']);
 doc=await decodeGameData(await encodeGameData(doc));const state=ensureClassicState(doc);run=state.slots[0];const pending=run.pendingMoves[0];applyClassicAction(doc,{action:'learn',boxId:pending.boxId,move:pending.move,slot:1});
 assert.ok(run.party[0].moves.includes('거품'));assert.equal(run.party[0].fusionSpecies,7);assert.equal(run.screen,'reward');assert.deepEqual(doc.adventure,{safe:true});assert.equal(state.slots[1].id,'other');
});

test('unverified fusion and randomized move sets keep their previous learning rules',()=>{
 for(const mode of ['invalid','randomized']){const {run}=setup();const mon=run.party[0];if(mode==='invalid')mon.fusionSpecies=25;else mon.rogueMovesetSeed='unverified';const result=gainClassicExperience(mon,classicExpToNext(mon),30);assert.equal(result.learned.includes('거품'),false);}
});
