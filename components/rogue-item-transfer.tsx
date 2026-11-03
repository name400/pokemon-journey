'use client';
import {useState} from 'react';

type Item={kind:'native'|'modifier';id:string;name:string;count:number;typeBoost:string|null;crystal?:boolean};
type Mon={boxId:string;name:string;item?:string;transferItems?:Item[]};
export default function RogueItemTransfer({party,disabled,onTransfer}:{party:Mon[];disabled:boolean;onTransfer:(data:{fromBoxId:string;toBoxId:string;id:string;typeBoost:string|null;quantity:number;kind:'native'|'modifier'})=>Promise<unknown>}){
 const [fromId,setFrom]=useState(''),[itemIndex,setItem]=useState(''),[toId,setTo]=useState(''),[quantity,setQuantity]=useState(1);
 const from=party.find(p=>p.boxId===fromId),item=from?.transferItems?.[Number(itemIndex)],targets=party.filter(p=>p.boxId!==fromId&&(!item?.crystal||!p.item));
 const selected=itemIndex!==''&&item&&targets.some(p=>p.boxId===toId)&&Number.isInteger(quantity)&&quantity>=1&&quantity<=item.count;
 return <section className="rc-transfer" aria-label="소지 도구 옮기기"><h3>소지 도구 옮기기</h3><p>전투가 끝난 뒤 파티원 사이에서 도구를 옮깁니다. 전용 크리스탈은 맞는 포켓몬만 받을 수 있습니다.</p>
 <div className="rc-transfer-fields"><label>주는 포켓몬<select value={fromId} disabled={disabled} onChange={e=>{setFrom(e.target.value);setItem('');setTo('');setQuantity(1);}}><option value="">선택</option>{party.filter(p=>p.transferItems?.length).map(p=><option key={p.boxId} value={p.boxId}>{p.name}</option>)}</select></label>
 <label>도구<select value={itemIndex} disabled={disabled||!from} onChange={e=>{setItem(e.target.value);setTo('');setQuantity(1);}}><option value="">선택</option>{from?.transferItems?.map((i,index)=><option key={i.id+':'+i.typeBoost+':'+index} value={index}>{i.name} {i.kind==='native'?'· 소지품':'· 효과'} ×{i.count}</option>)}</select></label>
 <label>받는 포켓몬<select value={toId} disabled={disabled||!item||itemIndex===''} onChange={e=>setTo(e.target.value)}><option value="">선택</option>{targets.map(p=><option key={p.boxId} value={p.boxId}>{p.name}</option>)}</select></label>
 <label>수량<input type="number" min="1" max={item?.count||1} value={quantity} disabled={disabled||!item||itemIndex===''} onChange={e=>setQuantity(Number(e.target.value))}/></label>
 <button className="rogue-button rogue-button-small" disabled={disabled||!selected} onClick={()=>{if(selected)void onTransfer({fromBoxId:fromId,toBoxId:toId,id:item.id,typeBoost:item.typeBoost,quantity,kind:item.kind}).then(result=>{if(result){setItem('');setTo('');setQuantity(1);}});}}>옮기기</button></div></section>;
}
