'use client';

import {useEffect, useRef, useState} from 'react';
import {ArrowRight, Check, ChevronRight, Coins, Flag, LoaderCircle, Package, Trophy, Users} from 'lucide-react';
import PokemonImage from './pokemon-image';
import type {MoveLearnMon} from './rogue-move-learn';
import './rogue-wave-clear.css';

export type RogueWaveClearProps = {
  wave: number;
  party: MoveLearnMon[];
  money: number;
  interlude: boolean;
  rewardName?: string;
  busy: boolean;
  onContinue: () => Promise<unknown> | void;
  onParty: () => Promise<unknown> | void;
};
export function waveClearRoute(wave: number) {
  const complete = wave >= 200;
  const next = Math.min(200,wave + 1), boundary = Math.min(200,Math.ceil(next / 10) * 10);
  return {complete, next, boundary};
}
export default function RogueWaveClear(props: RogueWaveClearProps) {
  return <WaveClearScreen key={`${props.wave}:${props.interlude}`} {...props}/>;
}
function WaveClearScreen({wave,party,money,interlude,rewardName,busy,onContinue,onParty}: RogueWaveClearProps) {
  const [pending,setPending] = useState<'continue' | 'party' | null>(null), [error,setError] = useState('');
  const lock = useRef(false), mounted = useRef(true), continueButton = useRef<HTMLButtonElement>(null);
  const locked = busy || !!pending, route = waveClearRoute(wave), lead = party.find(mon => mon.hp > 0) || party[0];
  const healthy = party.filter(mon => mon.hp > 0).length;
  useEffect(() => { mounted.current = true; if(document.activeElement === document.body)continueButton.current?.focus({preventScroll:true}); return () => {mounted.current = false;}; }, []);
  async function dispatch(kind: 'continue' | 'party') {
    if(locked || lock.current)return;
    lock.current = true; setPending(kind); setError('');
    try { await (kind === 'continue' ? onContinue() : onParty()); }
    catch(cause) {if(mounted.current)setError(cause instanceof Error ? cause.message : '다음 화면으로 이동하지 못했습니다. 다시 시도해 주세요.');}
    finally {lock.current = false; if(mounted.current)setPending(null);}
  }
  return <section className={`rogue-wave-clear ${interlude ? 'is-interlude' : ''}`} aria-label={`${wave}층 돌파 정비`} aria-busy={locked}>
    <header className="rwc-header"><span className="rwc-clear-mark">{route.complete ? <Trophy size={26} aria-hidden="true"/> : <Check size={27} aria-hidden="true"/>}</span><div><span className="rwc-eyebrow">{route.complete ? 'CLASSIC / COMPLETE' : interlude ? 'CHECKPOINT / A NEW CHAPTER' : 'FLOOR CLEAR / ONWARD'}</span><h2>{route.complete ? '200층, 도전을 완주했습니다.' : `${wave}층 돌파!`}</h2><p>{route.complete ? '마지막까지 함께한 파티의 모습을 확인하세요.' : interlude ? '한 구간을 지나, 다음 여정을 준비합니다.' : '함께한 파트너들과 다음 만남을 준비하세요.'}</p></div>{lead && <div className="rwc-hero-pokemon"><PokemonImage mon={lead} variant="battle" eager alt=""/></div>}</header>
    <div className="rwc-body"><div className="rwc-journey"><div className="rwc-money"><span><Coins size={17} aria-hidden="true"/>현재 소지금</span><b>{money.toLocaleString('ko-KR')}<small>원</small></b></div>{rewardName && <div className="rwc-reward"><span className="rwc-reward-symbol"><Package size={24} aria-hidden="true"/></span><div><small>{interlude ? '이번 구간의 보상' : '선택한 보상'}</small><b>{rewardName}</b></div><Check size={19} aria-label="선택한 보상"/></div>}
      <div className="rwc-route"><div className="rwc-section-title"><Flag size={17} aria-hidden="true"/><h3>{route.complete ? '클래식 도전 기록' : '다음 여정'}</h3></div><ol><li className="is-cleared"><span className="rwc-route-dot"><Check size={13} aria-hidden="true"/></span><div><small>돌파한 층</small><b>{wave}층</b></div></li>{!route.complete && <><li className="is-next"><span className="rwc-route-dot"/><div><small>{interlude ? '새 구간의 첫 만남' : route.next === route.boundary ? '다음 구간 경계' : '다음 만남'}</small><b>{route.next}층<ArrowRight size={17} aria-hidden="true"/></b></div></li>{route.boundary !== route.next && <li className="is-ahead"><span className="rwc-route-dot"/><div><small>다음 구간 경계</small><b>{route.boundary}층</b></div></li>}</>}</ol><p>{route.complete ? '완주 기록으로 이동해 이번 도전을 확인하세요.' : '출발 전 파티 상태를 확인할 수 있습니다.'}</p></div></div>
      <div className="rwc-team"><div className="rwc-section-title"><Users size={18} aria-hidden="true"/><h3>함께하는 파티</h3><span>{party.length} / 6 · 전투 가능 {healthy}</span></div><div className="rwc-party-grid">{Array.from({length:6},(_,index) => {
        const mon = party[index];
        if(!mon)return <div key={`empty:${index}`} className="rwc-party-empty"><span>0{index+1}</span><i/><small>빈 자리</small></div>;
        const fraction = Math.min(1,Math.max(0,mon.hp / Math.max(1,mon.maxHp)));
        return <div className={`rwc-party-mon ${mon.hp <= 0 ? 'is-fainted' : ''}`} key={`${mon.id}:${index}`}><PokemonImage mon={mon} variant="sprite" alt=""/><div><div className="rwc-mon-name"><b>{mon.name}</b><small>Lv.{mon.level}</small></div><span className="rwc-hp-label">{mon.hp <= 0 ? '기절' : 'HP'} <strong>{mon.hp} / {mon.maxHp}</strong></span><span className={`rwc-hp-track ${fraction <= .25 ? 'is-low' : fraction <= .5 ? 'is-medium' : ''}`} role="meter" aria-label={`${mon.name} HP`} aria-valuemin={0} aria-valuemax={mon.maxHp || 1} aria-valuenow={mon.hp}><i style={{transform:`scaleX(${fraction})`}}/></span></div></div>;
      })}</div></div></div>
    {error && <p className="rwc-error" role="alert">{error}</p>}
    <div className="rwc-actions"><button className="rwc-party-button" disabled={locked} onClick={() => void dispatch('party')}>{pending === 'party' ? <LoaderCircle className="rwc-spin" size={18} aria-hidden="true"/> : <Users size={18} aria-hidden="true"/>}파티 살펴보기</button><button className="rwc-continue" ref={continueButton} disabled={locked} onClick={() => void dispatch('continue')}>{pending === 'continue' ? <LoaderCircle className="rwc-spin" size={19} aria-hidden="true"/> : <ArrowRight size={20} aria-hidden="true"/>}{pending === 'continue' ? '여정을 준비하는 중…' : route.complete ? '완주 기록으로' : `${route.next}층으로 출발`}<ChevronRight size={20} aria-hidden="true"/></button></div>
  </section>;
}
