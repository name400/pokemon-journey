'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export type BattleVisualEvent = {
  kind?: string; side: number; targetSide?: number; boxId?: string; actorBoxId?: string;
  targetBoxId?: string; teamIndex?: number; type?: string; category?: string; hit?: boolean;
  move?: string; moveId?: string; text?: string; hp?: number; maxHp?: number; beforeHp?: number;
  amount?: number; status?: string | null; pokemon?: Record<string, any>; cause?: string;
  critical?: boolean; ball?: string; ballId?: string; shakes?: number; caught?: boolean;
  actorSide?: number; actorTeamIndex?: number; actorSlot?: number;
  targetSlot?: number; activeSlot?: number; slot?: number;
};
export type BattlePlaybackFrame = {
  anim: string; eventKey: string; event: BattleVisualEvent | null; index: number;
  playing: boolean; sourceKey: string; durationMs: number;
};
const idleFrame = (): BattlePlaybackFrame => ({ anim: '', eventKey: '', event: null, index: -1, playing: false, sourceKey: '', durationMs: 0 });
export function battleAnimationClass(event: BattleVisualEvent): string {
  const side = event.side === 1 ? 1 : 0;
  const type = /^[a-z]+$/.test(event.type || '') ? event.type : 'normal';
  const category = ['physical', 'special', 'status'].includes(event.category || '') ? event.category : 'physical';
  const kind = /^[a-z]+$/.test(event.kind || '') ? event.kind : 'move';
  return `event-actor-${side} event-kind-${kind} fx-${type} category-${category}${event.hit === true ? ' event-hit' : ''}`;
}

export type BattleDisplay = { teams: any[][]; active: number[]; activeBySide: number[][] };
export function battleDisplay(battle: any, before = false): BattleDisplay {
  const teams = before && Array.isArray(battle.before) ? battle.before : battle.teams;
  const active = before && Array.isArray(battle.beforeActive) ? battle.beforeActive : battle.active;
  const multiple = before && Array.isArray(battle.beforeActiveBySide) ? battle.beforeActiveBySide : battle.activeBySide;
  const activeBySide = [0, 1].map(side => Array.isArray(multiple?.[side]) ? multiple[side].map((index: number) => Number.isInteger(index) ? index : -1) : [active?.[side] ?? 0]);
  return { teams: (teams || [[], []]).map((team: any[]) => team.map(mon => ({ ...mon }))), active: [...(active || [0, 0])], activeBySide };
}
export type BattleEventLocation = { side: number; index: number; slot: number; boxId?: string };
/** Explicit identity wins over side/slot hints, including friendly fire and switches. */
export function battleEventLocation(display: BattleDisplay, event: BattleVisualEvent, role: 'actor' | 'target' = 'target'): BattleEventLocation | null {
  const actor = role === 'actor';
  const boxId = actor ? event.actorBoxId || (event.kind === 'move' ? event.boxId : undefined) : event.targetBoxId || (event.kind !== 'move' ? event.boxId : undefined);
  const sideHint = actor ? event.actorSide ?? event.side : event.targetSide ?? event.side;
  const bySide = display.activeBySide || display.active.map(index => [index]);
  if (boxId !== undefined) {
    for (const side of [sideHint === 1 ? 1 : 0, sideHint === 1 ? 0 : 1]) {
      const index = display.teams[side]?.findIndex(mon => String(mon.boxId) === String(boxId)) ?? -1;
      if (index >= 0) return { side, index, slot: bySide[side]?.indexOf(index) ?? -1, boxId: String(boxId) };
    }
    return null;
  }
  const side = sideHint === 1 ? 1 : 0;
  const explicitIndex = actor ? event.actorTeamIndex : event.teamIndex;
  const explicitSlot = actor ? event.actorSlot : event.targetSlot ?? event.activeSlot ?? event.slot;
  const index = Number.isInteger(explicitIndex) ? explicitIndex! : Number.isInteger(explicitSlot) ? bySide[side]?.[explicitSlot!] : bySide[side]?.length === 1 ? bySide[side][0] : -1;
  if (!Number.isInteger(index) || !display.teams[side]?.[index]) return null;
  return { side, index, slot: bySide[side]?.indexOf(index) ?? -1, boxId: display.teams[side][index].boxId };
}
/** Apply explicit server state only; damage is never inferred from move power. */
export function applyBattleEvent(display: BattleDisplay, event: BattleVisualEvent): BattleDisplay {
  if (!['damage', 'heal', 'status', 'switch', 'faint', 'form'].includes(event.kind || '')) return display;
  const location = battleEventLocation(display, event);
  if (!location) return display;
  const { side, index } = location, team = display.teams[side] || [];
  if (!team[index]) return display;
  const changed = { ...team[index], ...(event.pokemon || {}) };
  if (Number.isFinite(event.maxHp)) changed.maxHp = Math.max(1, event.maxHp!);
  if (Number.isFinite(event.hp)) changed.hp = Math.max(0, Math.min(changed.maxHp, event.hp!));
  if (event.kind === 'faint') { changed.hp = 0; changed.fainted = true; }
  else if (Number.isFinite(event.hp) && event.hp! > 0) changed.fainted = false;
  if (Object.prototype.hasOwnProperty.call(event, 'status')) changed.status = event.status;
  const teams = [...display.teams]; teams[side] = [...team]; teams[side][index] = changed;
  const active = [...display.active], activeBySide = (display.activeBySide || display.active.map(index => [index])).map(indices => [...indices]);
  if (event.kind === 'switch') {
    let slot = event.activeSlot ?? event.targetSlot ?? event.slot;
    if (!Number.isInteger(slot)) {
      const emptySlots = activeBySide[side].map((member, slotIndex) => !team[member] || team[member].hp <= 0 ? slotIndex : -1).filter(slotIndex => slotIndex >= 0);
      slot = activeBySide[side].length === 1 ? 0 : location.slot >= 0 ? location.slot : emptySlots.length === 1 ? emptySlots[0] : undefined;
    }
    if (Number.isInteger(slot) && slot! >= 0 && slot! < activeBySide[side].length) activeBySide[side][slot!] = index;
    active[side] = activeBySide[side].find(member => member >= 0) ?? index;
  }
  return { teams, active, activeBySide };
}
/** Same-render double input and stale request completion guard. */
export class BattleSubmissionGate {
  private key = ''; private locked = false;
  reset(key: string) { this.key = key; this.locked = false; }
  enter(key: string) { if (this.key !== key) this.reset(key); if (this.locked) return false; this.locked = true; return true; }
  release(key: string) { if (this.key === key) this.locked = false; }
}

