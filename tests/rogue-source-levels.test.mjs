import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {makeReferenceMon,rogueSpecies} from '../lib/rogue-reference.mjs';
import {classicLevelCap,classicWildLevel} from '../lib/rogue-classic-rules.mjs';
import {classicTotalExperience,classicExpToNext,gainClassicExperience} from '../lib/rogue-classic-growth.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {classicEncounter} from '../lib/rogue-classic-world.mjs';
import {CLASSIC_REWARD_REGISTRY,chooseClassicReward,classicRewardView} from '../lib/rogue-classic-rewards.mjs';
test('Classic uses original caps above100 while the cartridge constructor remains capped',()=>{
 assert.equal(classicLevelCap(111),104);assert.equal(classicLevelCap(200),200);assert.equal(classicWildLevel(200),200);assert.throws(()=>makeMon(1,101));
 assert.equal(makeReferenceMon(1,201).level,201);assert.throws(()=>makeReferenceMon(1,Infinity));assert.throws(()=>makeReferenceMon(1,1.5));
});
test('all six source growth curves have real totals above the old lookup table',()=>{
 const totalsAt200=[7034285,7480000,8000000,8331454,8650000,9144000];
 for(let growth=0;growth<6;growth++){
  const species=[...rogueSpecies.values()].find(s=>s.growthRate===growth),mon=makeReferenceMon(species.sourceId,200);
  assert.equal(classicTotalExperience(mon),totalsAt200[growth]);assert.ok(classicExpToNext(mon)>1);assert.ok(classicTotalExperience(mon,201)>classicTotalExperience(mon,200));
 }
});
test('EXP can grow an existing level99 Pokemon to200 without resetting stats or reviving it',()=>{
 const hero=makeReferenceMon(151,99,{boxId:'growing'}),result=gainClassicExperience(hero,1000000000,200);
 assert.equal(result.mon.level,200);assert.equal(result.mon.experience,0);assert.ok(result.levels.includes(101));assert.ok(result.mon.maxHp>hero.maxHp);
 const fainted=gainClassicExperience({...hero,hp:0},1000000000,200);assert.equal(fainted.mon.hp,0);
});
test('Rare Candy and Rarer Candy exceed100 and the wave cap with their Candy Jar boost',()=>{
 const hero=makeReferenceMon(151,100,{boxId:'hero'}),other=makeReferenceMon(1,201,{boxId:'other'}),def=CLASSIC_REWARD_REGISTRY.find(d=>d.effect==='candy');
 assert.ok(def);const run={wave:1,screen:'reward',party:[hero,other],modifiers:[{id:'candyjar',boxId:null,count:2}],tools:{},balls:{},money:1000,rewards:[{...def,rewardId:'candy-over100'}],pendingMoves:[],pendingGrowth:[]};
 assert.equal(classicRewardView(run,null)[0].targets[0].eligible,true);chooseClassicReward(run,{rewardId:'candy-over100',boxId:'hero'},null);assert.equal(hero.level,103);
 const all=CLASSIC_REWARD_REGISTRY.find(d=>d.id==='rarercandy');run.rewards=[{...all,rewardId:'all-over100'}];chooseClassicReward(run,{rewardId:'all-over100'},null);assert.equal(hero.level,106);assert.equal(other.level,204);
});
test('native battle damage and JSON restore preserve level200 and source HP',()=>{
 let run={id:'level200-battle',wave:200,biome:1,rng:42,party:[makeReferenceMon(151,200,{boxId:'hero',moves:['Night Shade']})],modifiers:[],tools:{},balls:{},encounter:{kind:'wild'}};
 run.combat=createClassicCombat(run,[makeReferenceMon(151,300,{boxId:'foe',moves:['Splash']})]);run.party=run.combat.teams[0];const old=run.combat.teams[1][0].hp;
 run.combat=playClassicCombat(run,{type:'move',move:'nightshade'});run.party=run.combat.teams[0];assert.equal(run.combat.teams[1][0].hp,old-200);
 run=JSON.parse(JSON.stringify(run));const b=restoreClassicNativeBattle(run.combat,run);assert.equal(b.p1.active[0].level,200);assert.equal(b.p1.active[0].maxhp,run.party[0].maxHp);
 const final=classicEncounter(run);assert.equal(final.team[0].level,200);
});
