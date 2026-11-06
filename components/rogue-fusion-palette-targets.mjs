import {reviewedMegaAtlas} from './rogue-reviewed-mega-atlases.mjs';
import {reviewedTransformationAtlas} from './rogue-reviewed-transformation-atlases.mjs';
import {reviewedOrdinaryFormAtlas,reviewedOrdinaryFormRecord} from './rogue-reviewed-form-atlases.mjs';
import species from '../data/rogue-fusion-palette-species.json' with {type:'json'};
import forms from '../data/rogue-fusion-palette-forms.json' with {type:'json'};
import primaryForms from '../data/rogue-fusion-primary-artwork.json' with {type:'json'};
const appearanceKey=(mon,record)=>{if(!record)return null;const genderSpecific=!!record.genderDiffs;if(genderSpecific&&!['M','F'].includes(mon.gender))return null;return `${genderSpecific&&mon.gender==='F'?'female/':''}${mon.rogueSourceId}`;};
const nativeKey=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const eternamaxAtlas=mon=>mon?.rogueSourceId===890&&Number(mon.id)===890&&mon.rogueFormIndex===1&&mon.rogueFormKey==='eternamax'&&mon.rogueBattleSpecies==='eternatuseternamax'&&mon.eternamax===true&&!mon.mega&&!mon.primal&&!mon.ultra&&!mon.gigantamax&&!mon.dynamaxed?reviewedTransformationAtlas(mon):null;
// Only actual persisted transformation identities may use transformation atlases.
const fusionTransformationAtlas=mon=>{
 const record=reviewedTransformationAtlas(mon);if(!record||!mon||mon.mega||record.formKey==='eternamax'||mon.rogueFormIndex!==record.formIndex||mon.rogueFormKey!==record.formKey||!record.native.includes(nativeKey(mon.rogueBattleSpecies)))return null;
 const kind=record.formKey.startsWith('gigantamax')?'gigantamax':record.formKey;
 if(!['primal','ultra','gigantamax'].includes(kind)||mon[kind]!==true||kind==='gigantamax'&&mon.dynamaxed!==true||kind!=='gigantamax'&&mon.dynamaxed)return null;
 const base=species[record.sourceId],variants=Object.values(forms[record.sourceId]||{}),ids=[record.sourceId,base?.id,...variants.flatMap(form=>[form.id,...form.alternateIds||[]])].filter(Number.isFinite);
 return ids.includes(Number(mon.id))?record:null;
};
// Only reviewed source atlases are used; unreviewed forms keep the existing fallback.
export function classicFusionPaletteTarget(mon,facing='front',variant='battle'){
 // Explicitly verified new Mega atlases may participate on either side. Existing
 // unreviewed transformations keep their original fallback below.
 if(reviewedMegaAtlas(mon)||reviewedMegaAtlas(mon?.rogueFusion?.donor)||reviewedOrdinaryFormAtlas(mon)||eternamaxAtlas(mon)||eternamaxAtlas(mon?.rogueFusion?.donor)||fusionTransformationAtlas(mon)||fusionTransformationAtlas(mon?.rogueFusion?.donor)){
  if(variant!=='battle'||!['front','back'].includes(facing)||mon?.rogueFusionRule!=='preview-v1'||!mon.fusionSpecies)return null;
  const donor=mon.rogueFusion?.donor;if(!donor||donor.rogueSourceId!==mon.fusionSpecies)return null;
  const atlas=(value,primary)=>{
   if(value.sourceAppearanceMissing||value.variant&&(!value.shiny||![1,2].includes(value.variant)))return null;
   const transformation=eternamaxAtlas(value)||fusionTransformationAtlas(value);if(transformation)return transformation.atlas;
   if(value.primal||value.ultra||value.dynamaxed||value.gigantamax||value.eternamax)return null;
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