type PlaybackOptions = {
  onFrame: (frame: BattlePlaybackFrame) => void; reducedMotion?: () => boolean;
  enabled?: () => boolean; speed?: () => number;
  durationMs?: number | ((event: BattleVisualEvent) => number); gapMs?: number; maxDurationMs?: number;
};
export class BattlePlaybackController {
  private generation = 0; private pending = new Set<() => void>();
  private completed = new Set<string>(); private superseded = new Set<string>();
  private active: { key: string; generation: number; promise: Promise<boolean> } | null = null;
  constructor(private options: PlaybackOptions) {}
  private emit(frame:BattlePlaybackFrame) { try { this.options.onFrame(frame); } catch {} }
  private remember(set: Set<string>, key: string) { set.add(key); if (set.size > 128) set.delete(set.values().next().value!); }
  private wait(ms: number, generation: number): Promise<boolean> {
    if (ms <= 0) return Promise.resolve(generation === this.generation);
    return new Promise(resolve => {
      let finished = false;
      const finish = () => { if (finished) return; finished = true; clearTimeout(timer); this.pending.delete(finish); resolve(generation === this.generation); };
      const timer = setTimeout(finish, ms); this.pending.add(finish);
    });
  }
  skipDelays(): void { this.emit(idleFrame()); for (const finish of [...this.pending]) finish(); }
  /** Manual/unmount cancellation permits StrictMode to replay the same source. */
  cancel(): void { this.generation++; this.active = null; for (const finish of [...this.pending]) finish(); this.emit(idleFrame()); }
  play(events: readonly BattleVisualEvent[], sourceKey: string | number): Promise<boolean> {
    const key = String(sourceKey);
    if (this.completed.has(key) || this.superseded.has(key)) {
      if (!this.active) this.emit(idleFrame());
      return Promise.resolve(false);
    }
    if (this.active?.key === key) return this.active.promise;
    if (this.active) this.remember(this.superseded, this.active.key);
    this.cancel(); const generation = this.generation;
    let resolve!: (value: boolean) => void;
    const promise = new Promise<boolean>(done => { resolve = done; });
    this.active = { key, generation, promise };
    const settle = (done: boolean) => {
      if (done) this.remember(this.completed, key);
      if (this.active?.generation === generation) {
        this.active = null;
        this.emit(idleFrame());
      }
      resolve(done);
    };
    void this.run(Array.isArray(events) ? events.filter(Boolean) : [], key, generation).then(settle, () => settle(false));
    return promise;
  }
  private async run(events: readonly BattleVisualEvent[], key: string, generation: number): Promise<boolean> {
    const budget = Math.max(0, this.options.maxDurationMs ?? 2800), deadline = Date.now() + budget;
    const nominal = events.map(event => Math.max(0, typeof this.options.durationMs === 'function' ? this.options.durationMs(event) : this.options.durationMs ?? 700));
    const initialSpeed = Math.max(.25, this.options.speed?.() || 1);
    const total = nominal.reduce((sum, duration) => sum + duration / initialSpeed, 0) + Math.max(0, events.length - 1) * (this.options.gapMs ?? 16);
    const scale = total > budget && total > 0 ? budget / total : 1;
    this.emit({ ...idleFrame(), playing: true, sourceKey: key });
    for (let index = 0; index < events.length; index++) {
      if (generation !== this.generation) return false;
      if (this.options.reducedMotion?.() || this.options.enabled?.() === false) break;
      if (Date.now() >= deadline) break;
      if (index > 0) { this.emit({ ...idleFrame(), playing: true, sourceKey: key }); if (!await this.wait(Math.min((this.options.gapMs ?? 16) * scale, Math.max(0, deadline - Date.now())), generation)) return false; if (this.options.reducedMotion?.() || this.options.enabled?.() === false) break; }
      const event = events[index];
      const duration = Math.min(nominal[index] * scale / Math.max(.25, this.options.speed?.() || 1), Math.max(0, deadline - Date.now()));
      this.emit({ anim: battleAnimationClass(event), eventKey: `${key}:${generation}:${index}`, event, index, playing: true, sourceKey: key, durationMs: duration });
      if (!await this.wait(duration, generation)) return false;
    }
    if (generation !== this.generation) return false;
    this.emit(idleFrame()); return true;
  }
}
type HookOptions = { durationMs?: number | ((event: BattleVisualEvent) => number); gapMs?: number; enabled?: boolean; speed?: number; maxDurationMs?: number };
/** A false result means superseded/cancelled/duplicate, so do not apply its delayed response. */
export function useBattlePlayback(options: HookOptions = {}) {
  const [frame, setFrame] = useState<BattlePlaybackFrame>(idleFrame);
  const mounted = useRef(false), reducedMotion = useRef(false), currentOptions = useRef(options); currentOptions.current = options;
  const controller = useRef<BattlePlaybackController | null>(null);
  if (!controller.current) controller.current = new BattlePlaybackController({
    reducedMotion: () => reducedMotion.current, enabled: () => currentOptions.current.enabled !== false, speed: () => currentOptions.current.speed || 1,
    durationMs: event => { const duration = currentOptions.current.durationMs; return typeof duration === 'function' ? duration(event) : duration ?? 700; },
    gapMs: options.gapMs, maxDurationMs: options.maxDurationMs, onFrame: next => { if (mounted.current) setFrame(next); },
  });
  useEffect(() => {
    mounted.current = true;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)'); reducedMotion.current = query.matches;
    const onChange = () => { reducedMotion.current = query.matches; if (query.matches) controller.current!.skipDelays(); };
    query.addEventListener('change', onChange);
    return () => { mounted.current = false; query.removeEventListener('change', onChange); controller.current!.cancel(); };
  }, []);
  useEffect(() => { if (options.enabled === false) controller.current!.skipDelays(); }, [options.enabled]);
  const play = useCallback((events: readonly BattleVisualEvent[], sourceKey: string | number) => mounted.current ? controller.current!.play(events, sourceKey) : Promise.resolve(false), []);
  const cancel = useCallback(() => controller.current!.cancel(), []);
  return { ...frame, play, cancel };
}
