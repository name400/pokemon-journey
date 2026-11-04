import test from 'node:test';
import assert from 'node:assert/strict';
import {mysteriousChallengersHardTemplate} from '../lib/rogue-mysterious-challengers.mjs';

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
