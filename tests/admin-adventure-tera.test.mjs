import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {validatePokemonEdit,mergeAdminPokemon} from '../lib/admin-pokemon.mjs';
import {stableTeraType} from '../lib/tera-type.mjs';
import {createCombat} from '../lib/party-battle.mjs';

const request=(species=1,teraType='Water')=>({species,level:20,experience:0,teraType});
test('adventure admin validates selected and fixed tera types',()=>{
 assert.equal(validatePokemonEdit(request()).teraType,'Water');
 assert.equal(validatePokemonEdit(request(1,'불꽃')).teraType,'Fire');
 assert.throws(()=>validatePokemonEdit(request(1,'invalid')),/테라스탈/);
 assert.equal(validatePokemonEdit(request(1017,'Grass')).teraType,'Grass');
 assert.equal(validatePokemonEdit(request(1024,'Stellar')).teraType,'Stellar');
 assert.throws(()=>validatePokemonEdit(request(1017,'Water')),/테라스탈/);
 assert.throws(()=>validatePokemonEdit(request(1024,'Fire')),/테라스탈/);
});
test('editing keeps identity, health, history and selected type in battle',()=>{
 const old={...makeMon(1,20),boxId:'owned',teraType:'Fire',personality:12345,friendship:119,walkSteps:987,customHistory:{important:true},hp:10};
 const input=request(1,'Water'),saved=mergeAdminPokemon(old,validatePokemonEdit(input),input);
 assert.equal(saved.teraType,'Water');assert.equal(saved.personality,12345);assert.equal(saved.friendship,119);assert.equal(saved.walkSteps,987);assert.equal(saved.hp,10);assert.deepEqual(saved.customHistory,{important:true});
 const battle=createCombat([saved],[{...makeMon(4,10),boxId:'opponent'}]);assert.equal(JSON.parse(JSON.stringify(battle)).teams[0][0].teraType,'Water');
 const without={species:1,level:20,experience:0},preserved=mergeAdminPokemon(old,validatePokemonEdit(without),without);assert.equal(preserved.teraType,'Fire');
 const legacy={...old};delete legacy.teraType;assert.equal(mergeAdminPokemon(legacy,validatePokemonEdit(without),without).teraType,stableTeraType(legacy));
});

test('species changes retain history and enforce the new species fixed type',()=>{
 const old={...makeMon(1,20),boxId:'owned',teraType:'Water',walkSteps:42,hp:10};
 const input={species:1024,level:20,experience:0},updated=mergeAdminPokemon(old,validatePokemonEdit(input),input);
 assert.equal(updated.id,1024);assert.equal(updated.teraType,'Stellar');assert.equal(updated.boxId,'owned');assert.equal(updated.walkSteps,42);assert.equal(updated.hp,10);
});
