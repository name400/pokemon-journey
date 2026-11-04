import test from 'node:test';
import assert from 'node:assert/strict';
import {planClowningAroundTypes,stageClowningAroundTypes} from '../lib/rogue-clowning-around.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
test('clown type plan prioritizes unique off-type damaging moves without touching the party',()=>{
 const mon=makeReferenceMon(133,50,{boxId:'hero',moves:['Tackle','Water Gun','Surf','Flamethrower']}),party=[mon],before=structuredClone(party);let draws=0;const plan=planClowningAroundTypes(party,()=>{draws++;return 0;});assert.deepEqual(plan,[{boxId:'hero',primary:'노말',second:'물'}]);assert.equal(draws,1);assert.deepEqual(party,before);
});
test('clown fallback rejects original types and validates unsupported fusion',()=>{
 const mon=makeReferenceMon(133,50,{boxId:'hero',moves:['Tackle','Splash']}),rolls=[0,.6];const plan=planClowningAroundTypes([mon],()=>rolls.shift());assert.equal(plan[0].second,'물');assert.equal(rolls.length,0);assert.throws(()=>planClowningAroundTypes([{...mon,fusionSpecies:25}],()=>0));
});
test('staging persists custom type and RNG without changing the input save',()=>{
 const mon=makeReferenceMon(133,50,{boxId:'hero',moves:['Tackle','Water Gun']}),run={rng:123,screen:'mystery',party:[mon],mystery:{type:'clowning-around',stage:'confirm',selection:{job:'types'}}},before=structuredClone(run),next=stageClowningAroundTypes(run),restored=JSON.parse(JSON.stringify(next));
 assert.deepEqual(run,before);assert.deepEqual(restored.party[0].rogueTypes,['노말','물']);assert.equal(restored.party[0].rogueCustomSecondType,'물');assert.equal(restored.mystery.stage,'types-staged');assert.throws(()=>stageClowningAroundTypes(next));
 const invalid=structuredClone(run);invalid.party[0].fusionSpecies=25;const copy=structuredClone(invalid);assert.throws(()=>stageClowningAroundTypes(invalid));assert.deepEqual(invalid,copy);
});
test('staged types reach the battle engine and survive battle snapshot restoration',async()=>{
 const {createClassicCombat,restoreClassicNativeBattle}=await import('../lib/rogue-battle-engine.mjs');const hero=makeReferenceMon(133,50,{boxId:'hero',moves:['Tackle','Water Gun']}),foe=makeReferenceMon(25,50,{boxId:'foe',moves:['Splash']}),run={seed:'clown',rng:123,wave:80,biome:1,screen:'mystery',party:[hero],modifiers:[],tools:{},balls:{},participants:[],awardedFoes:[],expNotices:[],encounter:{kind:'mystery',trainer:{name:'광대'}},mystery:{type:'clowning-around',stage:'confirm',selection:{job:'types'}}},staged=stageClowningAroundTypes(run);
 staged.combat=createClassicCombat(staged,[foe],{trainer:true});const restored=restoreClassicNativeBattle(JSON.parse(JSON.stringify(staged.combat)),JSON.parse(JSON.stringify(staged)));assert.deepEqual(restored.p1.pokemon[0].getTypes(),['Normal','Water']);
});
test('custom second type survives evolution and item form changes',async()=>{
 const {classicEvolutionOptions,evolveClassicPokemon}=await import('../lib/rogue-evolution.mjs');const {applyClassicForm}=await import('../lib/rogue-transformations.mjs');
 const eevee=makeReferenceMon(133,20,{boxId:'hero',rogueCustomSecondType:'물',rogueTypes:['노말','물'],types:['노말','물']}),run={id:'clown',rng:123,wave:31,biome:1,screen:'reward',party:[eevee],modifiers:[],pendingMoves:[],tools:{},evolutionItems:{firestone:1}},option=classicEvolutionOptions(eevee,run,{}).find(e=>e.sourceId===136);evolveClassicPokemon(run,{}, {boxId:'hero',evolutionKey:option.key});assert.deepEqual(run.party[0].rogueTypes,['불꽃','물']);assert.equal(run.party[0].rogueCustomSecondType,'물');assert.deepEqual(JSON.parse(JSON.stringify(run)).party[0].types,['불꽃','물']);
 const charizard=makeReferenceMon(6,50,{boxId:'dragon',rogueCustomSecondType:'물',rogueTypes:['불꽃','물'],types:['불꽃','물']}),formRun={formItems:{dragon:['charizarditex']},tools:{megaBracelet:true}},mega=applyClassicForm(charizard,formRun,'charizarditex');assert.deepEqual(mega.rogueTypes,['불꽃','물']);assert.equal(mega.rogueCustomSecondType,'물');assert.deepEqual(charizard.rogueTypes,['불꽃','물']);
 const duplicate=makeReferenceMon(133,20,{boxId:'duplicate',rogueCustomSecondType:'불꽃'}),same={...run,party:[duplicate],evolutionItems:{firestone:1}};evolveClassicPokemon(same,{}, {boxId:'duplicate',evolutionKey:classicEvolutionOptions(duplicate,same,{}).find(e=>e.sourceId===136).key});assert.deepEqual(same.party[0].rogueTypes,['불꽃']);assert.equal(same.party[0].rogueCustomSecondType,'불꽃');
});
