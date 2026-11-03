'use client';
import {useEffect,useRef,useState} from 'react';

export default function AdventureStoryScene({revision,events}:{revision:number;events:any[]}){
 const last=useRef(revision),dialog=useRef<HTMLDialogElement>(null),[scene,setScene]=useState<any>(null);
 useEffect(()=>{if(revision<=last.current)return;last.current=revision;const event=events?.find(e=>['cityRank','cityIncident','cityWish','cityMegaGift','cityFinale'].includes(e.kind));if(event)setScene(event);},[revision,events]);
 useEffect(()=>{const el=dialog.current;if(!scene||!el)return;el.showModal();return()=>{if(el.open)el.close();};},[scene]);
 if(!scene)return null;
 const title=scene.kind==='cityRank'?`${scene.rank} 랭크로 승급!`:scene.kind==='cityIncident'?'포켓몬이 진정되었다!':scene.kind==='cityMegaGift'?'메가스톤을 받았다!':scene.kind==='cityFinale'?'도시의 균형을 지켰다!':'A 랭크 선물을 받았다!';
 const description=scene.kind==='cityRank'?'새로운 상대와 이야기가 기다립니다.':scene.kind==='cityIncident'?`${scene.name}을(를) 진정시켰습니다. 조사단 동료에게 소식을 전하세요.`:scene.kind==='cityMegaGift'?'파트너의 최종 진화형에게 지니게 한 뒤 배틀에서 직접 메가진화를 선택하세요.':scene.kind==='cityFinale'?'조사단과 포켓몬들이 함께 도시의 미래를 이어갑니다.':'선택한 선물을 가방과 여행 기록에서 확인하세요.';
 return <dialog ref={dialog} className="adv-story-scene" aria-labelledby="adv-story-scene-title" onCancel={()=>setScene(null)}><div className="adv-story-spark" aria-hidden="true">✦</div><p>POKÉMON JOURNEY</p><h2 id="adv-story-scene-title">{title}</h2><p>{description}</p><button autoFocus onClick={()=>setScene(null)}>계속하기</button></dialog>;
}
