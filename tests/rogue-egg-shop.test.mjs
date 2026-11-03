import assert from 'node:assert/strict';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {registerStarterCaught} from '../lib/rogue-starter-system.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {eggShopView,grantClassicVoucher,drawClassicEggs,hatchClassicEgg} from '../lib/rogue-egg-shop.mjs';

const document={coins:1000000,collection:[]},system=ensureClassicState(document,{initialStarterId:1}).system;
grantClassicVoucher(system,'regular');
const draw=drawClassicEggs(document,{machineId:'move',voucherType:'regular'},()=>.2);
assert.equal(draw.count,1);assert.equal(document.coins,1000000);assert.equal(eggShopView(document).vouchers.regular,0);
assert.equal(eggShopView(document).eggs[0].pokemon,undefined);
assert.throws(()=>drawClassicEggs(document,{machineId:'move',voucherType:'regular'},()=>.2),/부족/);
// Voucher eggs preserve the explicit duplicate refund rule.
const egg=system.eggs[0];egg.pokemon=makeReferenceMon(1,5,{boxId:'duplicate',shiny:false});
registerStarterCaught(system,egg.pokemon,{kind:'capture'});
const before=document.coins,result=hatchClassicEgg(document,egg.id);
assert.equal(result.duplicate,true);assert.equal(result.refund,3000);assert.equal(document.coins,before+3000);
assert.throws(()=>hatchClassicEgg(document,egg.id),/부화/);assert.equal(document.coins,before+3000);
console.log('Voucher spend, hidden contents, duplicate refund and replay guard passed.');

const legacy={id:'legacy-paid',productId:'rare',paidPrice:48000,pokemon:makeReferenceMon(1,5,{boxId:'legacy-mon',shiny:false})};system.eggs.push(legacy);const prior=document.coins;assert.equal(hatchClassicEgg(document,legacy.id).refund,12000);assert.equal(document.coins,prior+12000);
