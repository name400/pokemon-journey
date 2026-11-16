import {createCombat,nativeTeamSet} from '../party-battle.mjs';

// Only ordinary effects with unambiguous ZA absence are covered here. Keep
// every unreviewed ability, including form mechanics, until independently checked.
const SUPPRESSED=new Set(['levitate','static','intimidate','pressure','overgrow','blaze','torrent','lightningrod','voltabsorb','waterabsorb','flashfire']);
const id=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function adventureNativeTeamSet(mon,index){
 const set=nativeTeamSet(mon,index);
 return SUPPRESSED.has(id(set.ability))?{...set,ability:'noability'}:set;
}
// Shared engine receives temporary simulator-only clones. Restore the original
// saved ability field before the combat object can be written to player data.
export function createZAAbilityCombat(player,foes,options={}){
 const original=Symbol('adventure original');
 const prepare=team=>team.map((mon,index)=>{const set=adventureNativeTeamSet(mon,index);return {...mon,...(set.ability==='noability'?{ability:'noability'}:{}),[original]:mon};});
 const combat=createCombat(prepare(player),prepare(foes),options);
 combat.teams=combat.teams.map(team=>team.map(mon=>{const before=mon[original],result={...mon};delete result[original];if(!before)return result;if(Object.hasOwn(before,'ability'))result.ability=before.ability;else delete result.ability;return result;}));
 return combat;
}
