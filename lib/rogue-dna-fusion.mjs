import {classicRandomizedAbilityValid} from './rogue-challenge-randomizers.mjs';
// Internal preview only: the reward and party actions must remain gated until
// move learning and held-item transfers can be committed atomically.
import {configure,statKeys} from './pokemon-config.mjs';
import {sourceSpeciesFor} from './rogue-reference.mjs';
import {classicTypesWithCustomSecond} from './rogue-custom-types.mjs';

export function reviewedClassicDnaDonorForm(sourceId,index,key,id){return [[678,1,'female',10025],[744,1,'own-tempo',10151],[745,1,'midnight',10126],[745,2,'dusk',10152],[849,1,'lowkey',10184],[854,1,'antique',30344],[855,1,'antique',855],[869,1,'ruby-cream',869],[869,2,'matcha-cream',869],[869,3,'mint-cream',869],[869,4,'lemon-cream',869],[869,5,'salted-cream',869],[869,6,'ruby-swirl',869],[869,7,'caramel-swirl',869],[869,8,'rainbow-swirl',869]].some(([species,formIndex,formKey,pokemonId])=>species===sourceId&&formIndex===index&&formKey===key&&pokemonId===Number(id));}

function check(mon,{allowDonorForm=false}={}){
 const species=sourceSpeciesFor(mon),reviewed=allowDonorForm&&reviewedClassicDnaDonorForm(species?.sourceId,mon?.rogueFormIndex,mon?.rogueFormKey,mon?.id),form=reviewed?species.formList.find(f=>f.formIndex===mon.rogueFormIndex&&f.formKey===mon.rogueFormKey):null;
 if(!mon?.boxId||!species||mon.fusionSpecies||mon.fusionId||mon.fusionShiny||mon.rogueFusionRule||mon.mega||mon.primal||mon.ultra||mon.dynamaxed||mon.gigantamax||mon.eternamax||mon.rogueFormIndex&&!reviewed||reviewed&&(!form||!form.abilities?.some(a=>a.key===mon.ability)&&mon.rogueAbilityOverride!==mon.ability&&!classicRandomizedAbilityValid(mon,form))||reviewed&&String(mon.rogueBattleSpecies||'')!==String(form?.nativeSpecies||'')||!reviewed&&mon.rogueBattleSpecies||!mon.rogueBaseStats||!Array.isArray(mon.rogueTypes)||!mon.rogueTypes.length||!mon.ability||!Number.isInteger(mon.level)||!Number.isFinite(mon.hp)||!Number.isFinite(mon.maxHp)||mon.maxHp<=0||mon.hp<0||mon.hp>mon.maxHp||!Array.isArray(mon.moves)||!statKeys.every(k=>Number.isFinite(mon.rogueBaseStats[k])&&mon.rogueBaseStats[k]===(form?.baseStats||species.baseStats)[k])) throw new Error('Unsupported DNA fusion preview');
}
export function classicDnaFusionTypes(primaryTypes,partner){
 const first=primaryTypes[0],second=partner[1]&&partner[1]!==first?partner[1]:partner[0]!==first?partner[0]:primaryTypes[1];
 return second&&second!==first?[first,second]:[first];
}
export function previewClassicDnaFusion(primary,donor,{random=Math.random,allowDonorForm=false}={}){
 check(primary);check(donor,{allowDonorForm});
 if(primary.boxId===donor.boxId)throw new Error('DNA fusion requires two distinct Pokémon');
 const first=primary.rogueTypes[0],types=classicDnaFusionTypes(primary.rogueTypes,donor.rogueTypes);
 let statusOwner=primary.hp>0&&primary.status?primary:donor;
 if(primary.hp>0&&donor.hp>0&&primary.status&&donor.status){const roll=random();if(!Number.isFinite(roll)||roll<0||roll>=1)throw new Error('Invalid DNA fusion random value');statusOwner=roll<.5?donor:primary;}
 const fused=configure({...structuredClone(primary),fusionSpecies:donor.rogueSourceId,rogueFusionRule:'preview-v1',rogueFusion:{baseStats:structuredClone(donor.rogueBaseStats),primaryAbility:primary.ability,primaryTypes:structuredClone(primary.rogueTypes),donor:structuredClone(donor)},ability:donor.ability,rogueTypes:types,types,type:first,status:statusOwner.hp?statusOwner.status:null,rogueStatusState:statusOwner.hp?structuredClone(statusOwner.rogueStatusState??null):null});
 fused.hp=Math.min(fused.maxHp,Math.round(primary.maxHp*(primary.hp/primary.maxHp+donor.hp/donor.maxHp)/2));
 return {fused,offeredMoves:structuredClone(donor.moves),donorConsumed:true,heldItemsTransferred:false};
}
export function previewClassicDnaUnsplice(mon){
 if(mon?.rogueFusionRule!=='preview-v1'||!mon.rogueFusion?.donor||!mon.rogueFusion.primaryAbility||!Array.isArray(mon.rogueFusion.primaryTypes))throw new Error('Unsupported DNA unsplice preview');
 const out=structuredClone(mon),info=out.rogueFusion;
 out.ability=info.primaryAbility;out.rogueTypes=info.primaryTypes;out.types=[...info.primaryTypes];out.type=info.primaryTypes[0];
 delete out.rogueFusion;delete out.rogueFusionRule;delete out.fusionSpecies;
 return {primary:configure(out,{hp:out.hp}),donorRestored:false};
}

// Only validated, base-form preview fusions are accepted. Unknown or damaged
// save representations stay indeterminate in challenge checks.
export function validatedClassicDnaFusion(mon){
 try{
  if(mon?.rogueFusionRule!=='preview-v1'||mon.rogueAbilityOverride||mon.mega||mon.primal||mon.ultra||mon.dynamaxed||mon.gigantamax)return null;
  const donor=mon.rogueFusion?.donor,primary=previewClassicDnaUnsplice(mon).primary;
  for(const part of [primary,donor]){const source=sourceSpeciesFor(part),form=part===donor&&part.rogueFormIndex?source.formList.find(f=>f.formIndex===part.rogueFormIndex&&f.formKey===part.rogueFormKey):null,expected=classicTypesWithCustomSecond(part,form?.types||source.types);if(!Array.isArray(part.rogueTypes)||part.rogueTypes.length!==expected.length||part.rogueTypes.some((type,i)=>type!==expected[i]))return null;}
  const rebuilt=previewClassicDnaFusion(primary,donor,{random:()=>0,allowDonorForm:true}).fused;
  if(mon.fusionSpecies!==donor.rogueSourceId||mon.ability!==donor.ability||!Array.isArray(mon.rogueTypes)||mon.rogueTypes.length!==rebuilt.rogueTypes.length||mon.rogueTypes.some((t,i)=>t!==rebuilt.rogueTypes[i])||statKeys.some(k=>mon.rogueFusion.baseStats[k]!==donor.rogueBaseStats[k]))return null;
  return {donor,types:[...rebuilt.rogueTypes]};
 }catch{return null;}
}
