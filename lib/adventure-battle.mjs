import {configure} from './pokemon-config.mjs';

// These fields describe the current battle presentation or temporary state.
// Preserve any values that were already present before this particular battle.
const presentationKeys=['battleAppearance','battleArtId','battleSprite','currentAbility','currentTypes','terastallized','dynamaxed','gigantamax','mega','primal','ultra','battleCriticals'];

export function adventureBattleBase(teams){
 return teams.map(team=>team.map(mon=>({boxId:mon.boxId,fields:Object.fromEntries(presentationKeys.filter(key=>Object.hasOwn(mon,key)).map(key=>[key,structuredClone(mon[key])]))})));
}

export function adventureBattleBaseFor(combat,side,mon){
 return combat?.adventureBattleBase?.[side]?.find(entry=>entry.boxId===mon.boxId)?.fields;
}

export function restoreAdventurePokemon(mon,base){
 const clean={...mon};
 if(base){for(const key of presentationKeys){delete clean[key];if(Object.hasOwn(base,key))clean[key]=structuredClone(base[key]);}}
 else {delete clean.battleAppearance;delete clean.battleArtId;} // Older battles did not record a baseline.
 const normal=configure(clean,{hp:mon.hp});
 // Dynamax is temporary; Showdown ends it by rounding remaining HP up to the
 // equivalent base-HP fraction. Do not reinterpret pre-existing saved forms.
 if(base&&mon.dynamaxed&&!base.dynamaxed&&mon.maxHp>0&&normal.maxHp!==mon.maxHp){
  normal.hp=mon.hp<=0?0:Math.min(normal.maxHp,Math.max(1,Math.ceil(mon.hp*normal.maxHp/mon.maxHp)));
 }
 return normal;
}
