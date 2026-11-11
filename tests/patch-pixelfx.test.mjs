import test from 'node:test';
import assert from 'node:assert/strict';
import { createFrame, createFx, composite } from '../third_party/pixelfx/src/core/index.js';
import * as fire from '../third_party/pixelfx/src/fx/fire/fireball.js';
import * as electric from '../third_party/pixelfx/src/fx/lightning/zap-hit.js';
import * as hit from '../third_party/pixelfx/src/fx/impacts/hit-spark.js';
import * as water from '../third_party/pixelfx/src/fx/water/splash.js';
import * as ice from '../third_party/pixelfx/src/fx/ice/snowflake-burst.js';
import * as poison from '../third_party/pixelfx/src/fx/nature/acid-splash.js';
import * as heal from '../third_party/pixelfx/src/fx/nature/healing-bloom.js';
import * as grass from '../third_party/pixelfx/src/fx/nature/vine-whip.js';
import * as burn from '../third_party/pixelfx/src/fx/fire/spirit-flame.js';
import * as sleep from '../third_party/pixelfx/src/fx/status/sleep.js';

for (const [name, effect] of Object.entries({ fire, electric, hit, water, ice, poison, heal, grass, burn, sleep })) {
  test(`Patch PixelFX ${name} renders a transparent battle overlay`, () => {
    const frame = createFrame(128, 128);
    const instance = createFx(effect, { x: 64, y: 84 });
    for (let step = 0; step < 8; step++) instance.update(1 / 30);
    instance.draw(frame);
    const pixels = composite(frame, new Uint8ClampedArray(128 * 128 * 4));
    let visible = 0, transparent = 0;
    for (let i = 3; i < pixels.length; i += 4) pixels[i] ? visible++ : transparent++;
    assert.ok(visible > 0, 'effect has visible pixels');
    assert.ok(transparent > 0, 'background remains transparent');
  });
}

test('sleep overlay does not paint the stock actor eyes', async () => {
  const { stockActor } = await import('../third_party/pixelfx/src/core/index.js');
  const render = eyes => {
    const actor = { ...stockActor(2), eyes };
    const frame = createFrame(128, 128);
    const instance = createFx(sleep, { x: 64, y: 84, actor });
    instance.update(0.2);
    instance.draw(frame);
    return composite(frame, new Uint8ClampedArray(128 * 128 * 4));
  };
  assert.deepEqual(render([[0, 0], [23, 37]]), render([]));
});
