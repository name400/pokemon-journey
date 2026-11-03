import {configure} from './pokemon-config.mjs';

// Preserve the existing wild-IV policy (all 31), which satisfies Z-A's minimum
// of three perfect IVs, until the remaining-IV distribution is verified.
export function makeAdventureAlpha(mon){
 return configure({...mon,evs:{...mon.evs,hp:252},adventureAlpha:true});
}
