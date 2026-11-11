import test from 'node:test';
import assert from 'node:assert/strict';
import { createFrame, createFx, composite } from '../third_party/pixelfx/src/core/index.js';
import * as fire from '../third_party/pixelfx/src/fx/fire/fireball.js';
import * as electric from '../third_party/pixelfx/src/fx/lightning/zap-hit.js';
import * as hit from '../third_party/pixelfx/src/fx/impacts/hit-spark.js';

for (const [name, effect] of Object.entries({ fire, electric, hit })) {
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
