'use client';
import {Fragment,useEffect,useRef,useState} from 'react';
import {useIvScannerSetting} from './rogue-iv-scanner-settings';
const labels:Record<string,string>={hp:'HP',atk:'공격',def:'방어',spa:'특공',spd:'특방',spe:'스피드'};
type Reading={boxId:string;name:string;stats:{stat:string;value:number;improved:boolean;perfect:boolean}[]};
const descriptor=(value:number)=>value===31?'최고':value===30?'훌륭함':value>20?'매우 좋음':value>10?'꽤 좋음':value>0?'그럭저럭':'별로';
export default function RogueIvScanner({readings,paused=false}:{readings?:Reading[];paused?:boolean}){
 const setting=useIvScannerSetting();
 const seen=useRef(new Set<string>()),dialog=useRef<HTMLDialogElement>(null),[queue,setQueue]=useState<Reading[]>([]),[showValues,setShowValues]=useState(false);
 useEffect(()=>{if(!setting.ready||paused||!readings?.length)return;const fresh=readings.filter(mon=>!seen.current.has(mon.boxId));if(!fresh.length)return;for(const mon of fresh)seen.current.add(mon.boxId);if(!setting.hidden)setQueue(previous=>[...previous,...fresh]);},[readings,paused,setting.ready,setting.hidden]);
 useEffect(()=>{if(setting.ready&&setting.hidden){setQueue([]);setShowValues(false);}},[setting.ready,setting.hidden]);
 useEffect(()=>{const node=dialog.current;if(queue.length&&!paused&&node&&!node.open)node.showModal();else if((!queue.length||paused)&&node?.open)node.close();},[queue,paused]);
 useEffect(()=>{if(queue.length&&!paused)dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();},[queue,paused,showValues]);
 function next(){setShowValues(false);setQueue(previous=>previous.slice(1));}
 if(!readings?.length&&!queue.length)return null;
 const current=queue[0];
 return <><div className="bs-iv-scanner" aria-label="IV 스캐너 기록 비교"><label className="bs-iv-setting"><input type="checkbox" checked={setting.hidden} disabled={!setting.ready} onChange={e=>setting.setHide(e.target.checked)}/>팝업 숨기기</label>{(readings||[]).map(mon=><p key={mon.boxId}><b>{mon.name}</b> · {mon.stats.map((stat,index)=><Fragment key={stat.stat}>{index>0?' · ':''}<span className={stat.perfect?'is-perfect':stat.improved?'is-improved':undefined}>{labels[stat.stat]}{stat.perfect?' ★':stat.improved?' ↑':''}</span></Fragment>)}</p>)}</div><dialog ref={dialog} className="bs-iv-dialog" aria-labelledby="iv-scanner-title" onCancel={event=>{event.preventDefault();next();}}>{current&&(showValues?<><h2 id="iv-scanner-title">{current.name}의 개체값</h2><dl>{current.stats.map(stat=><div key={stat.stat} className={stat.perfect?'is-perfect':stat.improved?'is-improved':undefined}><dt>{labels[stat.stat]}</dt><dd>{descriptor(stat.value)}{stat.perfect?' ★':stat.improved?' ↑':''}</dd></div>)}</dl><div className="bs-iv-actions"><button type="button" autoFocus onClick={next}>계속</button></div></>:<><h2 id="iv-scanner-title">IV 스캐너</h2><p>{current.name}의 개체값을 확인할까요?</p><div className="bs-iv-actions"><button type="button" autoFocus onClick={()=>setShowValues(true)}>예</button><button type="button" onClick={next}>아니요</button></div></>)}</dialog></>;
}
