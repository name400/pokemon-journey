import species from '../data/rogue-fusion-palette-species.json' with {type:'json'};
const nativeKey=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'');
// Only base forms without gender-specific sprites are used.
export function classicFusionPaletteTarget(mon,facing='front',variant='battle'){
 if(variant!=='battle'||!['front','back'].includes(facing)||mon?.rogueFusionRule!=='preview-v1'||!mon.fusionSpecies||mon.variant||mon.sourceAppearanceMissing||mon.mega||mon.primal||mon.ultra||mon.dynamaxed||mon.gigantamax||mon.eternamax)return null;
 const donor=mon.rogueFusion?.donor,first=species[mon.rogueSourceId],second=species[mon.fusionSpecies];
 if(!first||!second||!donor||donor.rogueSourceId!==mon.fusionSpecies||Number(mon.id)!==first.id||Number(donor.id)!==second.id||mon.rogueFormIndex||donor.rogueFormIndex||donor.variant||donor.sourceAppearanceMissing||donor.mega||donor.primal||donor.ultra||donor.dynamaxed||donor.gigantamax||donor.eternamax)return null;
 if(mon.battleAppearance&&nativeKey(mon.battleAppearance)!==first.native)return null;
 return {primary:String(mon.rogueSourceId),donor:String(mon.fusionSpecies),facing,...(mon.shiny?{primaryShiny:true}:{}),...(donor.shiny?{donorShiny:true}:{})};
}
