import {rogueSpecies} from './rogue-reference.mjs';

// Only enrich presentation when the saved source species and concrete ID
// independently identify the same non-fused Pokemon. Never rewrite the save.
export function classicLegacyNameView(mon){
 if(!mon||mon.baseName||mon.nickname||mon.fusionSpecies||typeof mon.name!=='string'||!mon.name.includes(' · ')||!Number.isSafeInteger(mon.rogueSourceId)||!Number.isSafeInteger(mon.id))return mon;
 const species=rogueSpecies.get(mon.rogueSourceId);
 if(!species||typeof species.name!=='string'||!species.name||!(species.pokemonId===mon.id||(species.formList||[]).some(form=>form.pokemonId===mon.id)))return mon;
 if(mon.speciesId!=null&&(!Number.isSafeInteger(mon.speciesId)||species.pokemonId!==mon.speciesId&&!(species.formList||[]).some(form=>form.pokemonId===mon.speciesId)))return mon;
 return {...mon,baseName:species.name};
}
