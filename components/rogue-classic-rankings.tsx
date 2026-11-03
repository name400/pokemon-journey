'use client';
import {useEffect,useState} from 'react';
type Row={rank:number;nickname:string;wave:number;isSelf:boolean};
export default function RogueClassicRankings({personalBest}:{personalBest:number|null}){
 const [rows,setRows]=useState<Row[]|null>(null),[error,setError]=useState('');
 useEffect(()=>{const controller=new AbortController();void fetch('/api/rogue-classic/leaderboard',{cache:'no-store',signal:controller.signal}).then(async response=>{const data=await response.json() as {items?:Row[];error?:string};if(!response.ok)throw Error(data.error||'랭킹을 불러오지 못했습니다.');setRows(data.items||[]);}).catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:'랭킹을 불러오지 못했습니다.');});return()=>controller.abort();},[]);
 return <section className="rc-rankings"><div className="rc-heading"><span className="rogue-eyebrow">CLASSIC RECORDS</span><h2>도전 기록</h2><p>개인 최고 도달: {personalBest==null?'기록 없음':`${personalBest} 웨이브`}</p><p>개인 기록은 저장된 슬롯과 최근 도전 기록 기준입니다. 글로벌 순위는 새로 시작한 서버 기록 중 관리자 지급·수정이 확인된 도전을 제외한 기록의 최고 클리어 웨이브를 표시합니다.</p></div><h3>글로벌 랭킹</h3>{error?<p role="alert">{error}</p>:rows===null?<p role="status">랭킹을 불러오는 중…</p>:rows.length===0?<p>아직 등록된 클리어 기록이 없습니다.</p>:<ol className="rc-ranking-list">{rows.map((row,index)=><li key={`${row.rank}:${index}`}><b>{row.rank}위</b><span>{row.nickname}{row.isSelf?' · 나':''}</span><strong>{row.wave} 웨이브 클리어</strong></li>)}</ol>}</section>;
}
