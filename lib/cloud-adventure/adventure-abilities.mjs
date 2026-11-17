import {createCombat,nativeTeamSet} from '../party-battle.mjs';

import {adventureSuppressAbility,initializeZAFormAttack} from './adventure-ability-rules.mjs';
import {Battle,Dex} from '@pkmn/sim';
import {rules,effectiveIVs} from '../pokemon-config.mjs';
import {ZA_BASE_ATTACK} from './adventure-za-attack.mjs';
export function adventureNativeTeamSet(mon,index){
 const set=nativeTeamSet(mon,index);
 // ZA's 10%/50% Zygarde changes form independently of its stored Ability.
 // Only recognized native forms and known stored abilities are adapted.
 if(mon?.speciesId===718&&[718,10181].includes(mon.id)&&['aurabreak','powerconstruct'].includes(String(set.ability).toLowerCase().replace(/[^a-z0-9]/g,'')))return {...set,ability:'powerconstruct'};
 return adventureSuppressAbility(set.ability)?{...set,ability:'noability'}:set;
}
// Display the next ZA battle's unboosted Attack without editing the stored mon.
// Inputs that cannot be represented safely remain on the existing display path.
export function zaFieldAttack(mon){
 const base=ZA_BASE_ATTACK[rules.species[mon?.id]?.key];if(!base)return null;
 const level=mon.level,iv=effectiveIVs(mon).atk,ev=mon.evs?.atk??0;
 if(!Number.isSafeInteger(level)||level<1||level>100||!Number.isSafeInteger(iv)||iv<0||iv>31||!Number.isSafeInteger(ev)||ev<0||ev>255)return null;
 const nature=Dex.natures.get(mon.rogueNatureOverride||mon.nature||'hardy'),raw=Math.floor((2*base+iv+Math.floor(ev/4))*level/100)+5;
 return nature.plus==='atk'?Math.floor(raw*110/100):nature.minus==='atk'?Math.floor(raw*90/100):raw;
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
 const prepared=initializeZAFormAttack(Battle.fromJSON(combat.snapshot));combat.snapshot=prepared.toJSON();combat.adventureZAFormAttackV1=true;
 combat.adventureNoAbilitiesV2=true;combat.adventureMorpekoV1=true;combat.adventureDisguiseV1=true;combat.adventureWeatherLockV1=true;combat.adventureMegaPowerV1={version:1,trainers:{}};
 return combat;
}
