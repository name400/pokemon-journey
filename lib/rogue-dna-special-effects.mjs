// Source fuse transfers held modifiers even when manual transfer is disabled.
// Preserve all stacks, rejecting source caps rather than dropping overflow.
export function stageDnaSpecialBaseEffects(run,primary,donor){
 const ids=new Set(['oldgateau','shucklejuice']);
 const owned=member=>run.modifiers.filter(m=>m.boxId===member.boxId&&ids.has(m.id));
 for(const member of [primary,donor]){
  const rows=owned(member),totals=new Map(),juice=[];
  for(const m of rows){const gateau=m.id==='oldgateau',key=gateau?m.id:m.id+':'+m.statDelta;
   if(Object.keys(m).some(k=>!['id','boxId','count','transferable',...(gateau?[]:['statDelta'])].includes(k))||m.transferable!==false||!Number.isSafeInteger(m.count)||m.count<1||m.count>(gateau?1:2)||!gateau&&![10,-15].includes(m.statDelta))throw Error('옛날과자 또는 주스 기록을 확인하세요.');
   totals.set(key,(totals.get(key)||0)+m.count);if(totals.get(key)>(gateau?1:2))throw Error('옛날과자 또는 주스 중첩을 확인하세요.');if(!gateau)for(let i=0;i<m.count;i++)juice.push(m.statDelta);
  }
  if(!!member.rogueOldGateau!==rows.some(m=>m.id==='oldgateau')||!Array.isArray(member.rogueJuiceMods||[])||JSON.stringify(member.rogueJuiceMods||[])!==JSON.stringify(juice))throw Error('옛날과자 또는 주스 효과가 기록과 다릅니다.');
 }
 const fold=rows=>{const result=[];for(const m of rows){const prior=result.find(t=>t.id===m.id&&(m.id==='oldgateau'||t.statDelta===m.statDelta));if(prior){result.splice(result.indexOf(prior),1);result.push({...prior,count:prior.count+m.count});}else result.push({...m});}return result;};
 const incoming=fold(owned(donor));if(!incoming.length)return null;
 const merged=fold(owned(primary));
 for(const m of incoming){const target=merged.find(t=>t.id===m.id&&(m.id==='oldgateau'||t.statDelta===m.statDelta));if(target){target.count+=m.count;if(target.count>(m.id==='oldgateau'?1:2))throw Error('옛날과자 또는 주스 중첩을 모두 보존할 수 없습니다.');merged.splice(merged.indexOf(target),1);merged.push(target);}else merged.push({...m,boxId:primary.boxId});}
 run.modifiers=run.modifiers.filter(m=>!ids.has(m.id)||![primary.boxId,donor.boxId].includes(m.boxId));run.modifiers.push(...merged);
 donor.rogueOldGateau=false;donor.rogueJuiceMods=[];
 return {rogueOldGateau:merged.some(m=>m.id==='oldgateau'),rogueJuiceMods:merged.filter(m=>m.id==='shucklejuice').flatMap(m=>Array(m.count).fill(m.statDelta)),rogueFusionSpecialHeldRule:'source-v1'};
}
