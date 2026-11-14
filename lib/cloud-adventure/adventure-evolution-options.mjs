import {evolutionOptions} from '../evolution.mjs';
// The generic data includes form-neutral Slowpoke rows. In the adventure,
// Galarian Slowpoke can only use its two regional item evolutions.
// https://allthings.how/how-to-get-and-evolve-galarian-slowpoke-in-pokemon-legends-z-a/
export function adventureEvolutionOptions(mon,world={},party=[],inventory={}){
 const galar=mon?.id===10164||(mon?.speciesId===79&&mon?.formId===10323);
 const options=evolutionOptions(galar?{...mon,speciesId:79,formId:10323}:mon,{...world,adventureEngine:'cloud'},party,inventory);
 if(galar)return options.filter(option=>option.id===10165||option.id===10172);
 return options;
}
