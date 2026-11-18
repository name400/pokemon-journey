import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {classicEvolutionOptions,classicEvolutionItemCandidates} from '../lib/rogue-evolution.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {classicGameView} from '../lib/rogue-classic-game.mjs';
import {classicEvolutionOptionName} from '../lib/rogue-form-label.mjs';

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

test('nature-dependent evolution guidance identifies the original nature even after a mint and save recovery',async()=>{
 for(const [nature,mint,label,met] of [['timid','adamant','겁쟁이',true],['adamant','timid','고집',false]]){
  const doc={coins:0,collection:[],adventure:{keep:true}},state=ensureClassicState(doc),mon={...makeReferenceMon(848,30,{boxId:'nature-guidance'}),nature,rogueNatureOverride:mint};
  state.slots[0]={id:'nature-guidance',seed:'nature-guidance',wave:30,biome:1,weather:'',rng:42,screen:'reward',party:[mon],balls:{pokeball:5},money:1000,modifiers:[],tools:{},encounter:{kind:'wild'},participants:[],awardedFoes:[],expNotices:[],pendingMoves:[],rewards:[],rerolls:0};
  const before=JSON.stringify(doc),decoded=await decodeGameData(await encodeGameData(doc)),option=classicGameView(decoded).run.party[0].evolutions.find(e=>e.sourceId===849&&e.formIndex===1);
  assert.deepEqual(option.conditions.find(c=>c.label.startsWith('진화 폼에 맞는 원래 성격')),{met,label:`진화 폼에 맞는 원래 성격 (현재: ${label})`});
  assert.equal(JSON.stringify(doc),before);assert.equal(decoded.classic.slots[0].party[0].nature,nature);assert.equal(decoded.classic.slots[0].party[0].rogueNatureOverride,mint);assert.deepEqual(decoded.adventure,{keep:true});
 }
});

test('evolution items show their Korean names while retaining their saved IDs',async()=>{
 for(const [species,item,label] of [[64,'linkingcord','연결의끈'],[891,'scrollofwaters','물의 족자'],[891,'scrollofdarkness','악의 족자']]){
  const mon=makeReferenceMon(species,50,{boxId:`mon-${item}`}),run={id:'item-guidance',wave:50,biome:1,screen:'reward',party:[mon],modifiers:[],evolutionItems:{}};
  const option=()=>classicEvolutionOptions(mon,run,{}).find(e=>e.item===item);assert.ok(option(),item);assert.deepEqual(option().conditions.find(c=>c.label.endsWith(' 1개')),{met:false,label:`${label} 1개`});
  assert.ok(classicEvolutionItemCandidates(run,{}, {rare:option().sourceItem>=51}).some(c=>c.item===item&&c.name===label));run.evolutionItems[item]=1;assert.equal(option().conditions.find(c=>c.label===`${label} 1개`).met,true);
  const restored=await decodeGameData(await encodeGameData({run,other:{keep:true}}));assert.equal(restored.run.evolutionItems[item],1);assert.deepEqual(restored.other,{keep:true});
 }
});

test('evolution choice names are localized for display without changing evolution options or the save',async()=>{
 const mon=makeReferenceMon(868,50,{boxId:'cream-guidance'}),run={id:'cream-guidance',wave:50,biome:1,screen:'reward',party:[mon],modifiers:[],evolutionItems:{}};
 const before=JSON.stringify(run),options=classicEvolutionOptions(mon,run,{}).filter(e=>e.sourceId===869),ruby=options.find(e=>e.name==='마휘핑 · Ruby Cream');assert.ok(ruby);assert.equal(classicEvolutionOptionName(ruby.name),'마휘핑 · 루비크림');assert.equal(classicEvolutionOptionName('마휘핑 · Ruby Cream (두 번째)'),'마휘핑 · 루비크림 (두 번째)');assert.equal(classicEvolutionOptionName('별명 · Ruby Cream 친구'),'별명 · Ruby Cream 친구');assert.equal(JSON.stringify(run),before);
 const restored=await decodeGameData(await encodeGameData({run,other:{keep:true}}));assert.equal(classicEvolutionOptions(restored.run.party[0],restored.run,{}).find(e=>e.key===ruby.key).name,ruby.name);assert.deepEqual(restored.other,{keep:true});
});
