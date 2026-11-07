import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {normalizeStoredPokemon} from '../lib/normalize-pokemon.mjs';
import {initialTeraType,TERA_TYPES,stableTeraType} from '../lib/tera-type.mjs';
import {ensureStarterSystem,starterCatalog,buildStarterParty,registerStarterCaught} from '../lib/rogue-starter-system.mjs';

test('new adventure and classic pokemon retain a random type through storage',()=>{
 const adventure=makeMon(1,5),classic=makeReferenceMon(4,5);
 for(const mon of [adventure,classic]){assert.ok(TERA_TYPES.includes(mon.teraType));assert.equal(normalizeStoredPokemon(JSON.parse(JSON.stringify(mon))).teraType,mon.teraType);}
 assert.equal(new Set(Array.from({length:19},(_,i)=>initialTeraType(1,i))).size,19);
});
test('older pokemon recover a stable type without changing existing data',()=>{
 const mon=makeMon(1,5);delete mon.teraType;const saved=JSON.stringify(mon),a=normalizeStoredPokemon(JSON.parse(saved)),b=normalizeStoredPokemon(JSON.parse(saved));assert.equal(a.teraType,b.teraType);assert.equal(JSON.stringify(mon),saved);
 assert.equal(stableTeraType({...mon,teraType:'Fire'}),'Fire');
});
test('special species have fixed types and starter selections are validated',()=>{
 assert.equal(initialTeraType(1017,0),'Grass');assert.equal(initialTeraType(1024,0),'Stellar');
 const system={initialStarterId:1};ensureStarterSystem(system);registerStarterCaught(system,{...makeReferenceMon(1,5),teraType:'Water'},{kind:'capture'});const e=starterCatalog(system).find(p=>p.id===1),choice={id:e.id,ability:e.abilities[0].key,nature:e.natures[0].key,gender:e.genders[0],moves:e.defaultMoves,teraType:'Water'};
 assert.equal(buildStarterParty(system,[choice]).party[0].teraType,'Water');assert.throws(()=>buildStarterParty(system,[{...choice,teraType:'Fire'}]),/해금/);assert.throws(()=>buildStarterParty(system,[{...choice,teraType:'bad'}]),/테라스탈/);
});

test('adventure combat and recovery preserve the selected type',async()=>{
 const {createCombat,playCpu}=await import('../lib/party-battle.mjs');const player={...makeMon(1,30),boxId:'hero',teraType:'Water'},enemy={...makeMon(4,10),boxId:'foe'};
 const combat=createCombat([player],[enemy]),saved=JSON.parse(JSON.stringify(combat));assert.equal(saved.teams[0][0].teraType,'Water');
 const result=playCpu(saved,{type:'move',move:saved.requests[0].moves[0].name});assert.equal(result.teams[0][0].teraType,'Water');
});

test('classic save codec preserves a selected starter type and other fields',async()=>{
 const {encodeGameData,decodeGameData}=await import('../lib/game-storage.mjs');const mon={...makeReferenceMon(1,5),boxId:'starter',teraType:'Ghost'};
 const doc={classic:{party:[mon]},other:{coins:123}},restored=await decodeGameData(await encodeGameData(doc));assert.equal(restored.classic.party[0].teraType,'Ghost');assert.deepEqual(restored.other,doc.other);
});

test('captures accumulate distinct types and survive reconnect without losing old unlocks',async()=>{
 const {encodeGameData,decodeGameData}=await import('../lib/game-storage.mjs');const system={initialStarterId:1};ensureStarterSystem(system);
 const caught={...makeReferenceMon(1,5),teraType:'Water'};registerStarterCaught(system,caught,{kind:'capture'});registerStarterCaught(system,caught,{kind:'capture'});registerStarterCaught(system,{...caught,teraType:'Fire'},{kind:'hatch'});
 const types=starterCatalog(system).find(p=>p.id===1).teraTypes;assert.deepEqual(types,['Grass','Water','Fire']);
 const saved=await decodeGameData(await encodeGameData({system}));assert.deepEqual(starterCatalog(saved.system).find(p=>p.id===1).teraTypes,types);
});
