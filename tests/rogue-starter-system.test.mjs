import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {ROGUE_REFERENCE_COVERAGE,DEFAULT_STARTER_IDS} from '../lib/rogue-reference.mjs';
import {ensureStarterSystem,starterCatalog,buildStarterParty,registerStarterCaught,starterDexEntry,starterProgress,reduceStarterCost} from '../lib/rogue-starter-system.mjs';
const system={initialStarterId:1};ensureStarterSystem(system);let list=starterCatalog(system);
assert.equal(ROGUE_REFERENCE_COVERAGE.unmapped.length,0);assert.equal(new Set(list.map(p=>p.sourceId)).size,572);
assert.equal(list.filter(p=>p.unlocked).length,1);
for(const id of DEFAULT_STARTER_IDS){const p=list.find(p=>p.id===id);assert.equal(p.unlocked,id===1);assert.ok(p.abilities.length);assert.ok(p.moves.length);assert.deepEqual(Object.values(p.ivs),Array(6).fill(id===1?15:0));}
for(const id of [4,7,255,656,728])registerStarterCaught(system,makeMon(id,5),{kind:'admin',increment:false});list=starterCatalog(system);
const choose=id=>{const p=list.find(p=>p.id===id);return {id:p.id,ability:p.abilities[0].key,nature:p.natures[0].key,gender:p.genders[0],shiny:false,moves:p.defaultMoves};};
const started=buildStarterParty(system,[choose(1),choose(4),choose(7)]);assert.equal(started.cost,9);assert.equal(started.party.length,3);
assert.ok(started.party.every(p=>p.level===5&&Object.values(p.evs).every(v=>v===0)&&p.item===''));
assert.throws(()=>buildStarterParty(system,[choose(1),choose(1)]),/중복/);
assert.throws(()=>buildStarterParty(system,[choose(255),choose(656),choose(728)]),/10점/);
assert.throws(()=>buildStarterParty(system,[{...choose(1),id:150}]),/해금/);
assert.throws(()=>buildStarterParty(system,[{...choose(1),ability:'wonderguard'}]),/해금/);
assert.throws(()=>buildStarterParty(system,[{...choose(1),shiny:true}]),/해금/);
assert.throws(()=>buildStarterParty(system,[{...choose(1),moves:['파괴광선']}]),/기술/);
const tampered=buildStarterParty(system,[{...choose(1),level:100,ivs:{hp:31},evs:{atk:252},item:'leftovers'}]).party[0];
assert.equal(tampered.level,5);assert.equal(tampered.ivs.hp,15);assert.equal(tampered.evs.atk,0);assert.equal(tampered.item,'');
const oldHp=started.party[0].maxHp;
registerStarterCaught(system,{...makeMon(1,30),ivs:{hp:31,atk:9,def:20,spa:15,spd:30,spe:4},nature:'jolly',gender:'F',shiny:true},{kind:'capture'});
assert.equal(starterDexEntry(system,1).ivs.hp,31);assert.equal(starterDexEntry(system,1).ivs.atk,15);assert.equal(starterProgress(system,1).candies,5);
assert.equal(started.party[0].ivs.hp,15);assert.equal(started.party[0].maxHp,oldHp,'Meta IV upgrades must not modify the running party');
registerStarterCaught(system,{...makeMon(26,30),ivs:{hp:30,atk:22,def:13,spa:20,spd:25,spe:31},nature:'timid',gender:'F'},{kind:'capture'});
assert.equal(starterDexEntry(system,26).caught,true);assert.equal(starterDexEntry(system,25).caught,true);assert.equal(starterDexEntry(system,172).caught,true);
assert.equal(starterDexEntry(system,26).ivs.hp,0);assert.equal(starterDexEntry(system,25).ivs.hp,30);assert.equal(starterDexEntry(system,172).ivs.hp,30);
assert.equal(starterProgress(system,172).candies,1);
starterProgress(system,1).candies=70;assert.equal(reduceStarterCost(system,1).cost,2);assert.equal(reduceStarterCost(system,1).cost,1);assert.equal(starterProgress(system,1).candies,0);assert.throws(()=>reduceStarterCost(system,1),/二|두 번/);
console.log('Pinned 572 starter species, one random default starter/IV15, 6-slot/10-point server validation, fresh-run levels/items, IV inheritance and candy cost reductions: passed');
// Pikachu is selectable even with a pre-evolution and spends its own candies;
// existing Pichu candies and other saved starter data are not migrated or reset.
const pikachu=starterProgress(system,25),pichu=starterProgress(system,172);pikachu.candies=15;pichu.candies=100;let pikachuView=starterCatalog(system).find(p=>p.sourceId===25&&p.formIndex===0);assert.equal(pikachuView.reductionCost,15);assert.equal(pikachuView.reductionCandies,15);assert.deepEqual(reduceStarterCost(system,25),{spent:15,cost:3});assert.equal(pichu.candies,100);assert.equal(pikachu.candies,0);assert.equal(pikachu.costReduction,1);assert.equal(starterCatalog(system).find(p=>p.sourceId===25&&p.formIndex===0).cost,3);
// Friendship candy is credited to selectable Pikachu, without changing Pichu.
const {addClassicFriendship}=await import('../lib/rogue-classic-growth.mjs');const pikaMon=makeMon(25,5);addClassicFriendship(pikaMon,34,system);assert.equal(pikachu.candies,1);assert.equal(pichu.candies,100);
const {buyClassicSpeciesEgg}=await import('../lib/rogue-egg-gacha.mjs');const {ensureClassicState}=await import('../lib/rogue-classic-state.mjs');const candyDoc={coins:0,collection:[],classic:{schema:3,sourceVersion:'test',activeSlot:0,slots:Array(5).fill(null),system,selection:null,history:[]}};ensureClassicState(candyDoc);pikachu.candies=12;assert.equal(buyClassicSpeciesEgg(candyDoc,{sourceId:25,expectedCost:12},()=>.5).spent,12);assert.equal(pikachu.candies,0);assert.equal(pichu.candies,100);
const {unlockStarterPassive}=await import('../lib/rogue-starter-system.mjs');pikachu.candies=30;unlockStarterPassive(system,25,30);assert.equal(pikachu.candies,0);assert.equal(pikachu.passiveUnlocked,true);assert.equal(pichu.candies,100);
