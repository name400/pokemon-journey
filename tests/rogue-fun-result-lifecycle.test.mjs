import test from 'node:test';
import assert from 'node:assert/strict';
import {resolvedFunFixture,leaveFunResult} from './fixtures/fun-result-lifecycle.mjs';
import {applyClassicAction,activeClassicRun,classicGameView} from '../lib/rogue-classic-game.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
for(const outcome of ['none','lens','knockout'])test(`completed Wobbuffet ${outcome} result survives reconnect but expires before the next normal reward`,async()=>{
 let doc=await resolvedFunFixture(outcome),run=activeClassicRun(doc);assert.equal(run.screen,'reward');assert.equal(run.mystery.stage,'resolved');assert.equal(run.mystery.prize,outcome==='none'?null:outcome==='lens'?'widelens':'knockout');
 const mystery=structuredClone(run.mystery),rewards=structuredClone(run.rewards),money=run.money;doc=await decodeGameData(await encodeGameData(doc));run=activeClassicRun(doc);assert.deepEqual(run.mystery,mystery);assert.deepEqual(run.rewards,rewards);assert.equal(classicGameView(doc).run.encounter.key,'fun-and-games');
 assert.equal(doc.coins,99);run=leaveFunResult(doc);assert.equal(run.wave,23);assert.equal(run.encounter.kind,'wild');assert.equal(run.screen,'battle');assert.equal(run.mystery,undefined);assert.equal(run.money,money);if(outcome==='lens')assert.equal(run.modifiers.find(row=>row.id==='widelens').count,1);
 // Keep the real next-encounter transition; choose a tiny synthetic ordinary
 // opponent to deterministically exercise the normal victory/reward pipeline.
 run.initialSwitchSlots=[];run.combat=createClassicCombat(run,[makeReferenceMon(19,1,{boxId:'ordinary-foe',moves:['Splash']})]);run.party=run.combat.teams[0];
 doc=await decodeGameData(await encodeGameData(doc));applyClassicAction(doc,{action:'turn',command:{type:'move',move:'seismictoss'}});run=activeClassicRun(doc);assert.equal(run.screen,'reward');assert.equal(run.rewards.length,3);assert.equal(run.mystery,undefined);
 doc=await decodeGameData(await encodeGameData(doc));assert.equal(classicGameView(doc).run.rewards.length,3);assert.equal(activeClassicRun(doc).mystery,undefined);assert.deepEqual(doc.classic.slots[1],{id:'other',untouched:true});assert.deepEqual(doc.adventure,{safe:true});assert.ok(doc.coins>99,'ordinary battle still awards its normal coins');
});
test('starting a new encounter does not discard another event record',async()=>{
 const doc=await resolvedFunFixture();let run=activeClassicRun(doc);run.mystery={type:'field-trip',stage:'resolved',correct:false,marker:'preserve-other-event'};const before=structuredClone(run.mystery);run=leaveFunResult(doc);assert.equal(run.screen,'battle');assert.deepEqual(run.mystery,before);
});
