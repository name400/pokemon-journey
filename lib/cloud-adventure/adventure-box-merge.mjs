// Compact movement responses update only selected Pokémon. Cache indices for
// immutable box arrays created here; a full response gets indexed on first use.
const indices=new WeakMap();
function indexFor(box){
 if(indices.has(box))return indices.get(box);
 const index=new Map();for(let i=0;i<box.length;i++){const id=box[i].boxId;if(index.has(id))return null;index.set(id,i);}
 indices.set(box,index);return index;
}
export function mergeAdventureBox(box,patch,tradedId){
 const original=indexFor(box);
 // Legacy duplicate IDs follow the previous Map semantics exactly.
 if(!original){const merged=new Map(box.map(p=>[p.boxId,p]));for(const p of patch)merged.set(p.boxId,{...merged.get(p.boxId),...p});return [...merged.values()].filter(p=>p.boxId!==tradedId);}
 let index=original,next=box.slice();
 for(const p of patch){let slot=index.get(p.boxId);if(slot===undefined){if(index===original)index=new Map(original);slot=next.length;index.set(p.boxId,slot);next.push({...p});}else next[slot]={...next[slot],...p};}
 if(index.has(tradedId)){next=next.filter(p=>p.boxId!==tradedId);return next;}
 indices.set(next,index);return next;
}
