'use client';
import {useState} from 'react';
import PokemonImage from '@/components/pokemon-image';

/** The server already committed the change; confirming here only dismisses it. */
export default function AdventureEvolutionResult({result,onClose}:{result:{before:any;after:any};onClose:()=>void}){
 const [skip,setSkip]=useState(false),{before,after}=result;
 return <section className="adv-evolution-result" data-motion-skipped={skip||undefined} aria-label="진화 결과">
  <div className="adv-evolution-art" aria-hidden="true"><PokemonImage className="adv-evolve-before" mon={before} alt=""/><span>→</span><PokemonImage className="adv-evolve-after" mon={after} alt=""/></div>
  <p role="status">축하합니다! {before.name}이(가) {after.name}(으)로 진화했다!</p>
  <div className="adv-evolution-actions"><button type="button" className="primary" onClick={onClose}>확인</button>{!skip&&<button type="button" onClick={()=>setSkip(true)}>연출 건너뛰기</button>}</div>
 </section>;
}
