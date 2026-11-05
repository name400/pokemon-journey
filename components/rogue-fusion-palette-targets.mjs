import species from '../data/rogue-fusion-palette-species.json' with {type:'json'};
import forms from '../data/rogue-fusion-palette-forms.json' with {type:'json'};
const appearanceKey=(mon,record)=>{if(!record)return null;const genderSpecific=!!record.genderDiffs;if(genderSpecific&&!['M','F'].includes(mon.gender))return null;return `${genderSpecific&&mon.gender==='F'?'female/':''}${mon.rogueSourceId}`;};
const nativeKey=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'');
// Only reviewed source atlases are used; unreviewed forms keep the existing fallback.
export function classicFusionPaletteTarget(mon,facing='front',variant='battle'){
 if(variant!=='battle'||!['front','back'].includes(facing)||mon?.rogueFusionRule!=='preview-v1'||!mon.fusionSpecies||mon.variant&&!mon.shiny||mon.variant&&![1,2].includes(mon.variant)||mon.sourceAppearanceMissing||mon.mega||mon.primal||mon.ultra||mon.dynamaxed||mon.gigantamax||mon.eternamax)return null;
 const donor=mon.rogueFusion?.donor,first=species[mon.rogueSourceId],index=donor?.rogueFormIndex??0,candidate=forms[mon.fusionSpecies]?.[index],form=candidate&&[candidate.id,...candidate.alternateIds||[]].includes(Number(donor?.id))&&(index?donor?.rogueFormKey===candidate.key:!donor?.rogueFormKey||donor.rogueFormKey===candidate.key)?candidate:null,second=form||species[mon.fusionSpecies];
 if(!first||!second||!donor||donor.rogueSourceId!==mon.fusionSpecies||Number(mon.id)!==first.id||!form&&Number(donor.id)!==second.id||mon.rogueFormIndex||donor.rogueFormIndex&&!form||donor.variant&&!donor.shiny||donor.variant&&![1,2].includes(donor.variant)||donor.sourceAppearanceMissing||donor.mega||donor.primal||donor.ultra||donor.dynamaxed||donor.gigantamax||donor.eternamax)return null;
 if(first.baseForm&&mon.rogueFormKey||second.baseForm&&!donor.rogueFormIndex&&donor.rogueFormKey)return null;
 if(mon.battleAppearance&&nativeKey(mon.battleAppearance)!==first.native)return null;
 const primary=appearanceKey(mon,first),donorKey=form?.atlas||appearanceKey(donor,second);if(!primary||!donorKey)return null;
 return {primary,donor:donorKey,facing,...(mon.shiny?{primaryShiny:true}:{}),...(donor.shiny?{donorShiny:true}:{}),...(mon.variant?{primaryVariant:mon.variant}:{}),...(donor.variant?{donorVariant:donor.variant}:{})};
}
