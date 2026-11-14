import pokedex from '../../data/pokedex.json' with {type:'json'};

// `id` and `formId` use different namespaces for regional and other forms.
// Missing legacy form IDs are allowed, but explicit contradictions are not.
const byId=new Map();
for(const entry of pokedex)if(!byId.has(entry.id))byId.set(entry.id,entry);
export function adventureTmIdentityConsistent(mon){
 const entry=byId.get(mon?.id);
 return !!entry&&(mon.speciesId==null||mon.speciesId===entry.speciesId)&&(mon.formId==null||mon.formId===entry.formId);
}
