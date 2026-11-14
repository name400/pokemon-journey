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
