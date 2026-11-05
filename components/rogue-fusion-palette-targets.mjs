import {reviewedMegaAtlas} from './rogue-reviewed-mega-atlases.mjs';
import {reviewedOrdinaryFormAtlas,reviewedOrdinaryFormRecord} from './rogue-reviewed-form-atlases.mjs';
import species from '../data/rogue-fusion-palette-species.json' with {type:'json'};
import forms from '../data/rogue-fusion-palette-forms.json' with {type:'json'};
import primaryForms from '../data/rogue-fusion-primary-artwork.json' with {type:'json'};
const appearanceKey=(mon,record)=>{if(!record)return null;const genderSpecific=!!record.genderDiffs;if(genderSpecific&&!['M','F'].includes(mon.gender))return null;return `${genderSpecific&&mon.gender==='F'?'female/':''}${mon.rogueSourceId}`;};
const nativeKey=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'');
// Only reviewed source atlases are used; unreviewed forms keep the existing fallback.
export function classicFusionPaletteTarget(mon,facing='front',variant='battle'){
 // Explicitly verified new Mega atlases may participate on either side. Existing
 // unreviewed transformations keep their original fallback below.
 if(reviewedMegaAtlas(mon)||reviewedMegaAtlas(mon?.rogueFusion?.donor)||reviewedOrdinaryFormAtlas(mon)){
  if(variant!=='battle'||!['front','back'].includes(facing)||mon?.rogueFusionRule!=='preview-v1'||!mon.fusionSpecies)return null;
  const donor=mon.rogueFusion?.donor;if(!donor||donor.rogueSourceId!==mon.fusionSpecies)return null;
  const atlas=(value,primary)=>{
   if(value.sourceAppearanceMissing||value.primal||value.ultra||value.dynamaxed||value.gigantamax||value.eternamax||value.variant&&(!value.shiny||![1,2].includes(value.variant)))return null;
   const mega=reviewedMegaAtlas(value);if(mega)return mega.atlas;if(value.mega)return null;
   if(primary&&value.rogueFormIndex){const permission=primaryForms.allowed[`${value.rogueSourceId}:${value.rogueFormIndex}`];return permission&&permission.id===Number(value.id)&&permission.key===value.rogueFormKey&&permission.native===value.rogueBattleSpecies?reviewedOrdinaryFormAtlas(value)?.atlas||null:null;}
   const base=species[value.rogueSourceId],index=value.rogueFormIndex??0,candidate=!primary&&forms[value.rogueSourceId]?.[index];
   const form=candidate&&[candidate.id,...candidate.alternateIds||[]].includes(Number(value.id))&&(index?value.rogueFormKey===candidate.key:!value.rogueFormKey||value.rogueFormKey===candidate.key)?candidate:null;
   if(!base||!form&&Number(value.id)!==base.id||index&&!form||base.baseForm&&!index&&value.rogueFormKey)return null;
   if(value.battleAppearance&&!form&&nativeKey(value.battleAppearance)!==base.native)return null;
   if(form&&reviewedOrdinaryFormRecord(value))return reviewedOrdinaryFormAtlas(value)?.atlas||null;
   return form?.atlas||appearanceKey(value,base);
  };
  const primary=atlas(mon,true),other=atlas(donor,false);if(!primary||!other)return null;
  return {primary,donor:other,facing,...(mon.shiny?{primaryShiny:true}:{}),...(donor.shiny?{donorShiny:true}:{}),...(mon.variant?{primaryVariant:mon.variant}:{}),...(donor.variant?{donorVariant:donor.variant}:{})};
 }

 if(variant!=='battle'||!['front','back'].includes(facing)||mon?.rogueFusionRule!=='preview-v1'||!mon.fusionSpecies||mon.variant&&!mon.shiny||mon.variant&&![1,2].includes(mon.variant)||mon.sourceAppearanceMissing||mon.mega||mon.primal||mon.ultra||mon.dynamaxed||mon.gigantamax||mon.eternamax)return null;
 const donor=mon.rogueFusion?.donor,first=species[mon.rogueSourceId],index=donor?.rogueFormIndex??0,candidate=forms[mon.fusionSpecies]?.[index],form=candidate&&[candidate.id,...candidate.alternateIds||[]].includes(Number(donor?.id))&&(index?donor?.rogueFormKey===candidate.key:!donor?.rogueFormKey||donor.rogueFormKey===candidate.key)?candidate:null,second=form||species[mon.fusionSpecies];
 if(!first||!second||!donor||donor.rogueSourceId!==mon.fusionSpecies||Number(mon.id)!==first.id||!form&&Number(donor.id)!==second.id||mon.rogueFormIndex||donor.rogueFormIndex&&!form||donor.variant&&!donor.shiny||donor.variant&&![1,2].includes(donor.variant)||donor.sourceAppearanceMissing||donor.mega||donor.primal||donor.ultra||donor.dynamaxed||donor.gigantamax||donor.eternamax)return null;
 if(first.baseForm&&mon.rogueFormKey||second.baseForm&&!donor.rogueFormIndex&&donor.rogueFormKey)return null;
 if(mon.battleAppearance&&nativeKey(mon.battleAppearance)!==first.native)return null;
 const primary=appearanceKey(mon,first),donorKey=form&&reviewedOrdinaryFormRecord(donor)?reviewedOrdinaryFormAtlas(donor)?.atlas:form?.atlas||appearanceKey(donor,second);if(!primary||!donorKey)return null;
 return {primary,donor:donorKey,facing,...(mon.shiny?{primaryShiny:true}:{}),...(donor.shiny?{donorShiny:true}:{}),...(mon.variant?{primaryVariant:mon.variant}:{}),...(donor.variant?{donorVariant:donor.variant}:{})};
}
