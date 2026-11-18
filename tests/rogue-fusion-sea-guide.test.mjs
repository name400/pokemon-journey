import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon,sourceSpeciesFor} from '../lib/rogue-reference.mjs';
import {previewClassicDnaFusion,previewClassicDnaUnsplice,validatedClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';
import {maybeClassicMystery,mysteryCanGuide} from '../lib/rogue-mystery.mjs';
import {applyClassicAction,classicGameView} from '../lib/rogue-classic-game.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function setup(donorId,level=20){
 const primary=makeReferenceMon(10,level,{boxId:'primary',moves:['Tackle']}),donor=makeReferenceMon(donorId,level,{boxId:'donor',moves:['Tackle']});primary.pp={tackle:3};
 const fused=previewClassicDnaFusion(primary,donor,{random:()=>0}).fused,{doc,state,run}=fixture([fused]);
 Object.assign(run,{wave:22,biome:6,screen:'mystery',encounter:{kind:'mystery',key:'lost-at-sea'},mystery:{type:'lost-at-sea',stage:'choose',selection:null},mysteryRule:'part-timer-v19',mysteryGuideFireRule:'source-subset-v2',mysteryGuideMixedRule:'source-subset-v1'});
 return {doc,state,run,donor};
}
for(const [job,donorId,moveId] of [['surf',7,57],['fly',16,19]])test(`validated fusion donor grants ${job} guide option and survives save`,async()=>{
 let {doc,state,run,donor}=setup(donorId);assert.ok(validatedClassicDnaFusion(run.party[0]));assert.ok(sourceSpeciesFor(donor).tms.includes(moveId));
 assert.equal(mysteryCanGuide(run.party[0],job),true);
 assert.deepEqual(classicGameView(doc).run.mystery.choices.find(choice=>choice.job===job).eligible,['primary']);
 const hp=run.party[0].hp,pp=structuredClone(run.party[0].pp),money=run.money;
 applyClassicAction(doc,{action:'mysterySelect',job,boxId:'primary'});
 doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);run=state.slots[0];
 assert.equal(run.mystery.selection.boxId,'primary');applyClassicAction(doc,{action:'mysteryConfirm'});
 assert.equal(run.screen,'mysteryResult');assert.ok(run.expNotices.some(entry=>entry.boxId==='primary'));
 assert.ok(validatedClassicDnaFusion(run.party[0]));assert.equal(run.party[0].hp,hp);assert.deepEqual(run.party[0].pp,pp);assert.equal(run.money,money);
 const saved=await decodeGameData(await encodeGameData(doc));assert.deepEqual(saved.adventure,{safe:true});assert.equal(ensureClassicState(saved).slots[1].id,'other');assert.throws(()=>applyClassicAction(saved,{action:'mysteryConfirm'}));
});
test('fainted and unverifiable fusions do not gain donor guidance',()=>{
 const {run}=setup(7),mon=run.party[0];assert.equal(mysteryCanGuide(previewClassicDnaUnsplice(mon).primary,'surf'),false);mon.hp=0;assert.equal(mysteryCanGuide(mon,'surf'),false);
 mon.hp=mon.maxHp;mon.fusionSpecies=25;assert.equal(validatedClassicDnaFusion(mon),null);assert.equal(mysteryCanGuide(mon,'surf'),false);
});
test('randomized fusion and donor-only egg moves retain the prior path',()=>{
 const randomized=setup(7).run.party[0];randomized.rogueMovesetSeed='randomized';assert.equal(mysteryCanGuide(randomized,'surf'),false);
 const {run,donor}=setup(207);assert.ok(sourceSpeciesFor(donor).eggMoves.includes(19));assert.ok(!sourceSpeciesFor(donor).tms.includes(19));
 assert.equal(mysteryCanGuide(run.party[0],'fly'),false);
});
test('donor current-level move is included but other levels are not',()=>{
 const {run,donor}=setup(55,40),mon=run.party[0],data=sourceSpeciesFor(donor);
 assert.ok(data.levelMoves.some(([level,move])=>level===40&&move===57));assert.ok(!data.tms.includes(57));
 assert.equal(mysteryCanGuide(mon,'surf'),true);mon.level=39;assert.equal(mysteryCanGuide(mon,'surf'),false);
 mon.level=41;assert.equal(mysteryCanGuide(mon,'surf'),false);
});
test('the normal encounter generator offers donor guidance for a seeded fusion party',()=>{
 const {doc,state,run}=setup(7);
 Object.assign(run,{screen:'battle',rng:55555515,encounter:{kind:'wild',team:[makeReferenceMon(7,20,{boxId:'wild'})]},mysteryState:{spawnWeight:256,history:[]}});
 delete run.mystery;
 assert.equal(maybeClassicMystery(run,state.system),true);assert.equal(run.mystery.type,'lost-at-sea');
 assert.deepEqual(classicGameView(doc).run.mystery.choices.find(choice=>choice.job==='surf').eligible,['primary']);
 applyClassicAction(doc,{action:'mysterySelect',job:'surf',boxId:'primary'});applyClassicAction(doc,{action:'mysteryCancel'});
 assert.equal(run.mystery.stage,'choose');assert.ok(validatedClassicDnaFusion(run.party[0]));
});
