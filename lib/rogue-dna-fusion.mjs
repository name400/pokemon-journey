import {classicNativeForm,classicPersistentFormKind} from './rogue-native-form.mjs';
import {normalizeClassicTransientDynamax} from './rogue-transient-dynamax.mjs';
import {classicRandomizedAbilityValid} from './rogue-challenge-randomizers.mjs';
// Shared calculation and validation for the atomic reward/party transaction.
import {configure,statKeys} from './pokemon-config.mjs';
import {sourceSpeciesFor,sourceAbilityMatchesSaved} from './rogue-reference.mjs';
import {classicTypesWithCustomSecond} from './rogue-custom-types.mjs';

export const CLASSIC_REVIEWED_STATIC_FORM_SPECIES=Object.freeze([133,412,413,422,423,479,550,664,665,666,676,710,711,741,876,893,931,8128]);
export function reviewedClassicDnaDonorForm(sourceId,index,key,id){
 if(CLASSIC_REVIEWED_STATIC_FORM_SPECIES.includes(sourceId)&&Number.isInteger(index)&&index>0){const source=sourceSpeciesFor({rogueSourceId:sourceId}),form=source?.formList.find(f=>f.formIndex===index&&f.formKey===key);if(form&&!classicPersistentFormKind(source,form)&&Number(id)===(form.pokemonId||source.pokemonId)&&classicNativeForm(source,form)?.exists)return true;}
 if([351,421,681,555,4555,746,774,964,778,875,877,845,2658,648,716,1017].includes(sourceId)){const source=sourceSpeciesFor({rogueSourceId:sourceId}),form=source?.formList.find(f=>f.formIndex===index&&f.formKey===key);if(form&&!classicPersistentFormKind(source,form)&&Number(id)===(form.pokemonId||source.pokemonId)&&classicNativeForm(source,form)?.exists)return true;}
 // Permanent source evolution identities, including cosmetic rarity and sex.
 const evolutionForms={172:{1:'spiky'},25:{1:'partner',2:'cosplay',3:'cool-cosplay',4:'beauty-cosplay',5:'cute-cosplay',6:'smart-cosplay',7:'tough-cosplay'},902:{1:'female'},916:{1:'female'},925:{1:'three'},982:{1:'three-segment'},999:{1:'roaming'},1012:{1:'artisan'},1013:{1:'masterpiece'},892:{1:'rapid-strike'}};
 if(evolutionForms[sourceId]?.[index]===key){const source=sourceSpeciesFor({rogueSourceId:sourceId}),form=source?.formList.find(f=>f.formIndex===index&&f.formKey===key);if(form&&Number(id)===(form.pokemonId||source.pokemonId)&&classicNativeForm(source,form)?.exists)return true;}

 if(sourceId===718){const ids={1:['10',718,10181],2:['50-pc',718,10119],3:['10-pc',718,10118],4:['complete',718,10119,10120],5:['10-complete',718,10118]};const row=ids[index];if(row?.[0]===key&&row.slice(1).includes(Number(id)))return true;}
 // Permanent cosmetic families: use the pinned metadata rather than repeating
 // every letter/season/color identity. Battle and item-triggered forms excluded.
 if([201,585,586,669,670,671,801,978].includes(sourceId)&&Number.isInteger(index)&&index>0){const source=sourceSpeciesFor({rogueSourceId:sourceId}),form=source?.formList.find(f=>f.formIndex===index&&f.formKey===key);if(form&&Number(id)===(form.pokemonId||source.pokemonId)&&statKeys.every(k=>form.baseStats[k]===source.baseStats[k])&&form.types.length===source.types.length&&form.types.every((t,i)=>t===source.types[i]))return true;}
 return [[678,1,'female',10025],[744,1,'own-tempo',10151],[745,1,'midnight',10126],[745,2,'dusk',10152],[849,1,'lowkey',10184],[854,1,'antique',30344],[855,1,'antique',855],[869,1,'ruby-cream',869],[869,2,'matcha-cream',869],[869,3,'mint-cream',869],[869,4,'lemon-cream',869],[869,5,'salted-cream',869],[869,6,'ruby-swirl',869],[869,7,'caramel-swirl',869],[869,8,'rainbow-swirl',869]].some(([species,formIndex,formKey,pokemonId])=>species===sourceId&&formIndex===index&&formKey===key&&pokemonId===Number(id));}

