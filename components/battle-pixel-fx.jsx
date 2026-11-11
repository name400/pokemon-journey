'use client';

import { useEffect, useRef, useState } from 'react';
import { createFrame, clearFrame, createFx, composite } from '../third_party/pixelfx/src/core/index.js';
import * as fireball from '../third_party/pixelfx/src/fx/fire/fireball.js';
import * as zap from '../third_party/pixelfx/src/fx/lightning/zap-hit.js';
import * as hit from '../third_party/pixelfx/src/fx/impacts/hit-spark.js';
import * as water from '../third_party/pixelfx/src/fx/water/splash.js';
import * as ice from '../third_party/pixelfx/src/fx/ice/snowflake-burst.js';
import * as poison from '../third_party/pixelfx/src/fx/nature/acid-splash.js';
import * as heal from '../third_party/pixelfx/src/fx/nature/healing-bloom.js';
import * as grass from '../third_party/pixelfx/src/fx/nature/vine-whip.js';

const effects = { fire: fireball, electric: zap, hit, water, ice, poison, heal, grass };

// The SVG remains a fallback if canvas is unavailable or reduced motion is requested.
export default function BattlePixelFx({ effect, duration, children }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = ref.current;
    const context = canvas?.getContext('2d');
    if (!context) return;
    const module = effects[effect] || hit;
    const frame = createFrame(128, 128);
    const image = context.createImageData(128, 128);
    const fx = createFx(module, { x: 64, y: effect === 'fire' ? 64 : 84, ...(effect === 'water' ? { stone: false } : {}) });
    if (effect === 'water') fx.update(0.2); // Skip the upstream stone-drop lead-in.
    let handle = 0, start = null, last = 0, displayed = -Infinity;
    const draw = now => {
      if (start === null) start = now;
      const elapsed = Math.min(Math.max(0, now - start), duration);
      if (elapsed - displayed >= 32 || displayed < 0) {
        const dt = Math.min(0.08, Math.max(0, elapsed - last) / 1000);
        fx.update(dt);
        clearFrame(frame);
        fx.draw(frame);
        composite(frame, image.data);
        context.putImageData(image, 0, 0);
        setReady(true);
        displayed = elapsed;
        last = elapsed;
      }
      if (elapsed < duration) handle = requestAnimationFrame(draw);
    };
    handle = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(handle);
  }, [effect, duration]);
  return <><span style={{ display: ready ? 'none' : 'contents' }}>{children}</span><canvas ref={ref} width={128} height={128} className="bs-pixel-fx" style={{ visibility: ready ? 'visible' : 'hidden' }} aria-hidden="true" /></>;
}
