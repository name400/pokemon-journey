/** Bounded wild-only lifecycle hooks; native MIT callbacks remain in dependency. */
const installed = new WeakSet();

function lapseFieldDuration(battle) {
  for (const [state, clear] of [[battle.field.weatherState, 'clearWeather'], [battle.field.terrainState, 'clearTerrain']]) {
    if (state.duration > 0 && --state.duration === 0) battle.field[clear]();
  }
}

export function installWildLifecycle(battle) {
  if (installed.has(battle)) return;
  installed.add(battle);
  const nativeCheckWin = battle.checkWin, nativeRunAction = battle.runAction;
  let actionInProgress = null;
  battle.rogueWild.lifecycle = 'deferred-residual-v1';

  Object.defineProperty(battle, 'checkWin', {configurable: true, enumerable: false, value(...args) {
    // Only a live wild turn's player victory is deferred. Player defeats/ties
    // and entry-hazard KOs outside a turn retain native terminal handling.
    if (this.midTurn && actionInProgress && !this.ended && this.p2.pokemonLeft === 0 && this.p1.pokemonLeft > 0) {
      this.rogueWild.pendingVictory = true;
      return false;
    }
    return nativeCheckWin.apply(this, args);
  }});
  Object.defineProperty(battle, 'runAction', {configurable: true, enumerable: false, value(action) {
    const prior = actionInProgress;
    actionInProgress = action.choice;
    this.rogueWild.lastNativeAction = action.choice;
    try {
      let result;
      if (action.choice === 'residual' && this.rogueWild.pendingVictory && this.rogueWild.wave % 10 === 0) {
        // Original move-KO interlude skips status/items/tags but lapses field
        // counters. This is not a general all-causes interlude phase emulator.
        lapseFieldDuration(this);
        this.rogueWild.interludeResidualSkipped = true;
      } else result = nativeRunAction.call(this, action);
      if (action.choice === 'residual') {
        this.rogueWild.lastResidualTurn = this.turn;
        if (this.rogueWild.pendingVictory && !this.ended) {
          this.rogueWild.settledEncounterId = this.rogueWild.encounterId;
          this.rogueWild.pendingVictory = false;
          nativeCheckWin.call(this);
        }
      }
      return result;
    } finally { actionInProgress = prior; }
  }});
}

export function settleLegacyMoveVictory(battle) {
  if (!battle.ended || battle.winner !== battle.p1.name) throw Error('Not an ended player victory');
  if (battle.rogueWild.settledEncounterId === battle.rogueWild.encounterId) return;
  if (!battle.queue.list.some(action => action.choice === 'residual')) {
    throw Error('Untracked residual/entry victory: completed effect handlers are not recorded in the legacy snapshot');
  }
  const ownCheckWin = Object.getOwnPropertyDescriptor(battle, 'checkWin');
  const ended = battle.ended, winner = battle.winner;
  Object.defineProperty(battle, 'checkWin', {configurable: true, enumerable: false, value() { return false; }});
  try {
    battle.ended = false;
    if (battle.rogueWild.wave % 10 === 0) lapseFieldDuration(battle);
    else battle.fieldEvent('Residual');
    battle.rogueWild.settledEncounterId = battle.rogueWild.encounterId;
  } finally {
    if (ownCheckWin) Object.defineProperty(battle, 'checkWin', ownCheckWin);
    else delete battle.checkWin;
    battle.ended = ended;
    battle.winner = battle.p1.pokemonLeft ? winner : battle.p2.name;
  }
}
