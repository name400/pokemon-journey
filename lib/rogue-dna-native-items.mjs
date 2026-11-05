// Source fuse combines held modifiers, including up to four Leftovers.
// Keep the primary's native slot (and its item-presence semantics); represent
// only the otherwise-conflicting donor item with the existing held modifier.
// This runs on stageClassicDnaFusion's copy, never on the live save.
export function stageDnaDuplicateLeftovers(run,primary,donor){
 if(primary.item!=='leftovers'||donor.item!=='leftovers')return;
 if(primary.rogueNativeItemNontransferable||donor.rogueNativeItemNontransferable)throw Error('이 소지 도구의 이전 상태를 확인하세요.');
 const owners=new Set([primary.boxId,donor.boxId]),rows=run.modifiers.filter(m=>m.id==='leftovers'&&owners.has(m.boxId));
 for(const row of rows){
  if(Object.keys(row).some(key=>!['id','boxId','count','typeBoost'].includes(key))||row.typeBoost!=null||!Number.isSafeInteger(row.count)||row.count<1||row.count>4)throw Error('먹다남은음식 중첩 기록을 확인하세요.');
 }
 const modifiers=rows.reduce((sum,row)=>sum+row.count,0);
 if(modifiers+2>4)throw Error('먹다남은음식 중첩을 모두 보존할 수 없습니다.');
 run.modifiers=run.modifiers.filter(row=>!rows.includes(row));
 run.modifiers.push({id:'leftovers',boxId:primary.boxId,typeBoost:null,count:modifiers+1});
 donor.item='';
}
