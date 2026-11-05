import test from 'node:test';
import assert from 'node:assert/strict';
import {salesmanFixture} from './fixtures/empty-reward-salesman.mjs';
import {applyClassicAction,activeClassicRun} from '../lib/rogue-classic-game.mjs';
import {classicCanContinueEmptyReward,classicCanLeaveReward} from '../lib/rogue-reward-continuation.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
for(const job of ['buy','leave'])test(`salesman ${job} completion and already-blocked saved reward can continue after reconnect`,async()=>{
 let {doc,run}=salesmanFixture();const money=run.money,price=run.mystery.offer.price;
 applyClassicAction(doc,{action:'mysterySelect',job,offerId:run.mystery.offer.pokemon.boxId});assert.equal(classicCanContinueEmptyReward(run),false);assert.throws(()=>applyClassicAction(doc,{action:'skipReward'}));
 doc=await decodeGameData(await encodeGameData(doc));applyClassicAction(doc,{action:'mysteryConfirm'});run=activeClassicRun(doc);assert.equal(run.screen,'reward');assert.deepEqual(run.rewards,[]);assert.equal(run.money,money-(job==='buy'?price:0));assert.equal(run.party.length,job==='buy'?2:1);
 // This is the existing saved shape: no new feature/version field is needed.
 doc=await decodeGameData(await encodeGameData(doc));run=activeClassicRun(doc);assert.equal(classicCanContinueEmptyReward(run),true);applyClassicAction(doc,{action:'skipReward'});run=activeClassicRun(doc);assert.equal(run.wave,24);assert.equal(run.screen,'battle');assert.equal(run.money,money-(job==='buy'?price:0));assert.deepEqual(doc.adventure,{safe:true});assert.deepEqual(doc.classic.slots[1],{id:'other',untouched:true});assert.equal(doc.coins,77);
});
test('full-party purchase must finish the capture choice before reward continuation',async()=>{
 let {doc,run}=salesmanFixture({fullParty:true});applyClassicAction(doc,{action:'mysterySelect',job:'buy',offerId:run.mystery.offer.pokemon.boxId});applyClassicAction(doc,{action:'mysteryConfirm'});assert.equal(run.screen,'capture');assert.equal(classicCanContinueEmptyReward(run),false);const pending=structuredClone(run.pendingCapture);assert.throws(()=>applyClassicAction(doc,{action:'skipReward'}));assert.deepEqual(run.pendingCapture,pending);assert.equal(run.party.length,6);
 doc=await decodeGameData(await encodeGameData(doc));applyClassicAction(doc,{action:'acceptCapture',replaceBoxId:'hero-0'});run=activeClassicRun(doc);assert.equal(classicCanContinueEmptyReward(run),true);applyClassicAction(doc,{action:'skipReward'});assert.equal(run.wave,24);assert.equal(run.party.length,6);
});
test('empty continuation is phase-based across event names and preserves pending decisions',()=>{
 for(const type of ['pokemon-salesman','fun-and-games','safari-zone','department-store','mysterious-chest','a-future-event',undefined])assert.equal(classicCanContinueEmptyReward({screen:'reward',rewards:[],mystery:{type,stage:'resolved'}}),true);
 assert.equal(classicCanContinueEmptyReward({screen:'reward',rewards:[],pendingGrowth:[{boxId:'hero-0',level:50}]}),false);assert.equal(classicCanContinueEmptyReward({screen:'reward',rewards:[{id:'potion'}]}),false);assert.equal(classicCanLeaveReward({screen:'reward',rewards:[{id:'potion'}]}),true);
 for(const pending of [{pendingCapture:{}},{pendingEvolution:{}},{pendingMysteryPreBattle:{}},{pendingSafariCatch:{}},{pendingMoves:[{boxId:'hero-0',move:'Water Gun',level:50}]},{npcDialogueQueue:[{}]},{mystery:{stage:'confirm'}}]){
  const {doc,run}=salesmanFixture();if(pending.pendingMoves)run.party[0].moves=['Tackle','Growl','Splash','Protect'];Object.assign(run,{screen:'reward',rewards:[]},pending);const before=structuredClone(run);assert.equal(classicCanContinueEmptyReward(run),false);assert.throws(()=>applyClassicAction(doc,{action:'skipReward'}));assert.equal(run.wave,23);for(const key of Object.keys(pending))assert.deepEqual(run[key],before[key]);
 }
});
