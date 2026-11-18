import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {classicGameView} from '../lib/rogue-classic-game.mjs';
import {CLASSIC_REWARD_REGISTRY,classicRewardView,chooseClassicReward} from '../lib/rogue-classic-rewards.mjs';
import {classicServices,buyClassicService} from '../lib/rogue-classic-services.mjs';
import {classicDisplayPokemonName} from '../lib/rogue-display-name.mjs';
import {classicLegacyNameView} from '../lib/rogue-legacy-name-view.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
import {classicEvolutionOptions,evolveClassicPokemon} from '../lib/rogue-evolution.mjs';

test('legacy names preserve a nickname when verified species identifies a different base name',async()=>{
 const doc={coins:25,adventure:{safe:true}},state=ensureClassicState(doc),mon=makeReferenceMon(54,20,{boxId:'legacy',moves:['Tackle']});delete mon.baseName;delete mon.nickname;mon.name='별명 · Normal';mon.hp=1;
 state.slots[0]={id:'legacy-name',wave:21,biome:1,screen:'reward',party:[mon],modifiers:[],tools:{},balls:{},money:10000,encounter:{kind:'wild'},participants:[],awardedFoes:[],expNotices:[],pendingMoves:[],rewards:[{...CLASSIC_REWARD_REGISTRY.find(r=>r.id==='rarecandy'),rewardId:'rare'}]};
 let restored=await decodeGameData(await encodeGameData(doc));classicGameView(restored);const before=structuredClone(restored),run=restored.classic.slots[0],party=classicGameView(restored).run.party[0],reward=classicRewardView(run,{})[0].targets[0],service=classicServices(run).find(s=>s.id==='potion').targets[0];
 for(const target of [party,reward,service])assert.equal(classicDisplayPokemonName(target),'별명 · Normal');assert.deepEqual(restored,before);assert.equal(Object.hasOwn(run.party[0],'baseName'),false);assert.deepEqual(restored.adventure,{safe:true});
 const potion=classicServices(run).find(s=>s.id==='potion');buyClassicService(run,{itemId:'potion',boxId:'legacy',expectedPrice:potion.price});chooseClassicReward(run,{rewardId:'rare',boxId:'legacy'},{});restored=await decodeGameData(await encodeGameData(restored));assert.equal(restored.classic.slots[0].party[0].name,'별명 · Normal');assert.equal(Object.hasOwn(restored.classic.slots[0].party[0],'baseName'),false);assert.deepEqual(restored.adventure,{safe:true});
});

test('ambiguous, conflicting, fused and explicitly named identities are not enriched',()=>{
 const base=makeReferenceMon(54,20,{boxId:'legacy',moves:['Tackle']});delete base.baseName;base.name='별명 · Normal';for(const mon of [{...base,rogueSourceId:25},{...base,id:25},{...base,speciesId:25},{...base,speciesId:'25'},{...base,rogueSourceId:undefined},{...base,fusionSpecies:25},{...base,baseName:'다른 이름'},{...base,nickname:'명시적 별명'}]){const before=structuredClone(mon);assert.equal(classicLegacyNameView(mon),mon);assert.deepEqual(mon,before);}
});

test('verified legacy nickname is not replaced by the species name when evolving',async()=>{
 const mon=makeReferenceMon(54,33,{boxId:'legacy-evolve',moves:['Tackle']});delete mon.baseName;delete mon.nickname;mon.name='별명 · Normal';const run={id:'legacy-evolve',wave:40,screen:'reward',party:[mon],modifiers:[],tools:{},evolutionItems:{},balls:{},pendingMoves:[],challenges:[]},choice=classicEvolutionOptions(mon,run,{}).find(option=>option.ready);assert.ok(choice);const result=evolveClassicPokemon(run,{}, {boxId:mon.boxId,evolutionKey:choice.key});assert.equal(result.after.name,'별명 · Normal');assert.equal(result.after.baseName,'골덕');const saved=await decodeGameData(await encodeGameData({run,other:{safe:true}}));assert.equal(saved.run.party[0].name,'별명 · Normal');assert.deepEqual(saved.other,{safe:true});
});
test('an ambiguous species-prefixed form name retains the previous evolution behavior',()=>{const mon=makeReferenceMon(54,33,{boxId:'ambiguous-evolve',moves:['Tackle']});delete mon.baseName;mon.name='고라파덕 · 알 수 없는 모습';const run={wave:40,screen:'reward',party:[mon],modifiers:[],tools:{},evolutionItems:{},balls:{},pendingMoves:[],challenges:[]},choice=classicEvolutionOptions(mon,run,{}).find(option=>option.ready);assert.equal(evolveClassicPokemon(run,{}, {boxId:mon.boxId,evolutionKey:choice.key}).after.name,'골덕');});
test('verified legacy nickname survives manual and automatic evolution commands',async()=>{
 const {recordClassicLevelGrowth}=await import('../lib/rogue-classic-growth.mjs'),{applyClassicAction}=await import('../lib/rogue-classic-game.mjs');for(const automatic of [false,true]){const doc={coins:9,adventure:{safe:true}},state=ensureClassicState(doc),mon=makeReferenceMon(1,16,{boxId:'legacy-evolve-action',moves:['Tackle']});delete mon.baseName;mon.name='별명 · Normal';const run={id:'legacy-evolve-action',seed:'legacy-evolve-action',wave:21,biome:1,rng:42,screen:'reward',party:[mon],balls:{pokeball:5},money:1000,modifiers:[],tools:{},encounter:{kind:'wild'},participants:[],awardedFoes:[],expNotices:[],pendingMoves:[],pendingGrowth:[],rewards:[],rerolls:0};state.slots[0]=run;state.slots[1]={keep:true};if(automatic){recordClassicLevelGrowth(run,mon,[16],[]);assert.equal(classicGameView(doc).run.screen,'evolution');applyClassicAction(doc,{action:'resolveEvolution',decision:'evolve'});}else{const option=classicEvolutionOptions(mon,run,state.system).find(e=>e.sourceId===2&&e.ready);applyClassicAction(doc,{action:'evolve',boxId:mon.boxId,evolutionKey:option.key});}const saved=await decodeGameData(await encodeGameData(doc));assert.equal(saved.classic.slots[0].party[0].name,'별명 · Normal');assert.equal(saved.classic.slots[0].party[0].baseName,'이상해풀');assert.deepEqual(saved.classic.slots[1],{keep:true});assert.deepEqual(saved.adventure,{safe:true});}
});
