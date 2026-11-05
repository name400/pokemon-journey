// Reviewed against source 7c088125: generation-06 and POWER_CONSTRUCT.
// Keep the two source Complete identities despite their shared native sprite.
import {sourceSpeciesFor} from './rogue-reference.mjs';
import {classicNativeForm} from './rogue-native-form.mjs';
import {reviewedClassicDnaDonorForm} from './rogue-dna-fusion.mjs';
import {applyClassicSourceForm} from './rogue-transformations.mjs';
import {calculateStats} from './pokemon-config.mjs';

function reviewed(mon){
 if(!mon)return null;
 const source=sourceSpeciesFor(mon),form=source?.formList.find(f=>f.formIndex===mon.rogueFormIndex&&f.formKey===mon.rogueFormKey);
 return source?.sourceId===718&&form&&mon.ability==='powerconstruct'&&!mon.fusionSpecies&&!mon.mega&&!mon.primal&&!mon.ultra&&!mon.gigantamax&&!mon.eternamax&&reviewedClassicDnaDonorForm(718,form.formIndex,form.formKey,mon.id)&&classicNativeForm(source,form)?.id===mon.rogueBattleSpecies&&Object.entries(form.baseStats).every(([key,value])=>mon.rogueBaseStats?.[key]===value)?form:null;
}
export function resetClassicZygarde(mon,run){
 const form=reviewed(mon),target={complete:'50-pc','10-complete':'10-pc'}[form?.formKey];
 if(!target)return mon;
 const next=applyClassicSourceForm(mon,run,target);
 if(mon.dynamaxed){next.dynamaxed=true;next.maxHp=calculateStats(next).hp*2;next.hp=mon.hp>0?Math.min(next.maxHp,mon.hp+Math.max(0,next.maxHp-mon.maxHp)):0;}
 return next;
}
// Earlier native Power Construct updated only appearance/HP, leaving the
// source index behind. Repair only the exact self-consistent living signature;
// ambiguous, fused, transformed or Dynamaxed records remain untouched.
export function repairClassicZygarde(mon,run){
 const form=reviewed(mon),target={'50-pc':'complete','10-pc':'10-complete'}[form?.formKey];
 if(!target||mon.dynamaxed||mon.battleAppearance!=='zygardecomplete'||mon.battleSprite!=='zygarde-complete'||mon.currentAbility!=='powerconstruct'||!Number.isSafeInteger(mon.hp)||mon.hp<=0||!Number.isSafeInteger(mon.maxHp)||mon.hp>mon.maxHp)return mon;
 try{const next=applyClassicSourceForm(mon,run,target);return calculateStats(next).hp===mon.maxHp?next:mon;}catch{return mon;}
}
const formFields=['stats','id','rogueFormIndex','rogueFormKey','rogueBattleSpecies','rogueBaseStats','rogueTypes','types','type','baseExperience','ability','rogueAbilitySlot','roguePassiveAbility','sourceImage','sourceBackImage','sourceShinyImage','sourceShinyBackImage','sourceAppearanceMissing','rogueSpriteKey','battleAppearance','battleSprite','mega','primal','ultra','gigantamax'];
export function classicBattleSourceForm(p,mon){return p?.m?.rogueSourceForm?{...mon,...p.m.rogueSourceForm}:mon;}

export function installClassicZygarde(b,combat,run,{sourceMon,applyStats}){
 function change(p,reset=false){
  const mon=classicBattleSourceForm(p,sourceMon(p)),form=mon&&reviewed(mon);
  if(!form||p.transformed||!reset&&!p.hp)return;
  const target=reset?{complete:'50-pc','10-complete':'10-pc'}[form.formKey]:p.hp<=p.maxhp/2?{'50-pc':'complete','10-pc':'10-complete'}[form.formKey]:null;
  if(!target)return;
  const oldHp=p.hp,oldMax=p.maxhp,next=applyClassicSourceForm({...mon,hp:oldHp,maxHp:oldMax},run||{challenges:combat.challengeRestrictions||[]},target);
  p.m.rogueSourceForm=Object.fromEntries(formFields.map(key=>[key,next[key]]));
  const native=b.dex.species.get(next.rogueBattleSpecies);
  p.setSpecies(native);p.baseSpecies=p.species;applyStats(p,next,{forceSpecies:true});p.baseSpecies=p.species;
  p.hp=oldHp>0?Math.min(p.maxhp,oldHp+Math.max(0,p.maxhp-oldMax)):0;
  p.details=p.getUpdatedDetails();
  if(!reset){b.add('-activate',p,'ability: Power Construct');b.add('detailschange',p,p.details);b.add('-heal',p,p.getHealth,'[silent]');}
  const owned=run?.party?.find(m=>p.side.n===0&&String(m.boxId)===String(p.set.trainerToken));
  if(owned)Object.assign(owned,p.m.rogueSourceForm,{hp:p.hp,maxHp:p.maxhp});
 }
 // Install before passive binding, so both main and passive dispatch read the
 // same battle-local ability. The source explicitly disables it in fusions.
 const nativeDex=b.dex,localDex=Object.create(nativeDex);let cached;
 Object.defineProperty(localDex,'abilities',{value:new Proxy(nativeDex.abilities,{get(target,key){
  if(key==='get'||key==='getByID')return function(name){const ability=target[key](name);if(ability.id!=='powerconstruct')return ability;
   cached||=new nativeDex.Ability({...ability,onStart(p){change(p);},onResidual(p){change(p);},onFaint(p){change(p,true);}});return cached;};
  const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
 }})});b.dex=localDex;
}
