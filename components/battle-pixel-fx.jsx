'use client';

import { useEffect, useRef, useState } from 'react';
import { createFrame, clearFrame, createFx, composite } from '../third_party/pixelfx/src/core/index.js';
import * as fireball from '../third_party/pixelfx/src/fx/fire/fireball.js';
import * as zap from '../third_party/pixelfx/src/fx/lightning/zap-hit.js';
import * as hit from '../third_party/pixelfx/src/fx/impacts/hit-spark.js';

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
    const module = effect === 'fire' ? fireball : effect === 'electric' ? zap : hit;
    const frame = createFrame(128, 128);
    const image = context.createImageData(128, 128);
    const fx = createFx(module, { x: 64, y: effect === 'fire' ? 64 : 84 });
    let handle = 0, start = 0, last = 0, displayed = -Infinity;
    const draw = now => {
      if (!start) start = now;
      const elapsed = Math.min(Math.max(0, now - start), duration);
      if (elapsed - displayed >= 32 || displayed < 0) {
        const dt = Math.max(0, elapsed - last) / 1000;
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
