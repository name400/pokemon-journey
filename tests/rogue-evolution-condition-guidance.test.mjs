import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {classicEvolutionOptions} from '../lib/rogue-evolution.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {classicGameView} from '../lib/rogue-classic-game.mjs';

test('weather evolution explains all accepted weather without changing eligibility or saved data',async()=>{
 const mon=makeReferenceMon(705,50,{boxId:'weather-guidance'}),run={id:'weather-guidance',wave:100,biome:1,weather:'sunnyday',screen:'reward',party:[mon],modifiers:[],evolutionItems:{}};
 const saved=JSON.stringify(run),options=()=>classicEvolutionOptions(mon,run,{}).find(e=>e.sourceId===706),condition=()=>options().conditions.find(c=>c.label.startsWith('날씨:'));
 assert.equal(condition().label,'날씨: 비 · 안개 · 큰비');assert.equal(condition().met,false);assert.equal(JSON.stringify(run),saved);
 for(const weather of ['raindance','fog','primordialsea']){run.weather=weather;assert.equal(condition().met,true,weather);}
 run.weather='sunnyday';const restored=(await decodeGameData(await encodeGameData({run,other:{keep:true}})));assert.deepEqual(restored.other,{keep:true});assert.equal(classicEvolutionOptions(restored.run.party[0],restored.run,{}).find(e=>e.sourceId===706).conditions.find(c=>c.label.startsWith('날씨:')).met,false);
});

test('form evolution identifies its acceptable biomes and follows the current saved location',async()=>{
 const mon=makeReferenceMon(868,50,{boxId:'form-guidance'}),run={id:'form-guidance',wave:50,biome:1,screen:'reward',party:[mon],modifiers:[],evolutionItems:{}};
 const find=()=>classicEvolutionOptions(mon,run,{}).filter(e=>e.sourceId===869),options=find(),first=options.find(e=>e.conditions.some(c=>c.label==='바이옴: 마을 · 평야 · 풀숲 · 높은 풀숲 · 대도시'));
 assert.ok(first);assert.equal(first.conditions.find(c=>c.label.startsWith('바이옴:')).met,true);assert.ok(options.some(e=>e.conditions.some(c=>c.label==='바이옴: 숲 · 늪지 · 목초지 · 정글'&&!c.met)));
 run.biome=5;const decoded=await decodeGameData(await encodeGameData({run,unrelated:{safe:true}})),after=classicEvolutionOptions(decoded.run.party[0],decoded.run,{}).filter(e=>e.sourceId===869);assert.deepEqual(decoded.unrelated,{safe:true});assert.equal(after.find(e=>e.key===first.key).conditions.find(c=>c.label.startsWith('바이옴:')).met,false);assert.ok(after.some(e=>e.conditions.some(c=>c.label==='바이옴: 숲 · 늪지 · 목초지 · 정글'&&c.met)));
});

test('party view exposes the specific guidance after save recovery',async()=>{
 const doc={coins:0,collection:[],adventure:{keep:true}},state=ensureClassicState(doc),mon=makeReferenceMon(705,50,{boxId:'view-guidance'});
 state.slots[0]={id:'view-guidance',seed:'view-guidance',wave:21,biome:1,weather:'sunnyday',rng:42,screen:'reward',party:[mon],balls:{pokeball:5},money:1000,modifiers:[],tools:{},encounter:{kind:'wild'},participants:[],awardedFoes:[],expNotices:[],pendingMoves:[],rewards:[],rerolls:0};
 const restored=await decodeGameData(await encodeGameData(doc)),option=classicGameView(restored).run.party[0].evolutions.find(e=>e.sourceId===706);
 assert.deepEqual(option.conditions.find(c=>c.label.startsWith('날씨:')),{met:false,label:'날씨: 비 · 안개 · 큰비'});assert.deepEqual(restored.adventure,{keep:true});
});
