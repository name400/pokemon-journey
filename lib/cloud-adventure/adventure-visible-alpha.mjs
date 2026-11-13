// Overlay only persisted alpha identity, without replacing shared field records.
// Fixed alphas, unrecognized legacy records remain unchanged.
export function visibleWildAlpha(s,zone,p){
 if(!p||p.alpha||(p.burrow&&zone!==8))return p;
 const level=s?.zaWildVisibleAlphaLevels?.[`zone${zone}:${p.id}:${p.species}`];
 return Number.isInteger(level)&&level>=1&&level<=100?{...p,alpha:true,level}:p;
}
