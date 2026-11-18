import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {previewClassicDnaFusion,validatedClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';
import {CLASSIC_REWARD_REGISTRY,classicRewardView,generateClassicRewardsWithTiers} from '../lib/rogue-classic-rewards.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function setup(){
 const primary=makeReferenceMon(19,20,{boxId:'primary',moves:['Tackle','Growl','Quick Attack','Bite']}),donor=makeReferenceMon(7,20,{boxId:'donor',moves:['Tackle']});primary.pp={tackle:1};
 const fused=previewClassicDnaFusion(primary,donor,{random:()=>0}).fused;return fixture([fused]);
}
function tm(run,name,tier=2){run.rewards=[{...CLASSIC_REWARD_REGISTRY.find(r=>r.id==='tm'+tier),rewardId:'tm-test',moveName:name,name:'기술머신 · '+name}];}

test('generated donor-compatible TM can be learned and restored in battle',async()=>{
 let {doc,state,run}=setup();assert.ok(validatedClassicDnaFusion(run.party[0]));let offer;
 for(let i=0;i<1000;i++){const candidate=generateClassicRewardsWithTiers(run,[2],state.system)[0];if(candidate.id==='tm2'&&candidate.moveName==='파도타기'){offer=candidate;break;}}
 assert.ok(offer,'the real reward generator must include the donor-compatible TM');assert.equal(classicRewardView(run,state.system)[0].targets[0].eligible,true);
 applyClassicAction(doc,{action:'reward',rewardId:offer.rewardId,boxId:'primary',replaceIndex:1});assert.ok(run.party[0].moves.includes('파도타기'));assert.equal(run.party[0].pp.tackle,1);
 doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);run=state.slots[0];assert.equal(run.party[0].fusionSpecies,7);assert.equal(run.party[0].pp.tackle,1);assert.ok(restoreClassicNativeBattle(run.combat,run).p1.active[0].moveSlots.some(m=>m.id==='surf'));assert.deepEqual(doc.adventure,{safe:true});assert.equal(state.slots[1].id,'other');
});

test('donor-only TM is unavailable without a verified fusion or after separation',()=>{
 for(const mode of ['unspliced','invalid']){const {doc,state,run}=setup();if(mode==='unspliced')applyClassicAction(doc,{action:'unsplice',boxId:'primary',confirm:true});else run.party[0].fusionSpecies=25;tm(run,'파도타기');assert.equal(classicRewardView(run,state.system)[0].targets[0].eligible,false);assert.throws(()=>applyClassicAction(doc,{action:'reward',rewardId:'tm-test',boxId:'primary',replaceIndex:1}));}
});

test('a donor level move already available at the current level is not offered as a TM',()=>{
 const {state,run}=setup();tm(run,'물의파동',0);assert.equal(classicRewardView(run,state.system)[0].targets[0].eligible,false);
});

test('an already-known donor TM is not offered under its localized alias',()=>{
 const {state,run}=setup();run.party[0].moves[1]='Surf';run.party[0].pp.surf=3;tm(run,'파도타기');assert.equal(classicRewardView(run,state.system)[0].targets[0].eligible,false);assert.equal(run.party[0].pp.surf,3);
});
