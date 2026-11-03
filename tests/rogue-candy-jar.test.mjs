import assert from 'node:assert/strict';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {CLASSIC_REWARD_REGISTRY,classicRewardView} from '../lib/rogue-classic-rewards.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';

const doc={coins:71,collection:[{id:'preserve'}]},state=ensureClassicState(doc);
const hero=makeReferenceMon(1,15,{boxId:'hero',moves:['Tackle']}),fainted=makeReferenceMon(4,10,{boxId:'fainted',moves:['Scratch']}),nearCap=makeReferenceMon(7,99,{boxId:'near-cap',moves:['Tackle']});fainted.hp=0;
const run={id:'candy-jar',wave:40,biome:1,rng:42,party:[hero,fainted,nearCap],modifiers:[],tools:{},encounter:{kind:'wild'},screen:'reward',money:1000,balls:{pokeball:5},participants:[],awardedFoes:[],pendingMoves:[],rerolls:0};state.slots[0]=run;
function setReward(id){const def=CLASSIC_REWARD_REGISTRY.find(item=>item.id===id);assert.ok(def);run.screen='reward';run.rewards=[{...def,rewardId:id}];}
setReward('candyjar');applyClassicAction(doc,{action:'reward',rewardId:'candyjar'});setReward('candyjar');applyClassicAction(doc,{action:'reward',rewardId:'candyjar'});assert.equal(run.modifiers.find(m=>m.id==='candyjar').count,2);
setReward('rarecandy');let view=classicRewardView(run,state.system)[0];assert.match(view.description,/3/);assert.equal(view.targets.find(p=>p.boxId==='fainted').eligible,true);
applyClassicAction(doc,{action:'reward',rewardId:'rarecandy',boxId:'hero'});assert.equal(hero.level,18);assert.ok(hero.moves.includes('돌진'));assert.equal(run.screen,'evolution');assert.equal(run.pendingEvolution.targetName,'이상해풀');
let saved=JSON.parse(JSON.stringify(doc)),restored=ensureClassicState(saved).slots[0];assert.equal(restored.modifiers.find(m=>m.id==='candyjar').count,2);applyClassicAction(saved,{action:'resolveEvolution',decision:'cancel'});assert.equal(restored.party[0].rogueSourceId,1);

// The all-party candy affects fainted members without reviving them and stops
// at this game's level 100 cap; friendship is awarded once per candy use.
restored.screen='reward';restored.rewards=[{...CLASSIC_REWARD_REGISTRY.find(item=>item.id==='rarercandy'),rewardId:'rarercandy'}];view=classicRewardView(restored,ensureClassicState(saved).system)[0];assert.equal(view.requiresTarget,false);assert.match(view.description,/3/);
const restoredFainted=restored.party[1],oldFriendship=restoredFainted.friendship;applyClassicAction(saved,{action:'reward',rewardId:'rarercandy'});assert.equal(restoredFainted.level,13);assert.equal(restoredFainted.hp,0);assert.equal(restoredFainted.friendship,oldFriendship+6);assert.equal(restored.party[2].level,100);assert.equal(restored.party[0].level,21);
assert.equal(saved.coins,71);assert.deepEqual(saved.collection,[{id:'preserve'}]);assert.equal(CLASSIC_REWARD_REGISTRY.find(item=>item.id==='candyjar').tier,2);assert.equal(CLASSIC_REWARD_REGISTRY.find(item=>item.id==='rarercandy').tier,2);
console.log('Candy Jar stacks, single and party candy, fainted party and saved evolution queue passed.');
