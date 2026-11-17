'use client';
import {useEffect,useRef,useState} from 'react';

/** v60: keep the verified alpha mask fixed while the rainbow moves. */
export default function MegaToggleMark({selected}:{selected:boolean}){
 const canvas=useRef<HTMLCanvasElement>(null),state=useRef({selected,flash:0}),[ready,setReady]=useState(false);
 useEffect(()=>{if(selected&&!state.current.selected)state.current.flash=performance.now();state.current.selected=selected;},[selected]);
 useEffect(()=>{
  const node=canvas.current,ctx=node?.getContext('2d');if(!node||!ctx)return;
  let frame=0,cancelled=false,shown=false;const start=performance.now(),image=new Image(),motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  image.onload=()=>{
   if(cancelled)return;
   const mask=document.createElement('canvas');mask.width=52;mask.height=63;const m=mask.getContext('2d');if(!m)return;
   m.drawImage(image,0,0,52,63);const alpha=m.getImageData(0,0,52,63).data,out=ctx.createImageData(52,63);
   const draw=(now:number)=>{
    const seconds=motion.matches?0:(now-start)/1000,extra=state.current.selected?70+180*Math.max(0,1-(now-state.current.flash)/220):0;
    for(let y=0;y<63;y++){const p=y/63-seconds/2.5,theta=2*Math.PI*p;
     const rgb=[128+127*Math.cos(theta),128+127*Math.cos(theta-2*Math.PI/3),128+127*Math.cos(theta+2*Math.PI/3)];
     for(let x=0;x<52;x++){const i=(y*52+x)*4;out.data[i]=Math.min(255,rgb[0]+extra);out.data[i+1]=Math.min(255,rgb[1]+extra);out.data[i+2]=Math.min(255,rgb[2]+extra);out.data[i+3]=alpha[i+3];}
    }
    ctx.putImageData(out,0,0);if(!shown){shown=true;setReady(true);}frame=requestAnimationFrame(draw);
   };frame=requestAnimationFrame(draw);
  };
  image.src='/game/v60/mega-emblem-transparent.png';
  return()=>{cancelled=true;cancelAnimationFrame(frame);};
 },[]);
 return <span className="bs-v60-mark" aria-hidden="true"><img src="/game/v60/mega-emblem-transparent.png" alt="" style={{visibility:ready?'hidden':'visible'}}/><canvas ref={canvas} width={52} height={63}/></span>;
}
