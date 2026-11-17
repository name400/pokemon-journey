// A successful HTTP status is not proof that the returned game view is usable.
// In particular, never apply a partial view after a potentially committed action.
/** @param {any} value @param {{minimumRevision?:number,expectedRevision?:number|null}} [options] */
export function isClassicGameResponse(value,{minimumRevision=0,expectedRevision=null}={}){
 if(!value||typeof value!=='object'||Array.isArray(value)||!Number.isSafeInteger(value.revision)||value.revision<minimumRevision)return false;
 if(expectedRevision!==null&&value.revision!==expectedRevision)return false;
 if(!Array.isArray(value.slots)||!value.slots.every(slot=>slot&&typeof slot==='object'&&Array.isArray(slot.party))||!Number.isInteger(value.activeSlot)||value.activeSlot<0||value.activeSlot>=value.slots.length||typeof value.selecting!=='boolean')return false;
 const objectOrNull=x=>x===null||typeof x==='object'&&!Array.isArray(x);
 return Object.hasOwn(value,'run')&&objectOrNull(value.run)&&(value.run===null||typeof value.run.screen==='string'&&Array.isArray(value.run.party))&&Object.hasOwn(value,'battle')&&objectOrNull(value.battle)&&!!value.eggShop&&typeof value.eggShop==='object'&&!Array.isArray(value.eggShop)&&Array.isArray(value.eggShop.machines)&&Array.isArray(value.eggShop.eggs)&&!!value.eggShop.vouchers&&typeof value.eggShop.vouchers==='object'&&!!value.eggShop.voucherTypes&&typeof value.eggShop.voucherTypes==='object'&&!!value.meta&&typeof value.meta==='object'&&!Array.isArray(value.meta);
}
