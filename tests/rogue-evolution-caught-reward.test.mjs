import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {starterDexEntry} from '../lib/rogue-starter-system.mjs';
import {CLASSIC_REWARD_REGISTRY,classicRewardView,generateClassicRewardsWithTiers} from '../lib/rogue-classic-rewards.mjs';
import {classicEvolutionItemCandidates} from '../lib/rogue-evolution.mjs';
import {applyClassicAction,classicGameView} from '../lib/rogue-classic-game.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

for(const [species,partner,evolved] of [[588,616,589],[616,588,617]])test(`caught partner enables linking cord reward and evolution for ${species}`,async()=>{
 let {doc,state,run}=fixture([makeReferenceMon(species,20,{boxId:'bug',moves:['Tackle']})]);
 const reward={...CLASSIC_REWARD_REGISTRY.find(r=>r.id==='evolutionitem'),rewardId:'cord',boxId:'bug',evolutionItem:'linkingcord',name:'연결의끈'};
 run.rewards=[reward];assert.equal(classicRewardView(run,state.system)[0].targets[0].eligible,false);
 assert.throws(()=>applyClassicAction(doc,{action:'reward',rewardId:'cord',boxId:'bug'}));assert.equal(run.evolutionItems?.linkingcord,undefined);
 starterDexEntry(state.system,partner).caught=true;assert.ok(classicEvolutionItemCandidates(run,state.system).some(c=>c.item==='linkingcord'));
 let offer;for(let i=0;i<200;i++){const candidate=generateClassicRewardsWithTiers(run,[1],state.system)[0];if(candidate.id==='evolutionitem'&&candidate.evolutionItem==='linkingcord'){offer=candidate;break;}}
 assert.ok(offer,'the real reward generator offers the eligible item');assert.equal(classicRewardView(run,state.system)[0].targets[0].eligible,true);
 applyClassicAction(doc,{action:'reward',rewardId:offer.rewardId,boxId:'bug'});assert.equal(run.evolutionItemReview,true);assert.equal(run.evolutionItems.linkingcord,1);
 doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);run=state.slots[0];const option=classicGameView(doc).run.party[0].evolutions.find(e=>e.item==='linkingcord');assert.equal(option.ready,true);
 applyClassicAction(doc,{action:'evolve',boxId:'bug',evolutionKey:option.key});assert.equal(run.party[0].rogueSourceId,evolved);assert.equal(run.evolutionItems.linkingcord,0);assert.equal(state.system.dex[partner].caught,true);assert.equal(state.slots[1].id,'other');assert.deepEqual(doc.adventure,{safe:true});
});

test('missing caught record does not generate a linking cord for Shelmet',()=>{
 const {run,state}=fixture([makeReferenceMon(616,20,{boxId:'bug',moves:['Tackle']})]);
 for(let i=0;i<100;i++)assert.notEqual(generateClassicRewardsWithTiers(run,[1],state.system)[0].id,'evolutionitem');
});
