// Native slots and Classic modifier stacks share each reviewed source cap.
// Read live ownership before transfer; never truncate a legacy oversized stack.
export const CLASSIC_NATIVE_STACK_CAPS=Object.freeze({leftovers:4,shellbell:4});
export function classicHeldItemCount(id,modifiers,boxId,nativeItem=''){
 const rows=(modifiers||[]).filter(row=>row.id===id&&String(row.boxId)===String(boxId));
 if(rows.some(row=>!Number.isSafeInteger(row.count)||row.count<0))return Infinity;
 return rows.reduce((sum,row)=>sum+row.count,0)+Number(nativeItem===id);
}
export const classicLeftoversCount=(modifiers,boxId,nativeItem='')=>classicHeldItemCount('leftovers',modifiers,boxId,nativeItem);
export function classicCanReceiveHeldItem(id,modifiers,boxId,nativeItem='',quantity=1){
 return !Object.hasOwn(CLASSIC_NATIVE_STACK_CAPS,id)||classicHeldItemCount(id,modifiers,boxId,nativeItem)+quantity<=CLASSIC_NATIVE_STACK_CAPS[id];
}
