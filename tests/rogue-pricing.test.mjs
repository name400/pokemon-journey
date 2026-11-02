import assert from 'node:assert/strict';import {pokemonCoinValue,capsulePricing} from '../lib/rogue-pricing.mjs';import {ROGUE_CAPSULES} from '../lib/rogue-capsules.mjs';
const basic={baseStatTotal:250},strong={baseStatTotal:600},legend={baseStatTotal:680,legendary:true};
assert.ok(pokemonCoinValue(strong)>pokemonCoinValue(basic));assert.ok(pokemonCoinValue(legend)>pokemonCoinValue(strong));assert.ok(pokemonCoinValue({...legend,powerForm:true})>pokemonCoinValue(legend));
assert.ok(capsulePricing([basic,strong],[1,9]).price>capsulePricing([basic,strong],[9,1]).price);
assert.ok(capsulePricing([legend],[1]).price>capsulePricing([basic,legend],[1,1]).price);
assert.throws(()=>capsulePricing([],[]));assert.throws(()=>capsulePricing([basic],[0]));
assert.ok(ROGUE_CAPSULES.rare.price>ROGUE_CAPSULES.all.price);assert.ok(ROGUE_CAPSULES.all.price>ROGUE_CAPSULES.meadow.price);
for(const pack of Object.values(ROGUE_CAPSULES)){assert.equal(pack.price%250,0);assert.equal(pack.price,pack.pricing.price);assert.equal(new Set(pack.featured.map(p=>p.speciesId)).size,pack.featured.length);}
console.log('Capsule prices follow actual weighted candidate strength, legendary rarity and power forms; displayed and server prices share one source: passed');
