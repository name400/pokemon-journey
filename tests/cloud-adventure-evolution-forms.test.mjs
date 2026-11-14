import test from 'node:test';import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';import {evolutionOptions} from '../lib/evolution.mjs';import {adventureEvolutionOptions} from '../lib/cloud-adventure/adventure-evolution-options.mjs';
test('adventure Galarian Slowpoke only offers regional item evolutions',()=>{
 const galar={...makeMon(10164,40),tradeCount:1,item:'kingsrock'},normal={...makeMon(79,40),tradeCount:1,item:'kingsrock'},bag={galaricacuff:1,galaricawreath:1},before=structuredClone(galar);
 const options=adventureEvolutionOptions(galar,{},[],bag);assert.deepEqual(options.map(o=>o.id).sort((a,b)=>a-b),[10165,10172]);assert.ok(options.every(o=>o.ready));assert.deepEqual(galar,before);
 assert.deepEqual(adventureEvolutionOptions({...galar,id:79}, {}, [], bag).map(o=>o.id).sort((a,b)=>a-b),[10165,10172]);
 const old={...galar};delete old.formId;delete old.speciesId;const saved=structuredClone(old);assert.deepEqual(adventureEvolutionOptions(old,{},[],bag).map(o=>o.id).sort((a,b)=>a-b),[10165,10172]);assert.deepEqual(old,saved);
 const standard=adventureEvolutionOptions(normal,{},[],bag);assert.ok(standard.find(o=>o.id===80)?.ready);assert.ok(standard.find(o=>o.id===199)?.ready);assert.ok(!standard.some(o=>o.id===10165||o.id===10172));
 // Other games continue to use their existing shared evolution options.
 assert.ok(evolutionOptions(galar,{mode:'rogue'},[],bag).some(o=>o.id===80));
});

test('regional forms exclude ordinary evolution branches without changing base forms or saved data',()=>{
 const samples=[[10091,20,10092],[10101,28,10102],[10103,38,10104],[10105,51,10106],[10107,53,10108],[10109,75,10110],[10110,76,10111],[10112,89,10113],[10161,53,863],[10162,78,10163],[10174,264,10175],[10176,555,10177],[10179,563,867]],bag={icestone:1,firestone:1};
 for(const [id,normal,regional] of samples){const mon={...makeMon(id,60),friendship:255,tradeCount:1},saved=structuredClone(mon),options=adventureEvolutionOptions(mon,{},[],bag);assert.ok(!options.some(o=>o.id===normal),`${id} normal branch`);assert.ok(options.some(o=>o.id===regional),`${id} regional branch`);assert.deepEqual(mon,saved);const legacy={...mon};delete legacy.formId;delete legacy.speciesId;assert.ok(adventureEvolutionOptions(legacy,{},[],bag).some(o=>o.id===regional),`${id} legacy form`);}
 const regular=adventureEvolutionOptions(makeMon(37,60),{},[],bag);assert.ok(regular.some(o=>o.id===38&&o.ready));assert.ok(!regular.some(o=>o.id===10104));
 const other=adventureEvolutionOptions(makeMon(133,40),{},[],{firestone:1,icestone:1});assert.ok(other.some(o=>o.id===136&&o.ready));assert.ok(other.some(o=>o.id===471&&o.ready));
});
