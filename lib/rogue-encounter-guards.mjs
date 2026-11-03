/** Current-encounter guard only, native MIT move implementation reused. */
import {toID} from '@pkmn/sim';
const installed = new WeakSet();

export function installEncounterGuards(battle) {
  if (installed.has(battle)) return;
  installed.add(battle);
  const current = p => p.m.rogueEncounterId === battle.rogueWild.encounterId&&!p.m.captured&&!p.m.released;
  const nativeDex = battle.dex, nativeMove = nativeDex.moves.get('revivalblessing');
  const revive = new nativeDex.Move({...nativeMove, onTryHit(source) {
    if (source.side === this.p2 && !source.side.pokemon.some(p => current(p) && p.fainted)) return false;
    return nativeMove.onTryHit.call(this, source);
  }});
  const facade = Object.create(nativeDex);
  Object.defineProperty(facade, 'moves', {value: new Proxy(nativeDex.moves, {
    get(target, key) {
      if (key === 'get' || key === 'getByID') return function (name) {
        if (typeof name === 'string' && toID(name) === 'revivalblessing') return revive;
        return target[key](name);
      };
      const value = Reflect.get(target, key, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  })});
  battle.dex = facade;
  const nativeChooseSwitch = battle.p2.chooseSwitch;
  Object.defineProperty(battle.p2, 'chooseSwitch', {configurable: true, enumerable: false, value(slotText) {
    const actor = this.active[this.getChoiceIndex()];
    if (actor && this.slotConditions[actor.position]?.revivalblessing) {
      let target;
      if (!slotText) target = this.pokemon.find(p => current(p) && p.fainted);
      else if (/^\d+$/.test(slotText)) target = this.pokemon[Number(slotText) - 1];
      else target = this.pokemon.find(p => current(p) && (p.name.toLowerCase() === slotText.toLowerCase() || p.species.id === toID(slotText)));
      if (!target || !current(target)) return this.emitChoiceError('Archived encounter Pokemon cannot be revived');
      slotText = String(target.position + 1);
    }
    return nativeChooseSwitch.call(this, slotText);
  }});
}
