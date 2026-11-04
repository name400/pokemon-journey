import test from 'node:test';
import assert from 'node:assert/strict';
import {mysteriousChallengersHardTemplate,selectMysteriousChallengerCandidates} from '../lib/rogue-mysterious-challengers.mjs';

test('Mysterious Challengers hard party follows source wave boundaries', () => {
  for (const [wave, size] of [[1,2],[20,2],[21,3],[40,3],[41,4],[80,5],[81,6],[100,6],[200,6]]) {
    const template = mysteriousChallengersHardTemplate(wave);
    assert.equal(template.size, size);
    assert.deepEqual(template.slots.map(slot => slot.strength), [5, ...Array(size - 1).fill(3)]);
    assert.ok(template.slots.every(slot => slot.balanced && !slot.sameSpecies && slot.evoThresholdKind === 1));
    assert.equal(template.rootEvoThresholdKind, 1);
  }
  for (const wave of [0, -1, 1.5, NaN]) assert.throws(() => mysteriousChallengersHardTemplate(wave));
});

test('hard candidate retries at most five times and draws the boss separately', () => {
  const calls = [], draws = [7, 7, 7, 7, 7, 7, 7, 42];
  const result = selectMysteriousChallengerCandidates(boss => { calls.push(boss); return draws.shift(); }, id => ({id, female:false}));
  assert.deepEqual(calls, [false,false,false,false,false,false,false,true]);
  assert.deepEqual(result, {normal:{id:7,female:false},hard:{id:7,female:false},brutal:{id:42,female:false}});
  const early = [3,3,4,9], flags = [];
  const second = selectMysteriousChallengerCandidates(boss => {flags.push(boss);return early.shift();},id=>({id}));
  assert.deepEqual(flags,[false,false,false,true]);assert.equal(second.hard.id,4);assert.equal(second.brutal.id,9);
});

test('source wave offsets shift UTF-16 code units for each difficulty', async () => {
 const {mysteriousChallengerSeed}=await import('../lib/rogue-mysterious-challengers.mjs');
 assert.equal(mysteriousChallengerSeed('Az',20,'normal'),String.fromCharCode(65+200,122+200));
 assert.notEqual(mysteriousChallengerSeed('Az',20,'hard'),mysteriousChallengerSeed('Az',20,'brutal'));
 assert.throws(()=>mysteriousChallengerSeed('x',0,'normal'));
});
test('a temporary random source preserves the persisted cursor even after errors', async () => {
 const {classicRandom,withClassicRandomSource}=await import('../lib/rogue-classic-state.mjs');
 const run={rng:42};assert.throws(()=>withClassicRandomSource(run,()=>0.25,()=>{assert.equal(classicRandom(run),0.25);throw Error('test');}));
 assert.equal(run.rng,42);const expected=classicRandom({rng:42});assert.equal(classicRandom(run),expected);
});
