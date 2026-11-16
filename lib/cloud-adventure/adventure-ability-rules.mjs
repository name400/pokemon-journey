import {Dex} from '@pkmn/sim';
// Preserve special, unreviewed simulator mechanics. In particular these three
// reproduce ZA's documented species-specific behaviour in the turn engine.
const KEEP=new Set(['stancechange','disguise','hungerswitch']);
// These ordinary abilities carry simulator anti-copy flags, but are not
// species form mechanics and do not apply in ZA.
const ORDINARY_RESTRICTED=new Set(['neutralizinggas','wonderguard','trace']);
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
export function installAdventureAbilityRules(battle,enabled,morpeko=false){
 if(enabled!==true)return battle;
 for(const side of battle.sides)for(const pokemon of side.pokemon){
  const base=Object.getPrototypeOf(pokemon),original=pokemon.ignoringAbility;
  const proto=Object.create(base);
  Object.defineProperty(proto,'ignoringAbility',{value:function(){return morpeko===true&&this.ability==='hungerswitch'&&this.species?.baseSpecies==='Morpeko'||adventureSuppressAbility(this.ability)||original.call(this);}});
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
