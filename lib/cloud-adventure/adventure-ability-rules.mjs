import {Dex} from '@pkmn/sim';
// Preserve special, unreviewed simulator mechanics. In particular these three
// reproduce ZA's documented species-specific behaviour in the turn engine.
const KEEP=new Set(['stancechange','disguise','hungerswitch']);
// These ordinary abilities carry simulator anti-copy flags, but are not
// species form mechanics and do not apply in ZA.
const ORDINARY_RESTRICTED=new Set(['neutralizinggas','wonderguard','trace']);
// ZA caps the damage of the first direct hit rather than blocking it and
// applying separate recoil. This is attached only to versioned new battles.
const nativeDisguise=Dex.abilities.get('disguise');
const zaDisguise=Object.create(nativeDisguise);
Object.defineProperties(zaDisguise,{
 onCriticalHit:{value:undefined},onEffectiveness:{value:undefined},
 onDamage:{value:function(damage,target,source,effect){
  if(effect?.effectType==='Move'&&['mimikyu','mimikyutotem'].includes(target.species.id)){
   this.add('-activate',target,'ability: Disguise');this.effectState.busted=true;
   return Math.min(damage,Math.max(1,Math.floor(target.baseMaxhp/8)));
  }
 }},
 onUpdate:{value:function(pokemon){
  if(['mimikyu','mimikyutotem'].includes(pokemon.species.id)&&this.effectState.busted)
   pokemon.formeChange(pokemon.species.id==='mimikyutotem'?'Mimikyu-Busted-Totem':'Mimikyu-Busted',this.effect,true);
 }}
});
// These are ZA's base Attack stats, not the traditional Huge/Pure Power multiplier.
// Apply only when a new battle opts in; older snapshots keep their own stats.
const ZA_BASE_ATTACK=Object.freeze({meditite:56,medicham:84,medichammega:140,mawilemega:147,starmiemega:140});
function applyZAFormAttack(pokemon){
 const base=ZA_BASE_ATTACK[pokemon.species?.id];if(!base||pokemon.transformed)return;
 const attack=pokemon.battle.statModify({...pokemon.species.baseStats,atk:base},pokemon.set,'atk');
 pokemon.storedStats.atk=attack;pokemon.baseStoredStats.atk=attack;
}
export function initializeZAFormAttack(battle){for(const side of battle.sides)for(const pokemon of side.pokemon)applyZAFormAttack(pokemon);return battle;}
export function adventureSuppressAbility(value){
 const ability=Dex.abilities.get(value||'');
 if(!ability.exists||ability.id==='noability'||KEEP.has(ability.id))return false;
 const flags=ability.flags||{};
 // Restricted/cannot-copy abilities may represent unreviewed form mechanics.
 if(flags.cantsuppress||!ORDINARY_RESTRICTED.has(ability.id)&&(flags.failroleplay||flags.noreceiver||flags.noentrain||flags.notrace||flags.failskillswap))return false;
 return true;
}
// Battle snapshots contain only serializable state; install this prototype only
// in an opted-in in-memory instance after every restoration, including Mega.
export function installAdventureAbilityRules(battle,enabled,morpeko=false,disguise=false,formAttack=false){
 if(enabled!==true)return battle;
 for(const side of battle.sides)for(const pokemon of side.pokemon){
  const base=Object.getPrototypeOf(pokemon),original=pokemon.ignoringAbility,originalGetAbility=pokemon.getAbility,originalSetSpecies=pokemon.setSpecies;
  const proto=Object.create(base);
  Object.defineProperty(proto,'ignoringAbility',{value:function(){return morpeko===true&&this.ability==='hungerswitch'&&this.species?.baseSpecies==='Morpeko'||adventureSuppressAbility(this.ability)||original.call(this);}});
  if(formAttack===true)Object.defineProperty(proto,'setSpecies',{value:function(species,source,isTransform){const result=originalSetSpecies.call(this,species,source,isTransform);if(result&&!isTransform)applyZAFormAttack(this);return result;}});
  if(disguise===true)Object.defineProperty(proto,'getAbility',{value:function(){const ability=originalGetAbility.call(this);return ability.id==='disguise'&&this.species?.baseSpecies==='Mimikyu'?zaDisguise:ability;}});
  Object.setPrototypeOf(pokemon,proto);
 }
 return battle;
}

// ZA changes Morpeko's mode after Aura Wheel, not at the end of each turn.
// Install transiently alongside the battle's other event hooks.
export function installAdventureMorpeko(battle,enabled){
 if(enabled!==true)return;
 battle.onEvent('AfterMove',battle.format,{priority:0},function(source,target,move){
  if(!source?.hp||source.transformed||source.ability!=='hungerswitch'||source.species?.baseSpecies!=='Morpeko'||move?.id!=='aurawheel')return;
  source.formeChange(source.species.name==='Morpeko'?'Morpeko-Hangry':'Morpeko');
 });
}
// The shared visual log uses the move's static Dex type; Aura Wheel's actual
// execution type depends on the actor's mode at the beginning of its action.
export function adventureMorpekoEvents(events,teams,enabled){
 if(enabled!==true||!Array.isArray(events)||!Array.isArray(teams))return events;
 const hungry=new Set(teams.flat().filter(mon=>mon?.battleAppearance==='morpekohangry'&&typeof mon.boxId==='string'&&mon.boxId.length>0).map(mon=>mon.boxId));
 if(!hungry.size)return events;
 return events.map(event=>event?.moveId==='aurawheel'&&hungry.has(event.actorBoxId)?{...event,type:'dark'}:event);
}
