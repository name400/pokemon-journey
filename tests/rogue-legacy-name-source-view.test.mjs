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
