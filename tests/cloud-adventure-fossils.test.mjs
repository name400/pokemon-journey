import test from 'node:test';
import assert from 'node:assert/strict';
import {reviveFossilPokemon} from '../lib/cloud-adventure/adventure-side27.mjs';
import {calculateStats,rules} from '../lib/pokemon-config.mjs';

test('fossil revival rolls six IVs, a nature and one 1/4096 shiny roll',()=>{
 const samples=[0,31/32,1/32,15/32,22/32,30/32,24/25,0];let i=0;const mon=reviveFossilPokemon(696,()=>samples[i++]);
 assert.equal(i,8);assert.deepEqual(mon.ivs,{hp:0,atk:31,def:1,spa:15,spd:22,spe:30});assert.equal(mon.nature,Object.keys(rules.natures)[24]);assert.equal(mon.shiny,true);assert.deepEqual(mon.stats,calculateStats(mon));assert.equal(mon.hp,mon.maxHp);
 const rolls=[.5,.5,.5,.5,.5,.5,0,1/4096];i=0;const normal=reviveFossilPokemon(698,()=>rolls[i++]);assert.equal(normal.shiny,false);assert.equal(normal.nature,Object.keys(rules.natures)[0]);assert.notDeepEqual(normal.ivs,mon.ivs);
});
