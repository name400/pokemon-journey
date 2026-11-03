import {env} from 'cloudflare:workers';
import {encodeGameData,decodeGameData} from './game-storage.mjs';
import {ensureClassicState} from './rogue-classic-state.mjs';

// A request ID is retained with the save, so a retry after a lost response
// returns the original result instead of issuing another voucher.
export async function grantAdminVouchers(actor:string,b:any){
 const db=env.DB!,target=b.target,type=b.voucherType,amount=b.amount,id=b.requestId;
 if(b.mode!=='rogue'||typeof target!=='string'||!target||!['regular','plus','premium','golden'].includes(type)||!Number.isSafeInteger(amount)||amount<1||amount>9999||typeof id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))throw Error('대상, 바우처 종류와 지급 수량을 확인하세요.');
 if(!await db.prepare('SELECT user_id FROM players WHERE user_id=?').bind(target).first())throw Error('플레이어를 찾을 수 없습니다.');
 const row=await db.prepare('SELECT data,revision FROM saves WHERE user_id=?').bind(target).first<any>();
 const document=row?await decodeGameData(row.data):{version:2,screen:'home',dex:[],wins:0,coins:0,balls:5,potions:3,collection:[],run:null};document.__classicOwnerSeed=target;
 const state=ensureClassicState(document),system=state.system;system.adminVoucherGrants||={};const prior=system.adminVoucherGrants[id];
 if(prior){if(prior.actor!==actor||prior.type!==type||prior.amount!==amount)throw Error('이미 사용한 지급 요청입니다.');return {ok:true,duplicate:true,voucherType:type,amount,balance:prior.balance};}
 const existing=system.voucherCounts?.[type]??0;if(!Number.isSafeInteger(existing)||existing<0||!Number.isSafeInteger(existing+amount))throw Error('바우처 저장 수량을 확인하세요.');
 system.adminVoucherCounts||={};const adminCount=system.adminVoucherCounts[type]??0;if(!Number.isSafeInteger(adminCount)||adminCount<0||adminCount>existing||!Number.isSafeInteger(adminCount+amount))throw Error('관리자 바우처 기록을 확인하세요.');system.voucherCounts||={};system.voucherCounts[type]=existing+amount;system.adminVoucherCounts[type]=adminCount+amount;system.adminVoucherGrants[id]={actor,type,amount,balance:existing+amount};
 const encoded=await encodeGameData(document),now=Date.now();const mutation=row?db.prepare('UPDATE saves SET data=?,revision=revision+1,updated_at=? WHERE user_id=? AND revision=?').bind(encoded,now,target,row.revision):db.prepare('INSERT OR IGNORE INTO saves(user_id,data,revision,updated_at) VALUES(?,?,1,?)').bind(target,encoded,now);
 const audit=db.prepare('INSERT INTO admin_audit(actor,target,action,detail,created_at) SELECT ?,?,?,?,? WHERE changes()=1').bind(actor,target,'grantVouchers',JSON.stringify({mode:'rogue',voucherType:type,amount,requestId:id,balance:existing+amount}),now);
 const result=await db.batch([mutation,audit]);if(!result[0].meta.changes)throw Error('저장이 변경됐습니다. 같은 요청으로 다시 시도하세요.');return {ok:true,duplicate:false,voucherType:type,amount,balance:existing+amount};
}
