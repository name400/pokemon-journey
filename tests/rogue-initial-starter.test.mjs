import assert from 'node:assert/strict';
import {DEFAULT_STARTER_IDS} from '../lib/rogue-reference.mjs';
import {ensureStarterSystem,starterCatalog,registerStarterCaught} from '../lib/rogue-starter-system.mjs';
import {makeMon} from '../lib/game.mjs';
const a=ensureStarterSystem({},[],{seed:'player-a'}),again=ensureStarterSystem({},[],{seed:'player-a'}),b=ensureStarterSystem({},[],{seed:'player-b'});
assert.ok(DEFAULT_STARTER_IDS.includes(a.initialStarterId));assert.equal(a.initialStarterId,again.initialStarterId);assert.notEqual(a.initialStarterId,b.initialStarterId);assert.equal(starterCatalog(a).filter(p=>p.unlocked).length,1);
const earned=DEFAULT_STARTER_IDS.find(id=>id!==a.initialStarterId);registerStarterCaught(a,makeMon(earned,5),{kind:'hatch'});assert.ok(starterCatalog(a).find(p=>p.sourceId===earned).unlocked);assert.equal(a.dex[earned].eggRegistered,true);
// Existing default unlocks and dex details must survive migration.
a.dexVersion=3;for(const id of DEFAULT_STARTER_IDS){a.dex[id]||={caught:true,seen:true,registered:true,ivs:{hp:15,atk:15,def:15,spa:15,spd:15,spe:15},natures:['hardy'],abilitySlots:['primary'],genders:['M','F'],forms:[0],caughtCount:0,hatchedCount:0};a.dex[id].registered=true;a.dex[id].forms=[0];}
const existing=DEFAULT_STARTER_IDS.find(id=>id!==a.initialStarterId&&id!==earned);a.dex[existing].shiny=true;a.dex[existing].ivs.hp=31;const saved=structuredClone(a.dex[existing]);
ensureStarterSystem(a,[],{seed:'player-a'});assert.equal(starterCatalog(a).filter(p=>p.unlocked).length,27);assert.deepEqual(a.dex[existing],saved);assert.ok(starterCatalog(a).find(p=>p.sourceId===earned).unlocked);
const older=structuredClone(a);older.dexVersion=2;const extra=Object.keys(older.dex).find(id=>!DEFAULT_STARTER_IDS.includes(Number(id)));older.dex[extra].registered=true;older.dex[extra].forms=[0];ensureStarterSystem(older,[],{seed:'player-a'});assert.equal(older.dex[extra].registered,true);
const oldest=structuredClone(a);oldest.dexVersion=1;oldest.dex[existing].natures=['adamant'];ensureStarterSystem(oldest,[],{seed:'player-a'});assert.ok(oldest.dex[existing].natures.includes('adamant'));
// Old collections can lack a recognizable origin; keep their dex evidence without inventing an egg unlock.
const unmarked=makeMon(DEFAULT_STARTER_IDS[1],5);unmarked.origin='legacy';unmarked.ivs={hp:31,atk:31,def:31,spa:31,spd:31,spe:31};
const oldCollection=ensureStarterSystem({},[unmarked],{seed:'player-a'});assert.notEqual(oldCollection.initialStarterId,DEFAULT_STARTER_IDS[1]);assert.equal(oldCollection.dex[DEFAULT_STARTER_IDS[1]].caught,true);assert.equal(oldCollection.dex[DEFAULT_STARTER_IDS[1]].ivs.hp,31);assert.equal(oldCollection.dex[DEFAULT_STARTER_IDS[1]].registered,false);
// Legacy egg origin is equivalent to the old gacha origin, including non-default species.
const oldEgg=makeMon(25,5);oldEgg.origin='egg';for(const legacy of [{},{dexVersion:2,dex:{},starterData:{}},{dexVersion:3,dex:{},starterData:{}},{dex:{},starterData:{}}]){const migrated=ensureStarterSystem(legacy,[oldEgg],{seed:'player-a'});assert.equal(migrated.dex[25].registered,true);assert.equal(migrated.dex[25].eggRegistered,true);}
// Partial unversioned records and future schema versions must never be reset.
const partial=structuredClone(a);delete partial.dexVersion;partial.starterData[existing]={candies:47,friendshipPoints:11,costReduction:1,passiveUnlocked:true,eggMask:3};const beforePartial=structuredClone(partial.dex[existing]);ensureStarterSystem(partial,[],{seed:'player-a'});assert.deepEqual(partial.dex[existing],beforePartial);assert.equal(partial.starterData[existing].candies,47);
const future=structuredClone(partial);future.dexVersion=999;const beforeFuture=structuredClone(future);assert.throws(()=>ensureStarterSystem(future),/지원하지 않는/);assert.deepEqual(future,beforeFuture);
console.log('One stable random starter per player, new egg unlock, and non-destructive migration of existing starters passed');
