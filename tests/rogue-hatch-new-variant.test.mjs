import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {registerStarterCaught} from '../lib/rogue-starter-system.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {lapseClassicEggs,acknowledgeClassicHatch} from '../lib/rogue-egg-shop.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

test('new shiny variant is shown as new without changing legacy payout or other saves',async()=>{
 const doc={coins:1000,adventure:{sentinel:true}},state=ensureClassicState(doc,{initialStarterId:1}),system=state.system;state.slots[1]={sentinel:'other slot'};
 registerStarterCaught(system,makeReferenceMon(1,5,{boxId:'seen',shiny:true,variant:0}),{kind:'capture'});
 system.eggs=[1,1,0].map((variant,index)=>({id:`egg-${index}`,remainingWaves:1,productId:'common',paidPrice:12000,pokemon:makeReferenceMon(1,5,{boxId:`mon-${index}`,shiny:true,variant})}));
 const run={wave:10};lapseClassicEggs(doc,run);
 assert.deepEqual(system.pendingHatches.map(e=>e.duplicate),[false,true,true]);
 assert.deepEqual(system.pendingHatches.map(e=>e.refund),[3000,3000,3000]);
 assert.equal(doc.coins,10000);assert.equal(system.dex[1].shinyVariantMask&3,3);
 const restored=await decodeGameData(await encodeGameData(doc));assert.deepEqual(restored.adventure,{sentinel:true});assert.deepEqual(restored.classic.slots[1],{sentinel:'other slot'});
 const before=JSON.stringify(restored);lapseClassicEggs(restored,run);assert.equal(JSON.stringify(restored),before,'the same wave must not hatch or pay twice');
 acknowledgeClassicHatch(restored,'egg-0');assert.throws(()=>acknowledgeClassicHatch(restored,'egg-0'),/변경/);assert.equal(restored.coins,10000);
});

test('legacy shiny records without variant history retain their existing duplicate and payout behavior',()=>{
 const doc={coins:0},system=ensureClassicState(doc,{initialStarterId:1}).system;registerStarterCaught(system,makeReferenceMon(1,5,{boxId:'seen',shiny:true,variant:0}),{kind:'capture'});
 delete system.dex[1].shinyVariantMask;system.eggs=[{id:'legacy',remainingWaves:1,productId:'common',paidPrice:12000,pokemon:makeReferenceMon(1,5,{boxId:'mon',shiny:true,variant:1})}];
 lapseClassicEggs(doc,{wave:1});assert.equal(system.pendingHatches[0].duplicate,true);assert.equal(system.pendingHatches[0].refund,3000);assert.equal(doc.coins,3000);
});
