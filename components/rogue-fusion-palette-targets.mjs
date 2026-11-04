import species from '../data/rogue-fusion-palette-species.json' with {type:'json'};
import {classicSourceFormAtlas} from './rogue-source-form-images.mjs';
const appearanceKey=(mon,record)=>{if(!record)return null;const genderSpecific=!!record.genderDiffs;if(genderSpecific&&!['M','F'].includes(mon.gender))return null;return `${genderSpecific&&mon.gender==='F'?'female/':''}${mon.rogueSourceId}`;};
const nativeKey=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'');
// Only reviewed source atlases are used; unreviewed forms keep the existing fallback.
export function classicFusionPaletteTarget(mon,facing='front',variant='battle'){
 if(variant!=='battle'||!['front','back'].includes(facing)||mon?.rogueFusionRule!=='preview-v1'||!mon.fusionSpecies||mon.variant||mon.sourceAppearanceMissing||mon.mega||mon.primal||mon.ultra||mon.dynamaxed||mon.gigantamax||mon.eternamax)return null;
 const donor=mon.rogueFusion?.donor,first=species[mon.rogueSourceId],form=classicSourceFormAtlas(donor,facing),second=species[mon.fusionSpecies]||(form&&Number(donor?.id)===Number(mon.fusionSpecies)?{id:Number(mon.fusionSpecies)}:null);
 if(!first||!second||!donor||donor.rogueSourceId!==mon.fusionSpecies||Number(mon.id)!==first.id||Number(donor.id)!==second.id||mon.rogueFormIndex||donor.rogueFormIndex&&!form||donor.variant||donor.sourceAppearanceMissing||donor.mega||donor.primal||donor.ultra||donor.dynamaxed||donor.gigantamax||donor.eternamax)return null;
 if(first.baseForm&&mon.rogueFormKey||second.baseForm&&!donor.rogueFormIndex&&donor.rogueFormKey)return null;
 if(mon.battleAppearance&&nativeKey(mon.battleAppearance)!==first.native)return null;
 const primary=appearanceKey(mon,first),donorKey=form?.key||appearanceKey(donor,second);if(!primary||!donorKey)return null;
 return {primary,donor:donorKey,facing,...(mon.shiny?{primaryShiny:true}:{}),...(donor.shiny?{donorShiny:true}:{})};
}
