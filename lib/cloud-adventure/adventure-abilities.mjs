import {createCombat,nativeTeamSet} from '../party-battle.mjs';

import {adventureSuppressAbility} from './adventure-ability-rules.mjs';
export function adventureNativeTeamSet(mon,index){
 const set=nativeTeamSet(mon,index);
 // ZA's 10%/50% Zygarde changes form independently of its stored Ability.
 // Only recognized native forms and known stored abilities are adapted.
 if(mon?.speciesId===718&&[718,10181].includes(mon.id)&&['aurabreak','powerconstruct'].includes(String(set.ability).toLowerCase().replace(/[^a-z0-9]/g,'')))return {...set,ability:'powerconstruct'};
 return adventureSuppressAbility(set.ability)?{...set,ability:'noability'}:set;
}
export function zaZygardeFieldHp(mon,normal){
 if(mon?.speciesId!==718||![718,10181].includes(mon.id)||mon.battleAppearance!=='zygardecomplete'||mon.currentAbility!=='powerconstruct'||!Number.isFinite(mon.hp)||!Number.isFinite(normal?.maxHp))return null;
 return Math.max(0,Math.min(normal.maxHp,mon.hp));
}
// Shared engine receives temporary simulator-only clones. Restore the original
// saved ability field before the combat object can be written to player data.
export function createZAAbilityCombat(player,foes,options={}){
 const original=Symbol('adventure original');
 const prepare=team=>team.map((mon,index)=>{const set=adventureNativeTeamSet(mon,index);return {...mon,ability:set.ability,[original]:mon};});
 const combat=createCombat(prepare(player),prepare(foes),options);
 combat.teams=combat.teams.map(team=>team.map(mon=>{const before=mon[original],result={...mon};delete result[original];if(!before)return result;if(Object.hasOwn(before,'ability'))result.ability=before.ability;else delete result.ability;return result;}));
 combat.adventureNoAbilitiesV2=true;combat.adventureMorpekoV1=true;combat.adventureDisguiseV1=true;combat.adventureWeatherLockV1=true;combat.adventureMegaPowerV1={version:1,trainers:{}};
 return combat;
}
