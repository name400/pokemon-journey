'use client';
import {useEffect,useState} from 'react';
import PokemonImage from './pokemon-image';
import './evolution-presentation.css';

/** Visualizes an already committed result; no game actions occur here. */
export default function EvolutionPresentation({before,after,beforeName,afterName,onClose}:{before:any;after:any;beforeName:string;afterName:string;onClose:()=>void}){
 const [phase,setPhase]=useState<'intro'|'changing'|'result'>('intro');
 useEffect(()=>{
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(motion.matches){setPhase('result');return;}
  const start=window.setTimeout(()=>setPhase(current=>current==='result'?current:'changing'),1800);
  const finish=window.setTimeout(()=>setPhase('result'),9500);
  const reduce=()=>{if(motion.matches){clearTimeout(start);clearTimeout(finish);setPhase('result');}};
  motion.addEventListener('change',reduce);
  return()=>{clearTimeout(start);clearTimeout(finish);motion.removeEventListener('change',reduce);};
 },[]);
 return <section className="evolution-presentation" data-phase={phase} aria-label="진화 결과">
  <div className="evolution-presentation-stage">
   <div className="evolution-presentation-shade"/><span className="evolution-presentation-rays"/><span className="evolution-presentation-orbit"/><span className="evolution-presentation-light"/>
   <PokemonImage className="evolution-presentation-before" mon={before} alt="" eager/>
   <PokemonImage className="evolution-presentation-after" mon={after} alt="" eager/>
   <span className="evolution-presentation-sparks">✦ · ✧ · ✦</span>
   <div className="evolution-presentation-message" role="status" aria-live="polite">{phase==='intro'?<>어라?<br/>{beforeName}의 모습이…</>:phase==='result'?<>축하합니다!<br/>{beforeName}이(가) {afterName}(으)로 진화했다!</>:null}</div>
  </div>
  <div className="evolution-presentation-actions"><button type="button" onClick={onClose}>확인</button>{phase!=='result'&&<button type="button" onClick={()=>setPhase('result')}>연출 건너뛰기</button>}</div>
 </section>;
}
