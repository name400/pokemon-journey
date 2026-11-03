'use client';
import {useEffect,useState} from 'react';
import PokemonImage from '@/components/pokemon-image';
async function api(url:string,body?:any){const r=await fetch(url,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:undefined);const d:any=await r.json();if(!r.ok)throw Error(d.error||'요청에 실패했습니다.');return d}
export {default as Shop} from '@/components/adventure-shop';
export {default as Pvp} from './pvp-panel';
export function Collection(){const [data,setData]=useState<any>(null),[error,setError]=useState('');useEffect(()=>{api('/api/world').then(setData).catch(e=>setError(e.message))},[]);return <div className="content"><div className="section-head"><div><span className="kicker">YOUR POKÉMON</span><h2>포켓몬 보유함</h2><p>탐험에서 포획하거나 캡슐에서 얻은 포켓몬입니다. 파트너는 모험 화면에서 교체하세요.</p></div><strong className="count">{data?.box?.length??'—'} <small>마리</small></strong></div>{error&&<p className="feedback">{error}</p>}{data&&!data.box.length&&<div className="notice">아직 보유한 포켓몬이 없습니다. 모험을 시작해 주세요.</div>}<div className="collection">{data?.box.map((p:any)=><div className="dex-card" key={p.boxId}><div className="dex-num">#{String(p.id).padStart(3,'0')} · {p.origin==='gacha'?'캡슐':p.origin==='capture'?'포획':'파트너'}</div><PokemonImage className="portrait" mon={p} alt=""/><b>{p.name} · Lv.{p.level}</b><small>HP {p.hp}/{p.maxHp} · 경험치 {p.experience||0}</small></div>)}</div></div>}

