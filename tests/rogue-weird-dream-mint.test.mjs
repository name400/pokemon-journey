import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {ensureStarterSystem,registerStarterCaught} from '../lib/rogue-starter-system.mjs';
import {classicRewardView,chooseClassicReward,generateClassicWeirdDreamTransformRewards} from '../lib/rogue-classic-rewards.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {calculateStats} from '../lib/pokemon-config.mjs';
function fixture(){const system={};ensureStarterSystem(system);const mon=makeReferenceMon(4,50,{boxId:'hero',nature:'hardy',moves:['Tackle']}),run={id:'mint',seed:'mint',rng:42,wave:80,screen:'reward',biome:1,party:[mon],modifiers:[],tools:{},balls:{rogueball:0},money:123,participants:[],awardedFoes:[],expNotices:[]};return {run,mon,system};}
test('dream transformation offers the source fixed reward list',()=>{const {run}=fixture(),rewards=generateClassicWeirdDreamTransformRewards(run);assert.deepEqual(rewards.map(r=>r.id),['memorymushroom','rogueball','mint','mint','mint','mint']);assert.ok(rewards.slice(2).every(r=>r.mintNature));assert.equal(new Set(rewards.map(r=>r.rewardId)).size,6);assert.deepEqual(JSON.parse(JSON.stringify(rewards)),rewards);});
test('mint stores an effective nature separately and persists it through battle restore',()=>{
 const {run,mon,system}=fixture();registerStarterCaught(system,mon,{kind:'capture',increment:false});generateClassicWeirdDreamTransformRewards(run);const mint=run.rewards.find(r=>r.id==='mint');mint.mintNature='adamant';const old=structuredClone(mon),cost=run.money;
 assert.equal(classicRewardView(run,system).find(r=>r.id===mint.rewardId).targets[0].eligible,true);chooseClassicReward(run,{rewardId:mint.rewardId,boxId:'hero'},system);
 assert.equal(mon.nature,old.nature);assert.equal(mon.rogueNatureOverride,'adamant');assert.ok(system.dex['4'].natures.includes('adamant'));assert.equal(mon.hp,old.hp);assert.equal(run.money,cost);assert.deepEqual(mon.stats,calculateStats({...mon,nature:'adamant',rogueNatureOverride:null}));
 const foe=makeReferenceMon(151,50,{boxId:'foe',moves:['Splash']});run.encounter={kind:'wild',trainer:null};run.combat=createClassicCombat(run,[foe]);const restored=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run),native=restored.p1.pokemon.find(p=>p.set.trainerToken==='hero');assert.equal(native.set.nature,'adamant');assert.equal(native.storedStats.atk,mon.stats.atk);assert.equal(run.party[0].nature,'hardy');
});
test('mint rejects the same effective nature without consuming the reward',()=>{const {run,mon,system}=fixture();generateClassicWeirdDreamTransformRewards(run);const mint=run.rewards.find(r=>r.id==='mint');mint.mintNature=mon.nature;assert.throws(()=>chooseClassicReward(run,{rewardId:mint.rewardId,boxId:'hero'},system));assert.ok(run.rewards.some(r=>r.rewardId===mint.rewardId));assert.equal(mon.rogueNatureOverride,undefined);});
test('legacy missing nature is treated as neutral when checking mint eligibility',()=>{const {run,mon,system}=fixture();delete mon.nature;generateClassicWeirdDreamTransformRewards(run);const mint=run.rewards.find(r=>r.id==='mint');mint.mintNature='hardy';assert.throws(()=>chooseClassicReward(run,{rewardId:mint.rewardId,boxId:'hero'},system));assert.equal(mon.rogueNatureOverride,undefined);});
