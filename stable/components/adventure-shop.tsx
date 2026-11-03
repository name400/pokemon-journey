'use client';

import {useEffect,useMemo,useRef,useState} from 'react';
import {Coins,Search,ShoppingBag,Sparkles} from 'lucide-react';
import PokemonImage from '@/components/pokemon-image';
import {species} from '@/lib/game.mjs';
import {GACHA} from '@/lib/world.mjs';
import {mergeAdventureShopState,filterAdventureCatalog} from '@/lib/adventure-shop-state.mjs';
import './adventure-shop.css';

const speciesById=new Map(species.map((pokemon:any)=>[pokemon.id,pokemon]));
const supplies=[
 {key:'ball',field:'balls',icon:'◉',name:'몬스터볼',price:100,desc:'야생 포켓몬을 포획할 때 사용합니다.'},
 {key:'potion',field:'potions',icon:'✚',name:'상처약',price:100,desc:'포켓몬의 HP를 20 회복합니다.'},
 {key:'super',field:'super_potions',icon:'✦',name:'좋은상처약',price:180,desc:'포켓몬의 HP를 60 회복합니다.'},
 {key:'hyper',field:'hyper_potions',icon:'✚',name:'고급상처약',price:600,desc:'포켓몬의 HP를 120 회복합니다.'},
 {key:'max',field:'max_potions',icon:'✚',name:'풀회복약',price:1200,desc:'포켓몬의 HP를 전부 회복합니다.'},
 {key:'fullrestore',field:'full_restores',icon:'✚',name:'회복약',price:1500,desc:'HP와 상태이상을 모두 회복합니다.'},
 {key:'antidote',field:'antidotes',icon:'✳',name:'해독제',price:80,desc:'포켓몬의 독 상태를 치료합니다.'},
];

async function requestShop(body?:any){
 const response=await fetch('/api/shop',body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{cache:'no-store'});
 const data:any=await response.json();if(!response.ok)throw Error(data.error||'요청에 실패했습니다.');return data;
}

function CapsuleContents({pool}:{pool:number[]}){
 const [open,setOpen]=useState(false),chance=(100/pool.length).toFixed(4);
 return <details className="as-capsule-details" onToggle={event=>setOpen(event.currentTarget.open)}><summary>전체 등장 목록 · 각 {chance}%</summary>{open&&<ul>{pool.map(id=><li key={id}><span>{(speciesById.get(id) as any)?.name||`도감 #${id}`}</span><b>{chance}%</b></li>)}</ul>}</details>;
}

