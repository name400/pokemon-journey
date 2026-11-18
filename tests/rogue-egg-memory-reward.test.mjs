import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {starterLegalMoves,starterProgress} from '../lib/rogue-starter-system.mjs';
import {classicRelearnMoves} from '../lib/rogue-classic-services.mjs';
import {classicRewardView,generateClassicRewardsWithTiers} from '../lib/rogue-classic-rewards.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function setup(){
 const result=fixture([makeReferenceMon(227,5,{boxId:'bird'})]),mon=result.run.party[0];
 mon.moves=starterLegalMoves(result.state.system,227);mon.origin='starter';mon.rogueMetBiome=-1;mon.pp={peck:1};
 return result;
}

test('unlocked forgotten egg move makes memory mushroom available in the actual reward pool',async()=>{
 let {doc,run,state}=setup();assert.deepEqual(classicRelearnMoves(run.party[0],state.system),[]);
 for(let i=0;i<100;i++)assert.notEqual(generateClassicRewardsWithTiers(run,[1],state.system)[0].id,'memorymushroom');
 starterProgress(state.system,227).eggMask=2;assert.deepEqual(classicRelearnMoves(run.party[0],state.system),['거수참']);
 let reward;for(let i=0;i<300;i++){const candidate=generateClassicRewardsWithTiers(run,[1],state.system)[0];if(candidate.id==='memorymushroom'){reward=candidate;break;}}
 assert.ok(reward,'the real reward generator must include memory mushroom');const target=classicRewardView(run,state.system)[0].targets[0];assert.equal(target.eligible,true);assert.ok(target.learnableMoves.includes('거수참'));
 applyClassicAction(doc,{action:'reward',rewardId:reward.rewardId,boxId:'bird',moveName:'거수참',replaceIndex:0});assert.ok(run.party[0].moves.includes('거수참'));assert.equal(run.party[0].pp.peck,1);
 doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);run=state.slots[0];assert.ok(run.party[0].moves.includes('거수참'));assert.equal(run.party[0].pp.peck,1);assert.equal(state.system.starterData[227].eggMask,2);assert.deepEqual(doc.adventure,{safe:true});assert.equal(state.slots[1].id,'other');
});
