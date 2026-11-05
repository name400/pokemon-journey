import test from 'node:test';
import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {calculateStats,classicEffectiveBaseStats} from '../lib/pokemon-config.mjs';
import {createClassicCombat,restoreClassicNativeBattle,playClassicCombat,continueClassicWild} from '../lib/rogue-battle-engine.mjs';
import {classicServices,buyClassicService} from '../lib/rogue-classic-services.mjs';
import {chooseClassicReward,CLASSIC_REWARD_REGISTRY} from '../lib/rogue-classic-rewards.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {previewClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';
import {recordClassicChallengeRibbons} from '../lib/rogue-challenge-rewards.mjs';
const mon=(id,boxId,moves=['Tackle'],patch={})=>makeReferenceMon(id,50,{boxId,moves,ability:'pressure',...patch});
const run=(challenges,party=[mon(25,'hero')])=>({id:'expanded',seed:'expanded',rng:42,wave:21,biome:1,screen:'battle',party,challenges,challengeEligibilityRule:'source-subset-v1',money:100000,modifiers:[],tools:{},balls:{masterball:5},participants:[],awardedFoes:[],expNotices:[],pendingMoves:[],encounter:{kind:'wild'}});
test('inverse reverses every single chart pair without leaking into global Dex or status immunities',()=>{
 const r=run([{id:5,value:1}]);r.combat=createClassicCombat(r,[mon(6,'foe',['Splash'])]);const b=restoreClassicNativeBattle(r.combat,r);
 for(const attack of Dex.types.names())for(const defense of Dex.types.names()){
  const expected=!Dex.getImmunity(attack,defense)?1:-Dex.getEffectiveness(attack,defense);
  assert.equal(b.dex.getEffectiveness(attack,defense)||0,expected||0,`${attack}->${defense}`);assert.equal(b.actions.dex.getEffectiveness(attack,defense)||0,expected||0);assert.ok(b.dex.getImmunity(attack,defense));
 }
 assert.equal(b.dex.getImmunity('brn','Fire'),false);assert.equal(Dex.getImmunity('Ground','Flying'),false);
 assert.equal(b.dex.getEffectiveness('Ground',['Fire','Flying']),0);assert.equal(b.p2.active[0].isGrounded(),false);assert.equal(b.p2.active[0].runImmunity('Ground'),true);
});
test('inverse keeps Levitate, Magnet Rise and Air Balloon; actual damage and restored predictions match',()=>{
 for(const patch of [{ability:'levitate'},{item:'airballoon'},{volatile:true},{}]){const r=run([{id:5,value:1}],[mon(150,'hero',['Earthquake'])]);r.combat=createClassicCombat(r,[mon(6,'foe',['Splash'],patch)]);let b=restoreClassicNativeBattle(r.combat,r);if(patch.volatile)b.p2.active[0].addVolatile('magnetrise');assert.equal(b.p2.active[0].runImmunity('Ground'),Object.keys(patch).length===0);if(!patch.volatile){const hp=r.combat.teams[1][0].hp;r.combat=playClassicCombat(r,{type:'move',move:'earthquake'});assert.equal(r.combat.teams[1][0].hp<hp,Object.keys(patch).length===0);}}
});
test('flip reverses base stats before fusion/modifiers, preserving IVs and nature, across wild restore',()=>{
 const primary=mon(25,'hero',['Seismic Toss'],{nature:'adamant',ivs:{hp:1,atk:2,def:3,spa:4,spd:5,spe:6}}),donor=mon(143,'donor'),fused=previewClassicDnaFusion(primary,donor).fused;
 const r=run([{id:6,value:1}],[fused]);r.combat=createClassicCombat(r,[{...mon(19,'foe',['Splash']),hp:1}]);r.party=r.combat.teams[0];const p=r.party[0],base=classicEffectiveBaseStats(p);assert.equal(base.hp,Math.ceil((primary.rogueBaseStats.spe+donor.rogueBaseStats.spe)/2));assert.equal(base.atk,Math.ceil((primary.rogueBaseStats.spd+donor.rogueBaseStats.spd)/2));assert.deepEqual(p.ivs,primary.ivs);assert.equal(p.nature,'adamant');assert.equal(p.maxHp,calculateStats(p).hp);
 r.combat=playClassicCombat(r,{type:'move',move:'seismictoss'});r.party=r.combat.teams[0];r.wave++;r.combat=continueClassicWild(r,[mon(19,'next',['Splash'])]);const b=restoreClassicNativeBattle(JSON.parse(JSON.stringify(r.combat)),r);assert.equal(b.p1.active[0].maxhp,p.maxHp);assert.equal(b.p2.active[0].maxhp,calculateStats({...mon(19,'next'),rogueFlipStats:true}).hp);
});
test('support restrictions separate paid supplies, free rewards and biome healing for all values',()=>{
 for(const value of [1,2,3]){const r=run([{id:8,value}]);r.screen='reward';r.party[0].hp=1;r.party[0].pp={tackle:0};assert.equal(classicServices(r).length>0,value===1);if(value!==1)assert.throws(()=>buyClassicService(r,{itemId:'potion',boxId:'hero'}));r.rewards=[{...CLASSIC_REWARD_REGISTRY.find(d=>d.id==='potion'),rewardId:'free'}];chooseClassicReward(r,{rewardId:'free',boxId:'hero'});assert.ok(r.party[0].hp>1);
 const doc={};const state=ensureClassicState(doc);state.slots[0]=r;r.screen='interlude';r.wave=20;r.party[0].hp=1;r.tools.map=true;applyClassicAction(doc,{action:'next'});assert.equal(r.party[0].hp===r.party[0].maxHp,value===2);if(value!==2)assert.equal(r.party[0].hp,1);
 }
});
test('extra ribbons never pollute generation/type records and support 3 awards all three ribbons',()=>{const r=run([{id:5,value:1},{id:6,value:1},{id:8,value:3}]),system={};recordClassicChallengeRibbons(system,r);assert.deepEqual(system.challengeRibbonSpecies[25],{generations:[],types:[],other:['inverse','flipStats','noHeal','noShop','noSupport']});});
test('flip is present before the first battle and on the extra Shedinja immediately after evolution',async()=>{
 const {buildStarterParty,starterCatalog}=await import('../lib/rogue-starter-system.mjs'),{classicEvolutionOptions,evolveClassicPokemon}=await import('../lib/rogue-evolution.mjs');const system=ensureClassicState({}, {initialStarterId:1}).system,entry=starterCatalog(system).find(e=>e.id===1),selection={id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:'M',shiny:false,moves:entry.defaultMoves};const starter=buildStarterParty(system,[selection],{challenges:[{id:6,value:1}]}).party[0];assert.equal(starter.rogueFlipStats,true);assert.equal(starter.maxHp,calculateStats(starter).hp);
 const r=run([{id:6,value:1}],[mon(290,'nincada',['Scratch'],{rogueFlipStats:true})]);r.screen='reward';r.balls.pokeball=1;const option=classicEvolutionOptions(r.party[0],r,{}).find(e=>e.sourceId===291),result=evolveClassicPokemon(r,{}, {boxId:'nincada',evolutionKey:option.key});assert.equal(result.extra.rogueFlipStats,true);assert.equal(result.extra.maxHp,1);assert.equal(result.extra.stats.spe,calculateStats(result.extra).spe);assert.notEqual(result.extra.stats.spe,calculateStats({...result.extra,rogueFlipStats:false}).spe);
});
