'use client';
import {useState,type ComponentProps} from 'react';
import PokemonImage from './pokemon-image';
import {classicDisplayPokemonName} from '@/lib/rogue-display-name.mjs';

type Mon=NonNullable<ComponentProps<typeof PokemonImage>['mon']>;
type Result={before:Mon;after:Mon;displayBefore?:Mon;displayAfter?:Mon};
export default function RogueEvolutionResult({result,onClose}:{result:Result;onClose:()=>void}){
 const [skip,setSkip]=useState(false),before=result.displayBefore||result.before,after=result.displayAfter||result.after;
 return <section className="rc-evolution-result" data-motion-skipped={skip||undefined} aria-label="진화 결과">
  <div className="rc-evolution-art" aria-hidden="true"><span className="rc-evolution-ring"/><PokemonImage className="rc-evolve-before" mon={before} alt=""/><span className="rc-evolution-arrow">→</span><PokemonImage className="rc-evolve-after" mon={after} alt=""/><span className="rc-evolution-sparks">✦　✧　✦</span></div>
  <div className="rc-evolution-copy"><small>EVOLUTION</small><b role="status">{classicDisplayPokemonName(before)}이(가) {classicDisplayPokemonName(after)}(으)로 진화했다!</b><div className="rc-decision-buttons"><button type="button" className="rogue-button rogue-button-small" onClick={onClose}>확인</button>{!skip&&<button type="button" className="rogue-button rogue-button-small rc-evolution-skip" onClick={()=>setSkip(true)}>연출 건너뛰기</button>}</div></div>
 </section>;
}
