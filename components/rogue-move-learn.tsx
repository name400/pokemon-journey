'use client';

import {useEffect, useRef, useState, type KeyboardEvent} from 'react';
import {ArrowDown, ArrowRight, Check, ChevronRight, LoaderCircle, Sparkles, X} from 'lucide-react';
import PokemonImage from './pokemon-image';
import './rogue-move-learn.css';

export type MoveInfo = {
  id: string;
  name: string;
  type: string;
  typeKey: string;
  category: string;
  power: number | null;
  accuracy: number | boolean | null;
  pp: number;
  maxPp: number;
  description: string;
  priority: number;
  targetLabel: string;
};
export type MoveLearnMon = {
  id: number | string;
  boxId?: string;
  artId?: number | string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  shiny?: boolean;
  moves: string[];
  sourceImage?: string | null;
  sourceBackImage?: string | null;
  sourceShinyImage?: string | null;
};
export type RogueMoveLearnProps = {
  mon: MoveLearnMon;
  currentMoves: MoveInfo[];
  newMove: MoveInfo;
  busy: boolean;
  error?: string;
  onLearn: (slot: number | null) => Promise<unknown> | void;
};
const categoryName = (category: string) => ({physical:'물리',special:'특수',status:'변화'} as Record<string,string>)[category.toLowerCase()] || category;
export function moveLearnFacts(move: MoveInfo) {
  return {
    power: move.category.toLowerCase() === 'status' ? '—' : move.power === 0 ? '변동' : move.power ?? '—',
    accuracy: move.accuracy === true ? '판정 없음' : typeof move.accuracy === 'number' ? `${move.accuracy}%` : '—',
    category: categoryName(move.category),
  };
}

export default function RogueMoveLearn(props: RogueMoveLearnProps) {
  const key = `${props.mon.boxId || props.mon.id}:${props.mon.level}:${props.newMove.id}:${props.currentMoves.map(move => move.id).join('|')}`;
  return <MoveLearnScreen key={key} {...props}/>;
}

