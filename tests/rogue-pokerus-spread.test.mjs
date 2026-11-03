import assert from 'node:assert/strict';
import {spreadClassicPokerusForEncounter} from '../lib/rogue-seeded-rng.mjs';
const newRun={pokerusSpreadRule:'source-v1',seed:'fixed-115',wave:1,party:[{pokerus:false},{pokerus:true},{pokerus:false},{pokerus:false}]};const untouched=structuredClone(newRun);assert.deepEqual(spreadClassicPokerusForEncounter(newRun,null,()=>0),[]);assert.deepEqual(newRun,untouched,'the initial encounter must not spread');
newRun.wave=2;assert.deepEqual(spreadClassicPokerusForEncounter(newRun,{}),[0,2]);assert.deepEqual(newRun.party.map(p=>p.pokerus),[true,true,true,false],'newly infected party members cannot spread in the same transition');const restored=JSON.parse(JSON.stringify(untouched));restored.wave=2;assert.deepEqual(spreadClassicPokerusForEncounter(restored,{}),[0,2]);
const legacy={party:[{pokerus:false},{pokerus:true},{pokerus:false},{pokerus:false}]};assert.deepEqual(spreadClassicPokerusForEncounter(legacy,{},()=>0),[0,2]);assert.deepEqual(legacy.party.map(p=>p.pokerus),[true,true,true,false]);
assert.throws(()=>spreadClassicPokerusForEncounter({pokerusSpreadRule:'source-v1',party:[],wave:2},{}),/진행/);
console.log('Pokerus spread: no initial infection, source-seeded transition, no chaining, JSON replay and legacy compatibility passed.');
