'use client';
import {useEffect,useState} from 'react';
import {ADVENTURE_IV_STATS,adventureJudgeStat} from '@/lib/cloud-adventure/adventure-iv-judge.mjs';

export default function AdventureIvJudge({box}:{box:any[]}){
 const [id,setId]=useState(''),[mon,setMon]=useState<any>(null),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 useEffect(()=>{
  setMon(null);setError('');if(!id){setLoading(false);return;}
  const controller=new AbortController();let current=true;setLoading(true);
  (async()=>{try{const response=await fetch(`/api/world?detail=${encodeURIComponent(id)}`,{cache:'no-store',signal:controller.signal});if(!response.ok)throw Error();const result:any=await response.json();const found=result.box?.find((m:any)=>m.boxId===id);if(!found)throw Error();if(current)setMon(found);}catch(e:any){if(current&&e?.name!=='AbortError')setError('포켓몬 정보를 불러오지 못했습니다. 다시 선택해 주세요.');}finally{if(current)setLoading(false);}})();
  return ()=>{current=false;controller.abort();};
 },[id]);
 return <details className="field-management"><summary>능력 평가</summary><p>포켓몬의 타고난 개체값을 평가합니다. 대단히 단련한 능력치는 별도로 표시합니다.</p><label>평가할 포켓몬 <select aria-label="평가할 포켓몬" value={id} onChange={e=>setId(e.target.value)}><option value="">선택</option>{box.map((p:any)=><option key={p.boxId} value={p.boxId}>{p.name} · Lv.{p.level}</option>)}</select></label>{loading&&<p role="status">정보를 불러오는 중입니다.</p>}{error&&<p role="alert">{error}</p>}{mon&&<div aria-live="polite"><b>{mon.name}의 능력 평가</b><ul>{ADVENTURE_IV_STATS.map(([key,label]:string[])=><li key={key}>{label}: {adventureJudgeStat(mon,key)}</li>)}</ul></div>}</details>;
}
