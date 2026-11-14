import {evolutionOptions} from '../evolution.mjs';
// The generic rules also include form-neutral evolution rows. These explicitly
// identified regional forms must not inherit those normal-form branches.
// https://bulbapedia.bulbagarden.net/wiki/Evolution_stones
// https://bulbapedia.bulbagarden.net/wiki/Evolution_method
// https://bulbapedia.bulbagarden.net/wiki/Galarian_Yamask
const REGIONAL=[
 [10091,19,10193,[10092]],[10101,27,10203,[10102]],[10103,37,10205,[10104]],
 [10105,50,10207,[10106]],[10107,52,10209,[10108]],[10109,74,10211,[10110]],
 [10110,75,10212,[10111]],[10112,88,10214,[10113]],[10161,52,10320,[863]],
 [10162,77,10321,[10163]],[10164,79,10323,[10165,10172]],
 [10174,263,10333,[10175]],[10176,554,10335,[10177]],[10179,562,10338,[867]],
];
const byId=new Map(REGIONAL.map(row=>[row[0],row]));
const byForm=new Map(REGIONAL.map(row=>[`${row[1]}:${row[2]}`,row]));
const byFormId=new Map(REGIONAL.map(row=>[row[2],row]));
export function adventureEvolutionOptions(mon,world={},party=[],inventory={}){
 const idRow=byId.get(mon?.id),formRow=byFormId.get(mon?.formId);
 // Explicit contradictions are not missing legacy identifiers. Never infer a
 // different species or form from one field while discarding another.
 if(idRow&&((mon.speciesId!=null&&mon.speciesId!==idRow[1])||(mon.formId!=null&&mon.formId!==idRow[2])))return [];
 if(formRow&&((mon.speciesId!=null&&mon.speciesId!==formRow[1])||(mon.id!=null&&mon.id!==formRow[0]&&mon.id!==formRow[1])))return [];
 const regional=idRow||byForm.get(`${mon?.speciesId}:${mon?.formId}`);
 // Fill missing legacy identifiers only for the calculation, leaving the saved
 // Pokémon untouched; other forms continue through the existing rules.
 const input=regional?{...mon,speciesId:regional[1],formId:regional[2]}:mon;
 // Shared-box transfers can leave stale party IDs until the player repairs the
 // team. Missing members cannot satisfy a party condition or break the view.
 const safeParty=(Array.isArray(party)?party:[]).filter(p=>p&&typeof p==='object').map(p=>Array.isArray(p.types)?p:{...p,types:[]});
 const options=evolutionOptions(input,{...world,adventureEngine:'cloud'},safeParty,inventory);
 return regional?options.filter(option=>regional[3].includes(option.id)):options;
}
