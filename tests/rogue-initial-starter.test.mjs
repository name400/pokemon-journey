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
console.log('One stable random starter per player, new egg unlock, and non-destructive migration of existing starters passed');
