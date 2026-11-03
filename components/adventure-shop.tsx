'use client';

import {useEffect,useMemo,useRef,useState} from 'react';
import {Coins,Search,ShoppingBag,Sparkles} from 'lucide-react';
import PokemonImage from '@/components/pokemon-image';
import AdventureItemImage from '@/components/adventure-item-image';
import {species} from '@/lib/game.mjs';
import {ADVENTURE_CAPSULES} from '@/lib/adventure-capsules.mjs';
import {ADVENTURE_GOODS,ADVENTURE_STORE_VERSION} from '@/lib/adventure-economy.mjs';
import {mergeAdventureShopState,filterAdventureCatalog} from '@/lib/adventure-shop-state.mjs';
import './adventure-shop.css';

const speciesById=new Map(species.map((pokemon:any)=>[pokemon.id,pokemon]));
const capsuleImages:Record<string,string>={meadow:'common',blaze:'rare',rare:'legendary',all:'epic'};

class ShopRequestError extends Error{uncertain:boolean;status:number;constructor(message:string,uncertain=false,status=0){super(message);this.uncertain=uncertain;this.status=status;}}
async function requestShop(body?:any){
 let response:Response;try{response=await fetch('/api/shop',body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{cache:'no-store'});}catch{throw new ShopRequestError('연결이 끊겼습니다.',!!body);}
 let data:any;try{data=await response.json();}catch{throw new ShopRequestError('서버 응답을 확인하지 못했습니다.',!!body);}
 if(!response.ok)throw new ShopRequestError(data.error||'요청에 실패했습니다.',!!body&&response.status>=500,response.status);return data;
}

function CapsuleContents({pack}:{pack:any}){
 const [open,setOpen]=useState(false),total=pack.weights.reduce((sum:number,weight:number)=>sum+weight,0);
 return <details className="as-capsule-details" onToggle={event=>setOpen(event.currentTarget.open)}><summary>전체 등장 목록 · 개별 확률</summary>{open&&<ul>{pack.pool.map((id:number,index:number)=><li key={id}><span>{(speciesById.get(id) as any)?.name||`도감 #${id}`}</span><b>{(100*pack.weights[index]/total).toFixed(4)}%</b></li>)}</ul>}</details>;
}

function CapsuleReveal({state,close}:{state:{pack:string;mon?:any};close:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);useEffect(()=>{const el=dialog.current;el?.showModal();return()=>{if(el?.open)el.close();};},[]);
 return <dialog ref={dialog} className="as-reveal" aria-labelledby="as-reveal-title" onCancel={event=>{if(!state.mon)event.preventDefault();else close();}}><div className="as-reveal-glow" aria-hidden="true"/><span className="as-eyebrow">POKÉMON CAPSULE</span><h2 id="as-reveal-title">{state.mon?'새로운 만남!':'캡슐을 열고 있어요'}</h2><div className={`as-reveal-stage${state.mon?' is-open':''}`}><img className="as-reveal-egg" src={`/game/eggs/${capsuleImages[state.pack]||'common'}.svg`} alt=""/>{state.mon&&<PokemonImage className="as-reveal-pokemon" mon={state.mon} variant="art" alt=""/>}</div>{state.mon?<><strong>{state.mon.name}</strong><p>보유함에 추가되었습니다.</p><button className="as-primary" autoFocus onClick={close}>계속하기</button></>:<p role="status">결과를 확인하고 있습니다…</p>}</dialog>;
}

