import assert from 'node:assert/strict';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {buyClassicSpeciesEgg,hatchClassicEgg,lapseClassicEggs} from '../lib/rogue-egg-shop.mjs';
import {starterProgress,SAME_SPECIES_EGG_COSTS} from '../lib/rogue-starter-system.mjs';
const document={coins:5678,inventory:{masterball:3},world:{safe:true}},system=ensureClassicState(document,{initialStarterId:1}).system,p=starterProgress(system,1),cost=SAME_SPECIES_EGG_COSTS[2];p.candies=cost*3;
assert.throws(()=>buyClassicSpeciesEgg(document,{sourceId:4,expectedCost:cost}),/해금/);assert.throws(()=>buyClassicSpeciesEgg(document,{sourceId:1,expectedCost:cost-1}),/비용/);assert.equal(p.candies,cost*3);
const old={id:'old',remainingWaves:5,pokemon:{id:4}};system.eggs=[old];const egg=buyClassicSpeciesEgg(document,{sourceId:1,expectedCost:cost},()=>.99);assert.equal(p.candies,cost*2);assert.equal(document.coins,5678);assert.deepEqual(document.world,{safe:true});assert.deepEqual(system.eggs[0],old);
const chosen=system.eggs.find(e=>e.id===egg.eggId);assert.equal(chosen.pokemon.rogueSourceId,1);assert.equal(chosen.remainingWaves,10);assert.equal(chosen.paidPrice,0);
p.sameSpeciesEggPity=[20,0];const forced=buyClassicSpeciesEgg(document,{sourceId:1,expectedCost:cost},()=>.99);assert.equal(system.eggs.find(e=>e.id===forced.eggId).pokemon.shiny,true);assert.equal(p.sameSpeciesEggPity[0],0);
const result=hatchClassicEgg(document,egg.eggId);assert.equal(result.refund,0);assert.equal(document.coins,5678);assert.throws(()=>hatchClassicEgg(document,egg.eggId),/부화/);
const before=p.candies;system.eggs=Array.from({length:99},(_,i)=>({id:String(i)}));assert.throws(()=>buyClassicSpeciesEgg(document,{sourceId:1,expectedCost:cost}),/99개/);assert.equal(p.candies,before);
console.log('Species candy eggs: validation, spending, legacy preservation, shiny pity, hatch and capacity passed.');
const {applyClassicAction,classicGameView}=await import('../lib/rogue-classic-game.mjs');
const viaAction={coins:101,world:{marker:1}},meta=ensureClassicState(viaAction,{initialStarterId:1}).system;starterProgress(meta,1).candies=cost;
assert.throws(()=>applyClassicAction(viaAction,{action:'buySpeciesEgg',sourceId:1,expectedCost:cost}),/선택 중/);
applyClassicAction(viaAction,{action:'prepare',slot:0});applyClassicAction(viaAction,{action:'buySpeciesEgg',sourceId:1,expectedCost:cost});
assert.equal(starterProgress(meta,1).candies,0);assert.equal(meta.eggs.length,1);assert.equal(classicGameView(viaAction).eggShop.eggs.length,1);assert.deepEqual(viaAction.world,{marker:1});
const pityDoc={},pitySys=ensureClassicState(pityDoc,{initialStarterId:1}).system,pityProgress=starterProgress(pitySys,1);pityProgress.candies=cost;pityProgress.sameSpeciesEggPity=[0,10];
pityProgress.candies=cost*2;const pityEgg=buyClassicSpeciesEgg(pityDoc,{sourceId:1,expectedCost:cost},()=>.99);assert.equal(pitySys.eggs.find(e=>e.id===pityEgg.eggId).pokemon.shiny,false);assert.equal(pitySys.eggs.find(e=>e.id===pityEgg.eggId).pokemon.variant,0);assert.equal(pityProgress.sameSpeciesEggPity[1],10);const stored=JSON.parse(JSON.stringify(pityDoc)),storedSystem=ensureClassicState(stored).system,storedProgress=starterProgress(storedSystem,1);const shinyEgg=buyClassicSpeciesEgg(stored,{sourceId:1,expectedCost:cost},()=>0);assert.equal(storedSystem.eggs.find(e=>e.id===shinyEgg.eggId).pokemon.shiny,true);assert.equal(storedSystem.eggs.find(e=>e.id===shinyEgg.eggId).pokemon.variant,2);assert.equal(storedProgress.sameSpeciesEggPity[1],0);hatchClassicEgg(stored,shinyEgg.eggId);assert.ok(storedSystem.dex[1].shinyVariantMask&4);
const hatchDoc={coins:12},hatchSys=ensureClassicState(hatchDoc,{initialStarterId:1}).system;starterProgress(hatchSys,1).candies=cost;
const timed=buyClassicSpeciesEgg(hatchDoc,{sourceId:1,expectedCost:cost},()=>.99),hatchRun={wave:1};
for(let wave=1;wave<=10;wave++){hatchRun.wave=wave;lapseClassicEggs(hatchDoc,hatchRun);lapseClassicEggs(hatchDoc,hatchRun);}
assert.equal(hatchSys.eggs.length,0);assert.equal(hatchSys.pendingHatches.length,1);assert.equal(hatchSys.pendingHatches[0].id,timed.eggId);assert.equal(hatchDoc.coins,12);
// Previously saved non-shiny eggs with a spurious variant remain intact and do not suppress the guarantee.
{const doc={},sys=ensureClassicState(doc,{initialStarterId:1}).system,progress=starterProgress(sys,1);progress.candies=cost;progress.sameSpeciesEggPity=[0,10];const legacy={id:'legacy-nonshiny',productId:'common',remainingWaves:5,pokemon:{rogueSourceId:1,shiny:false,variant:2}};sys.eggs=[legacy];const granted=buyClassicSpeciesEgg(doc,{sourceId:1,expectedCost:cost},()=>0),egg=sys.eggs.find(e=>e.id===granted.eggId);assert.deepEqual(sys.eggs[0],legacy);assert.equal(egg.pokemon.shiny,true);assert.equal(egg.pokemon.variant,2);assert.equal(progress.sameSpeciesEggPity[1],0);}
