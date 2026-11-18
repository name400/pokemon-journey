import test from 'node:test';
import assert from 'node:assert/strict';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {applyClassicAction,classicGameView} from '../lib/rogue-classic-game.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture(){const doc={coins:99,adventure:{safe:true}},state=ensureClassicState(doc),run={id:'egg-block',wave:122,biome:4,screen:'mystery',party:[makeReferenceMon(151,50,{boxId:'hero',moves:['Splash']})],modifiers:[],tools:{},balls:{},money:1000,encounter:{kind:'mystery'},mystery:{type:'a-trainers-test',stage:'choose',trainerId:121},participants:[],awardedFoes:[],expNotices:[],pendingMoves:[],rewards:[]};state.slots[0]=run;state.system.vouchers={regular:1,plus:0,premium:0,golden:0};return doc;}
test('egg shop reports the same trainer-test restriction enforced by the action after save recovery',async()=>{
 const doc=fixture(),restored=await decodeGameData(await encodeGameData(doc));for(const selection of [null,{slot:1}]){restored.classic.selection=selection;const view=classicGameView(restored),before=structuredClone(restored);assert.match(view.eggShop.blockedReason,/트레이너의 시험/);assert.throws(()=>applyClassicAction(restored,{action:'drawEggs',machineId:'move',voucherType:'regular'}),/트레이너의 시험/);assert.deepEqual(restored,before);}
 restored.classic.selection=null;restored.classic.slots[0].mystery.stage='resolved';assert.equal(classicGameView(restored).eggShop.blockedReason,null);restored.classic.slots[0].screen='reward';assert.match(classicGameView(restored).eggShop.blockedReason,/웨이브 보상/);restored.classic.selection={slot:1};assert.equal(classicGameView(restored).eggShop.blockedReason,null);assert.deepEqual(restored.adventure,{safe:true});
});