export default function AdventureShop(){
 const [wallet,setWallet]=useState<any>(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[syncBlocked,setSyncBlocked]=useState(false),[reveal,setReveal]=useState<{pack:string;mon?:any}|null>(null),[query,setQuery]=useState(''),[category,setCategory]=useState('all'),[limit,setLimit]=useState(24),[quantity,setQuantity]=useState(1);
 const actionLock=useRef(false),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;requestShop().then(data=>{if(mounted.current)setWallet(data);}).catch(error=>{if(mounted.current)setMessage(error.message);});return()=>{mounted.current=false;};},[]);
 async function refreshShop(){try{const next=await requestShop();if(mounted.current){setWallet(next);setSyncBlocked(false);}return true;}catch{if(mounted.current)setSyncBlocked(true);return false;}}
 async function action(kind:string,item?:string,expectedUnitPrice?:number){
  if(actionLock.current||syncBlocked)return;actionLock.current=true;setBusy(true);setMessage('');if(kind==='gacha'&&item)setReveal({pack:item});
  try{const result=await requestShop({action:kind,item,quantity:kind==='buyHeld'?quantity:1,priceVersion:ADVENTURE_STORE_VERSION,expectedUnitPrice});if(!mounted.current)return;setWallet((previous:any)=>mergeAdventureShopState(previous,result));if(kind==='gacha'&&item)setReveal({pack:item,mon:result.received});else setMessage(kind==='claim'?'오늘의 보상을 받았습니다.':'아이템을 구매했습니다.');}
  catch(error:any){if(!mounted.current)return;setReveal(null);if(error.uncertain){setSyncBlocked(true);const recovered=await refreshShop();if(mounted.current)setMessage(recovered?'요청 결과를 확정할 수 없습니다. 잔액과 보유함을 확인해 주세요.':'연결이 끊겨 상점 상태를 확인하지 못했습니다.');}else{setMessage(error.message||'요청에 실패했습니다.');if(error.status===409&&/가격|확률/.test(error.message))await refreshShop();}}
  finally{actionLock.current=false;if(mounted.current)setBusy(false);}
 }
 const filtered=useMemo(()=>filterAdventureCatalog(wallet?.catalog,category,query),[wallet?.catalog,category,query]);
 const validQuantity=Number.isInteger(quantity)&&quantity>=1&&quantity<=99,priceMismatch=!!wallet&&wallet.priceVersion!==ADVENTURE_STORE_VERSION,blocked=busy||syncBlocked||priceMismatch;
 return <div className="content adventure-shop">
  <header className="as-hero"><div><span className="as-eyebrow">SUPPLY STATION / ADVENTURE</span><h2>모험 상점</h2><p>여행에 필요한 도구와 새로운 파트너를 준비하세요.</p></div><div className="as-wallet" aria-label={wallet?`보유 코인 ${wallet.coins}`:'보유 코인 확인 중'}><Coins size={20} aria-hidden="true"/><span><small>보유 코인</small><b>{wallet?wallet.coins.toLocaleString():'—'}</b></span></div></header>
  <nav className="as-nav" aria-label="상점 구역"><a href="#shop-capsules">포켓몬 캡슐</a><a href="#shop-supplies">탐험 도구</a><a href="#shop-equipment">지닌 물건 · 진화</a></nav>
  {message&&<p className="as-feedback" role="status">{message}</p>}{priceMismatch&&<p className="as-feedback" role="status">가격표가 변경되었습니다. 페이지를 새로고침해 주세요.</p>}{syncBlocked&&<div className="as-feedback"><p>연결을 복구한 뒤 잔액과 보유함을 확인해 주세요.</p><button className="as-more" disabled={busy} onClick={async()=>{setBusy(true);await refreshShop();setBusy(false);}}>상점 상태 다시 확인</button></div>}
  <section id="shop-capsules" className="as-section"><header className="as-section-head"><div><span className="as-eyebrow">POKÉMON CAPSULES</span><h3>포켓몬 캡슐</h3><p>게임 내 코인으로 구매하며, 받은 포켓몬은 보유함에 추가됩니다. 후보별 확률은 서로 다릅니다.</p></div><Sparkles size={21} aria-hidden="true"/></header><div className="as-capsule-grid">{Object.entries(ADVENTURE_CAPSULES).map(([key,pack]:any)=>{
   const insufficient=wallet&&wallet.coins<pack.price;
   return <article className={`as-capsule as-capsule-${key}`} key={key}><div className="as-capsule-top"><img className="as-capsule-image" src={`/game/eggs/${capsuleImages[key]}.svg`} alt="" loading="lazy"/><span className="as-tag">{pack.pool.length.toLocaleString()}종 · 폼</span></div><h4>{pack.name}</h4><p>{pack.legendaryChance>0?`전설·환상 전체 ${(pack.legendaryChance*100).toFixed(2)}%`:'전설·환상 미포함'} · 강한 개체는 더 드물게 등장합니다.</p><div className="as-preview" aria-label="등장 예시">{pack.featured.map((id:number)=><PokemonImage key={id} mon={speciesById.get(id) as any} variant="sprite" alt={(speciesById.get(id) as any)?.name||''}/>)}</div><CapsuleContents pack={pack}/><button className="as-primary" disabled={blocked||!wallet||!!insufficient} onClick={()=>action('gacha',key,pack.price)}>{pack.price.toLocaleString()} 코인 · 한 번 뽑기</button>{insufficient&&<small className="as-shortfall">{(pack.price-wallet.coins).toLocaleString()}코인 부족</small>}</article>;
  })}</div></section>
  <section id="shop-supplies" className="as-section"><header className="as-section-head"><div><span className="as-eyebrow">FIELD ESSENTIALS</span><h3>탐험 도구</h3><p>필드와 배틀에서 사용할 도구를 준비하세요.</p></div><ShoppingBag size={21} aria-hidden="true"/></header><div className="as-supply-grid">{ADVENTURE_GOODS.map((item:any)=>{
   const count=item.column?wallet?.[item.column]??0:wallet?.inventory?.[item.id]??0,capacity=item.column?99:999,insufficient=wallet&&wallet.coins<item.price,full=count>=capacity;
   return <article className="as-supply" key={item.id}><span className="as-supply-icon"><AdventureItemImage id={item.id}/></span><div className="as-supply-copy"><h4>{item.name}</h4><p>{item.description}</p><small>보유 {wallet?count:'—'} / {capacity}</small></div><div className="as-supply-action"><b>{item.price.toLocaleString()} 코인</b><button disabled={blocked||!wallet||!!insufficient||full} onClick={()=>action('buy',item.id,item.price)}>{full?'보관 한도':insufficient?'코인 부족':'구매하기'}</button></div></article>;
  })}<article className="as-supply as-daily"><span className="as-supply-icon"><img src="/game/items/item-fallback.svg" alt=""/></span><div className="as-supply-copy"><h4>오늘의 보급품</h4><p>UTC 자정마다 하루 한 번 100코인을 받습니다.</p><small>최근 수령: {wallet?.last_claim||'없음'}</small></div><div className="as-supply-action"><b>100 코인</b><button disabled={blocked||!wallet} onClick={()=>action('claim')}>보상 받기</button></div></article></div></section>
  <section id="shop-equipment" className="as-section"><header className="as-section-head"><div><span className="as-eyebrow">EQUIPMENT & EVOLUTION</span><h3>지닌 물건 · 진화 도구</h3><p>구매한 도구는 탐험의 기술·성장 메뉴에서 사용할 수 있습니다.</p></div></header><div className="as-filters"><label><span>아이템 검색</span><div className="as-search"><Search size={17} aria-hidden="true"/><input value={query} onChange={event=>{setQuery(event.target.value);setLimit(24);}} placeholder="이름으로 검색"/></div></label><label><span>종류</span><select value={category} onChange={event=>{setCategory(event.target.value);setLimit(24);}}><option value="all">전체</option><option value="held">지닌 물건</option><option value="evolution">진화 도구</option><option value="berry">나무열매</option></select></label><label><span>구매 수량</span><input type="number" min={1} max={99} value={quantity} onChange={event=>setQuantity(Number(event.target.value))}/></label></div><p className="as-count" aria-live="polite">검색 결과 {filtered.length.toLocaleString()}개{!validQuantity?' · 수량은 1~99개를 입력하세요.':''}</p><div className="as-equipment-grid">{filtered.slice(0,limit).map((item:any)=><article key={item.id}><div><h4>{item.name}</h4><small>보유 {wallet?.inventory?.[item.id]||0}개</small></div><button disabled={blocked||!validQuantity||wallet.coins<item.price*quantity} onClick={()=>action('buyHeld',item.id,item.price)}>{(item.price*(validQuantity?quantity:1)).toLocaleString()} 코인 · {validQuantity?quantity:1}개</button></article>)}</div>{wallet&&!filtered.length&&<p className="as-empty">조건에 맞는 아이템이 없습니다.</p>}{filtered.length>limit&&<button className="as-more" onClick={()=>setLimit(limit+24)}>더 보기 · {Math.min(24,filtered.length-limit)}개</button>}</section>
 {reveal&&<CapsuleReveal state={reveal} close={()=>setReveal(null)}/>}
 </div>;
}
