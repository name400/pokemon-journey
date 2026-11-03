'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {ArrowUp,ArrowDown,ArrowLeft,ArrowRight,Backpack,BookOpen,ChevronRight,Coins,Heart,MapPin,MessageCircle,Search,Settings2,Store,Swords,Users,X} from 'lucide-react';
import RewardScene from '@/components/reward-scene';
import PokemonImage from '@/components/pokemon-image';
import BattlePanel from '@/components/battle-panel';
import AdventureField from '@/components/adventure-field';
import AdventureManagement from '@/components/adventure-management';
import AdventureBag from '@/components/adventure-bag';
import AdventureJournal from '@/components/adventure-journal';
import {species} from '@/lib/game.mjs';
import {STARTERS} from '@/lib/world.mjs';
import {TRAINERS} from '@/lib/campaign.mjs';
import {fieldPath,stepField} from '@/lib/adventure-world.mjs';
import './adventure.css';

type Screen='party'|'manage'|'bag'|'shop'|'journal'|null;
async function api(body?:any,light=false){
 const response=await fetch(light?'/api/world?light=1':'/api/world',body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{cache:'no-store'});
 const data=await response.json() as any;if(!response.ok)throw Error(data.error||'탐험 요청 실패');return data;
}
export function AdventureHP({mon}:{mon:any}){const ratio=Math.max(0,Math.min(1,mon.hp/Math.max(1,mon.maxHp)));return <div className="adv-health"><div><b>HP</b><span>{mon.hp} / {mon.maxHp}</span></div><div className="adv-meter" role="progressbar" aria-label={`${mon.name} HP`} aria-valuenow={mon.hp} aria-valuemin={0} aria-valuemax={mon.maxHp}><i className={ratio<.25?'low':ratio<.5?'half':''} style={{transform:`scaleX(${ratio})`}}/></div></div>;}
function Sheet({title,close,children}:{title:string;close:()=>void;children:React.ReactNode}){
 const ref=useRef<HTMLDialogElement>(null);useEffect(()=>{const el=ref.current;el?.showModal();return()=>el?.close();},[]);
 return <dialog ref={ref} className="adv-sheet" aria-labelledby="adv-sheet-title" onCancel={close} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}}}><header><h2 id="adv-sheet-title">{title}</h2><button autoFocus aria-label="닫기" onClick={close}><X size={22}/></button></header><div className="adv-sheet-body">{children}</div></dialog>;
}

