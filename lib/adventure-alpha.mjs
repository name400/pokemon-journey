import {Battle} from '@pkmn/sim';
import {configure} from './pokemon-config.mjs';

// Preserve the existing wild-IV policy (all 31), which satisfies Z-A's minimum
// of three perfect IVs, until the remaining-IV distribution is verified.
export function makeAdventureAlpha(mon){
 const alphaMove=mon.speciesId===16?'유턴':null;
 const moves=alphaMove?[alphaMove,...(mon.moves||[]).filter(move=>move!==alphaMove)].slice(0,4):mon.moves;
 return configure({...mon,moves,evs:{...mon.evs,hp:252},adventureAlpha:true,...(alphaMove?{adventureAlphaMove:alphaMove}:{})});
}

// Operate only on the newly created adventure battle snapshot. Captured data and
// other game modes retain normal Pokémon stats; Showdown serializes these values.
export function applyAdventureAlphaBattleStats(combat){
 const battle=Battle.fromJSON(combat.snapshot);
 for(const mon of combat.teams[1]){
  if(mon.adventureAlpha!==true)continue;
  const actor=battle.p2.pokemon.find(p=>p.set.trainerToken===String(mon.boxId));
  if(!actor)throw Error('우두머리 배틀 정보를 확인하세요.');
  for(const key of ['atk','def','spa','spd']){actor.storedStats[key]*=2;actor.baseStoredStats[key]*=2;}
 }
 combat.snapshot=battle.toJSON();return combat;
}
