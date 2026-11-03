import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { build } from 'esbuild';

await fs.mkdir('.sites-runtime/tests', { recursive: true });
await build({
  entryPoints: ['hooks/use-battle-playback.ts'],
  outfile: '.sites-runtime/tests/battle-playback.mjs',
  bundle: true, format: 'esm', platform: 'node', external: ['react'],
});
const { BattlePlaybackController, BattleSubmissionGate, battleDisplay, applyBattleEvent, battleEventLocation } = await import('../.sites-runtime/tests/battle-playback.mjs');
const event = { side: 0, type: 'water', category: 'special', hit: true };

let frames = [];
const queue = new BattlePlaybackController({ onFrame: frame => frames.push(frame), durationMs: 1, gapMs: 0 });
assert.equal(await queue.play([event, event], 'match:revision:1'), true);
const active = frames.filter(frame => frame.event);
assert.equal(active.length, 2);
assert.notEqual(active[0].eventKey, active[1].eventKey);
assert.equal(frames.at(-1).anim, '');
const count = frames.filter(frame => frame.event).length;
assert.equal(await queue.play([event], 'match:revision:1'), false);
assert.equal(frames.filter(frame => frame.event).length, count, 'Duplicate revisions must not replay events');
assert.equal(frames.at(-1).playing, false, 'A duplicate completion must release the presentation lock');

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

const remount = new BattlePlaybackController({ onFrame() {}, durationMs: 10000 });
const interruptedMount = remount.play([event], 'strict-mode');
remount.cancel();
assert.equal(await interruptedMount, false);
assert.equal(await remount.play([], 'strict-mode'), true, 'StrictMode cancellation must not poison the source key');

const gate = new BattleSubmissionGate();
assert.equal(gate.enter('decision:1'), true);
assert.equal(gate.enter('decision:1'), false, 'Same-render double commands are blocked');
gate.reset('decision:2');
assert.equal(gate.enter('decision:2'), true);
gate.release('decision:1');
assert.equal(gate.enter('decision:2'), false, 'An old request must not release the new command');
gate.release('decision:2');
assert.equal(gate.enter('decision:2'), true);

const sample = { teams: [[{boxId:'a',hp:10,maxHp:30}], [{boxId:'b',hp:4,maxHp:40},{boxId:'c',hp:20,maxHp:40}]], before: [[{boxId:'a',hp:30,maxHp:30}], [{boxId:'b',hp:40,maxHp:40},{boxId:'c',hp:40,maxHp:40}]], active:[0,1], beforeActive:[0,0] };
let display = battleDisplay(sample, true);
assert.equal(display.teams[1][0].hp, 40, 'The final HP must not leak into the pre-impact view');
display = applyBattleEvent(display, {side:0,targetSide:1,boxId:'b',kind:'damage',hp:4,maxHp:40,amount:36});
assert.equal(display.teams[1][0].hp, 4);
assert.equal(display.teams[0][0].hp, 30);
display = applyBattleEvent(display, {side:1,targetSide:1,boxId:'c',kind:'switch',teamIndex:1,hp:40,maxHp:40});
assert.equal(display.active[1],1);
display = applyBattleEvent(display, {side:1,targetSide:0,boxId:'a',kind:'damage',hp:10,maxHp:30,amount:20});
assert.equal(display.teams[0][0].hp,10,'Absolute side numbers must remain correct for side=1 viewers');
const doubles={teams:[[{boxId:'hero0',hp:10,maxHp:10},{boxId:'hero1',hp:10,maxHp:10}],[{boxId:'wild-a',hp:10,maxHp:10},{boxId:'wild-b',hp:10,maxHp:10}]],active:[0,0],activeBySide:[[0,1],[0,1]]};
const captured={kind:'capture',side:1,actorSide:0,actorBoxId:'hero0',actorSlot:0,targetSide:1,targetBoxId:'wild-b'};assert.deepEqual(battleEventLocation(doubles,captured,'actor'),{side:0,index:0,slot:0,boxId:'hero0'});assert.deepEqual(battleEventLocation(doubles,captured,'target'),{side:1,index:1,slot:1,boxId:'wild-b'});
console.log('Battle playback cancellation, revision deduplication, unique FX keys, and reduced motion: passed');