export default function Adventure(){
 const [data,setData]=useState<any>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[selected,setSelected]=useState(1);
 const [screen,setScreen]=useState<Screen>(null),[dialogue,setDialogue]=useState<any>(null),[teamEdit,setTeamEdit]=useState(false),[team,setTeam]=useState<string[]>([]);
 const [query,setQuery]=useState(''),[page,setPage]=useState(0),[hint,setHint]=useState('방향키 / WASD로 걷고 E로 대화하세요.');
 const [battleResult,setBattleResult]=useState<any>(null),resultRef=useRef<any>(null);
 const lock=useRef(false),mounted=useRef(true),revision=useRef(-1),snapshot=useRef<any>(null),screenRef=useRef<Screen>(null),dialogueRef=useRef<any>(null);
 const heldDirection=useRef(''),pathQueue=useRef<string[]>([]),lastFacing=useRef('');
 snapshot.current=data;screenRef.current=screen;dialogueRef.current=dialogue;
 const stop=useCallback(()=>{heldDirection.current='';pathQueue.current=[];},[]);
 const accept=useCallback((d:any)=>{
  if(!mounted.current||d.revision<revision.current)return;revision.current=d.revision;
  setData((old:any)=>{if(d.boxMode!=='patch'||!old)return d;const merged=new Map(old.box.map((p:any)=>[p.boxId,p]));for(const p of d.box)merged.set(p.boxId,{...(merged.get(p.boxId) as any),...p});return {...d,fieldShop:d.fieldShop??old.fieldShop,expeditions:d.expeditions??old.expeditions,box:[...merged.values()]};});
  setTeam(d.world?.teamIds||[]);if(d.battle)stop();
 },[stop]);
 const load=useCallback(async(light=false)=>{try{accept(await api(undefined,light));setError('');}catch(e){if(mounted.current)setError(e instanceof Error?e.message:'불러오기 실패');}},[accept]);
 const act=useCallback(async(action:string,extra:any={})=>{
  if(lock.current)return null;lock.current=true;setBusy(true);setError('');
  try{const result=await api({action,revision:revision.current,...extra});if(result.battleResult){const terminal={battle:result.battleResult,trainer:snapshot.current?.world?.trainer,biome:snapshot.current?.world?.areaInfo?.biome};resultRef.current=terminal;setBattleResult(terminal);stop();}accept(result);return result;}
  catch(e){stop();if(mounted.current)setError(e instanceof Error?e.message:'요청 실패');await load();return null;}
  finally{lock.current=false;if(mounted.current)setBusy(false);}
 },[accept,load,stop]);
 useEffect(()=>{mounted.current=true;load();return()=>{mounted.current=false;stop();};},[load,stop]);
 const interact=useCallback(()=>{stop();const spot=snapshot.current?.world?.interaction;if(!spot){setHint('NPC나 건물 입구로 다가가 바라본 뒤 대화하세요.');return;}setDialogue(spot);},[stop]);
 useEffect(()=>{
  const dirs:Record<string,string>={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'};
  const keydown=(e:KeyboardEvent)=>{
   if(!snapshot.current?.world||snapshot.current.battle||resultRef.current||screenRef.current||dialogueRef.current||/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName||''))return;
   const key=e.key.toLowerCase();if(dirs[key]){e.preventDefault();if(!e.repeat)pathQueue.current=[dirs[key]];heldDirection.current=dirs[key];}
   else if(key==='e'||(key===' '&&document.activeElement?.tagName!=='BUTTON')){e.preventDefault();if(!e.repeat)interact();}
   else if(key==='j'||key==='b'){stop();setScreen(key==='j'?'journal':'bag');}
  };
  const keyup=(e:KeyboardEvent)=>{if(dirs[e.key.toLowerCase()]===heldDirection.current)heldDirection.current='';};
  const hide=()=>{if(document.hidden)stop();};
  window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',stop);document.addEventListener('visibilitychange',hide);
  let alive=true,timer:ReturnType<typeof setTimeout>;
  const tick=async()=>{
   if(!alive)return;const d=snapshot.current,direction=heldDirection.current||pathQueue.current[0];
   if(direction&&d?.world&&!d.battle&&!resultRef.current&&!screenRef.current&&!dialogueRef.current&&!lock.current){
    const step=stepField(d.world,direction);
    if(step.blocked){pathQueue.current=[];if(lastFacing.current!==direction||d.world.facing!==direction){lastFacing.current=direction;await act('face',{direction});}setHint(step.reason);}
    else{
     // A selected route can be sent in small batches; held controls remain one step
     // at a time so releasing a key or touch never queues extra movement.
     const path=heldDirection.current?[direction]:pathQueue.current.splice(0,4);
     if(heldDirection.current&&pathQueue.current[0]===direction)pathQueue.current.shift();
     lastFacing.current=path.at(-1)||direction;
     const r=await act('move',{path});
     // The server may stop early for an encounter, transition, or obstacle.
     if(r&&(r.battle||r.world?.area!==d.world.area||r.world?.interior!==d.world.interior||r.world?.district!==d.world.district||(r.world?.steps||0)-(d.world.steps||0)<path.length))stop();
    }
   }
   if(alive)timer=setTimeout(tick,65);
  };timer=setTimeout(tick,0);
  return()=>{alive=false;clearTimeout(timer);window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',stop);document.removeEventListener('visibilitychange',hide);};
 },[act,interact,stop]);
 useEffect(()=>{if(!data?.world?.inUnion||screen||dialogue||data.battle||battleResult)return;const timer=setInterval(()=>{if(!lock.current)load(true);},4000);return()=>clearInterval(timer);},[data?.world?.inUnion,screen,dialogue,!!data?.battle,battleResult,load]);
 const roster=useMemo(()=>{const q=query.trim().toLowerCase();return (data?.box||[]).filter((p:any)=>!q||`${p.name} ${p.id} ${p.types?.join(' ')}`.toLowerCase().includes(q));},[data?.box,query]);
 const close=()=>{setScreen(null);setTeamEdit(false);setQuery('');setPage(0);};
 const open=(s:Screen)=>{stop();setScreen(s);setDialogue(null);setTeam(data?.world?.teamIds||[]);};
 if(!data)return <div className="content adv-loading" role="status"><span className="adv-loading-ball"/><h2>{error||'모험을 불러오는 중…'}</h2>{error&&<button className="primary" onClick={()=>load()}>다시 불러오기</button>}</div>;
 if(!data.world)return <div className="content adv-intro"><span className="kicker">첫 번째 모험</span><h2>너와 함께 여행하고 싶어!</h2><p>첫 파트너를 선택하세요. 풀숲 너머로 8개의 체육관과 포켓몬 리그가 기다립니다.</p><div className="adv-starters">{STARTERS.map(id=>{const p=species.find(s=>s.id===id)!;return <button className={selected===id?'selected':''} aria-pressed={selected===id} onClick={()=>setSelected(id)} key={id}><PokemonImage mon={p} variant="sprite" eager/><b>{p.name}</b><span>{p.types.join(' / ')}</span></button>;})}</div><button className="primary" disabled={busy} onClick={()=>act('start',{species:selected})}>{busy?'출발 준비 중…':'이 파트너와 출발하기'}<ChevronRight size={18}/></button><p className="adv-note">계정에 자동 저장 · 최대 Lv.100 · 직접 선택하는 진화</p>{error&&<p className="feedback" role="alert">{error}</p>}</div>;
 const w=data.world,mon=data.box.find((p:any)=>p.boxId===w.activeId),area=w.areaInfo,spot=w.interaction;
 if(!mon)return <div className="content"><p role="alert">파트너 정보를 다시 불러와 주세요.</p><button onClick={()=>load()}>다시 불러오기</button></div>;
 const inBattle=!!data.battle||!!battleResult,party=w.teamIds.map((id:string)=>data.box.find((p:any)=>p.boxId===id)).filter(Boolean),ready=mon.evolutions?.some((e:any)=>e.ready);
 const titles={party:'포켓몬 · 파티와 보유함',manage:`${mon.name} · 기술과 성장`,bag:'가방',shop:'프렌들리숍',journal:'여행 수첩'};
 return <div className={`content adventure-game biome-${area.biome}`}>
  <header className="adv-heading"><div><span className="kicker">나의 포켓몬 여행</span><h2><MapPin size={20}/>{area.name}</h2></div><div className="adv-wallet"><span><Coins size={17}/>{(data.wallet?.coins||0).toLocaleString()}<small>코인</small></span><span className="adv-ball-count"><i/>{data.wallet?.balls||0}<small>볼</small></span></div></header>
  <div className="adv-route-bar"><p><span className="adv-dot"/>{w.objective}</p><button onClick={()=>open('journal')} aria-label={`여행 수첩 열기. 배지 ${w.badges.length}개`}>배지 <b>{w.badges.length}/8</b><span className="adv-mini-badges" aria-hidden="true">{TRAINERS.slice(0,8).map(t=><i key={t.id} className={w.badges.includes(t.id)?'earned':''}/>)}</span><ChevronRight size={16}/></button></div>
  <div className="adv-game-layout"><section className="adv-field-section" aria-label="필드 탐험">
   <div className="adv-field-top"><span><span className="adv-dot"/> {inBattle?'배틀 중':busy?'저장 중…':w.interior?'실내 탐험':'필드 탐험'}</span><span>{w.interior?'남쪽 출구로 나가기':w.district==='lumiose-garden'?'서쪽 길로 광장에 돌아가기':w.district?'동쪽 정원 · 남쪽 항구 정류장':<>야생 Lv.{area.min||40}–{area.max||65} · {data.gameTime?.period==='night'?'밤':'낮'}</>}</span></div>
   <AdventureField world={w} disabled={inBattle||!!screen||!!dialogue} onPath={path=>{if(!path.length){setHint('이곳까지 걸어갈 길이 없습니다.');return;}heldDirection.current='';pathQueue.current=path.slice(0,240);}} onInteract={interact}/>
   <div className="adv-field-bottom"><span>{w.district?area.name:`지역 ${w.area+1}/10`}</span><span>KENNEY CC0 타일 · <a href="/game/town/README.md" target="_blank" rel="noreferrer">자산 출처</a></span></div>
   <div className="adv-console"><div className="adv-message" role="status" aria-live="polite"><b>{spot?`${spot.name} 앞`:'여행 기록'}</b><p>{error||w.log?.at(-1)||hint}</p><small>{hint}</small></div><div className="adv-inputs"><div className="adv-dpad" aria-label="이동 버튼">{[['up',ArrowUp,'위'],['left',ArrowLeft,'왼쪽'],['down',ArrowDown,'아래'],['right',ArrowRight,'오른쪽']].map(([direction,Icon,label]:any)=><button key={direction} className={`adv-dir-${direction}`} aria-label={`${label}로 이동`} disabled={inBattle||!!screen||!!dialogue} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);pathQueue.current=[direction];heldDirection.current=direction;}} onPointerUp={()=>{heldDirection.current='';}} onPointerCancel={stop} onLostPointerCapture={()=>{heldDirection.current='';}} onClick={e=>{if(e.detail===0)pathQueue.current=[direction];}}><Icon size={21} aria-hidden="true"/></button>)}</div><button className="adv-talk" disabled={inBattle||busy} onClick={interact}><MessageCircle size={23}/><b>대화</b><kbd>E</kbd></button></div></div>
   <nav className="adv-toolbar" aria-label="탐험 메뉴">{[['party',Users,'포켓몬'],['bag',Backpack,'가방'],['journal',BookOpen,'여행 수첩'],['manage',Settings2,ready?'진화 가능!':'기술 · 성장']].map(([s,Icon,label]:any)=><button key={s} disabled={inBattle} className={s==='manage'&&ready?'adv-ready':''} onClick={()=>open(s)}><Icon size={20} aria-hidden="true"/><span>{label}</span></button>)}</nav>
   <div className="adv-landmarks" aria-label="주요 장소 길 찾기">{[['H',Heart,'센터'],['M',Store,'숍'],[w.area===0?'P':w.area===9?'L':'G',Swords,w.area===0?'연구소':w.area===9?'리그':'체육관']].map(([tile,Icon,label]:any)=>{let target:any;w.map.forEach((row:string,y:number)=>{const x=row.indexOf(tile);if(x>=0&&!target)target={x,y};});return target?<button key={tile} disabled={inBattle} onClick={()=>{stop();pathQueue.current=fieldPath(w.map,{x:w.x,y:w.y},target);if(!pathQueue.current.length)interact();}}><Icon size={15}/>{label}로 걷기</button>:null;})}</div>
  </section><aside className="adv-sidebar"><article className="adv-partner"><div className="adv-card-label"><span>함께 걷는 파트너</span><span>{mon.shiny?'색이 다른 모습':'선두'}</span></div><div className="adv-partner-art"><PokemonImage mon={mon} variant="sprite" eager/><div className="adv-sprite-shadow"/></div><div className="adv-partner-name"><h3>{mon.name}</h3><b>Lv.{mon.level}</b></div><div className="adv-types">{mon.types.map((t:string)=><span key={t}>{t}</span>)}{mon.status&&<strong>{mon.status}</strong>}</div><AdventureHP mon={mon}/><div className="adv-exp"><span>EXP</span><div className="adv-meter"><i style={{transform:`scaleX(${mon.level>=100?1:Math.min(1,(mon.experience||0)/Math.max(1,mon.expToNext||1))})`}}/></div><small>{mon.level>=100?'MAX':`${mon.experience||0} / ${mon.expToNext||0}`}</small></div>{ready&&<button className="adv-evolve-prompt" onClick={()=>open('manage')} disabled={inBattle}>진화 조건을 충족했어요! 직접 진화하기 <ChevronRight size={16}/></button>}</article><article className="adv-party"><div className="adv-card-label"><b>나의 파티 <span>{party.length}/6</span></b><button onClick={()=>open('party')} disabled={inBattle}>편성</button></div>{party.map((p:any)=><button key={p.boxId} className={p.boxId===w.activeId?'active':''} disabled={busy||inBattle} onClick={()=>act('switch',{id:p.boxId})}><PokemonImage mon={p} variant="sprite" alt=""/><div><b>{p.name}</b><small>Lv.{p.level} · {p.hp<=0?'기절':p.status||`HP ${p.hp}/${p.maxHp}`}</small></div><span className={p.hp<=0?'fainted':'healthy'}/></button>)}</article><div className="adv-tip"><BookOpen size={18}/><p>풀숲에서 만난 포켓몬은 HP를 줄이거나 상태이상을 걸면 잡기 쉬워집니다.</p></div></aside></div>
  {error&&<p className="feedback" role="alert">{error}</p>}
  {dialogue&&<Sheet title={dialogue.name} close={()=>setDialogue(null)}><div className="adv-dialogue"><MessageCircle size={34}/><p>{dialogue.text}</p></div><div className="adv-sheet-actions">{(dialogue.actions||[dialogue]).filter((option:any)=>option.action).map((option:any)=><button key={option.action} className="primary" disabled={busy} onClick={async()=>{if(option.action==='shop'){open('shop');return;}if(await act(option.action))setDialogue(null);}}>{option.label}</button>)}<button onClick={()=>setDialogue(null)}>이야기 마치기</button></div>{error&&<p role="alert">{error}</p>}</Sheet>}
  {screen&&<Sheet title={titles[screen]} close={close}>
   {screen==='party'&&<><div className="adv-sheet-actions"><p>보유 {data.box.length}마리 · 서로 다른 {new Set(data.box.map((p:any)=>p.speciesId||p.id)).size}종</p><button className="primary" onClick={()=>{setTeamEdit(!teamEdit);setTeam(w.teamIds);}}>{teamEdit?'편성 취소':'파티 편성하기'}</button></div><label className="adv-search"><Search size={18}/><input aria-label="보유 포켓몬 검색" value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}} placeholder="이름, 도감 번호, 타입 검색"/></label>{teamEdit&&<div className="adv-team-save"><span>{team.length}/6마리 선택</span><button className="primary" disabled={busy||!team.length} onClick={async()=>{if(await act('team',{ids:team}))setTeamEdit(false);}}>파티 저장</button></div>}<div className="adv-roster">{roster.slice(page*48,(page+1)*48).map((p:any)=><button key={p.boxId} aria-pressed={teamEdit?team.includes(p.boxId):p.boxId===w.activeId} disabled={busy||teamEdit&&!team.includes(p.boxId)&&team.length>=6} onClick={()=>{if(teamEdit)setTeam(team.includes(p.boxId)?team.filter(id=>id!==p.boxId):[...team,p.boxId]);else act('switch',{id:p.boxId});}}><PokemonImage mon={p} variant="sprite" alt=""/><b>{p.name}</b><span>Lv.{p.level}{p.shiny?' · 색이 다름':''}</span><small>HP {p.hp}/{p.maxHp}</small>{teamEdit&&<span>{team.includes(p.boxId)?`선택 ${team.indexOf(p.boxId)+1}`:'선택하기'}</span>}</button>)}</div>{!roster.length&&<p>일치하는 포켓몬이 없습니다.</p>}<div className="adv-pagination"><button disabled={page===0} onClick={()=>setPage(page-1)}>이전</button><span>{page+1} / {Math.max(1,Math.ceil(roster.length/48))}</span><button disabled={(page+1)*48>=roster.length} onClick={()=>setPage(page+1)}>다음</button></div></>}
   {screen==='manage'&&<AdventureManagement data={data} mon={mon} cell={spot?.tile} busy={busy} act={act}/>}
   {(screen==='bag'||screen==='shop')&&<AdventureBag data={data} mon={mon} shop={screen==='shop'} busy={busy} act={act}/>}
   {screen==='journal'&&<AdventureJournal data={data} busy={busy} act={act} close={close}/>}
   {error&&<p className="feedback" role="alert">{error}</p>}
  </Sheet>}
  {!battleResult&&<RewardScene revision={data.revision} events={w.events||[]} box={data.box} activeId={w.activeId} log={w.log}/>}
  {inBattle&&<BattlePanel error={error} battle={battleResult?.battle||data.battle} battleKey={`world:${data.revision}`} biome={battleResult?.biome||area.biome} title={(battleResult?.trainer||w.trainer)?`${(battleResult?.trainer||w.trainer).name}와의 배틀`:'야생 포켓몬과 배틀'} trainer={battleResult?.trainer||w.trainer} onForfeit={battleResult?undefined:()=>{if(window.confirm('배틀을 포기하고 센터로 돌아가시겠습니까?'))act('forfeit');}} busy={busy} onCommand={command=>act('battle',{command})} onItem={item=>act('use',{item})} onBall={w.trainer?undefined:()=>act('ball')} onFlee={w.trainer?undefined:()=>act('flee')} items={data.wallet} onContinue={battleResult?()=>{resultRef.current=null;setBattleResult(null);}:undefined}/>}
 </div>;
}
