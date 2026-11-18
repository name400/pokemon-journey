import test from 'node:test';
import assert from 'node:assert/strict';
import {classicVoucherRewardNotice} from '../lib/rogue-presentation.mjs';
import {classicGameView} from '../lib/rogue-classic-game.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

test('empty slot has no voucher notice and remains unchanged across reload',async()=>{
 const doc={coins:42,adventure:{keep:true}},view=classicGameView(doc);
 assert.equal(view.run,null);
 const before=structuredClone(doc);
 assert.equal(classicVoucherRewardNotice(view.run),null);
 assert.deepEqual(doc,before);
 const saved=await decodeGameData(await encodeGameData(doc));
 assert.equal(classicVoucherRewardNotice(classicGameView(saved).run),null);
 assert.deepEqual(saved.adventure,{keep:true});
});

test('voucher notice appears only for an existing reward on the current wave',()=>{
 assert.equal(classicVoucherRewardNotice({wave:25}),null);
 assert.equal(classicVoucherRewardNotice({wave:26,lastVoucherReward:{wave:25,name:'알 교환권'}}),null);
 assert.deepEqual(classicVoucherRewardNotice({wave:25,lastVoucherReward:{wave:25,name:'알 교환권'}}),{wave:25,name:'알 교환권'});
});