// Native- and source-verified persistent item forms, independent of party role.
export function reviewedClassicFusionTransform(mon){
 const source=sourceSpeciesFor(mon),form=source?.formList.find(f=>f.formIndex===mon.rogueFormIndex&&f.formKey===mon.rogueFormKey);if(!form)return null;
 const kind=classicPersistentFormKind(source,form,mon),native=classicNativeForm(source,form,mon);if(!kind||!native||mon.eternamax)return null;
 for(const [flag,expected]of Object.entries({mega:kind==='mega',primal:kind==='primal',ultra:kind==='ultra',gigantamax:kind==='gigantamax',dynamaxed:kind==='gigantamax'}))if(expected?mon[flag]!==true:!!mon[flag])return null;
 if(kind==='ultra'&&(!['dawn-wings','dusk-mane'].includes(mon.rogueUltraOrigin)||source.sourceId!==800))return null;
 if(source.sourceId===718&&mon.rogueZygardeMegaOrigin!=null&&!['complete','10-complete'].includes(mon.rogueZygardeMegaOrigin))return null;
 const parent=kind==='ultra'?source.formList.find(f=>f.formKey===mon.rogueUltraOrigin):source.sourceId===892&&form.formKey==='gigantamax-rapid'?source.formList.find(f=>f.formKey==='rapid-strike'):null;
 const itemParents=(source.formChanges||[]).filter(c=>c.__class==='SpeciesFormChange'&&c.evoFormKey===form.formKey&&c.trigger?.__class==='SpeciesFormChangeItemTrigger').map(c=>source.formList.find(f=>f.formKey===(c.preFormKey||''))?.pokemonId);
 const zygardeParent=source.sourceId===718?({'10-complete':10118,complete:10119})[mon.rogueZygardeMegaOrigin]:null;
 return mon.rogueBattleSpecies===native.id&&[source.pokemonId,form.pokemonId,parent?.pokemonId,...itemParents,zygardeParent].filter(Boolean).includes(Number(mon.id))?{form,native,kind}:null;
}
export function reviewedClassicPrimaryMega(mon){const result=reviewedClassicFusionTransform(mon);return result?.kind==='mega'?result:null;}

