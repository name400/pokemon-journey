// An adventure-owned registration history, not a claim that every species is
// available in the Z-A Lumiose Pokédex. No research points are awarded here.
export function adventureDexEntries(s){
 return [...new Set((Array.isArray(s?.adventureDexSpecies)?s.adventureDexSpecies:[]).filter(id=>Number.isSafeInteger(id)&&id>0&&id<=1025))].sort((a,b)=>a-b);
}
export function registerAdventureDex(s,...ids){
 const entries=adventureDexEntries(s),seen=new Set(entries);
 for(const id of ids)if(Number.isSafeInteger(id)&&id>0&&id<=1025)seen.add(id);
 s.adventureDexSpecies=[...seen].sort((a,b)=>a-b);
 return s.adventureDexSpecies.length-entries.length;
}
