import {CLASSIC_NATIVE_TYPE_BOOSTERS} from './rogue-native-type-boosters.mjs';
import {CLASSIC_NATIVE_STACK_CAPS} from './rogue-held-item-cap.mjs';
// Source fuse combines held modifiers. Keep the primary native slot and move
// the reviewed donor healing item into its existing source-style modifier.
// This runs on stageClassicDnaFusion's copy, never on the live save.
export function stageDnaNativeHealingItems(run,primary,donor){
 if(!['leftovers','shellbell'].includes(primary.item)||!['leftovers','shellbell'].includes(donor.item))return;
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

export {CLASSIC_NATIVE_TYPE_BOOSTERS} from './rogue-native-type-boosters.mjs';
export function stageDnaNativeTypeBoosters(run,primary,donor){
 const native=[primary,donor].filter(mon=>Object.hasOwn(CLASSIC_NATIVE_TYPE_BOOSTERS,mon.item));if(!native.length)return;
 if(native.some(mon=>mon.rogueNativeItemNontransferable))throw Error('이 타입 도구의 이전 상태를 확인하세요.');
 const owners=new Set([primary.boxId,donor.boxId]),plans=[];
 for(const type of new Set(native.map(mon=>CLASSIC_NATIVE_TYPE_BOOSTERS[mon.item]))){
  const rows=run.modifiers.filter(row=>row.id==='typebooster'&&owners.has(row.boxId)&&row.typeBoost===type);
  if(rows.some(row=>Object.keys(row).some(key=>!['id','boxId','count','typeBoost'].includes(key))||!Number.isSafeInteger(row.count)||row.count<1||row.count>99))throw Error('타입 도구 중첩 기록을 확인하세요.');
  const count=rows.reduce((total,row)=>total+row.count,0)+native.filter(mon=>CLASSIC_NATIVE_TYPE_BOOSTERS[mon.item]===type).length;
  if(count>99)throw Error('타입 도구 중첩을 모두 보존할 수 없습니다.');plans.push({type,rows,count});
 }
 // Normalize both native slots. Leaving one native boost active would multiply
 // 1.2 by the modifier multiplier instead of the source's additive 1 + .2*n.
 for(const {type,rows,count} of plans){run.modifiers=run.modifiers.filter(row=>!rows.includes(row));run.modifiers.push({id:'typebooster',boxId:primary.boxId,typeBoost:type,count});}
 for(const mon of native)mon.item='';
}

// These native counterparts have the same single-copy effect. Normalize both
// Focus Bands so stacks share one n/10 survival roll, not independent rolls.
export function stageDnaNativeBattleItems(run,primary,donor){
 const native=[primary,donor].filter(mon=>['focusband','scopelens'].includes(mon.item));if(!native.length)return;
 if(native.some(mon=>mon.rogueNativeItemNontransferable))throw Error('이 전투 도구의 이전 상태를 확인하세요.');
 const owners=new Set([primary.boxId,donor.boxId]),plans=[];
 for(const id of new Set(native.map(mon=>mon.item))){
  const cap=CLASSIC_NATIVE_STACK_CAPS[id],rows=run.modifiers.filter(row=>row.id===id&&owners.has(row.boxId));
  if(rows.some(row=>Object.keys(row).some(key=>!['id','boxId','count','typeBoost'].includes(key))||row.typeBoost!=null||!Number.isSafeInteger(row.count)||row.count<1||row.count>cap))throw Error('전투 도구 중첩 기록을 확인하세요.');
  const count=rows.reduce((total,row)=>total+row.count,0)+native.filter(mon=>mon.item===id).length;
  if(count>cap)throw Error('전투 도구 중첩을 모두 보존할 수 없습니다.');plans.push({id,rows,count});
 }
 for(const {id,rows,count} of plans){run.modifiers=run.modifiers.filter(row=>!rows.includes(row));run.modifiers.push({id,boxId:primary.boxId,typeBoost:null,count});}
 for(const mon of native)mon.item='';
}
