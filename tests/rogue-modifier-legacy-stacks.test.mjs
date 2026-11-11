import test from 'node:test';
import assert from 'node:assert/strict';
import { addClassicModifier } from '../lib/rogue-classic-rewards.mjs';

const makeRun = modifiers => ({ party: [{boxId:'a',item:''},{boxId:'b',item:''}], modifiers });
test('legacy records without a type field receive a new stack in place and survive reload', () => {
  let run = makeRun([{id:'amuletcoin',count:4}]);
  run = JSON.parse(JSON.stringify(run));
  addClassicModifier(run,'amuletcoin');
  assert.equal(run.modifiers.length,1);
  assert.equal(run.modifiers[0].count,5);
  assert.throws(()=>addClassicModifier(run,'amuletcoin'),/한도/);
});
test('cap checks sum separate legacy stacks without touching saved records', () => {
  const run = makeRun([{id:'amuletcoin',boxId:null,count:3},{id:'amuletcoin',boxId:null,typeBoost:null,count:2}]);
  const before = structuredClone(run);
  assert.throws(()=>addClassicModifier(run,'amuletcoin'),/한도/);
  assert.deepEqual(run,before);
});
test('held stacks remain specific to their owners and elemental types', () => {
  const run = makeRun([{id:'shellbell',boxId:'a',count:2},{id:'shellbell',boxId:'b',count:4},{id:'typebooster',boxId:'a',typeBoost:'Water',count:2},{id:'typebooster',boxId:'a',typeBoost:'Fire',count:3}]);
  addClassicModifier(run,'shellbell',{boxId:'a'});
  addClassicModifier(run,'typebooster',{boxId:'a',typeBoost:'Water'});
  assert.equal(run.modifiers[0].count,3);
  assert.equal(run.modifiers[1].count,4);
  assert.equal(run.modifiers[2].count,3);
  assert.equal(run.modifiers[3].count,3);
});

test('native held items count toward caps alongside legacy modifier records', () => {
  const run = makeRun([{id:'shellbell',boxId:'a',count:3}]);
  run.party[0].item='shellbell';
  const before=structuredClone(run);
  assert.throws(()=>addClassicModifier(run,'shellbell',{boxId:'a'}),/한도/);
  assert.deepEqual(run,before);
});
test('damaged or invalid quantities never partially modify the save', () => {
  for(const n of [0,-1,1.5]) {const run=makeRun([{id:'amuletcoin',count:2}]),before=structuredClone(run);assert.throws(()=>addClassicModifier(run,'amuletcoin',{count:n}));assert.deepEqual(run,before);}
  const run=makeRun([{id:'amuletcoin',count:-2}]),before=structuredClone(run);assert.throws(()=>addClassicModifier(run,'amuletcoin'));assert.deepEqual(run,before);
});
