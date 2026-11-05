import {CLASSIC_NATIVE_STACK_CAPS} from './rogue-held-item-cap.mjs';
// Source fuse combines held modifiers. Keep the primary native slot and move
// the reviewed donor healing item into its existing source-style modifier.
// This runs on stageClassicDnaFusion's copy, never on the live save.
export function stageDnaNativeHealingItems(run,primary,donor){
 if(!Object.hasOwn(CLASSIC_NATIVE_STACK_CAPS,primary.item)||!Object.hasOwn(CLASSIC_NATIVE_STACK_CAPS,donor.item))return;
 if(primary.rogueNativeItemNontransferable||donor.rogueNativeItemNontransferable)throw Error('이 소지 도구의 이전 상태를 확인하세요.');
 const id=donor.item,cap=CLASSIC_NATIVE_STACK_CAPS[id],owners=new Set([primary.boxId,donor.boxId]),rows=run.modifiers.filter(m=>m.id===id&&owners.has(m.boxId));
 for(const row of rows){
  if(Object.keys(row).some(key=>!['id','boxId','count','typeBoost'].includes(key))||row.typeBoost!=null||!Number.isSafeInteger(row.count)||row.count<1||row.count>cap)throw Error('회복 도구 중첩 기록을 확인하세요.');
 }
 const modifiers=rows.reduce((sum,row)=>sum+row.count,0);
 if(modifiers+1+Number(primary.item===id)>cap)throw Error('회복 도구 중첩을 모두 보존할 수 없습니다.');
 run.modifiers=run.modifiers.filter(row=>!rows.includes(row));
 run.modifiers.push({id,boxId:primary.boxId,typeBoost:null,count:modifiers+1});
 donor.item='';
}