function check(mon,{allowDonorForm=false,allowTransform=false}={}){
 const transformed=allowTransform&&reviewedClassicFusionTransform(mon),species=sourceSpeciesFor(mon),base=species?.formList.find(f=>f.formIndex===0),baseNative=base&&classicNativeForm(species,base),canonicalBase=!mon?.rogueFormIndex&&baseNative&&mon?.rogueBattleSpecies===baseNative.id&&(mon.rogueFormKey==null||mon.rogueFormKey===base.formKey)&&Number(mon.id)===(base.pokemonId||species.pokemonId),reviewed=!!transformed||!!canonicalBase||allowDonorForm&&reviewedClassicDnaDonorForm(species?.sourceId,mon?.rogueFormIndex,mon?.rogueFormKey,mon?.id),form=reviewed?(transformed?.form||canonicalBase&&base||species.formList.find(f=>f.formIndex===mon.rogueFormIndex&&f.formKey===mon.rogueFormKey)):null;
 const nativeIds=transformed?[transformed.native.id]:canonicalBase?[baseNative.id]:[form?.nativeSpecies||'',...(!form?.nativeSpecies&&form?[classicNativeForm(species,form,mon)?.id].filter(Boolean):[])];
 if(!mon?.boxId||!species||mon.fusionSpecies||mon.fusionId||mon.fusionShiny||mon.rogueFusionRule||(mon.mega||mon.primal||mon.ultra||mon.dynamaxed||mon.gigantamax)&&!transformed||mon.eternamax||mon.rogueFormIndex&&!reviewed||reviewed&&(!form||!sourceAbilityMatchesSaved(mon,form.abilities)&&mon.rogueAbilityOverride!==mon.ability&&!classicRandomizedAbilityValid(mon,form))||reviewed&&!nativeIds.includes(String(mon.rogueBattleSpecies||''))||!reviewed&&mon.rogueBattleSpecies||!mon.rogueBaseStats||!Array.isArray(mon.rogueTypes)||!mon.rogueTypes.length||!mon.ability||!Number.isInteger(mon.level)||!Number.isFinite(mon.hp)||!Number.isFinite(mon.maxHp)||mon.maxHp<=0||mon.hp<0||mon.hp>mon.maxHp||!Array.isArray(mon.moves)||!statKeys.every(k=>Number.isFinite(mon.rogueBaseStats[k])&&mon.rogueBaseStats[k]===(form?.baseStats||species.baseStats)[k])) throw new Error('Unsupported DNA fusion preview');
}
export function classicDnaFusionTypes(primaryTypes,partner){
 const first=primaryTypes[0],second=partner[1]&&partner[1]!==first?partner[1]:partner[0]!==first?partner[0]:primaryTypes[1];
 return second&&second!==first?[first,second]:[first];
}
export function previewClassicDnaFusion(primary,donor,{random=Math.random,allowDonorForm=false}={}){
 primary=normalizeClassicTransientDynamax(primary);donor=normalizeClassicTransientDynamax(donor);
 check(primary,{allowDonorForm:true,allowTransform:true});check(donor,{allowDonorForm,allowTransform:true});
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
 const out=structuredClone(normalizeClassicTransientDynamax(mon)),info=out.rogueFusion;
 out.ability=info.primaryAbility;out.rogueTypes=info.primaryTypes;out.types=[...info.primaryTypes];out.type=info.primaryTypes[0];
 delete out.rogueFusion;delete out.rogueFusionRule;delete out.fusionSpecies;
 const primary=configure(out,{hp:out.hp});primary.hp=out.hp>0?Math.min(primary.maxHp,out.hp+Math.max(0,primary.maxHp-out.maxHp)):0;
 return {primary,donorRestored:false};
}

// Only validated base or explicitly reviewed form fusions are accepted. Unknown or damaged
// save representations stay indeterminate in challenge checks.
export function validatedClassicDnaFusion(mon){
 try{
  mon=normalizeClassicTransientDynamax(mon);
  if(mon?.rogueFusionRule!=='preview-v1'||mon.rogueAbilityOverride||(mon.mega||mon.primal||mon.ultra||mon.dynamaxed||mon.gigantamax)&&!reviewedClassicFusionTransform(mon))return null;
  const donor=mon.rogueFusion?.donor,primary=previewClassicDnaUnsplice(mon).primary;
  for(const part of [primary,donor]){const source=sourceSpeciesFor(part),form=part.rogueFormIndex?source.formList.find(f=>f.formIndex===part.rogueFormIndex&&f.formKey===part.rogueFormKey):null,expected=classicTypesWithCustomSecond(part,form?.types||source.types);if(!Array.isArray(part.rogueTypes)||part.rogueTypes.length!==expected.length||part.rogueTypes.some((type,i)=>type!==expected[i]))return null;}
  const rebuilt=previewClassicDnaFusion(primary,donor,{random:()=>0,allowDonorForm:true}).fused;
  if(mon.fusionSpecies!==donor.rogueSourceId||mon.ability!==donor.ability||!Array.isArray(mon.rogueTypes)||mon.rogueTypes.length!==rebuilt.rogueTypes.length||mon.rogueTypes.some((t,i)=>t!==rebuilt.rogueTypes[i])||statKeys.some(k=>mon.rogueFusion.baseStats[k]!==donor.rogueBaseStats[k]))return null;
  return {donor,types:[...rebuilt.rogueTypes]};
 }catch{return null;}
}
