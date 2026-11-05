/**
 * Passive ability adapter integrated into the Classic battle engine.
 * Native callbacks are invoked from the installed MIT @pkmn/sim dependency;
 * see UPSTREAM-LICENSE.txt. No PokéRogue implementation code is copied.
 *
 * Previously exercised examples include Levitate, Intimidate, Multitype,
 * Flash Fire, Mold Breaker, Adaptability and Battle Armor. The adapter accepts
 * other native abilities, but their interactions are not fully validated.
 */
import {Battle, Dex, PRNG, toID} from '@pkmn/sim';

const bindings = new WeakMap();
const SUPPORTED = new Set(Dex.abilities.all().filter(a=>a.exists&&a.num>0).map(a=>a.id));
const PREFIX = 'roguepassive:';

export function bindAbilityComponents(battle, input) {
  if (input?.version !== 2 || !Array.isArray(input.pokemon)) throw Error('Invalid component descriptor');
  const descriptor = structuredClone(input);
  const records = new Map();
  for (const e of descriptor.pokemon) {
    e.passive = toID(e.passive);
    if (![0, 1].includes(e.side) || typeof e.token !== 'string' || !e.token || !SUPPORTED.has(e.passive)) throw Error('Unsupported component');
    const key = `${e.side}:${e.token}`;
    if (records.has(key)) throw Error('Duplicate component owner');
    records.set(key, e);
    Object.freeze(e);
  }
  Object.freeze(descriptor.pokemon);
  Object.freeze(descriptor);
  const signature = JSON.stringify(descriptor);
  const prior = bindings.get(battle);
  if (prior) {
    if (prior.signature !== signature) throw Error('Descriptor updates require a restore boundary');
    return prior.api;
  }

  const nativeDex = battle.dex;
  const nativeSingleEvent = battle.singleEvent;
  const contexts = new WeakMap();
  const ownHandlers = new Set();
  const wrappedConditions = new Map();
  const recordFor = p => records.get(`${p.side.n}:${String(p.set.trainerToken || '')}`);
  const passiveState = p => {
    const e = recordFor(p);
    return e && p.volatiles[`${PREFIX}${e.passive}`];
  };
  const ability = id => nativeDex.abilities.getByID(toID(id));
  for (const p of battle.getAllActive()) {
    if (recordFor(p) && !passiveState(p)) throw Error('Bind a fresh battle before initial entry');
  }
  const baseState = p => contexts.get(p)?.baseState || p.abilityState;
  let dispatchDepth = 0;
  let reconciling = false;

  function shieldActive(p) {
    // Native Ability Shield has ignoreKlutz, so this check does not recursively
    // ask hasAbility/ignoringAbility while computing ability suppression.
    return p.item === 'abilityshield' && p.isActive && !p.volatiles.embargo &&
      !battle.field.pseudoWeather.magicroom;
  }
  function gasOwner(p) {
    if (!p.hp || !p.isActive || p.volatiles.gastroacid || p.transformed) return false;
    if (p.ability === 'neutralizinggas' && !baseState(p).ending) return true;
    const e = recordFor(p), state = passiveState(p);
    return e?.passive === 'neutralizinggas' && state?.queryActive && !state.nativeState?.ending;
  }
  function gasActive() {
    return battle.getAllActive().some(gasOwner);
  }
  function suppressed(p, effect) {
    if (battle.gen >= 5 && !p.isActive) return true;
    if (effect.flags.notransform && p.transformed) return true;
    if (effect.flags.cantsuppress) return false;
    if (p.volatiles.gastroacid) return true;
    // The source exempts a lone Gas owner's other component. With two Gas
    // sources, SuppressAbilitiesTag.shouldApplyToSelf suppresses both owners'
    // other suppressible components; duplicate base/passive Gas counts once.
    if (shieldActive(p) || effect.id === 'neutralizinggas') return false;
    if (gasOwner(p) && battle.getAllActive().filter(gasOwner).length === 1) return false;
    if (p.volatiles.commanding) return false;
    return gasActive();
  }
  function query(p, wanted) {
    const ids = (Array.isArray(wanted) ? wanted : [wanted]).map(toID);
    if (ids.includes(p.ability) && !suppressed(p, ability(p.ability))) return true;
    const e = recordFor(p), state = passiveState(p);
    return !!(e && state?.queryActive && ids.includes(e.passive) && !suppressed(p, ability(e.passive)));
  }

  function seed(p) {
    const e = recordFor(p);
    if (!e || !p.hp) return;
    const id = PREFIX + e.passive;
    if (p.volatiles[id]) return;
    p.volatiles[id] = battle.initEffectState({
      id, target: p, queryActive: true, ready: false, started: false,
      nativeState: battle.initEffectState({id: e.passive, target: p}),
    });
  }

  function invokeNative(p, effect, state, eventid, callback, args, route = 'passive') {
    if (eventid !== 'End' && suppressed(p, effect)) return undefined;
    if (route === 'passive' && effect.flags.breakable && battle.suppressingAbility(p)) return undefined;
    const oldState = p.abilityState;
    const oldContext = contexts.get(p);
    const oldEvent = battle.event, oldEffect = battle.effect, oldEffectState = battle.effectState;
    const oldDepth = battle.eventDepth;
    let result;
    dispatchDepth++;
    contexts.set(p, {id: effect.id, baseState: oldContext?.baseState || oldState});
    p.abilityState = state;
    try {
      nativeSingleEvent.call(battle, eventid, effect, state, p,
        oldEvent?.source, oldEvent?.effect, undefined, function () {
          // singleEvent normally has no modifier accumulator. Preserve the
          // parent runEvent contract for callbacks using chainModify or event.target.
          if (oldEvent && !(state.rogueFormReplacement && ['Start', 'End', 'SwitchIn'].includes(eventid))) {
            this.event.target = oldEvent.target;
            this.event.source = oldEvent.source;
            this.event.effect = oldEvent.effect;
            if (oldEvent.modifier !== undefined) this.event.modifier = oldEvent.modifier;
          }
          result = callback.apply(this, args);
          if (oldEvent?.modifier !== undefined) oldEvent.modifier = this.event.modifier;
          return result;
        });
      return result;
    } finally {
      p.abilityState = oldState;
      if (oldContext) contexts.set(p, oldContext);
      else contexts.delete(p);
      // Native singleEvent has no finally if its callback throws.
      battle.event = oldEvent;
      battle.effect = oldEffect;
      battle.effectState = oldEffectState;
      battle.eventDepth = oldDepth;
      dispatchDepth--;
    }
  }

  function endPassiveGas(p, state = passiveState(p)) {
    const e = recordFor(p);
    if (e?.passive !== 'neutralizinggas' || !state?.ready || !state.queryActive ||
        state.nativeState.ending || p.ability === 'neutralizinggas') return;
    const effect = ability(e.passive);
    // Use the installed native End callback to restart suppressed main
    // abilities, with the auxiliary component's state rather than base state.
    if (typeof effect.onEnd === 'function') invokeNative(p, effect, state.nativeState, 'End', effect.onEnd, [p]);
    state.nativeState.ending = true;
    state.started = false;
  }
  function startPassive(p, state) {
    const e = recordFor(p);
    if (!e || !state || state !== passiveState(p) || !state.queryActive || !state.ready || !p.isActive || !p.hp) return;
    const effect = ability(e.passive);
    state.wasSuppressed = suppressed(p, effect);
    if (state.wasSuppressed) { state.started = false; return; }
    if (effect.id === 'neutralizinggas' && state.nativeState.ending && !p.beingCalledBack &&
        typeof effect.onSwitchIn === 'function') {
      invokeNative(p, effect, state.nativeState, 'SwitchIn', effect.onSwitchIn, [p]);
    }
    // Trace may already have acquired and started the same ability.
    if (p.ability === e.passive) { state.started = true; return; }
    if (state.started) return;
    // Native Gas.onEnd runs before the outgoing Gas user has left its slot.
    // Do not aim a restarted Intimidate at that outgoing/fainted Pokemon.
    if (effect.id === 'intimidate' && !p.adjacentFoes().some(foe => foe.hp && !foe.beingCalledBack)) return;
    const callback = effect.onStart;
    if (callback) invokeNative(p, effect, state.nativeState, 'Start', callback, [p]);
    state.started = true;
  }
  function reconcilePassives() {
    if (dispatchDepth || reconciling || battle.ended) return;
    reconciling = true;
    try {
      const switchingOut = battle.getAllActive().some(p => p.beingCalledBack);
      for (const p of battle.getAllActive()) {
        const state = passiveState(p), e = recordFor(p);
        if (!state || !e || !state.ready) continue;
        if (e.passive === 'neutralizinggas' && !gasOwner(p)) endPassiveGas(p, state);
        const isSuppressed = suppressed(p, ability(e.passive));
        if (isSuppressed) { state.wasSuppressed = true; state.started = false; }
        else if (!switchingOut) startPassive(p, state);
      }
    } finally { reconciling = false; }
  }

  // Explicit source form changes may change a passive during the same turn.
  // Existing callers keep their immutable descriptor until this API is invoked.
  function replacePassive(p, nextId) {
    const id = nextId ? toID(nextId) : null;
    if (!p || p.battle !== battle || id && !SUPPORTED.has(id)) throw Error('Unsupported form passive');
    const key = `${p.side.n}:${String(p.set.trainerToken || '')}`;
    const previous = recordFor(p), state = passiveState(p);
    if ((previous?.passive || null) === id) return false;
    const ready = !!p.isActive || !!state?.ready;
    if (previous && state) {
      const effect = ability(previous.passive);
      if (state.started && state.queryActive && p.ability !== effect.id && typeof effect.onEnd === 'function') {
        invokeNative(p, effect, state.nativeState, 'End', effect.onEnd, [p]);
      }
      state.queryActive = false;
      state.started = false;
      delete p.volatiles[PREFIX + previous.passive];
    }
    if (id) {
      records.set(key, Object.freeze({side: p.side.n, token: String(p.set.trainerToken || ''), passive: id}));
      const volatile = PREFIX + id;
      p.volatiles[volatile] = battle.initEffectState({id: volatile, target: p,
        queryActive: true, ready, started: false,
        nativeState: battle.initEffectState({id, target: p, rogueFormReplacement: true}),
      });
      startPassive(p, p.volatiles[volatile]);
    } else records.delete(key);
    const binding = bindings.get(battle);
    if (binding) binding.signature = JSON.stringify(api.descriptor);
    reconcilePassives();
    return true;
  }

  function passiveCondition(id) {
    if (wrappedConditions.has(id)) return wrappedConditions.get(id);
    const effect = ability(id.slice(PREFIX.length));
    if (!SUPPORTED.has(effect.id)) throw Error('Unsupported serialized passive');
    // A neutral Condition avoids the native event loop's early, base-only
    // Ability suppression check. invokeNative applies the correct component.
    const condition = {...effect, id, effectType: 'Condition'};
    for (const [name, value] of Object.entries(effect)) {
      if (!/^on[A-Z]/.test(name) || !(typeof value === 'function' || typeof value === 'boolean' ||
          name === 'onFractionalPriority' && typeof value === 'number')) continue;
      const callback = typeof value === 'function' ? value : function () { return value; };
      const eventid = name.replace(/^on(?:Ally|Foe|Any|Source)?/, '');
      condition[name] = function (...args) {
        const p = this.effectState.target, state = this.effectState;
        if (!state.queryActive || p.ability === effect.id) return undefined;
        return invokeNative(p, effect, state.nativeState, eventid, callback, args);
      };
      // Keep native ability suborder despite the neutral outer effect type.
      condition[`${name}SubOrder`] ||= 7;
    }
    // Query state exists before hazards. Actual side-effect Start runs after all
    // ordinary native base starts, including Trace's copied ability Start.
    delete condition.onStart;
    condition.onSwitchInPriority = -100000;
    condition.onSwitchInSubOrder = 7;
    condition.onSwitchIn = function (p) {
      this.effectState.ready = true;
      if (this.effectState.queryActive && p.ability !== effect.id && typeof effect.onSwitchIn === 'function') {
        invokeNative(p, effect, this.effectState.nativeState, 'SwitchIn', effect.onSwitchIn, [p]);
      }
      startPassive(p, this.effectState);
    };
    // Gas has a field-wide End lifecycle. Other auxiliary removals continue
    // to avoid calling the ordinary base ability's End logic.
    condition.onEnd = function () {
      if (effect.id === 'neutralizinggas') endPassiveGas(this.effectState.target, this.effectState);
      this.effectState.queryActive = false;
      this.effectState.started = false;
    };
    wrappedConditions.set(id, condition);
    return condition;
  }

  // This facade is owned by this Battle only; Dex instances/caches/data and
  // Pokemon/Battle prototypes are never patched.
  const localDex = Object.create(nativeDex);
  Object.defineProperty(localDex, 'conditions', {value: new Proxy(nativeDex.conditions, {
    get(target, key) {
      if (key === 'get' || key === 'getByID') return function (name) {
        if (typeof name === 'string' && name.startsWith(PREFIX)) return passiveCondition(name);
        return target[key](name);
      };
      const value = Reflect.get(target, key, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  })});
  // Native Gastro Acid refuses the whole move when ONLY the base ability is
  // unsuppressible. Under independent-component semantics it can still suppress
  // the ordinary passive. Bounded move adapter; original-game move eligibility
  // must be checked separately before adopting it in production.
  const gastroAcid = new nativeDex.Move({...nativeDex.moves.get('gastroacid'),
    onTryHit(target, ...rest) {
      const e = recordFor(target);
      if (target.getAbility().flags.cantsuppress && e && !ability(e.passive).flags.cantsuppress) {
        if (target.hasItem('Ability Shield')) {
          this.add('-block', target, 'item: Ability Shield');
          return null;
        }
        return undefined;
      }
      return nativeDex.moves.get('gastroacid').onTryHit.call(this, target, ...rest);
    },
  });
  Object.defineProperty(localDex, 'moves', {value: new Proxy(nativeDex.moves, {
    get(target, key) {
      if (key === 'get' || key === 'getByID') return function (name) {
        if (typeof name === 'string' && toID(name) === 'gastroacid') return gastroAcid;
        return target[key](name);
      };
      const value = Reflect.get(target, key, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  })});
  battle.dex = localDex;

  function bindPokemon(p) {
    Object.defineProperty(p, 'ignoringAbility', {configurable: true, enumerable: false,
      value() { return suppressed(this, ability(contexts.get(this)?.id || this.ability)); }});
    Object.defineProperty(p, 'hasAbility', {configurable: true, enumerable: false,
      value(wanted) { return query(this, wanted); }});
  }
  for (const side of battle.sides) for (const p of side.pokemon) bindPokemon(p);

  Object.defineProperty(battle, 'singleEvent', {configurable: true, enumerable: false,
    value(eventid, effect, state, target, ...rest) {
      const p = target?.side && target.battle === battle ? target : null;
      const ps = p && passiveState(p), e = p && recordFor(p);
      const baseStart = p && effect.effectType === 'Ability' && eventid === 'Start' &&
        effect.id === p.ability && state === baseState(p);
      if (baseStart && e?.passive === effect.id && ps?.started && !suppressed(p, effect)) return true;
      const savedEvent = this.event, savedDepth = this.eventDepth;
      const savedEffect = this.effect, savedEffectState = this.effectState;
      let completed = false;
      dispatchDepth++;
      try {
        const result = nativeSingleEvent.call(this, eventid, effect, state, target, ...rest);
        if (baseStart && e?.passive === effect.id && ps && !suppressed(p, effect)) ps.started = true;
        completed = true;
        return result;
      } finally {
        this.event = savedEvent;
        this.eventDepth = savedDepth;
        this.effect = savedEffect;
        this.effectState = savedEffectState;
        dispatchDepth--;
        if (completed) reconcilePassives();
      }
    }});

  function on(event, priority, callback) {
    battle.onEvent(event, battle.format, priority, callback);
    ownHandlers.add(battle.events[`on${event}`].at(-1));
  }
  on('BeforeSwitchIn', {priority: 100}, function (p) { bindPokemon(p);seed(p); });
  on('SwitchOut', {priority: 1000}, function (p) { endPassiveGas(p); });
  on('Faint', {priority: 1000}, function (p) { endPassiveGas(p); });
  // Guarantees a post-entry reconciliation even if an incoming Pokemon has no
  // native SwitchIn callbacks, after Gas's early onEnd restart boundary.
  on('SwitchIn', {priority: -200000}, function () {});
  // Multitype is implemented with raw pokemon.ability checks in the native
  // Arceus species condition, not in AbilityData. This explicit bounded adapter
  // is required to prove the passive's actual Plate/type effect without faking
  // pokemon.ability. It is not a general solution for all hardcoded abilities.
  on('Type', {priority: 0}, function (types, p) {
    const e = recordFor(p);
    if (e?.passive === 'multitype' && !battle.rogueSourceTypedForm?.(p) && p.baseSpecies.baseSpecies === 'Arceus' &&
        !p.transformed && query(p, 'Multitype')) return [p.getItem().onPlate || 'Normal'];
  });

  const api = {
    get descriptor() { return Object.freeze({...descriptor, pokemon: Object.freeze([...records.values()])}); },
    replacePassive,
    reconcile: reconcilePassives,
    componentSuppressed: (p, id) => suppressed(p, ability(id)),
    serialize() {
      // The Classic adapter owns the entire instance registry and reinstalls
      // every registered hook before requests and AI simulations are restored.
      const property = Object.getOwnPropertyDescriptor(battle, 'events');
      try { delete battle.events; return battle.toJSON(); }
      finally { if (property) Object.defineProperty(battle, 'events', property); }
    },
  };
  bindings.set(battle, {signature, api});
  return api;
}

export function replaceAbilityPassive(battle, pokemon, id) {
  const binding = bindings.get(battle);
  if (!binding) throw Error('Bind ability components before changing a form passive');
  return binding.api.replacePassive(pokemon, id);
}

export function saveAbilityCombat(battle, binding) {
  return JSON.parse(JSON.stringify({snapshot: binding.serialize(), components: binding.descriptor}));
}
export function restoreAbilityCombat(combat) {
  // Native fromJSON eagerly computes requests before instance hooks exist.
  // Tombstone them temporarily, bind first, then compute without clearing the
  // already submitted side choices. Preserve true null requests and the PRNG.
  const state = structuredClone(combat.snapshot);
  const activeRequests = state.sides.map(side => side.activeRequest !== null);
  for (const side of state.sides) side.activeRequest = null;
  const battle = Battle.fromJSON(state);
  const binding = bindAbilityComponents(battle, combat.components);
  if (activeRequests.some(Boolean)) {
    try {
      const requests = battle.getRequests(battle.requestState);
      battle.sides.forEach((side, i) => { side.activeRequest = activeRequests[i] ? requests[i] : null; });
    } finally {
      battle.prng = new PRNG(state.prng);
    }
  }
  return {battle, binding};
}
