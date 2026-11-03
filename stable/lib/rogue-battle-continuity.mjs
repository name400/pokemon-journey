/**
 * Bounded native @pkmn/sim wild-wave continuity experiment. NOT application code.
 * Native effects/actions are called from the installed MIT dependency; notice
 * in UPSTREAM-LICENSE.txt. No PokéRogue implementation is copied.
 */
import {Battle} from '@pkmn/sim';
import {installWildLifecycle, settleLegacyMoveVictory} from './rogue-battle-lifecycle.mjs';
import {installEncounterGuards} from './rogue-encounter-guards.mjs';

export function markInitialEncounter(battle, id = 'wave-1', biome = 'meadow', {trackLifecycle = true} = {}) {
  battle.rogueWild = {version: 1, biome, encounterId: id, wave: 1, blockWaves:1, waveTurn: 1};
  for (const p of battle.p2.pokemon) p.m.rogueEncounterId = id;
  if (trackLifecycle) installWildLifecycle(battle);
  installEncounterGuards(battle);
}
export function currentFoes(battle) {
  return battle.p2.pokemon.filter(p => p.m.rogueEncounterId === battle.rogueWild?.encounterId);
}
export function publicFoes(battle) {
  return currentFoes(battle).map(p => ({token: p.set.trainerToken, species: p.species.id,
    hp: p.hp, maxHp: p.maxhp, active: p.isActive, nativeSlot: p.position + 1}));
}

export function continueWild(battle, nextSets, {id, biome = battle.rogueWild?.biome,beforeEntry=null} = {}) {
  if (!battle.rogueWild || !battle.ended || battle.winner !== battle.p1.name || battle.p2.pokemonLeft !== 0) throw Error('Requires a player victory at an ended wild boundary');
  if (biome !== battle.rogueWild.biome) throw Error('New biome requires a fresh Battle');
  if (!id || id === battle.rogueWild.encounterId) throw Error('New encounter identity required');
  if (!nextSets.length || nextSets.length > battle.p2.active.length) throw Error('Unsupported wild active count');
  if (battle.p2.pokemon.length + nextSets.length > 24) throw Error('Native 24-position reference limit requires a fresh Battle');
  if (battle.p1.active.some(p => !p?.hp || p.switchFlag || p.forceSwitchFlag)) throw Error('Player replacement/pivot boundary requires explicit handling');
  if ((battle.rogueWild.blockWaves||1) >= 10) throw Error('Biome block maximum is 10 waves');
  if (battle.rogueWild.settledEncounterId !== battle.rogueWild.encounterId) settleLegacyMoveVictory(battle);
  if (battle.winner !== battle.p1.name) throw Error('Post-victory residual exhausted the player party');
  installWildLifecycle(battle); // upgrade a safely settled legacy move victory

  // A win can leave the losing move/residual in the queue and midTurn=true.
  // They cannot be executed as the next encounter's actions.
  battle.queue.clear();
  battle.faintQueue.length = 0;
  battle.clearActiveMove(true);
  battle.ended = false;
  battle.winner = '';
  battle.sentEnd = false;
  battle.midTurn = false;
  battle.requestState = '';
  for (const side of battle.sides) {
    side.activeRequest = null;
    side.clearChoice();
  }
  battle.p2.totalFainted = 0; // current encounter, never historical graveyard
  battle.p2.faintedThisTurn = null;
  battle.p2.faintedLastTurn = null;
  battle.rogueWild = {...battle.rogueWild, encounterId: id, wave: battle.rogueWild.wave + 1,blockWaves:(battle.rogueWild.blockWaves||1)+1, waveTurn: 1};

  for (const p of battle.p1.active) {
    // Original game's wave-first-action counter is distinct from cumulative
    // summon turns. Native Fake Out uses activeMoveActions instead.
    p.activeTurns = 0;
    p.activeMoveActions = 0;
    // Winning before residual leaves native one-turn guards/flinch behind.
    // This is a bounded known tag list, NOT an all-tags original keep policy.
    for (const tag of ['flinch', 'protect', 'spikyshield', 'kingsshield', 'banefulbunker',
      'obstruct', 'silktrap', 'burningbulwark', 'endure']) {
      if (p.volatiles[tag]) p.removeVolatile(tag);
    }
  }

  const newcomers = nextSets.map(input => {
    const set = structuredClone(input);
    // addPokemon appends side.pokemon but NOT side.team. Both are mandatory:
    // State.serializeSide encodes original team order using team.indexOf(set).
    battle.p2.team.push(set);
    const p = battle.p2.addPokemon(set);
    if (!p) throw Error('Unexpected native Pokemon limit');
    p.m.rogueEncounterId = id;
    if(beforeEntry)beforeEntry(p);
    return p;
  });
  for (const [slot, p] of newcomers.entries()) {
    if (!battle.actions.switchIn(p, slot)) throw Error('Native incoming switch failed');
  }
  const first = battle.queue.shift();
  if (first?.choice !== 'runSwitch') throw Error('Unexpected native entry queue');
  battle.actions.runSwitch(first.pokemon); // batches remaining runSwitch entries
  battle.queue.clear();
  battle.resolveFaints({checkWinIfNoFaints: true});
  if (battle.ended && battle.winner === battle.p1.name) battle.rogueWild.settledEncounterId = id;
  if (!battle.ended) {
    battle.updateSpeed();
    battle.endTurn(); // next request/update, NO residual or p1 switch/start
  }
  return newcomers;
}

export function saveWild(battle) {
  return JSON.parse(JSON.stringify(battle.toJSON()));
}
export function restoreWild(snapshot) {
  const battle = Battle.fromJSON(JSON.parse(JSON.stringify(snapshot)));
  if (battle.rogueWild?.lifecycle === 'deferred-residual-v1') installWildLifecycle(battle);
  if (battle.rogueWild) installEncounterGuards(battle);
  return battle;
}

export function resetForTrainerOrBiome(playerSets, foeSets, {formatid = 'gen9customgame', seed = [1, 2, 3, 4], persistent = []} = {}) {
  const battle = new Battle({formatid, seed, p1: {name: 'hero', team: structuredClone(playerSets)},
    p2: {name: 'trainer', team: structuredClone(foeSets)}});
  if (battle.requestState === 'teampreview') battle.makeChoices(`team ${playerSets.map((_, i) => i + 1).join('')}`, `team ${foeSets.map((_, i) => i + 1).join('')}`);
  for (const saved of persistent) {
    const p = battle.p1.pokemon.find(p => p.set.trainerToken === saved.token);
    if (!p) throw Error('Missing persistent player');
    if (saved.hp !== undefined) {
      if (saved.hp <= 0) throw Error('Demo fresh reset requires the full fainted-party importer; never revive to 1 HP');
      p.hp = Math.min(p.maxhp, saved.hp);
    }
    if (saved.status) p.setStatus(saved.status, p, null, true);
    for (const slot of p.baseMoveSlots) if (Number.isInteger(saved.pp?.[slot.id])) slot.pp = saved.pp[slot.id];
  }
  battle.makeRequest('move');
  return battle;
}
