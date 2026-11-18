import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {previewClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';
import {classicChallengeBattleEligibility} from '../lib/rogue-challenge-eligibility.mjs';
import {classicMysteryGuideChoices} from '../lib/rogue-mystery.mjs';
import {applyClassicAction,classicGameView} from '../lib/rogue-classic-game.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function setup(type=10){
 const primary=makeReferenceMon(10,20,{boxId:'primary',moves:['Tackle']}),donor=makeReferenceMon(7,20,{boxId:'donor',moves:['Tackle']}),fused=previewClassicDnaFusion(primary,donor,{random:()=>0}).fused;
 const {doc,state,run}=fixture([fused]);Object.assign(run,{wave:22,biome:6,screen:'mystery',encounter:{kind:'mystery',key:'lost-at-sea'},mystery:{type:'lost-at-sea',stage:'choose',selection:null},mysteryRule:'part-timer-v19',mysteryGuideFireRule:'source-subset-v2',mysteryGuideMixedRule:'source-subset-v1',challengeEligibilityRule:'source-subset-v1',challenges:[{id:1,value:type,severity:0}],updatedAt:1});
 return {doc,state,run};
}
test('a fusion forbidden by the challenge cannot alone unlock the guide option',()=>{
 const {doc,run}=setup();run.party.push(makeReferenceMon(4,20,{boxId:'legal',moves:['Tackle']}));assert.equal(classicChallengeBattleEligibility(run.party[0],run.challenges),false);assert.equal(classicChallengeBattleEligibility(run.party[1],run.challenges),true);
 assert.deepEqual(classicMysteryGuideChoices(run,'surf'),[]);
 assert.deepEqual(classicGameView(doc).run.mystery.choices.find(choice=>choice.job==='surf').eligible,[]);
 const before=structuredClone(doc);assert.throws(()=>applyClassicAction(doc,{action:'mysterySelect',job:'surf',boxId:'primary'}));assert.deepEqual(doc,before);
});
test('an allowed fusion still guides through save and reload',async()=>{
 let {doc,run}=setup(11);assert.equal(classicChallengeBattleEligibility(run.party[0],run.challenges),true);
 assert.deepEqual(classicMysteryGuideChoices(run,'surf'),['primary']);applyClassicAction(doc,{action:'mysterySelect',job:'surf',boxId:'primary'});
 doc=await decodeGameData(await encodeGameData(doc));run=ensureClassicState(doc).slots[0];applyClassicAction(doc,{action:'mysteryConfirm'});
 assert.equal(run.screen,'mysteryResult');assert.ok(run.expNotices.some(entry=>entry.boxId==='primary'));assert.deepEqual(doc.adventure,{safe:true});assert.equal(ensureClassicState(doc).slots[1].id,'other');
});
test('a changed challenge invalidates a previously selected guide without mutating the save',()=>{
 const {doc,run}=setup(11);run.party.push(makeReferenceMon(4,20,{boxId:'legal',moves:['Tackle']}));applyClassicAction(doc,{action:'mysterySelect',job:'surf',boxId:'primary'});run.challenges[0].value=10;run.updatedAt=1;
 const before=structuredClone(doc);assert.throws(()=>applyClassicAction(doc,{action:'mysteryConfirm'}));assert.deepEqual(doc,before);
});
test('once an allowed guide exists, legacy fallback retains its candidate order',()=>{
 const {run}=setup(11),other=makeReferenceMon(151,20,{boxId:'other',moves:['Tackle']});run.party.unshift(other);
 assert.equal(classicChallengeBattleEligibility(other,run.challenges),false);assert.equal(classicChallengeBattleEligibility(run.party[1],run.challenges),true);
 assert.deepEqual(classicMysteryGuideChoices(run,'surf'),['other','primary']);
});
test('ordinary runs keep their existing guide and an unknown challenge does not unlock one',()=>{
 const {run}=setup();delete run.challengeEligibilityRule;delete run.challenges;assert.deepEqual(classicMysteryGuideChoices(run,'surf'),['primary']);
 run.challengeEligibilityRule='source-subset-v1';assert.deepEqual(classicMysteryGuideChoices(run,'surf'),[]);
});
