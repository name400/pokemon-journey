import test from 'node:test';
import assert from 'node:assert/strict';
import {classicEvolutionOptions,evolveClassicPokemon} from '../lib/rogue-evolution.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {evolutionOptions} from '../lib/evolution.mjs';
import {makeMon} from '../lib/game.mjs';
import {calculateStats} from '../lib/pokemon-config.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
import {previewClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';

test('Toxel evolution uses original nature, not mint stat nature, after restore',async()=>{
 for(const [nature,mint,expected] of [['hardy','modest',0],['modest','adamant',1],['adamant','modest',0],['timid','adamant',1],[undefined,'modest',0]]){
  const mon={...makeReferenceMon(848,30),boxId:'hero',rogueNatureOverride:mint};if(nature===undefined)delete mon.nature;else mon.nature=nature;
  const run={id:'mint-form',screen:'reward',wave:30,biome:1,rng:42,party:[mon],modifiers:[],tools:{},encounter:{kind:'wild'},participants:[],awardedFoes:[],evolutionItems:{},balls:{},pendingMoves:[],pendingGrowth:[]};
  const restored=(await decodeGameData(await encodeGameData({run}))).run,p=restored.party[0],options=classicEvolutionOptions(p,restored,{}),ready=options.filter(o=>o.ready);
  assert.deepEqual(ready.map(o=>o.formIndex),[expected],`${nature}/${mint}`);assert.deepEqual(calculateStats(p),calculateStats({...p,nature:mint,rogueNatureOverride:undefined}));
  const evolved=evolveClassicPokemon(restored,{}, {boxId:'hero',evolutionKey:ready[0].key}).after;assert.equal(evolved.rogueFormIndex,expected);assert.equal(evolved.rogueNatureOverride,mint);assert.equal(evolved.nature,nature??'hardy');
 }
});

test('cloud adventure evolution also ignores mint for form and retains its stat modifier',()=>{
 for(const [nature,mint,id] of [['hardy','modest',849],['modest','adamant',10184]]){
  const mon={...makeMon(848,30),nature,rogueNatureOverride:mint},opts=evolutionOptions(mon,{adventureEngine:'cloud'},[mon],{});assert.deepEqual(opts.filter(o=>o.ready).map(o=>o.id),[id]);assert.deepEqual(calculateStats(mon),calculateStats({...mon,nature:mint,rogueNatureOverride:undefined}));
 }
});

test('fusion evolution uses the fused original nature despite a mint override',()=>{
 const primary={...makeReferenceMon(151,30),boxId:'primary',nature:'hardy',rogueNatureOverride:'modest'},donor={...makeReferenceMon(848,30),boxId:'donor',nature:'modest'};
 const fused=previewClassicDnaFusion(primary,donor,{random:()=>0}).fused,run={wave:30,biome:1,party:[fused],modifiers:[],evolutionItems:{},pendingMoves:[]};
 const options=classicEvolutionOptions(fused,run,{}).filter(o=>o.fusion);assert.deepEqual(options.filter(o=>o.ready).map(o=>o.formIndex),[0]);
});
