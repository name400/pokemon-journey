import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {previewClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';
import {classicChallengeBattleEligibility} from '../lib/rogue-challenge-eligibility.mjs';
import {classicMysteryCalmTarget} from '../lib/rogue-mystery.mjs';
import {applyClassicAction,classicGameView} from '../lib/rogue-classic-game.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

const mon=(id,boxId,ability)=>makeReferenceMon(id,20,{boxId,moves:['Tackle'],...(ability?{ability}:{})});
function setup(type=11){
 const fused=previewClassicDnaFusion(mon(10,'primary'),mon(7,'donor'),{random:()=>0}).fused;
 const {doc,state,run}=fixture([mon(143,'snorlax','thickfat'),fused]);
 Object.assign(run,{wave:42,biome:18,screen:'mystery',encounter:{kind:'mystery',key:'fiery-fallout'},mystery:{type:'fiery-fallout',stage:'choose',selection:null},mysteryRule:'part-timer-v19',mysteryGuideFireRule:'source-subset-v2',mysteryFireMixedRule:'source-subset-v1',challengeEligibilityRule:'source-subset-v1',challenges:[{id:1,value:type,severity:0}],updatedAt:1});
 return {doc,state,run};
}
test('a challenge-ineligible resistance ability cannot alone unlock calm',()=>{
 const {doc,run}=setup();assert.equal(classicChallengeBattleEligibility(run.party[0],run.challenges),false);assert.equal(classicChallengeBattleEligibility(run.party[1],run.challenges),true);
 assert.equal(classicMysteryCalmTarget(run),null);assert.deepEqual(classicGameView(doc).run.mystery.fireCalmers,[]);
 const before=structuredClone(doc);assert.throws(()=>applyClassicAction(doc,{action:'mysterySelect',job:'calm',boxId:'snorlax'}));assert.deepEqual(doc,before);
});
test('the first allowed resistant candidate is chosen rather than a forbidden earlier one',async()=>{
 let {doc,run}=setup();run.party.splice(1,0,mon(86,'seal','thickfat'));
 assert.equal(classicChallengeBattleEligibility(run.party[1],run.challenges),true);assert.equal(classicMysteryCalmTarget(run)?.boxId,'seal');
 applyClassicAction(doc,{action:'mysterySelect',job:'calm',boxId:'seal'});doc=await decodeGameData(await encodeGameData(doc));run=ensureClassicState(doc).slots[0];
 assert.equal(run.mystery.selection.boxId,'seal');applyClassicAction(doc,{action:'mysteryConfirm'});assert.equal(run.screen,'reward');
 assert.ok(run.expNotices.some(entry=>entry.boxId==='seal'));assert.deepEqual(doc.adventure,{safe:true});assert.equal(ensureClassicState(doc).slots[1].id,'other');
});
test('a fire type keeps the original type-based gate even when challenge-ineligible',()=>{
 const {run}=setup();run.party=[mon(4,'fire'),run.party[1]];
 assert.equal(classicChallengeBattleEligibility(run.party[0],run.challenges),false);assert.equal(classicMysteryCalmTarget(run)?.boxId,'fire');
});
test('a guide that becomes fainted before confirmation is rejected without changing save',()=>{
 const {doc,run}=setup();run.party.splice(1,0,mon(86,'seal','thickfat'));applyClassicAction(doc,{action:'mysterySelect',job:'calm',boxId:'seal'});
 run.party[1].hp=0;run.updatedAt=1;const before=structuredClone(doc);assert.throws(()=>applyClassicAction(doc,{action:'mysteryConfirm'}));assert.deepEqual(doc,before);
});
test('ordinary runs retain the existing fallback candidate',()=>{
 const {run}=setup();delete run.challengeEligibilityRule;delete run.challenges;assert.equal(classicMysteryCalmTarget(run)?.boxId,'snorlax');
});
