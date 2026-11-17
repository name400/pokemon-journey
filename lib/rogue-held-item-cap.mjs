import {CLASSIC_NATIVE_TYPE_BOOSTERS} from './rogue-native-type-boosters.mjs';
import {Dex} from '@pkmn/sim';
// Native slots and Classic modifier stacks share each reviewed source cap.
// Read live ownership before transfer; never truncate a legacy oversized stack.
export const CLASSIC_NATIVE_STACK_CAPS=Object.freeze({leftovers:4,shellbell:4,focusband:5,scopelens:1});
// Legacy saves can retain an item's display name; interpret it without rewriting the save.
export function classicNativeItemId(value){const item=Dex.items.get(typeof value==='string'?value:'');return item.exists?item.id:'';}
export function classicHeldItemCount(id,modifiers,boxId,nativeItem=''){
 const rows=(modifiers||[]).filter(row=>row.id===id&&String(row.boxId)===String(boxId));
 if(rows.some(row=>!Number.isSafeInteger(row.count)||row.count<0))return Infinity;
 return rows.reduce((sum,row)=>sum+row.count,0)+Number(classicNativeItemId(nativeItem)===id);
}
export const classicLeftoversCount=(modifiers,boxId,nativeItem='')=>classicHeldItemCount('leftovers',modifiers,boxId,nativeItem);
export function classicTypeBoosterCount(modifiers,boxId,type,nativeItem=''){
 if(!Object.values(CLASSIC_NATIVE_TYPE_BOOSTERS).includes(type))return Infinity;
 const rows=(modifiers||[]).filter(row=>row.id==='typebooster'&&String(row.boxId)===String(boxId)&&row.typeBoost===type);
 if(rows.some(row=>!Number.isSafeInteger(row.count)||row.count<0))return Infinity;
 return rows.reduce((sum,row)=>sum+row.count,0)+Number(CLASSIC_NATIVE_TYPE_BOOSTERS[classicNativeItemId(nativeItem)]===type);
}
export function classicCanReceiveHeldItem(id,modifiers,boxId,nativeItem='',quantity=1,typeBoost=null){
 const type=Object.hasOwn(CLASSIC_NATIVE_TYPE_BOOSTERS,id)?CLASSIC_NATIVE_TYPE_BOOSTERS[id]:id==='typebooster'?typeBoost:null;
 if(id==='typebooster'||type)return classicTypeBoosterCount(modifiers,boxId,type,nativeItem)+quantity<=99;
 return !Object.hasOwn(CLASSIC_NATIVE_STACK_CAPS,id)||classicHeldItemCount(id,modifiers,boxId,nativeItem)+quantity<=CLASSIC_NATIVE_STACK_CAPS[id];
}
