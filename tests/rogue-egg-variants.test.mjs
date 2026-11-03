import assert from 'node:assert/strict';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {drawClassicEggs,grantClassicVoucher,hatchClassicEgg} from '../lib/rogue-egg-shop.mjs';
import {supportsShinyVariants} from '../lib/rogue-wild-variants.mjs';
const document={coins:4321},state=ensureClassicState(document,{initialStarterId:1}),system=state.system;
const oldEgg={id:'old-egg',productId:'common',remainingWaves:8,pokemon:{id:1,rogueSourceId:1,shiny:false}};system.eggs=[oldEgg];
grantClassicVoucher(system,'regular');drawClassicEggs(document,{machineId:'shiny',voucherType:'regular'},()=>0);
const egg=system.eggs.find(e=>e.id!=='old-egg');assert.ok(egg.pokemon.shiny);assert.equal(egg.pokemon.variant,2);assert.ok(supportsShinyVariants(egg.pokemon.rogueSourceId));assert.deepEqual(system.eggs.find(e=>e.id==='old-egg'),oldEgg);assert.equal(document.coins,4321);
const sourceId=egg.pokemon.rogueSourceId;const loaded=JSON.parse(JSON.stringify(document)),result=hatchClassicEgg(loaded,egg.id);assert.equal(result.pokemon.variant,2);assert.equal(ensureClassicState(loaded).system.dex[sourceId].shinyVariantMask,4);assert.equal(ensureClassicState(loaded).system.eggs[0].id,'old-egg');
console.log('Gacha red shiny variant, compatible species, old eggs and serialized hatch registration passed.');
for(const [roll,variant] of [[.1,1],[.4,0]]){
 const next={},s=ensureClassicState(next,{initialStarterId:1}).system;grantClassicVoucher(s,'regular');let calls=0;const rng=()=>++calls===1?0:calls===2?roll:.2;
 drawClassicEggs(next,{machineId:'move',voucherType:'regular'},rng);const selected=s.eggs[0].pokemon;assert.equal(selected.variant,variant);if(variant)assert.ok(supportsShinyVariants(selected.rogueSourceId));
}