function MoveLearnScreen({mon, currentMoves, newMove, busy, error, onLearn}: RogueMoveLearnProps) {
  const [slot, setSlot] = useState<number | undefined>();
  const [pending, setPending] = useState<'learn' | 'skip' | null>(null);
  const [localError, setLocalError] = useState('');
  const lock = useRef(false), mounted = useRef(true), root = useRef<HTMLElement>(null);
  const locked = busy || !!pending;
  const known = currentMoves.some(move => move.id === newMove.id);
  const selected = slot === undefined ? undefined : currentMoves[slot];
  const newFacts = moveLearnFacts(newMove);
  const selectedFacts = selected ? moveLearnFacts(selected) : null;

  useEffect(() => {
    mounted.current = true;
    if (document.activeElement === document.body || root.current?.contains(document.activeElement)) root.current?.querySelector<HTMLButtonElement>('[data-move-slot="0"]')?.focus({preventScroll:true});
    return () => { mounted.current = false; };
  }, []);

  function choose(index: number) { if (!locked) {setSlot(index); setLocalError('');} }
  async function submit(chosen: number | null) {
    if (lock.current || locked || chosen !== null && (known || !Number.isInteger(chosen) || chosen < 0 || chosen > 3)) return;
    lock.current = true; setPending(chosen === null ? 'skip' : 'learn'); setLocalError('');
    try { await onLearn(chosen); }
    catch (cause) { if (mounted.current) setLocalError(cause instanceof Error ? cause.message : '기술 선택을 완료하지 못했습니다. 다시 시도해 주세요.'); }
    finally {lock.current = false; if (mounted.current) setPending(null);}
  }
  function keyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || locked || (event.target as HTMLElement).matches('input,select,textarea')) return;
    if (/^[1-4]$/.test(event.key)) {
      event.preventDefault(); event.stopPropagation(); const index = Number(event.key) - 1; choose(index);
      root.current?.querySelector<HTMLButtonElement>(`[data-move-slot="${index}"]`)?.focus(); return;
    }
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); void submit(null); return; }
    if (event.key === 'Enter' && (event.target as HTMLElement).hasAttribute('data-move-slot')) {const focused = Number((event.target as HTMLElement).dataset.moveSlot); event.preventDefault(); event.stopPropagation(); if(slot === focused) void submit(focused); else choose(focused); return;}
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key) && (event.target as HTMLElement).hasAttribute('data-move-slot')) {
      const current = Number((event.target as HTMLElement).dataset.moveSlot), next = (current + ({ArrowLeft:-1,ArrowRight:1,ArrowUp:-2,ArrowDown:2}[event.key] || 0) + 4) % 4;
      event.preventDefault(); event.stopPropagation(); root.current?.querySelector<HTMLButtonElement>(`[data-move-slot="${next}"]`)?.focus();
    }
  }

  return <section className="rogue-move-learn" ref={root} aria-label={`${mon.name}의 새 기술 학습`} aria-busy={locked} onKeyDown={keyboard}>
    <header className="rml-header"><span className="rml-header-mark"><Sparkles size={22} aria-hidden="true"/></span><div><span className="rml-eyebrow">A NEW MOVE / PARTNER GROWTH</span><h2>새로운 기술을 배울 시간.</h2></div><span className="rml-level">Lv.<b>{mon.level}</b></span></header>
    <div className="rml-spotlight"><div className="rml-partner"><div className="rml-sprite-stage"><span className="rml-sprite-ring" aria-hidden="true"/><PokemonImage mon={mon} variant="battle" eager/></div><div><span className="rml-eyebrow">YOUR PARTNER</span><h3>{mon.name}{mon.shiny && <Sparkles size={16} aria-label="색이 다른 모습"/>}</h3><p>HP {mon.hp} / {mon.maxHp}</p></div></div><div className="rml-new-move" data-type={newMove.typeKey}><div className="rml-new-heading"><span className="rml-new-label"><Sparkles size={14} aria-hidden="true"/>새로 배울 기술</span><span className="rml-type">{newMove.type}</span></div><h3>{newMove.name}</h3><div className="rml-move-facts"><span><small>분류</small><b>{newFacts.category}</b></span><span><small>위력</small><b>{newFacts.power}</b></span><span><small>명중</small><b>{newFacts.accuracy}</b></span><span><small>PP</small><b>{newMove.maxPp}</b></span></div><p className="rml-description">{newMove.description || '기술의 위력, 명중, 대상 정보를 확인하고 배울 자리를 선택하세요.'}</p><div className="rml-extra-facts">{newMove.targetLabel && <span>대상 · {newMove.targetLabel}</span>}<span>우선도 {newMove.priority > 0 ? '+' : ''}{newMove.priority}</span></div></div></div>

    <div className="rml-slot-section"><div className="rml-section-heading"><div><h3>어느 자리에 배울까요?</h3><p>기존 기술을 교체하거나 빈 자리를 선택하세요.</p></div><span>기술 {Math.min(4,currentMoves.length)} / 4</span></div><div className="rml-slots" aria-label="배울 기술 자리 선택">{[0,1,2,3].map(index => {
      const move = currentMoves[index], facts = move ? moveLearnFacts(move) : null, isSelected = slot === index;
      return <button key={index} className={`rml-slot ${isSelected ? 'is-selected' : ''} ${!move ? 'is-empty' : ''}`} data-type={move?.typeKey} data-move-slot={index} aria-pressed={isSelected} disabled={locked} onClick={() => choose(index)} aria-label={`${index + 1}번 ${move?.name || mon.moves[index] || '빈 자리'}${isSelected ? ', 선택됨' : ', 이 자리에 배우기'}`}><span className="rml-slot-number">0{index + 1}</span><span className="rml-slot-copy"><b>{move?.name || mon.moves[index] || '빈 자리'}</b>{move && facts ? <><span className="rml-slot-info"><span className="rml-slot-type">{move.type}</span><span>{facts.category}</span><span>PP {move.pp} / {move.maxPp}</span></span><span className="rml-slot-stats">위력 {facts.power}<i/>명중 {facts.accuracy}</span></> : <span className="rml-empty-note">{mon.moves[index] ? '이 자리에 새 기술을 배웁니다.' : '기존 기술을 지우지 않고 배웁니다.'}</span>}</span><span className="rml-slot-check" aria-hidden="true">{isSelected ? <Check size={18}/> : <ChevronRight size={18}/>}</span></button>;
    })}</div></div>

    <div className={`rml-decision ${slot !== undefined ? 'has-choice' : ''}`}>
      {slot !== undefined ? <div className="rml-comparison" key={slot}><div className="rml-swap-summary"><span>{slot + 1}번 자리</span><b>{selected?.name || mon.moves[slot] || '빈 자리'}</b><ArrowRight size={19} aria-hidden="true"/><strong>{newMove.name}</strong></div>{selectedFacts && <div className="rml-compare-values"><span>위력 <b>{selectedFacts.power}</b><ArrowRight size={12} aria-hidden="true"/><strong>{newFacts.power}</strong></span><span>명중 <b>{selectedFacts.accuracy}</b><ArrowRight size={12} aria-hidden="true"/><strong>{newFacts.accuracy}</strong></span><span>최대 PP <b>{selected?.maxPp ?? '—'}</b><ArrowRight size={12} aria-hidden="true"/><strong>{newMove.maxPp}</strong></span></div>}</div> : <div className="rml-choose-prompt"><ArrowDown size={20} aria-hidden="true"/><span>{known ? '이미 알고 있는 기술입니다.' : '기술을 배울 자리를 먼저 선택하세요.'}</span></div>}
      {(error || localError) && <p className="rml-error" role="alert">{error || localError}</p>}
      <div className="rml-actions"><button className="rml-skip" disabled={locked} onClick={() => void submit(null)}>{pending === 'skip' ? <LoaderCircle className="rml-spin" size={17} aria-hidden="true"/> : <X size={17} aria-hidden="true"/>}배우지 않고 계속</button><button className="rml-confirm" disabled={locked || slot === undefined || known} onClick={() => {if(slot !== undefined) void submit(slot);}}>{pending === 'learn' ? <LoaderCircle className="rml-spin" size={19} aria-hidden="true"/> : <Check size={19} aria-hidden="true"/>}{pending === 'learn' ? '기술을 배우는 중…' : `${newMove.name} 배우기`}<ArrowRight size={19} aria-hidden="true"/></button></div>
    </div>
    <p className="rml-key-help">1–4: 자리 선택 · Enter: 배우기 · Esc: 배우지 않고 계속</p>
  </section>;
}
