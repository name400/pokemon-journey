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
export function installAdventureAbilityRules(battle,enabled){
 if(enabled!==true)return battle;
 for(const side of battle.sides)for(const pokemon of side.pokemon){
  const base=Object.getPrototypeOf(pokemon),original=pokemon.ignoringAbility;
  const proto=Object.create(base);
  Object.defineProperty(proto,'ignoringAbility',{value:function(){return adventureSuppressAbility(this.ability)||original.call(this);}});
  Object.setPrototypeOf(pokemon,proto);
 }
 return battle;
}
