'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type BattleVisualEvent = {
  side: number;
  type?: string;
  category?: string;
  hit?: boolean;
  move?: string;
  targetSide?: number;
};

export type BattlePlaybackFrame = {
  anim: string;
  eventKey: string;
  event: BattleVisualEvent | null;
};

const idleFrame = (): BattlePlaybackFrame => ({ anim: '', eventKey: '', event: null });

export function battleAnimationClass(event: BattleVisualEvent): string {
  const side = event.side === 1 ? 1 : 0;
  const type = /^[a-z]+$/.test(event.type || '') ? event.type : 'normal';
  const category = ['physical', 'special', 'status'].includes(event.category || '')
    ? event.category : 'physical';
  return `event-actor-${side} fx-${type} category-${category}${event.hit === true ? ' event-hit' : ''}`;
}

/**
 * The controller contains no browser dependencies, so queue cancellation can be tested directly.
 * A false play result means superseded, cancelled, or duplicate: callers must not apply its
 * delayed response to game state. Server state still needs its own monotonic revision guard.
 */
export class BattlePlaybackController {
  private generation = 0;
  private pending = new Set<() => void>();
  private seen = new Set<string>();

  constructor(private options: {
    onFrame: (frame: BattlePlaybackFrame) => void;
    reducedMotion?: () => boolean;
    durationMs?: number;
    gapMs?: number;
  }) {}

  private wait(ms: number, generation: number): Promise<boolean> {
    if (ms <= 0) return Promise.resolve(generation === this.generation);
    return new Promise(resolve => {
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        this.pending.delete(finish);
        resolve(generation === this.generation);
      };
      const timer = setTimeout(finish, ms);
      this.pending.add(finish);
    });
  }

  /** Finish waits without cancelling the response, for a reduced-motion preference change. */
  skipDelays(): void {
    this.options.onFrame(idleFrame());
    for (const finish of [...this.pending]) finish();
  }

  cancel(): void {
    this.generation++;
    for (const finish of [...this.pending]) finish();
    this.options.onFrame(idleFrame());
  }

  async play(events: readonly BattleVisualEvent[], sourceKey: string | number): Promise<boolean> {
    const key = String(sourceKey);
    if (this.seen.has(key)) return false;
    this.cancel();
    const generation = this.generation;
    this.seen.add(key);
    if (this.seen.size > 128) this.seen.delete(this.seen.values().next().value!);

    for (let index = 0; index < events.length; index++) {
      if (generation !== this.generation) return false;
      if (this.options.reducedMotion?.()) break;

      // Clear the prior CSS animation between adjacent identical move events. eventKey also
      // lets the caller key the FX layer, which guarantees restart without remounting sprites.
      if (index > 0) {
        this.options.onFrame(idleFrame());
        if (!await this.wait(this.options.gapMs ?? 32, generation)) return false;
        if (this.options.reducedMotion?.()) break;
      }
      this.options.onFrame({
        anim: battleAnimationClass(events[index]),
        eventKey: `${key}:${generation}:${index}`,
        event: events[index],
      });
      if (!await this.wait(this.options.durationMs ?? 700, generation)) return false;
    }

    if (generation !== this.generation) return false;
    this.options.onFrame(idleFrame());
    return true;
  }
}

/**
 * Use `eventKey` on the transient FX layer, not the entire battlefield. Await play and only
 * apply a delayed server response when it resolves true; cancel/new playback resolves false.
 */
export function useBattlePlayback(options: { durationMs?: number; gapMs?: number } = {}) {
  const [frame, setFrame] = useState<BattlePlaybackFrame>(idleFrame);
  const mounted = useRef(false);
  const reducedMotion = useRef(false);
  const controller = useRef<BattlePlaybackController | null>(null);
  if (!controller.current) {
    controller.current = new BattlePlaybackController({
      ...options,
      reducedMotion: () => reducedMotion.current,
      onFrame: next => { if (mounted.current) setFrame(next); },
    });
  }

  useEffect(() => {
    mounted.current = true;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.current = query.matches;
    const onChange = () => {
      reducedMotion.current = query.matches;
      if (query.matches) controller.current!.skipDelays();
    };
    query.addEventListener('change', onChange);
    return () => {
      mounted.current = false;
      query.removeEventListener('change', onChange);
      controller.current!.cancel();
    };
  }, []);

  const play = useCallback((events: readonly BattleVisualEvent[], sourceKey: string | number) => {
    if (!mounted.current) return Promise.resolve(false);
    return controller.current!.play(events, sourceKey);
  }, []);
  const cancel = useCallback(() => controller.current!.cancel(), []);

  return { ...frame, play, cancel };
}
