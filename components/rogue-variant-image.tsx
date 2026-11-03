'use client';
import {useEffect,useState} from 'react';
import PokemonImage from './pokemon-image';
import type {StarterEntry} from './rogue-starter-logic';

const root='https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/fb8ccb6d0703ffe48cdf80a8102d5ed943c82dba/images/pokemon';
const cache=new Map<string,Promise<string|null>>();
async function json<T>(url:string):Promise<T>{const response=await fetch(url);if(!response.ok)throw Error('asset unavailable');return await response.json() as T;}
type Frame={filename:string;rotated:boolean;frame:{x:number;y:number;w:number;h:number};sourceSize:{w:number;h:number};spriteSourceSize:{x:number;y:number}};
async function variantImage(species:number,variant:number):Promise<string|null>{
 const key=`${species}:${variant}`,existing=cache.get(key);if(existing)return existing;
 const task=(async()=>{try{
  const master=await json<Record<string,number[]>>(`${root}/variant/_masterlist.json`);
  const kind=master[String(species)]?.[variant];if(kind!==1&&kind!==2)return null;
  const base=kind===2?`${root}/variant/${species}_${variant+1}`:`${root}/${species}`;
  const [atlas,palette]=await Promise.all([json<{textures:{frames:Frame[]}[]}>(`${base}.json`),kind===1?json<Record<string,Record<string,string>>>(`${root}/variant/${species}.json`):Promise.resolve(null)]);
  const frame:Frame|undefined=atlas.textures?.[0]?.frames?.find((f:Frame)=>f.filename==='0001.png');if(!frame||frame.rotated)return null;
  const image=new Image();image.crossOrigin='anonymous';image.src=`${base}.png`;await image.decode();
  const canvas=document.createElement('canvas');canvas.width=frame.sourceSize.w;canvas.height=frame.sourceSize.h;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return null;const f=frame.frame,o=frame.spriteSourceSize;ctx.drawImage(image,f.x,f.y,f.w,f.h,o.x,o.y,f.w,f.h);
  if(palette){const map=palette[String(variant)];if(!map)return null;const data=ctx.getImageData(0,0,canvas.width,canvas.height),p=data.data;for(let i=0;i<p.length;i+=4){if(!p[i+3])continue;const rgb=[p[i],p[i+1],p[i+2]].map(n=>n.toString(16).padStart(2,'0')).join(''),replace=map[rgb];if(replace){p[i]=parseInt(replace.slice(0,2),16);p[i+1]=parseInt(replace.slice(2,4),16);p[i+2]=parseInt(replace.slice(4,6),16);}}ctx.putImageData(data,0,0);}
  return canvas.toDataURL('image/png');
 }catch{return null;}})();cache.set(key,task);return task;
}
export default function RogueVariantImage({entry,shiny,variant}:{entry:StarterEntry;shiny:boolean;variant?:number}){
 const [src,setSrc]=useState<string|null>(null),[failed,setFailed]=useState(false);
 useEffect(()=>{let live=true;setSrc(null);setFailed(false);if(shiny&&variant&&(entry.formIndex??0)===0)variantImage(entry.sourceId??entry.speciesId,variant).then(value=>{if(live){setSrc(value);setFailed(!value);}});else if(shiny&&variant)setFailed(true);return()=>{live=false;};},[entry.sourceId,entry.formIndex,shiny,variant]);
 return <>{src&&shiny&&variant?<img src={src} alt={`${entry.name} 이로치 변종`} style={{imageRendering:'pixelated',objectFit:'contain'}}/>:<PokemonImage mon={{...entry,shiny}} variant="battle" eager/>}{failed&&<span className="rss-variant-unavailable" role="status">변종 이미지 준비 중</span>}</>;
}
