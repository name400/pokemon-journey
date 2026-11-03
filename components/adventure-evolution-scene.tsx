'use client';
import {useEffect,useRef} from 'react';
import PokemonImage from './pokemon-image';

export default function AdventureEvolutionScene({before,after,close}:{before:any;after:any;close:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const el=ref.current;el?.showModal();return()=>{if(el?.open)el.close();};},[]);
 return <dialog ref={ref} className="adv-evolution-scene" aria-labelledby="adv-evolution-title" onCancel={close}>
  <div className="adv-evolution-stars" aria-hidden="true"><i/><i/><i/><i/></div>
  <p className="adv-evolution-kicker">파트너의 새로운 모습</p>
  <div className="adv-evolution-stage" aria-hidden="true"><span className="adv-evolution-ring"/><PokemonImage mon={before} variant="sprite" className="adv-evolution-before" alt="" eager/><PokemonImage mon={after} variant="sprite" className="adv-evolution-after" alt="" eager/></div>
  <h2 id="adv-evolution-title">{before.name} → {after.name}</h2>
  <p>축하합니다! {after.name} 진화에 성공했어요!</p>
  <button autoFocus onClick={close}>함께 모험 계속하기</button>
 </dialog>;
}
