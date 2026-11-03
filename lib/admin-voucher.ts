import {encodeGameData,decodeGameData} from './game-storage.mjs';
import {ensureClassicState} from './rogue-classic-state.mjs';
import {grantClassicVoucher} from './rogue-egg-shop.mjs';

export async function grantAdminVoucher(db:any,actor:string,payload:any){
  const target=payload.target,type=payload.voucherType,amount=payload.amount;
  if(payload.mode!=='rogue')throw Error('교환권은 포켓로그에만 지급할 수 있습니다.');
  if(typeof target!=='string'||!target||target.length>100)throw Error('플레이어를 선택하세요.');
  if(!['regular','plus','premium','golden'].includes(type))throw Error('교환권 종류를 선택하세요.');
  if(!Number.isSafeInteger(amount)||amount<1||amount>1000)throw Error('수량은 1부터 1000까지의 정수여야 합니다.');
  if(!await db.prepare('SELECT user_id FROM players WHERE user_id=?').bind(target).first())throw Error('플레이어를 찾을 수 없습니다.');
  const row=await db.prepare('SELECT data,revision FROM saves WHERE user_id=?').bind(target).first();
  const document=row?await decodeGameData(row.data):{};document.__classicOwnerSeed=target;
  const state=ensureClassicState(document),before=state.system.vouchers?.[type]??0;
  if(!Number.isSafeInteger(before)||before<0||!Number.isSafeInteger(before+amount))throw Error('보유 수량이 유효한 범위를 벗어났습니다.');
  grantClassicVoucher(state.system,type,amount);
  const now=Date.now(),encoded=await encodeGameData(document),mutation=row?db.prepare('UPDATE saves SET data=?,revision=revision+1,updated_at=? WHERE user_id=? AND revision=?').bind(encoded,now,target,row.revision):db.prepare('INSERT OR IGNORE INTO saves(user_id,data,revision,updated_at) VALUES(?,?,1,?)').bind(target,encoded,now);
  const audit=db.prepare("INSERT INTO admin_audit(actor,target,action,detail,created_at) SELECT ?,?,'grantVoucher',?,? WHERE changes()=1").bind(actor,target,JSON.stringify({mode:'rogue',voucherType:type,amount,before,after:before+amount}),now);
  const result=await db.batch([mutation,audit]);if(!result[0].meta.changes)throw Error('플레이어 저장이 변경됐습니다. 다시 확인하고 지급하세요.');
  return {ok:true,mode:'rogue',voucherType:type,amount,total:before+amount};
}
