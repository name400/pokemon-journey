'use client';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {createPortal} from 'react-dom';
import {dialoguePosition} from '@/lib/rogue-dialogue-pages.mjs';
import '@/app/rogue-npc-dialogue.css';
const subscribePortal=()=>()=>{};
const portalSnapshot=()=>document.body;
const serverPortalSnapshot=()=>null;
type Dialogue={id:string;speaker?:string;portrait?:string;pages:string[];index:number;segmentIndex?:number;segmentRule?:string;pageMode?:string};
export default function NpcDialogue({dialogue,busy,onNext,onSkip}:{dialogue:Dialogue;busy:boolean;onNext:()=>void;onSkip:()=>void}){
 const next=useRef<HTMLButtonElement>(null),container=useRef<HTMLElement>(null),[bottom,setBottom]=useState(14);
 const portalRoot=useSyncExternalStore(subscribePortal,portalSnapshot,serverPortalSnapshot);
 const pagination=dialoguePosition(dialogue);
 useEffect(()=>{
  if(!portalRoot)return;
  const position=()=>{
   const scene=document.querySelector('.battle-screen')?.getBoundingClientRect(),menu=document.querySelector('.sidebar')?.getBoundingClientRect(),panelHeight=container.current?.getBoundingClientRect().height||180,maxBottom=Math.max(14,window.innerHeight-panelHeight-8);
   const sceneBottom=scene&&scene.bottom>0&&scene.top<window.innerHeight?window.innerHeight-Math.min(window.innerHeight,scene.bottom)+12:14;
   const menuBottom=menu&&menu.bottom>=window.innerHeight-1&&menu.top>=window.innerHeight/2&&menu.width>=window.innerWidth/2?window.innerHeight-menu.top+12:14;
   setBottom(Math.max(14,Math.min(maxBottom,Math.max(sceneBottom,menuBottom))));
  };
  position();const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(position);
  if(container.current)observer?.observe(container.current);const scene=document.querySelector('.battle-screen'),menu=document.querySelector('.sidebar');if(scene)observer?.observe(scene);if(menu)observer?.observe(menu);
  window.addEventListener('resize',position);window.addEventListener('scroll',position,true);
  return()=>{observer?.disconnect();window.removeEventListener('resize',position);window.removeEventListener('scroll',position,true);};
 },[portalRoot,dialogue.id,dialogue.index]);
 useEffect(()=>{
  if(!portalRoot)return;
  next.current?.focus();const key=(event:KeyboardEvent)=>{
   if(event.key==='Escape'&&!busy){event.preventDefault();onSkip();}
   else if(event.key==='Tab'){
    const buttons=[...(container.current?.querySelectorAll<HTMLElement>('button:not(:disabled),[tabindex="0"]')||[])];
    if(!buttons.length){event.preventDefault();return;}const first=buttons[0],last=buttons[buttons.length-1];
    if(event.shiftKey&&(document.activeElement===first||!container.current?.contains(document.activeElement))){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&(document.activeElement===last||!container.current?.contains(document.activeElement))){event.preventDefault();first.focus();}
   }
  };
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 },[portalRoot,dialogue.id,dialogue.index,dialogue.segmentIndex,busy,onSkip]);
 return portalRoot?createPortal(<div className="rc-npc-dialogue-backdrop" style={{paddingBottom:`max(${bottom}px, env(safe-area-inset-bottom))`}}>
  <section ref={container} className={'rc-npc-dialogue'+(!dialogue.speaker?' is-narration':'')} role="dialog" aria-modal="true" aria-label={dialogue.speaker?dialogue.speaker+'의 대화':'대화'}>
   {!!dialogue.speaker&&<div className="rc-npc-dialogue-portrait" aria-hidden="true"><img src={dialogue.portrait||'/game/trainers/fallback.svg'} alt="" onError={event=>{event.currentTarget.onerror=null;event.currentTarget.src='/game/trainers/fallback.svg';}}/></div>}
   <div className="rc-npc-dialogue-content">
    <div className="rc-npc-dialogue-header">{dialogue.speaker?<div className="rc-npc-dialogue-name">{dialogue.speaker}</div>:<span className="rc-npc-dialogue-narrator">이야기</span>}{pagination.total>1&&<span className="rc-npc-dialogue-page" aria-label={`대화 ${pagination.current} / ${pagination.total}`}>{pagination.current}<span aria-hidden="true"> / </span>{pagination.total}</span>}</div>
    <p className="rc-npc-dialogue-text" aria-live="polite" tabIndex={0}>{pagination.text}</p>
    <div className="rc-npc-dialogue-actions"><button className="rc-npc-dialogue-skip" type="button" disabled={busy} onClick={onSkip}>건너뛰기</button><button className="rc-npc-dialogue-next" ref={next} type="button" disabled={busy} onClick={onNext} aria-label={pagination.hasNext?'다음 문장':'대화 확인'}><span aria-hidden="true">▼</span></button></div>
   </div>
  </section>
 </div>,portalRoot):null;
}
