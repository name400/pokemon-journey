import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { build } from 'esbuild';

await fs.mkdir('.sites-runtime/tests', { recursive: true });
await build({
  entryPoints: ['hooks/use-battle-playback.ts'],
  outfile: '.sites-runtime/tests/battle-playback.mjs',
  bundle: true, format: 'esm', platform: 'node', external: ['react'],
});
const { BattlePlaybackController } = await import('../.sites-runtime/tests/battle-playback.mjs');
const event = { side: 0, type: 'water', category: 'special', hit: true };

let frames = [];
const queue = new BattlePlaybackController({ onFrame: frame => frames.push(frame), durationMs: 1, gapMs: 0 });
assert.equal(await queue.play([event, event], 'match:revision:1'), true);
const active = frames.filter(frame => frame.event);
assert.equal(active.length, 2);
assert.notEqual(active[0].eventKey, active[1].eventKey);
assert.equal(frames.at(-1).anim, '');
const count = frames.length;
assert.equal(await queue.play([event], 'match:revision:1'), false);
assert.equal(frames.length, count, 'Duplicate revisions must not replay');

frames = [];
const reduced = new BattlePlaybackController({ onFrame: frame => frames.push(frame), durationMs: 10000, reducedMotion: () => true });
assert.equal(await reduced.play([event, event], 'reduce:1'), true);
assert.equal(frames.filter(frame => frame.event).length, 0);
assert.equal(frames.at(-1).anim, '');

frames = [];
const cancellable = new BattlePlaybackController({ onFrame: frame => frames.push(frame), durationMs: 10000 });
const pending = cancellable.play([event, event], 'cancel:1');
cancellable.cancel();
assert.equal(await pending, false);
assert.equal(frames.at(-1).anim, '');

const superseded = cancellable.play([event], 'old:2');
const current = cancellable.play([], 'new:3');
assert.equal(await superseded, false);
assert.equal(await current, true);

let preference = false;
const toggled = new BattlePlaybackController({ onFrame() {}, reducedMotion: () => preference, durationMs: 10000 });
const toggledResult = toggled.play([event, event], 'preference:1');
preference = true;
toggled.skipDelays();
assert.equal(await toggledResult, true, 'Changing preference must apply the completed server response');
console.log('Battle playback cancellation, revision deduplication, unique FX keys, and reduced motion: passed');
