// A type-only preview; do not run simulator events while building a request.
// Move types that can change at execution are deliberately left unknown.
const variableType=new Set(['weatherball','judgment','revelationdance','multiattack','terrainpulse','naturalgift','technoblast','hiddenpower','aurawheel','ragingbull','ivycudgel','terablast','terastarstorm','struggle']);
export function adventureTypePreview(b,source,target,move){
 if(!target||!source||!move||move.category==='Status'||variableType.has(move.id))return null;
 if(source.hasAbility('normalize')||move.type==='Normal'&&source.hasAbility(['pixilate','aerilate','refrigerate','galvanize','dragonize'])||move.flags?.sound&&source.hasAbility('liquidvoice'))return null;
 const visible=target.illusion||target,types=visible.getTypes(),type=move.type;
 if(move.id==='thousandarrows'&&type==='Ground')return 2**types.filter(t=>t!=='Flying').reduce((sum,t)=>sum+b.dex.getEffectiveness(type,t),0);
 if(!b.dex.getImmunity(type,visible))return 0;
 let stages=types.reduce((sum,t)=>sum+(move.id==='freezedry'&&t==='Water'?1:b.dex.getEffectiveness(type,t)),0);
 if(move.id==='flyingpress')stages+=b.dex.getEffectiveness('Flying',visible);
 return 2**stages;
}
