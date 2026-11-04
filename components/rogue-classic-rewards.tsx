'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowRight, Check, ChevronDown, ChevronRight, Coins, HeartPulse, LoaderCircle, Package, RefreshCw, Sparkles, Users, X } from 'lucide-react';
import PokemonImage from './pokemon-image';
import {moneyText,requiresReplacement,emptyMoveSlot,requiresRewardTarget,automaticRewardTarget,eligibleRewardMoves,rewardTargetBlockReason,rewardActionError,servicePurchaseError,type Configuration,type ClassicRewardTarget,type RewardChoice,type ServiceChoice,type RogueClassicRewardsProps} from './rogue-reward-logic';
export {requiresRewardTarget,automaticRewardTarget,eligibleRewardMoves,rewardTargetBlockReason,rewardActionError,servicePurchaseError} from './rogue-reward-logic';
export type {ClassicRewardMove,ClassicRewardTarget,RewardChoice,ServiceChoice,ClassicRewardMon,RewardPayload,ServicePayload,RogueClassicRewardsProps} from './rogue-reward-logic';
import './rogue-classic-rewards.css';

type Selection = { kind: 'reward' | 'service'; id: string };
const TIERS = ['일반', '슈퍼', '하이퍼', '로그', '마스터'];
const TM_TYPE_IDS:Record<string,number>={노말:1,격투:2,비행:3,독:4,땅:5,바위:6,벌레:7,고스트:8,강철:9,불꽃:10,물:11,풀:12,전기:13,에스퍼:14,얼음:15,드래곤:16,악:17,페어리:18};
function RewardImage({ image, name, large = false,moveType }: { image: string; name: string; large?: boolean;moveType?:string }) {
  if(moveType&&TM_TYPE_IDS[moveType])image='/game/tm-icons/'+TM_TYPE_IDS[moveType]+'.svg';
  const [failed, setFailed] = useState('');
  return failed === image
    ? <span className={`rcr-item-image rcr-image-fallback ${large ? 'is-large' : ''}`} aria-label={name}><Package size={large ? 40 : 25} aria-hidden="true"/></span>
    // Raw, tiny item sprites retain their pixel grid without an image proxy.
    // eslint-disable-next-line @next/next/no-img-element
    : <img className={`rcr-item-image ${large ? 'is-large' : ''}`} src={image} width={large ? 96 : 48} height={large ? 96 : 48} alt={name} decoding="async" loading={large ? 'eager' : 'lazy'} onError={() => setFailed(image)}/>;
}

export default function RogueClassicRewards(props: RogueClassicRewardsProps) {
  const version = `${props.wave}:${props.choices.map(choice => choice.id).join('|')}`;
  return <ClassicRewardScreen key={version} {...props}/>;
}

