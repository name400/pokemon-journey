import {createCombat,nativeTeamSet} from '../party-battle.mjs';

import {adventureSuppressAbility} from './adventure-ability-rules.mjs';
export function adventureNativeTeamSet(mon,index){
 const set=nativeTeamSet(mon,index);
 return adventureSuppressAbility(set.ability)?{...set,ability:'noability'}:set;
}
// Shared engine receives temporary simulator-only clones. Restore the original
// saved ability field before the combat object can be written to player data.
export function createZAAbilityCombat(player,foes,options={}){
 const original=Symbol('adventure original');
 const prepare=team=>team.map((mon,index)=>{const set=adventureNativeTeamSet(mon,index);return {...mon,...(set.ability==='noability'?{ability:'noability'}:{}),[original]:mon};});
 const combat=createCombat(prepare(player),prepare(foes),options);
 combat.teams=combat.teams.map(team=>team.map(mon=>{const before=mon[original],result={...mon};delete result[original];if(!before)return result;if(Object.hasOwn(before,'ability'))result.ability=before.ability;else delete result.ability;return result;}));
 combat.adventureNoAbilitiesV2=true;
 return combat;
}
