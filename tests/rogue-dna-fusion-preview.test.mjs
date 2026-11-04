import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {classicEffectiveBaseStats,statKeys} from '../lib/pokemon-config.mjs';
import {previewClassicDnaFusion,previewClassicDnaUnsplice} from '../lib/rogue-dna-fusion.mjs';
import {createClassicCombat,restoreClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
const mon=(id,boxId)=>makeReferenceMon(id,50,{boxId,moves:['Splash']});
test('DNA preview averages base stats, chooses source types and ability without mutating input',()=>{
 const a=mon(1,'a'),b=mon(7,'b');a.rogueJuiceMods=[4];a.rogueBaseBoosts={atk:1};a.status='독';a.item='leftovers';b.item='oranberry';b.moves=['Tackle','Splash'];const original=structuredClone([a,b]);
 const p=previewClassicDnaFusion(a,b,{random:()=>{throw Error('unnecessary random draw')}});
 assert.deepEqual([a,b],original);assert.deepEqual(p.fused.rogueTypes,['풀','물']);assert.equal(p.fused.ability,b.ability);assert.equal(p.fused.status,'독');assert.deepEqual(p.offeredMoves,b.moves);assert.equal(p.heldItemsTransferred,false);assert.equal(p.fused.item,'leftovers');assert.deepEqual(p.fused.rogueFusion.donor,b);
 const aWithoutBoost={...a,rogueBaseBoosts:{}};const base=classicEffectiveBaseStats(aWithoutBoost);const got=classicEffectiveBaseStats(p.fused);for(const k of statKeys)assert.equal(got[k],Math.floor(Math.ceil((base[k]+b.rogueBaseStats[k])/2)*(k==='atk'?1.1:1)));
 const restored=previewClassicDnaUnsplice(JSON.parse(JSON.stringify(p.fused)));assert.equal(restored.donorRestored,false);assert.equal(restored.primary.ability,a.ability);assert.deepEqual(restored.primary.rogueTypes,a.rogueTypes);assert.deepEqual(restored.primary.moves,a.moves);assert.equal(restored.primary.item,a.item);assert.equal(restored.primary.fusionSpecies,undefined);
});
test('DNA preview handles statuses and rejects unsafe participants',()=>{
 const a=mon(1,'a'),b=mon(7,'b');a.status='독';b.status='마비';assert.equal(previewClassicDnaFusion(a,b,{random:()=>0}).fused.status,'마비');assert.equal(previewClassicDnaFusion(a,b,{random:()=>.9}).fused.status,'독');a.hp=0;assert.equal(previewClassicDnaFusion(a,b).fused.status,'마비');assert.throws(()=>previewClassicDnaFusion(b,b));assert.throws(()=>previewClassicDnaFusion({...a,rogueFormIndex:1},b));assert.throws(()=>previewClassicDnaFusion({...a,rogueBaseStats:{hp:1}},b));
});
test('preview battle survives serialization with fused stats, types and ability',()=>{
 const a=mon(1,'a'),b=mon(7,'b'),fused=previewClassicDnaFusion(a,b,{random:()=>0}).fused;const run={id:'dna-preview',wave:5,biome:1,rng:42,party:[fused],modifiers:[],tools:{},encounter:{kind:'wild'},participants:[],awardedFoes:[]};run.combat=createClassicCombat(run,[mon(143,'foe')]);let battle=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run),hero=battle.p1.pokemon[0];assert.deepEqual(hero.getTypes(),['Grass','Water']);assert.equal(hero.ability,'torrent');assert.deepEqual(hero.species.baseStats,classicEffectiveBaseStats(fused));assert.equal(hero.maxhp,fused.maxHp);run.combat=playClassicCombat(run,{type:'turn',actions:[{actor:0,type:'move',move:'splash'}]});run.party=run.combat.teams[0];const saved=JSON.parse(JSON.stringify(run));battle=restoreClassicNativeBattle(saved.combat,saved);hero=battle.p1.pokemon[0];assert.deepEqual(hero.getTypes(),['Grass','Water']);assert.equal(hero.ability,'torrent');assert.deepEqual(saved.party[0].rogueFusion.donor,b);
});