function ClassicRewardScreen({ wave, party, money, choices, services, rerollCost, rerolls, busy, error, notice, onChoose, onService, onReroll, onOpenParty }: RogueClassicRewardsProps) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [targetId, setTargetId] = useState<string | undefined>();
  const [moveIndex, setMoveIndex] = useState<number | undefined>();
  const [replaceIndex, setReplaceIndex] = useState<number | undefined>();
  const [newMoveName, setNewMoveName] = useState('');
  const [servicesOpen, setServicesOpen] = useState(true);
  const [pending, setPending] = useState('');
  const [localError, setLocalError] = useState('');
  const lock = useRef(false), mounted = useRef(true);
  const screen = useRef<HTMLElement>(null);
  const detailTitle = useRef<HTMLHeadingElement>(null);
  const detail = useRef<HTMLElement>(null);
  const uniqueId = useId();
  const locked = busy || !!pending;
  const active = selection?.kind === 'reward' ? choices.find(choice => choice.id === selection.id) : selection?.kind === 'service' ? services.find(service => service.id === selection.id) : undefined;
  const targets = active?.targets || [];
  const selectedTarget = targets.find(target => target.boxId === targetId) || targets.find(target => target.boxId === automaticRewardTarget(targets));
  const ppMoves = eligibleRewardMoves(selectedTarget,active);
  const selectedMoveIndex = moveIndex ?? (ppMoves.length === 1 ? ppMoves[0].index : undefined);
  const configuration: Configuration = {
    ...(active && requiresRewardTarget(active) && selectedTarget ? { boxId: selectedTarget.boxId } : {}),
    ...(active?.requiresMove && selectedMoveIndex !== undefined ? { moveIndex: selectedMoveIndex } : {}),
    ...(active && requiresReplacement(active) && (emptyMoveSlot(selectedTarget) ?? replaceIndex) !== undefined ? { replaceIndex: emptyMoveSlot(selectedTarget) ?? replaceIndex } : {}),
    ...(active?.requiresNewMove && newMoveName ? { moveName: newMoveName } : {}),
  };
  const activeService = selection?.kind === 'service' ? services.find(service => service.id === selection.id) : undefined;
  const confirmationError = active ? (activeService ? servicePurchaseError(activeService, money) : rewardTargetBlockReason(active)) || rewardActionError(active, configuration) : null;
  const rerollShortfall = Math.max(0, rerollCost - money);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (!selection) return;
    detailTitle.current?.focus({ preventScroll: true });
  }, [selection]);

  async function request(key: string, callback: () => Promise<unknown> | void) {
    if (lock.current || busy) return;
    lock.current = true; setPending(key); setLocalError('');
    try { await callback(); }
    catch (cause) { if (mounted.current) setLocalError(cause instanceof Error ? cause.message : '처리하지 못했습니다. 다시 선택해 주세요.'); }
    finally { lock.current = false; if (mounted.current) setPending(''); }
  }
  function clearConfiguration() { setTargetId(undefined); setMoveIndex(undefined); setReplaceIndex(undefined); setNewMoveName(''); setLocalError(''); }
  function dismissDetail() {
    const previous = selection;
    setSelection(null); clearConfiguration();
    requestAnimationFrame(() => {
      const previousButton = [...(screen.current?.querySelectorAll<HTMLButtonElement>('[data-rcr-id]') || [])].find(button => button.dataset.rcrId === previous?.id && button.dataset.rcrKind === previous?.kind && !button.disabled);
      (previousButton || screen.current?.querySelector<HTMLButtonElement>('.rcr-services-toggle, .rcr-reroll-action button:not(:disabled), .rcr-party-button:not(:disabled)'))?.focus();
    });
  }
  function pickReward(choice: RewardChoice) {
    if (locked || lock.current) return;
    const reason = rewardTargetBlockReason(choice);
    if (reason) { setLocalError(reason); return; }
    clearConfiguration();if(!requiresRewardTarget(choice)){void request(`reward:${choice.id}`, () => onChoose({ rewardId: choice.id }));return;}setSelection({ kind: 'reward', id: choice.id });setTargetId(automaticRewardTarget(choice.targets));
  }
  function pickService(service: ServiceChoice) {
    if (locked || lock.current) return;
    const reason = servicePurchaseError(service, money);
    if (reason) { setLocalError(reason); return; }
    clearConfiguration();if(!requiresRewardTarget(service)){void request(`service:${service.id}`, () => onService({ itemId: service.id, expectedPrice: service.price }));return;}setSelection({ kind: 'service', id: service.id });setTargetId(automaticRewardTarget(service.targets));
  }
  function confirm() {
    if (!active || !selection || locked || lock.current) return;
    const reason = (activeService ? servicePurchaseError(activeService, money) : rewardTargetBlockReason(active)) || rewardActionError(active, configuration);
    if (reason) { setLocalError(reason); return; }
    if (selection.kind === 'reward') void request(`reward:${active.id}`, () => onChoose({ rewardId: active.id, ...configuration }));
    else if (activeService) void request(`service:${active.id}`, () => onService({ itemId: active.id, expectedPrice: activeService.price, ...configuration }));
  }
  function reroll() {
    if (locked || lock.current || rerollShortfall || !choices.length) return;
    setSelection(null); clearConfiguration(); void request('reroll', onReroll);
  }
  function chooseTarget(target: ClassicRewardTarget) {
    if (!target.eligible || locked) return;
    setTargetId(target.boxId); setMoveIndex(undefined); setReplaceIndex(undefined); setNewMoveName(''); setLocalError('');
  }
  function focusWithin(event: KeyboardEvent<HTMLElement>, selector: string) {
    if (event.altKey || event.ctrlKey || event.metaKey || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>(selector)].filter(button => !button.disabled);
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index < 0 || !buttons.length) return;
    const columns = getComputedStyle(event.currentTarget).gridTemplateColumns.split(' ').length;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : index + ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns }[event.key] || 0);
    event.preventDefault(); event.stopPropagation(); buttons[Math.max(0, Math.min(buttons.length - 1, next))]?.focus();
  }

  return <section className="rogue-classic-rewards" ref={screen} aria-label={`${wave}층 돌파 보상`} aria-busy={locked} onKeyDown={event => {
    if(event.key==='Tab'&&selection&&detail.current){const controls=[...detail.current.querySelectorAll<HTMLElement>('button:not([disabled]),select:not([disabled]),input:not([disabled]),[tabindex="0"]')].filter(el=>el.getClientRects().length>0);if(controls.length){const first=controls[0],last=controls[controls.length-1],current=document.activeElement;if(event.shiftKey&&(current===first||!controls.includes(current as HTMLElement))){event.preventDefault();last.focus();}else if(!event.shiftKey&&(current===last||!controls.includes(current as HTMLElement))){event.preventDefault();first.focus();}}}
    if (event.key === 'Escape' && selection && !locked && !(event.target as HTMLElement).matches('select,input,textarea')) { event.preventDefault(); event.stopPropagation(); dismissDetail(); }
  }}>
    <header className="rcr-header"><div className="rcr-clear"><span className="rcr-clear-mark"><Check size={19} aria-hidden="true"/></span><div><span className="rcr-eyebrow">FLOOR CLEAR</span><h2>{wave}층 돌파</h2></div></div><div className="rcr-header-tools">{onOpenParty && <button className="rcr-party-button" aria-label="파티 확인" disabled={locked} onClick={onOpenParty}><Users size={17} aria-hidden="true"/>파티 확인</button>}<div className="rcr-money"><span><Coins size={15} aria-hidden="true"/>소지금</span><b>{moneyText(money)}<small>원</small></b></div></div></header>

    <div className="rcr-heading"><div><span className="rcr-eyebrow">CHOOSE ONE / FREE REWARD</span><h3>다음 층으로 가져갈 한 가지.</h3><p>무료 아이템 하나를 선택하면 {wave + 1}층으로 출발합니다.</p></div><span className="rcr-choice-count">{choices.length}가지 선택지</span></div>
    <div className="rcr-choice-grid" onKeyDown={event => focusWithin(event, '.rcr-choice')}>{choices.map((choice, index) => {
      const reason = rewardTargetBlockReason(choice), activeChoice = selection?.kind === 'reward' && selection.id === choice.id;
      return <button key={choice.id} data-rcr-id={choice.id} data-rcr-kind="reward" className={`rcr-choice tier-${choice.tier} ${activeChoice ? 'is-selected' : ''}`} title={choice.moveDescription || undefined} disabled={locked || !!reason} aria-pressed={activeChoice} onClick={() => pickReward(choice)}><span className="rcr-choice-top"><span className="rcr-tier"><i/>{TIERS[choice.tier]}</span><span className="rcr-choice-number">0{index + 1}</span></span><span className="rcr-choice-art"><RewardImage image={choice.image} name={choice.name} moveType={choice.moveType} large/>{(choice.quantity || 0) > 1 && <b>×{choice.quantity}</b>}</span><span className="rcr-choice-copy"><b>{choice.name}</b><span>{choice.description}</span>{choice.moveName && <span className="rcr-tm-preview"><strong>{choice.moveName} · {choice.moveType} · 위력 {choice.moveCategory==='Status'?'변화':choice.movePower||'변동'} · 명중 {choice.moveAccuracy===true?'필중':choice.moveAccuracy??'—'}</strong>{choice.moveDescription && <small>{choice.moveDescription}</small>}</span>}{choice.stackText && <small>{choice.stackText}</small>}</span><span className="rcr-choice-action">{pending === `reward:${choice.id}` ? <><LoaderCircle size={16} className="rcr-spin" aria-hidden="true"/>처리 중…</> : reason ? <span>{reason}</span> : <><span>{requiresRewardTarget(choice) ? '사용할 대상 선택' : '이 보상 선택'}</span><ArrowRight size={17} aria-hidden="true"/></>}</span></button>;
    })}</div>
    {!choices.length && <div className="rcr-empty"><Package size={28} aria-hidden="true"/><p>선택 가능한 보상 정보를 기다리고 있습니다.</p></div>}

    <div className="rcr-reroll"><div><b><RefreshCw size={16} aria-hidden="true"/>다른 보상 찾아보기</b><p>새로고침할 때마다 비용이 2배가 됩니다.<span>현재 {rerolls}회 · 다음 비용 {moneyText(rerollCost * 2)}원</span></p></div><div className="rcr-reroll-action"><button className="rcr-button rcr-button-outline" disabled={locked || !!rerollShortfall || !choices.length} onClick={reroll}>{pending === 'reroll' ? <LoaderCircle className="rcr-spin" size={16} aria-hidden="true"/> : <RefreshCw size={16} aria-hidden="true"/>}새로고침 <b>{moneyText(rerollCost)}원</b></button>{rerollShortfall > 0 && <span>{moneyText(rerollShortfall)}원 부족</span>}</div></div>

    {active && selection && <><div className="rcr-scrim" aria-hidden="true" onClick={()=>{if(!locked)dismissDetail();}}/><section className={`rcr-detail ${selection.kind === 'service' ? 'is-service' : ''}`} ref={detail} role="dialog" aria-modal="true" aria-labelledby={`${uniqueId}-detail`}><div className="rcr-detail-heading"><RewardImage image={active.image} name={active.name} moveType={'moveType' in active?active.moveType:undefined}/><div><span className="rcr-eyebrow">{selection.kind === 'service' ? 'USE IMMEDIATELY' : 'REWARD SETUP'}</span><h3 id={`${uniqueId}-detail`} ref={detailTitle} tabIndex={-1}>{active.name}{activeService && <small>{moneyText(activeService.price)}원</small>}</h3><p>{active.description}</p>{'moveName' in active && active.moveName && <span className="rcr-learning-move">배울 기술 · {active.moveName}</span>}{'moveDescription' in active && active.moveDescription && <div className="rcr-learning-detail"><b>{active.moveType} · 위력 {active.moveCategory==='Status'?'변화':active.movePower||'변동'} · 명중 {active.moveAccuracy===true?'필중':active.moveAccuracy??'—'}</b><span>{active.moveDescription}</span></div>}</div><button className="rcr-close-detail" disabled={locked} onClick={dismissDetail} aria-label="선택 상세 닫기"><X size={18} aria-hidden="true"/></button></div>
      {requiresRewardTarget(active) && <div className="rcr-target-section"><div className="rcr-section-heading"><h4>사용할 포켓몬</h4>{automaticRewardTarget(targets) === selectedTarget?.boxId && !!selectedTarget && <span>적용 가능한 한 마리 자동 선택</span>}</div><div className="rcr-targets" onKeyDown={event => focusWithin(event, '.rcr-target')}>{targets.map(target => {
        const mon = party.find(member => member.boxId === target.boxId), isSelected = selectedTarget?.boxId === target.boxId;
        return <button key={target.boxId} className={`rcr-target ${isSelected ? 'is-selected' : ''}`} disabled={locked || !target.eligible} aria-pressed={isSelected} aria-label={`${target.name}, HP ${target.hp}/${target.maxHp}${!target.eligible ? `, ${target.reason || '사용 불가'}` : ''}`} onClick={() => chooseTarget(target)}><PokemonImage mon={mon || null} variant="sprite" alt=""/><span className="rcr-target-data"><b>{target.name}{isSelected && <Check size={15} aria-hidden="true"/>}</b><span className="rcr-target-hp">HP {target.hp} / {target.maxHp}</span><span className="rcr-target-bar" aria-hidden="true"><i style={{ transform: `scaleX(${Math.min(1, Math.max(0, target.hp / Math.max(1, target.maxHp)))})` }}/></span>{!target.eligible && <small>{target.reason || '사용할 수 없는 대상'}</small>}</span></button>;
      })}</div>{!targets.length && <p className="rcr-inline-reason">사용할 대상 정보가 없습니다.</p>}</div>}
      {active.requiresNewMove && selectedTarget && <div className="rcr-move-section rcr-learn-section"><div className="rcr-section-heading"><h4>다시 배울 기술</h4><span>기술을 고른 뒤 아래에서 배울 자리를 선택하세요.</span></div><label className="rcr-learn-field" htmlFor={`${uniqueId}-new-move`}><span>배울 기술</span><select id={`${uniqueId}-new-move`} value={newMoveName} disabled={locked || !selectedTarget.eligible || !selectedTarget.learnableMoves?.length} onChange={event => { setNewMoveName(event.target.value); setReplaceIndex(undefined); setLocalError(''); }}><option value="">기억할 기술을 선택하세요</option>{[...new Set(selectedTarget.learnableMoves || [])].map(move => <option key={move} value={move}>{move}</option>)}</select></label>{!selectedTarget.learnableMoves?.length && <p className="rcr-inline-reason">이 포켓몬이 다시 배울 수 있는 기술이 없습니다.</p>}</div>}
      {active.requiresMove && selectedTarget && <div className="rcr-move-section"><div className="rcr-section-heading"><h4>{'moveSelectionMode' in active && active.moveSelectionMode==='ppup'?'최대 PP를 늘릴 기술':'PP를 회복할 기술'}</h4><span>{'moveSelectionMode' in active && active.moveSelectionMode==='ppup'?'최대 PP를 늘릴 수 있는 기술을 선택하세요.':'PP가 줄어든 기술만 선택할 수 있습니다.'}</span></div><div className="rcr-moves" onKeyDown={event => focusWithin(event, '.rcr-move')}>{(selectedTarget.moves || []).map(move => <button key={move.index} className={`rcr-move ${selectedMoveIndex === move.index ? 'is-selected' : ''}`} disabled={locked || !selectedTarget.eligible || !ppMoves.some(candidate=>candidate.index===move.index)} aria-pressed={selectedMoveIndex === move.index} onClick={() => setMoveIndex(move.index)}><span><small>0{move.index + 1}</small><b>{move.name}</b></span><span>PP <b>{move.pp}</b> / {move.maxPp}{!ppMoves.some(candidate=>candidate.index===move.index) && <small>{'moveSelectionMode' in active && active.moveSelectionMode==='ppup'?'최대 PP 증가 불가':'회복할 PP 없음'}</small>}</span></button>)}</div>{!selectedTarget.moves?.length && <p className="rcr-inline-reason">선택 가능한 기술 정보가 없습니다.</p>}</div>}
      {requiresReplacement(active) && selectedTarget && emptyMoveSlot(selectedTarget)===undefined && <div className="rcr-move-section"><div className="rcr-section-heading"><h4>잊을 기술 선택</h4><span>새 기술을 배우기 위해 기존 기술 하나를 고르세요.</span></div><div className="rcr-moves rcr-replace-moves" onKeyDown={event => focusWithin(event, '.rcr-move')}>{[0, 1, 2, 3].map(index => {
        const current = selectedTarget.moves?.find(move => move.index === index);
        return <button key={index} className={`rcr-move ${replaceIndex === index ? 'is-selected' : ''} ${!current ? 'is-empty-slot' : ''}`} disabled={locked || !selectedTarget.eligible} aria-pressed={replaceIndex === index} onClick={() => setReplaceIndex(index)}><span><small>0{index + 1}</small><b>{current?.name || '빈 자리'}</b></span><span>{current ? '이 기술과 교체' : '이 자리에 배우기'}<ChevronRight size={15} aria-hidden="true"/></span></button>;
      })}</div></div>}
      {requiresReplacement(active) && selectedTarget && emptyMoveSlot(selectedTarget)!==undefined && <p className="rcr-inline-reason">빈 기술 자리에 자동으로 배웁니다.</p>}
      {(error||localError)&&<p className="rcr-error rcr-dialog-error" role="alert">{error||localError}</p>}
      <div className="rcr-confirm"><div>{confirmationError ? <p className="rcr-inline-reason">{confirmationError}</p> : <p>{selection.kind === 'service' ? '구매 즉시 선택한 대상에게 사용합니다.' : '이 보상을 받고 다음 층으로 출발합니다.'}</p>}{activeService && <span>사용 후 소지금 {moneyText(Math.max(0, money - activeService.price))}원</span>}</div><button className="rcr-button rcr-button-primary" disabled={locked || !!confirmationError} onClick={confirm}>{pending ? <LoaderCircle className="rcr-spin" size={18} aria-hidden="true"/> : selection.kind === 'service' ? <HeartPulse size={18} aria-hidden="true"/> : <Check size={18} aria-hidden="true"/>}{selection.kind === 'service' ? `${moneyText(activeService?.price || 0)}원 · 바로 사용` : '이 보상으로 결정'}<ArrowRight size={18} aria-hidden="true"/></button></div>
    </section></>}

    {notice && <div className="rcr-notice" role="status"><Check size={18} aria-hidden="true"/><span>{notice}</span></div>}
    {!selection && (error || localError) && <p className="rcr-error" role="alert">{error || localError}</p>}
    {services.length > 0 && <section className="rcr-services" aria-label="유료 파티 정비 서비스"><button className="rcr-services-toggle" aria-expanded={servicesOpen} aria-controls={`${uniqueId}-services`} onClick={() => setServicesOpen(previous => !previous)}><span><HeartPulse size={18} aria-hidden="true"/><b>출발 전, 파티 정비</b><small>구매 즉시 적용</small></span><ChevronDown className={servicesOpen ? 'is-open' : ''} size={19} aria-hidden="true"/></button><div id={`${uniqueId}-services`} hidden={!servicesOpen}><p className="rcr-services-note">필요한 도구를 골라 포켓몬에게 바로 사용하세요. 사용 후에도 같은 화면에서 준비를 이어갈 수 있습니다.</p><div className="rcr-service-grid" onKeyDown={event => focusWithin(event, '.rcr-service')}>{services.map(service => {
      const reason = servicePurchaseError(service, money), activeService = selection?.kind === 'service' && selection.id === service.id;
      return <button key={service.id} title={service.description} data-rcr-id={service.id} data-rcr-kind="service" className={`rcr-service ${activeService ? 'is-selected' : ''}`} disabled={locked || !!reason} aria-pressed={activeService} onClick={() => pickService(service)}><RewardImage image={service.image} name={service.name}/><span className="rcr-service-copy"><b>{service.name}</b><span>{service.description}</span>{reason && <small>{reason}</small>}</span><span className="rcr-service-price">{moneyText(service.price)}<small>원</small><ChevronRight size={16} aria-hidden="true"/></span></button>;
    })}</div></div><div className="rcr-party-preview" aria-label="현재 파티 체력">{party.map(mon=><div key={mon.boxId}><PokemonImage mon={mon} variant="sprite" alt=""/><span><b>{mon.name}</b><small>{mon.hp<=0?'기절':`HP ${mon.hp} / ${mon.maxHp}`}</small></span></div>)}</div></section>}
    <p className="rcr-key-help"><Sparkles size={14} aria-hidden="true"/>방향키로 선택 · Enter로 결정 · 무료 보상은 한 가지만 받을 수 있습니다.</p>
  </section>;
}