export default function AdventureShop(){
 const [wallet,setWallet]=useState<any>(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[query,setQuery]=useState(''),[category,setCategory]=useState('all'),[limit,setLimit]=useState(24),[quantity,setQuantity]=useState(1);
 const actionLock=useRef(false),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;requestShop().then(data=>{if(mounted.current)setWallet(data);}).catch(error=>{if(mounted.current)setMessage(error.message);});return()=>{mounted.current=false;};},[]);
 async function action(kind:string,item?:string){
  if(actionLock.current)return;actionLock.current=true;setBusy(true);setMessage('');
  try{const result=await requestShop({action:kind,item,quantity:kind==='buyHeld'?quantity:1});if(!mounted.current)return;setWallet((previous:any)=>mergeAdventureShopState(previous,result));setMessage(kind==='claim'?'오늘의 보상을 받았습니다.':kind==='gacha'?`${result.received.name}을(를) 보유함에 추가했습니다!`:'아이템을 구매했습니다.');}
  catch(error:any){if(mounted.current)setMessage(error.message||'요청에 실패했습니다.');}
  finally{actionLock.current=false;if(mounted.current)setBusy(false);}
 }
 const filtered=useMemo(()=>filterAdventureCatalog(wallet?.catalog,category,query),[wallet?.catalog,category,query]);
 const validQuantity=Number.isInteger(quantity)&&quantity>=1&&quantity<=99;
 return <div className="content adventure-shop">
  <header className="as-hero"><div><span className="as-eyebrow">SUPPLY STATION / ADVENTURE</span><h2>모험 상점</h2><p>여행에 필요한 도구와 새로운 파트너를 준비하세요.</p></div><div className="as-wallet" aria-label={wallet?`보유 코인 ${wallet.coins}`:'보유 코인 확인 중'}><Coins size={20} aria-hidden="true"/><span><small>보유 코인</small><b>{wallet?wallet.coins.toLocaleString():'—'}</b></span></div></header>
  <nav className="as-nav" aria-label="상점 구역"><a href="#shop-capsules">포켓몬 캡슐</a><a href="#shop-supplies">탐험 도구</a><a href="#shop-equipment">지닌 물건 · 진화</a></nav>
  {message&&<p className="as-feedback" role="status">{message}</p>}
  <section id="shop-capsules" className="as-section"><header className="as-section-head"><div><span className="as-eyebrow">POKÉMON CAPSULES</span><h3>포켓몬 캡슐</h3><p>게임 내 코인으로 구매하며, 받은 포켓몬은 보유함에 추가됩니다.</p></div><Sparkles size={21} aria-hidden="true"/></header><div className="as-capsule-grid">{Object.entries(GACHA).map(([key,pack]:any)=>{
   const insufficient=wallet&&wallet.coins<pack.price;
   return <article className={`as-capsule as-capsule-${key}`} key={key}><div className="as-capsule-top"><span className="as-capsule-icon" aria-hidden="true">◉</span><span className="as-tag">{pack.pool.length.toLocaleString()}종 · 폼</span></div><h4>{pack.name}</h4><p>등장 후보 중 한 마리를 같은 확률로 만납니다.</p><div className="as-preview" aria-hidden="true">{pack.pool.slice(0,3).map((id:number)=><PokemonImage key={id} mon={speciesById.get(id) as any} variant="sprite" alt=""/>)}</div><CapsuleContents pool={pack.pool}/><button className="as-primary" disabled={busy||!wallet||!!insufficient} onClick={()=>action('gacha',key)}>{pack.price.toLocaleString()} 코인 · 한 번 뽑기</button>{insufficient&&<small className="as-shortfall">{(pack.price-wallet.coins).toLocaleString()}코인 부족</small>}</article>;
  })}</div></section>
  <section id="shop-supplies" className="as-section"><header className="as-section-head"><div><span className="as-eyebrow">FIELD ESSENTIALS</span><h3>탐험 도구</h3><p>필드와 배틀에서 사용할 도구를 준비하세요.</p></div><ShoppingBag size={21} aria-hidden="true"/></header><div className="as-supply-grid">{supplies.map(item=>{
   const count=wallet?.[item.field]??0,insufficient=wallet&&wallet.coins<item.price,full=count>=99;
   return <article className="as-supply" key={item.key}><span className="as-supply-icon" aria-hidden="true">{item.icon}</span><div className="as-supply-copy"><h4>{item.name}</h4><p>{item.desc}</p><small>보유 {wallet?count:'—'} / 99</small></div><div className="as-supply-action"><b>{item.price.toLocaleString()} 코인</b><button disabled={busy||!wallet||!!insufficient||full} onClick={()=>action('buy',item.key)}>{full?'보관 한도':insufficient?'코인 부족':'구매하기'}</button></div></article>;
  })}<article className="as-supply as-daily"><span className="as-supply-icon" aria-hidden="true">✦</span><div className="as-supply-copy"><h4>오늘의 보급품</h4><p>UTC 자정마다 하루 한 번 100코인을 받습니다.</p><small>최근 수령: {wallet?.last_claim||'없음'}</small></div><div className="as-supply-action"><b>100 코인</b><button disabled={busy||!wallet} onClick={()=>action('claim')}>보상 받기</button></div></article></div><p className="as-note">기력의조각은 탐험의 프렌들리숍에서 구매할 수 있습니다.</p></section>
  <section id="shop-equipment" className="as-section"><header className="as-section-head"><div><span className="as-eyebrow">EQUIPMENT & EVOLUTION</span><h3>지닌 물건 · 진화 도구</h3><p>구매한 도구는 탐험의 기술·성장 메뉴에서 사용할 수 있습니다.</p></div></header><div className="as-filters"><label><span>아이템 검색</span><div className="as-search"><Search size={17} aria-hidden="true"/><input value={query} onChange={event=>{setQuery(event.target.value);setLimit(24);}} placeholder="이름으로 검색"/></div></label><label><span>종류</span><select value={category} onChange={event=>{setCategory(event.target.value);setLimit(24);}}><option value="all">전체</option><option value="held">지닌 물건</option><option value="evolution">진화 도구</option><option value="berry">나무열매</option></select></label><label><span>구매 수량</span><input type="number" min={1} max={99} value={quantity} onChange={event=>setQuantity(Number(event.target.value))}/></label></div><p className="as-count" aria-live="polite">검색 결과 {filtered.length.toLocaleString()}개{!validQuantity?' · 수량은 1~99개를 입력하세요.':''}</p><div className="as-equipment-grid">{filtered.slice(0,limit).map((item:any)=><article key={item.id}><div><h4>{item.name}</h4><small>보유 {wallet?.inventory?.[item.id]||0}개</small></div><button disabled={busy||!validQuantity||wallet.coins<item.price*quantity} onClick={()=>action('buyHeld',item.id)}>{(item.price*(validQuantity?quantity:1)).toLocaleString()} 코인 · {validQuantity?quantity:1}개</button></article>)}</div>{wallet&&!filtered.length&&<p className="as-empty">조건에 맞는 아이템이 없습니다.</p>}{filtered.length>limit&&<button className="as-more" onClick={()=>setLimit(limit+24)}>더 보기 · {Math.min(24,filtered.length-limit)}개</button>}</section>
 </div>;
}
