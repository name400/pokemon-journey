import {legendaryPickupOptions} from './rogue-egg-shop.mjs';

const action='setRoguePickup';
export async function getRoguePickup(db:any){
  const row=await db.prepare('SELECT id,detail FROM admin_audit WHERE action=? ORDER BY id DESC LIMIT 1').bind(action).first();
  let sourceId:number|null=null;
  if(row){try{const value=JSON.parse(String(row.detail));if(Number.isInteger(value.sourceId)&&legendaryPickupOptions().some((p:any)=>p.sourceId===value.sourceId))sourceId=value.sourceId;}catch{}}
  return {sourceId,version:Number(row?.id||0)};
}
export async function setRoguePickup(db:any,actor:string,value:unknown){
  const sourceId=value===null?null:Number(value);
  if(sourceId!==null&&(!Number.isSafeInteger(sourceId)||!legendaryPickupOptions().some((p:any)=>p.sourceId===sourceId)))throw Error('전설 알에서 등장하는 포켓몬을 선택하세요.');
  await db.prepare('INSERT INTO admin_audit(actor,target,action,detail,created_at) VALUES(?,?,?,?,?)').bind(actor,'rogue-global',action,JSON.stringify({mode:'rogue',sourceId}),Date.now()).run();
  return {sourceId};
}
