import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {previewClassicDnaFusion,validatedClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';
import {classicRelearnMoves} from '../lib/rogue-classic-services.mjs';
import {classicRewardView,generateClassicRewardsWithTiers} from '../lib/rogue-classic-rewards.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fusedFixture(){
 const primary=makeReferenceMon(151,20,{boxId:'primary',moves:['Tackle','Growl','Quick Attack','Bite']}),donor=makeReferenceMon(7,20,{boxId:'donor',moves:['Tackle']});
 primary.pp={tackle:1};const fused=previewClassicDnaFusion(primary,donor,{random:()=>0}).fused;return fixture([fused]);
}

test('verified fusion can relearn donor moves from a real memory reward and restore',async()=>{
 let {doc,state,run}=fusedFixture();assert.ok(validatedClassicDnaFusion(run.party[0]));assert.ok(classicRelearnMoves(run.party[0],state.system).includes('물대포'));
 let offer;for(let i=0;i<300;i++){const candidate=generateClassicRewardsWithTiers(run,[1],state.system)[0];if(candidate.id==='memorymushroom'){offer=candidate;break;}}assert.ok(offer);
 assert.ok(classicRewardView(run,state.system)[0].targets[0].learnableMoves.includes('물대포'));
 applyClassicAction(doc,{action:'reward',rewardId:offer.rewardId,boxId:'primary',moveName:'물대포',replaceIndex:1});assert.ok(run.party[0].moves.includes('물대포'));assert.equal(run.party[0].pp.tackle,1);
 doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);run=state.slots[0];assert.ok(run.party[0].moves.includes('물대포'));assert.equal(run.party[0].pp.tackle,1);assert.equal(run.party[0].fusionSpecies,7);assert.deepEqual(doc.adventure,{safe:true});assert.equal(state.slots[1].id,'other');
});

test('unspliced and unverifiable fusions do not acquire donor-only candidates',()=>{
 const {doc,run}=fusedFixture(),fused=run.party[0];applyClassicAction(doc,{action:'unsplice',boxId:'primary',confirm:true});assert.equal(classicRelearnMoves(run.party[0]).includes('물대포'),false);
 const invalid=structuredClone(fused);invalid.fusionSpecies=25;assert.equal(validatedClassicDnaFusion(invalid),null);assert.equal(classicRelearnMoves(invalid).includes('물대포'),false);
 const randomized=structuredClone(fused);randomized.rogueMovesetSeed='unverified';assert.equal(classicRelearnMoves(randomized).includes('물대포'),false);
});
