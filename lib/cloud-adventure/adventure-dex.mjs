import lumioseDex from '../../data/lumiose-dex.json' with {type:'json'};
// An adventure-owned registration history, not a claim that every species is
// available in the Z-A Lumiose Pokédex. No research points are awarded here.
export function adventureDexEntries(s){
 return [...new Set((Array.isArray(s?.adventureDexSpecies)?s.adventureDexSpecies:[]).filter(id=>Number.isSafeInteger(id)&&id>0&&id<=1025))].sort((a,b)=>a-b);
}
export function registerAdventureDex(s,...ids){
 const raw=s.adventureDexSpecies;
 if(raw!=null&&!Array.isArray(raw))throw Error('도감 기록의 형식을 확인하세요.');
 const entries=adventureDexEntries(s),seen=new Set(entries),added=[];
 for(const id of ids)if(Number.isSafeInteger(id)&&id>0&&id<=1025&&!seen.has(id)){seen.add(id);added.push(id);}
 // Preserve opaque future/invalid entries exactly; only recognized species
 // contribute to progress. Canonical legacy arrays keep their sorted format.
 const opaque=Array.isArray(raw)&&raw.some(id=>!Number.isSafeInteger(id)||id<1||id>1025);
 s.adventureDexSpecies=opaque?[...raw,...added]:[...seen].sort((a,b)=>a-b);
 return added.length;
}

// The first 230 entries are the base Lumiose Pokédex; later listed additions
// remain visible but do not affect the original research task until verified.
export function lumioseDexProgress(s){
 const seen=new Set(adventureDexEntries(s));
 const registered=lumioseDex.nationalSpeciesIds.slice(0,230).filter(id=>seen.has(id)).length;
 const milestones=Array.from({length:46},(_,i)=>(i+1)*5);
 let points=0;for(let i=0;i<milestones.length;i++)if(registered>=milestones[i])points+=i===0?100:i<19?300:i<29?400:i<39?500:600;
 return {registered,total:230,points,next:milestones.find(n=>n>registered)??null};
}
export function lumioseDexEntries(s){const seen=new Set(adventureDexEntries(s));return lumioseDex.nationalSpeciesIds.map((id,i)=>({number:i+1,speciesId:id,registered:seen.has(id)}));}
