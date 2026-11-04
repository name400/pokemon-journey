import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {previewClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';
import {classicChallengeBattleEligibility as eligible} from '../lib/rogue-challenge-eligibility.mjs';
const mon=(id,boxId)=>makeReferenceMon(id,50,{boxId,moves:['Splash']});
const type=value=>[{id:1,value,severity:0}],gen=value=>[{id:0,value,severity:0}];
test('fusion challenge checks both source generations and fused types',()=>{
 const a=mon(1,'a'),b=mon(7,'b'),fusion=previewClassicDnaFusion(a,b,{random:()=>0}).fused;assert.equal(eligible(fusion,gen(1)),true);assert.equal(eligible(fusion,gen(2)),false);assert.equal(eligible(fusion,type(12)),true);assert.equal(eligible(fusion,type(11)),true);assert.equal(eligible(fusion,type(4)),false);
 const mixed=previewClassicDnaFusion(a,mon(152,'c'),{random:()=>0}).fused;assert.equal(eligible(mixed,gen(1)),false);assert.equal(eligible(mixed,gen(2)),false);assert.equal(eligible(JSON.parse(JSON.stringify(fusion)),type(11)),true);
});
test('unverified or corrupt fusion records remain indeterminate',()=>{
 const fusion=previewClassicDnaFusion(mon(1,'a'),mon(7,'b'),{random:()=>0}).fused;for(const mutate of [f=>f.fusionSpecies=4,f=>f.rogueFusion.baseStats.atk++,f=>f.rogueTypes=['불꽃'],f=>f.rogueFusion.donor.rogueFormIndex=1,f=>f.ability='blaze',f=>f.mega=true]){const copy=structuredClone(fusion);mutate(copy);assert.equal(eligible(copy,gen(1)),null);assert.equal(eligible(copy,type(12)),null);}
});
test('Castform base exception and fainting match source challenge behavior',()=>{const fusion=previewClassicDnaFusion(mon(351,'a'),mon(7,'b'),{random:()=>0}).fused;assert.equal(eligible(fusion,type(1)),true);fusion.hp=0;assert.equal(eligible(fusion,type(1)),false);});
test('type challenge uses validated fused type in battle after restore',async()=>{const {createClassicCombat,restoreClassicNativeBattle}=await import('../lib/rogue-battle-engine.mjs');const fusion=previewClassicDnaFusion(mon(1,'a'),mon(7,'b'),{random:()=>0}).fused,run={id:'fusion-challenge',wave:5,biome:1,rng:42,party:[fusion,mon(4,'other')],modifiers:[],tools:{},encounter:{kind:'wild'},participants:[],awardedFoes:[],challengeEligibilityRule:'source-subset-v1',challenges:type(11)};run.combat=createClassicCombat(run,[mon(143,'foe')]);const saved=JSON.parse(JSON.stringify(run)),battle=restoreClassicNativeBattle(saved.combat,saved);assert.equal(battle.p1.active[0].set.trainerToken,'a');assert.deepEqual(battle.p1.active[0].getTypes(),['Grass','Water']);});
test('challenge does not trust a self-consistent forged donor type',()=>{const fusion=previewClassicDnaFusion(mon(1,'a'),mon(7,'b'),{random:()=>0}).fused;fusion.rogueFusion.donor.rogueTypes=['불꽃'];fusion.rogueTypes=['풀','불꽃'];assert.equal(eligible(fusion,type(10)),null);});
