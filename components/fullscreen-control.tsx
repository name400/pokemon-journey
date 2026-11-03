'use client';

import {useEffect,useRef,useState} from 'react';
import {Maximize2,Minimize2} from 'lucide-react';

type FullscreenDoc = Document & {
  webkitFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => Promise<void> | void;
};
type FullscreenRoot = HTMLElement & {webkitRequestFullscreen?: () => Promise<void> | void};
const fitClass='poke-viewport-fit';

export default function FullscreenControl(){
  const [nativeFull,setNativeFull]=useState(false),[fit,setFit]=useState(false),[supported,setSupported]=useState<boolean|null>(null),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
  const lock=useRef(false);
  useEffect(()=>{
    const doc=document as FullscreenDoc,root=document.documentElement as FullscreenRoot;
    const update=()=>setNativeFull(!!(doc.fullscreenElement||doc.webkitFullscreenElement));
    const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape'&&root.classList.contains(fitClass)){root.classList.remove(fitClass);setFit(false);}};
    setSupported(!!((doc.fullscreenEnabled!==false&&root.requestFullscreen)||(doc.webkitFullscreenEnabled!==false&&root.webkitRequestFullscreen)));
    setFit(root.classList.contains(fitClass));update();
    document.addEventListener('fullscreenchange',update);document.addEventListener('webkitfullscreenchange',update);document.addEventListener('keydown',onKey);
    return()=>{document.removeEventListener('fullscreenchange',update);document.removeEventListener('webkitfullscreenchange',update);document.removeEventListener('keydown',onKey);root.classList.remove(fitClass);};
  },[]);
  useEffect(()=>{if(!notice)return;const timer=window.setTimeout(()=>setNotice(''),4500);return()=>window.clearTimeout(timer);},[notice]);
  function fitViewport(root:FullscreenRoot){root.classList.add(fitClass);setFit(true);setNotice('이 기기에서는 브라우저 영역을 채워 보여줍니다.');}
  async function toggle(){
    if(lock.current)return;lock.current=true;setBusy(true);setNotice('');
    const doc=document as FullscreenDoc,root=document.documentElement as FullscreenRoot;
    try{
      if(root.classList.contains(fitClass)){root.classList.remove(fitClass);setFit(false);return;}
      if(doc.fullscreenElement||doc.webkitFullscreenElement){if(doc.exitFullscreen)await doc.exitFullscreen();else await doc.webkitExitFullscreen?.();return;}
      if(supported===false){fitViewport(root);return;}
      try{
        if(typeof root.requestFullscreen==='function'&&doc.fullscreenEnabled!==false)await root.requestFullscreen();
        else if(typeof root.webkitRequestFullscreen==='function'&&doc.webkitFullscreenEnabled!==false)await root.webkitRequestFullscreen();
        else fitViewport(root);
      }catch{fitViewport(root);}
    }catch{setNotice('화면 크기를 바꾸지 못했습니다. 다시 시도해 주세요.');}
    finally{lock.current=false;setBusy(false);}
  }
  const active=nativeFull||fit,label=fit?'화면 채우기 종료':nativeFull?'전체화면 종료':supported===false?'화면 채우기':'전체화면';
  return <div className="fullscreen-control"><button type="button" className="fullscreen-toggle" onClick={()=>void toggle()} disabled={busy} aria-pressed={active} aria-label={label} title={supported===false&&!active?'브라우저 영역 채우기':label}>{active?<Minimize2 size={18} aria-hidden="true"/>:<Maximize2 size={18} aria-hidden="true"/>}<span>{label}</span></button><span className="fullscreen-notice" role="status" aria-live="polite">{notice}</span></div>;
}
