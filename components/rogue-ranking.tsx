'use client';
import {useCallback,useEffect,useState} from 'react';
import {Flag,RefreshCw,Trophy,Users} from 'lucide-react';
import './rogue-ranking.css';
type RankingData={leaders:{nickname:string;best_wave:number;is_self?:number}[];own:{bestWave:number;rank:number|null;needsNickname:boolean}|null};
async function fetchRanking(signal?:AbortSignal):Promise<RankingData>{const response=await fetch('/api/rogue-ranking',{cache:'no-store',signal}),result=await response.json() as RankingData&{error?:string};if(!response.ok)throw Error(result.error||'랭킹을 불러오지 못했습니다.');return result;}
export default function RogueRanking(){
 const [data,setData]=useState<RankingData|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 const load=useCallback(async()=>{setLoading(true);setError('');try{setData(await fetchRanking());}catch(cause){setError(cause instanceof Error?cause.message:'랭킹을 불러오지 못했습니다.');}finally{setLoading(false);}},[]);
 useEffect(()=>{const controller=new AbortController();void fetchRanking(controller.signal).then(result=>{if(!controller.signal.aborted)setData(result);},cause=>{if(!controller.signal.aborted)setError(cause instanceof Error?cause.message:'랭킹을 불러오지 못했습니다.');}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();},[]);
 return <section className="rogue-ranking" aria-label="포켓로그 랭킹" aria-busy={loading}>
  <header className="rr-heading"><div><span>CLASSIC / LEADERBOARD</span><h2><Trophy size={24} aria-hidden="true"/>포켓로그 랭킹</h2><p>전체 기간 · 완료한 최고 웨이브 · 동률은 기록 등록 순</p></div><button type="button" disabled={loading} onClick={()=>void load()}><RefreshCw size={16} aria-hidden="true"/>새로고침</button></header>
  <div className="rr-content"><section className="rr-personal" aria-label="개인 최고 기록"><span className="rr-icon"><Flag size={23} aria-hidden="true"/></span><div><small>PERSONAL BEST</small><h3>나의 최고 기록</h3><b>{loading?'기록을 불러오는 중…':error?'기록을 확인하지 못했습니다':data?.own?`${data.own.bestWave} 웨이브`:'아직 기록이 없습니다'}</b><p>{loading?'조회가 완료되면 표시됩니다.':error?'새로고침하여 다시 확인해 주세요.':data?.own?.needsNickname?'닉네임을 설정하면 글로벌 랭킹에 표시됩니다.':data?.own?.rank?`글로벌 ${data.own.rank}위`:'완료한 웨이브가 여기에 기록됩니다.'}</p></div></section>
  <section className="rr-global" aria-label="글로벌 랭킹"><div className="rr-global-head"><div><Users size={19} aria-hidden="true"/><h3>글로벌 랭킹</h3></div><small>상위 50명</small></div>{error?<p className="rr-empty" role="alert">{error}</p>:!data&&loading?<p className="rr-empty" role="status">기록을 불러오는 중…</p>:!data?.leaders.length?<p className="rr-empty">아직 등록된 기록이 없습니다.</p>:<ol className="rr-list">{data.leaders.map((entry,index)=><li key={`${index}:${entry.nickname}`} className={entry.is_self?'is-self':undefined}><span className="rr-place">{String(index+1).padStart(2,'0')}</span><strong>{entry.nickname}{!!entry.is_self&&<small> 나</small>}</strong><b>{entry.best_wave}<small> 웨이브</small></b></li>)}</ol>}<p className="rr-note">닉네임을 설정한 플레이어가 표시됩니다. 이전 도전은 저장에 남아 있는 완료 기록부터 반영됩니다.</p></section></div>
 </section>;
}
