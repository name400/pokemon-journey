import test from 'node:test';
import assert from 'node:assert/strict';
import {rollClassicEggTier,classicEggOdds,classicEggSpeciesWeight,MANAPHY_EGG_DENOMINATOR} from '../lib/rogue-egg-odds.mjs';
test('disclosed odds match every draw interval and include Manaphy substitution',()=>{
 for(const machine of ['move','legendary','shiny']){
  const counts=[0,0,0,0];for(let i=0;i<512;i++)counts[rollClassicEggTier((i+.5)/512,machine)]++;
  assert.deepEqual(counts,machine==='legendary'?[408,88,14,2]:[409,88,14,1]);
  const odds=classicEggOdds(machine);assert.ok(Math.abs(Object.values(odds).reduce((a,b)=>a+b,0)-1)<1e-12);
  assert.equal(odds.legendary,counts[3]/512);assert.equal(odds.rare,counts[1]/512);assert.equal(odds.epic,counts[2]/512);
  assert.equal(odds.manaphy,counts[0]/512/MANAPHY_EGG_DENOMINATOR);
  assert.equal(odds.common,counts[0]/512-odds.manaphy);
 }
});
test('mythical candidates receive half the ordinary weight',()=>{
 assert.equal(classicEggSpeciesWeight({mythical:true},200),100);assert.equal(classicEggSpeciesWeight({mythical:false},200),200);
});
