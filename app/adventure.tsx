'use client';
import {lazy,Suspense,useEffect,useState} from 'react';
const Local=lazy(()=>import('./adventure-local'));
const Cloud=lazy(()=>import('@/components/cloud-adventure/entry'));
export default function Adventure(){const [engine,setEngine]=useState<string|null>(null),[error,setError]=useState('');useEffect(()=>{const controller=new AbortController();fetch('/api/world?engineOnly=1',{cache:'no-store',signal:controller.signal}).then(async r=>{const d:any=await r.json();if(!r.ok)throw Error(d.error||'탐험을 불러오지 못했습니다.');setEngine(d.engine);}).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>controller.abort();},[]);if(error)return <p role="alert">{error}</p>;return <Suspense fallback={<p role="status">탐험을 불러오고 있습니다…</p>}>{engine==='cloud'?<div className="cloud-adventure-view"><Cloud/></div>:engine==='local'?<Local/>:<p role="status">저장된 탐험을 확인하고 있습니다…</p>}</Suspense>;}
