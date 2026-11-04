import assert from 'node:assert/strict';
import { makeReferenceMon } from '../lib/rogue-reference.mjs';
import { ensureClassicState } from '../lib/rogue-classic-state.mjs';
import { applyClassicAction, classicGameView } from '../lib/rogue-classic-game.mjs';
import { CLASSIC_REWARD_REGISTRY, generateClassicRewardsWithTiers } from '../lib/rogue-classic-rewards.mjs';

const mon=(id,boxId,level)=>makeReferenceMon(id,level,{boxId,moves:['Tackle']});
function fixture(){
 const doc={coins:73,collection:[],adventure:{untouched:true}},state=ensureClassicState(doc);
 const party=[mon(1,'a',15),mon(4,'b',15),mon(7,'c',99),mon(150,'d',100)];
 party[1].hp=0; for(const p of party)p.friendship=50;
 const run={id:'rarer',seed:'rarer',wave:21,biome:1,rng:42,screen:'reward',party,balls:{pokeball:5},money:1000,modifiers:[{id:'candyjar',boxId:null,count:2}],tools:{},encounter:{kind:'wild'},participants:[],awardedFoes:[],expNotices:[],pendingMoves:[],rewards:[{...CLASSIC_REWARD_REGISTRY.find(x=>x.id==='rarercandy'),rewardId:'all'}],rerolls:0,rarerCandyRule:'source-v1'};
 state.slots[0]=run;return {doc,run};
}
{
 const {doc,run}=fixture();assert.equal(classicGameView(doc).run.rewards[0].requiresTarget,false);
 applyClassicAction(doc,{action:'reward',rewardId:'all'});
 assert.deepEqual(run.party.map(p=>p.level),[18,18,100,100]);assert.equal(run.party[1].hp,0);
 assert.deepEqual(run.party.map(p=>p.friendship),[56,56,56,56]);assert.equal(run.modifiers[0].count,2);
 assert.equal(run.screen,'evolution');assert.equal(run.pendingEvolution.boxId,'a');
 const saved=JSON.parse(JSON.stringify(doc)),restored=ensureClassicState(saved).slots[0];
 let reachedSecond=false;for(let i=0;i<30;i++){
  if(restored.screen==='evolution'){if(restored.pendingEvolution.boxId==='b'){reachedSecond=true;break;}applyClassicAction(saved,{action:'resolveEvolution',decision:'cancel'});}
  else if(restored.screen==='learn'){const p=restored.pendingMoves[0];applyClassicAction(saved,{action:'learn',boxId:p.boxId,move:p.move,slot:null});}else break;
 }
 assert.ok(reachedSecond,'second party member evolution survives restore');
 assert.throws(()=>applyClassicAction(saved,{action:'reward',rewardId:'all'}));
 assert.equal(saved.coins,73);assert.deepEqual(saved.adventure,{untouched:true});
}
{
 let found=false;
 for(let seed=1;seed<=400;seed++){
  const {run}=fixture();run.rng=seed;delete run.rarerCandyRule;
  assert.ok(generateClassicRewardsWithTiers(run,[2,2,2]).every(r=>r.id!=='rarercandy'));
  run.rng=seed;run.rarerCandyRule='source-v1';
  if(generateClassicRewardsWithTiers(run,[2,2,2]).some(r=>r.id==='rarercandy'))found=true;
 }
 assert.ok(found,'new runs can generate the party candy');
}
console.log('Rarer Candy: full party, fainted, candy jars, evolution queue, restore and legacy pool passed');
