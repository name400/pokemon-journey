'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Flag, LockKeyhole, Minus, Plus, Search, Sparkles, Users, X } from 'lucide-react';
import PokemonImage from './pokemon-image';
import './rogue-starter-select.css';

export type StarterStat = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe';
export type StarterStats = Record<StarterStat, number>;
export type StarterEntry = {
  id: number;
  speciesId: number;
  artId: number;
  name: string;
  types: string[];
  generation: number;
  pokerus?: boolean;
  /** The current effective cost, including any permanent reductions. */
  cost: number;
  unlocked: boolean;
  ivs: StarterStats;
  /** Neutral-nature level-5 stats, with no EVs. */
  stats: StarterStats;
  abilities: Array<{ key: string; name: string }>;
  natures: Array<{ key: string; name: string }>;
  genders: Array<'M' | 'F' | 'N'>;
  shinyUnlocked: boolean;
  moves: string[];
  defaultMoves: string[];
  candies?: number;
  reductionCost?: number;
  costReduction?: number;
  formName?: string;
};
export type StarterSelection = {
  id: number;
  ability: string;
  nature: string;
  gender: string;
  shiny: boolean;
  moves: string[];
};
export type StarterTeamValidation = { valid: boolean; cost: number; remaining: number; error: string | null };
export type RogueStarterSelectProps = {
  starters: StarterEntry[];
  budget?: number;
  busy: boolean;
  error?: string;
  onStart: (team: StarterSelection[]) => Promise<unknown> | void;
  onCancel: () => void;
  onReduceCost?: (id: number) => Promise<unknown> | void;
};

const PAGE_SIZE = 48;
const STAT_NAMES: Array<[StarterStat, string]> = [['hp', 'HP'], ['atk', '공격'], ['def', '방어'], ['spa', '특수공격'], ['spd', '특수방어'], ['spe', '스피드']];
const NATURE_EFFECTS: Partial<Record<string, [StarterStat, StarterStat]>> = {
  lonely: ['atk', 'def'], brave: ['atk', 'spe'], adamant: ['atk', 'spa'], naughty: ['atk', 'spd'],
  bold: ['def', 'atk'], relaxed: ['def', 'spe'], impish: ['def', 'spa'], lax: ['def', 'spd'],
  timid: ['spe', 'atk'], hasty: ['spe', 'def'], jolly: ['spe', 'spa'], naive: ['spe', 'spd'],
  modest: ['spa', 'atk'], mild: ['spa', 'def'], quiet: ['spa', 'spe'], rash: ['spa', 'spd'],
  calm: ['spd', 'atk'], gentle: ['spd', 'def'], sassy: ['spd', 'spe'], careful: ['spd', 'spa'],
};
const genderName = (gender: string) => gender === 'M' ? '수컷 ♂' : gender === 'F' ? '암컷 ♀' : '성별 없음';
const pointUnits = (value: number) => Math.round(value * 1000);
const points = (value: number) => value.toLocaleString('ko-KR', { maximumFractionDigits: 3 });
const normalizeMoves = (moves: readonly string[]) => moves.filter(Boolean);

/** Deterministic defaults can also be used by the server integration and unit checks. */
export function defaultStarterSelection(entry: StarterEntry): StarterSelection {
  const defaultMoves = [...new Set(entry.defaultMoves)].filter(move => entry.moves.includes(move)).slice(0, 4);
  return {
    id: entry.id,
    ability: entry.abilities[0]?.key || '',
    nature: entry.natures.find(nature => nature.key === 'hardy')?.key || entry.natures[0]?.key || 'hardy',
    gender: entry.genders[0] || 'N',
    shiny: false,
    moves: defaultMoves.length ? defaultMoves : [...new Set(entry.moves)].slice(0, 4),
  };
}

export function starterCostTotal(starters: readonly StarterEntry[], team: readonly StarterSelection[]): number {
  const entries = new Map(starters.map(entry => [entry.id, entry]));
  return team.reduce((sum, member) => sum + pointUnits(entries.get(member.id)?.cost || 0), 0) / 1000;
}

export function starterSelectionError(entry: StarterEntry, selection: StarterSelection): string | null {
  if (!entry.unlocked) return '야생에서 포획하면 스타터로 해금됩니다.';
  if (selection.id !== entry.id) return '선택한 포켓몬 정보를 다시 확인하세요.';
  if (!entry.abilities.some(ability => ability.key === selection.ability)) return '해금된 특성을 선택하세요.';
  if (!entry.natures.some(nature => nature.key === selection.nature)) return '선택 가능한 성격을 골라주세요.';
  if (!entry.genders.some(gender => gender === selection.gender)) return '선택 가능한 성별을 골라주세요.';
  if (selection.shiny && !entry.shinyUnlocked) return '색이 다른 모습을 먼저 해금해야 합니다.';
  if (selection.moves.length < 1 || selection.moves.length > 4) return '기술을 1개에서 4개까지 선택하세요.';
  if (new Set(selection.moves).size !== selection.moves.length) return '같은 기술을 두 번 선택할 수 없습니다.';
  if (selection.moves.some(move => !entry.moves.includes(move))) return '이 포켓몬이 사용할 수 있는 기술을 선택하세요.';
  return null;
}

export function starterAddReason(starters: readonly StarterEntry[], team: readonly StarterSelection[], id: number, budget = 10): string | null {
  const entry = starters.find(candidate => candidate.id === id);
  if (!entry) return '포켓몬 정보를 다시 불러와 주세요.';
  if (!entry.unlocked) return '야생에서 포획하면 스타터로 해금됩니다.';
  if (team.length >= 6) return '파티가 가득 찼습니다. 먼저 한 마리를 제외하세요.';
  const species = new Map(starters.map(candidate => [candidate.id, candidate.speciesId]));
  if (team.some(member => species.get(member.id) === entry.speciesId)) return '같은 종은 모습이 달라도 한 마리만 편성할 수 있습니다.';
  if (!Number.isFinite(entry.cost) || entry.cost < 0) return '스타터 포인트 정보를 확인해 주세요.';
  const total = starterCostTotal(starters, team);
  if (pointUnits(total + entry.cost) > pointUnits(budget)) return `${points((pointUnits(total + entry.cost) - pointUnits(budget)) / 1000)}포인트가 부족합니다. 파티를 조정하세요.`;
  return null;
}

export function validateStarterTeam(starters: readonly StarterEntry[], team: readonly StarterSelection[], budget = 10): StarterTeamValidation {
  const cost = starterCostTotal(starters, team);
  const result = (error: string | null): StarterTeamValidation => ({ valid: error === null, cost, remaining: (pointUnits(budget) - pointUnits(cost)) / 1000, error });
  if (!Number.isFinite(budget) || budget < 0) return result('스타터 포인트 한도를 확인해 주세요.');
  if (!team.length) return result('함께 출발할 포켓몬을 한 마리 이상 추가하세요.');
  if (team.length > 6) return result('파티는 최대 6마리까지 편성할 수 있습니다.');
  const entries = new Map(starters.map(entry => [entry.id, entry]));
  const species = new Set<number>();
  for (const selection of team) {
    const entry = entries.get(selection.id);
    if (!entry) return result('목록에 없는 포켓몬이 있습니다. 파티에서 제외하고 다시 선택하세요.');
    if (species.has(entry.speciesId)) return result('같은 종은 다른 모습이라도 중복 편성할 수 없습니다.');
    species.add(entry.speciesId);
    if (!Number.isFinite(entry.cost) || entry.cost < 0) return result(`${entry.name}의 포인트 정보를 확인해 주세요.`);
    const error = starterSelectionError(entry, selection);
    if (error) return result(`${entry.name}: ${error}`);
  }
  if (pointUnits(cost) > pointUnits(budget)) return result(`스타터 포인트가 ${points((pointUnits(cost) - pointUnits(budget)) / 1000)}만큼 초과했습니다.`);
  return result(null);
}

export function starterStatsForNature(stats: StarterStats, nature: string): StarterStats {
  const effect = NATURE_EFFECTS[nature];
  if (!effect) return { ...stats };
  return { ...stats, [effect[0]]: Math.floor(stats[effect[0]] * 1.1), [effect[1]]: Math.floor(stats[effect[1]] * .9) };
}

export default function RogueStarterSelect({ starters, budget = 10, busy, error, onStart, onCancel, onReduceCost }: RogueStarterSelectProps) {
  const [team, setTeam] = useState<StarterSelection[]>([]);
  const [drafts, setDrafts] = useState<Record<number, StarterSelection>>({});
  const [focusedId, setFocusedId] = useState<number | null>(null);
  const [rovingId, setRovingId] = useState<number | null>(null);
  const [generation, setGeneration] = useState(0);
  const [query, setQuery] = useState('');
  const [unlockedOnly, setUnlockedOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [pane, setPane] = useState<'catalog' | 'detail'>('catalog');
  const [submitting, setSubmitting] = useState(false);
  const [reducing, setReducing] = useState(false);
  const [localError, setLocalError] = useState('');
  const [status, setStatus] = useState('');
  const root = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const mounted = useRef(true);
  const actionLock = useRef(false);
  const id = useId();
  const locked = busy || submitting || reducing;
  const entries = useMemo(() => new Map(starters.map(entry => [entry.id, entry])), [starters]);
  const focused = entries.get(focusedId ?? -1) || starters.find(entry => entry.unlocked) || starters[0];
  const draft = focused ? drafts[focused.id] || team.find(member => member.id === focused.id) || defaultStarterSelection(focused) : null;
  const selected = !!focused && team.some(member => member.id === focused.id);
  const validation = validateStarterTeam(starters, team, budget);
  const filtered = useMemo(() => {
    const text = query.trim().toLocaleLowerCase('ko-KR');
    return starters.filter(entry => (!generation || entry.generation === generation) && (!unlockedOnly || entry.unlocked) && (!text || `${entry.name} ${entry.formName || ''} ${entry.id} ${entry.speciesId}`.toLocaleLowerCase('ko-KR').includes(text)));
  }, [starters, generation, unlockedOnly, query]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages - 1);
  const visible = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const tabStop = visible.some(entry => entry.id === rovingId) ? rovingId : visible[0]?.id;
  const addReason = focused ? starterAddReason(starters, team, focused.id, budget) : '포켓몬을 선택하세요.';
  const draftError = focused && draft ? starterSelectionError(focused, { ...draft, moves: normalizeMoves(draft.moves) }) : null;
  const selectedStats = focused && draft ? starterStatsForNature(focused.stats, draft.nature) : null;
  const natureEffect = draft ? NATURE_EFFECTS[draft.nature] : undefined;

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (pane === 'detail' && typeof window !== 'undefined' && window.matchMedia('(max-width: 800px)').matches) detailHeading.current?.focus();
  }, [pane, focusedId]);

  function inspect(entry: StarterEntry) {
    setFocusedId(entry.id); setPane('detail'); setLocalError('');
  }
  function updateDraft(patch: Partial<StarterSelection>) {
    if (!focused || !draft || locked) return;
    const next = { ...draft, ...patch, id: focused.id };
    setDrafts(previous => ({ ...previous, [focused.id]: next }));
    setTeam(previous => previous.map(member => member.id === focused.id ? { ...next, moves: normalizeMoves(next.moves) } : member));
    setLocalError('');
  }
  function updateMove(slot: number, move: string) {
    if (!draft) return;
    const moves = Array.from({ length: 4 }, (_, index) => draft.moves[index] || '');
    moves[slot] = move;
    updateDraft({ moves });
  }
  function remove(id: number) {
    if (locked) return;
    setTeam(previous => previous.filter(member => member.id !== id));
    setStatus(`${entries.get(id)?.name || '포켓몬'}을(를) 파티에서 제외했습니다.`); setLocalError('');
  }
  function addFocused() {
    if (!focused || !draft || locked) return;
    const reason = starterAddReason(starters, team, focused.id, budget) || draftError;
    if (reason) { setLocalError(reason); return; }
    setTeam(previous => starterAddReason(starters, previous, focused.id, budget) ? previous : [...previous, { ...draft, moves: normalizeMoves(draft.moves) }]);
    setStatus(`${focused.name}을(를) 파티에 추가했습니다.`); setLocalError('');
  }
  async function start() {
    if (actionLock.current || locked) return;
    const result = validateStarterTeam(starters, team, budget);
    if (!result.valid) { setLocalError(result.error || '파티를 확인해 주세요.'); return; }
    actionLock.current = true; setSubmitting(true); setLocalError('');
    try { await onStart(team.map(member => ({ ...member, moves: [...member.moves] }))); }
    catch (cause) { if (mounted.current) setLocalError(cause instanceof Error ? cause.message : '도전을 시작하지 못했습니다. 다시 시도해 주세요.'); }
    finally { actionLock.current = false; if (mounted.current) setSubmitting(false); }
  }
  async function reduceCost() {
    if (!focused || !onReduceCost || locked || actionLock.current) return;
    actionLock.current = true; setReducing(true); setLocalError('');
    try { await onReduceCost(focused.id); }
    catch (cause) { if (mounted.current) setLocalError(cause instanceof Error ? cause.message : '비용을 감소시키지 못했습니다.'); }
    finally { actionLock.current = false; if (mounted.current) setReducing(false); }
  }
  function returnToList() {
    setPane('catalog');
    requestAnimationFrame(() => { grid.current?.querySelector<HTMLElement>(`[data-starter-id="${rovingId || focused?.id || ''}"]`)?.focus(); });
  }
  function gridKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const buttons = [...(grid.current?.querySelectorAll<HTMLButtonElement>('[data-starter-id]') || [])];
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index < 0 || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    const columns = grid.current ? getComputedStyle(grid.current).gridTemplateColumns.split(' ').length : 1;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : index + ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns }[event.key] || 0);
    event.preventDefault(); event.stopPropagation(); buttons[Math.max(0, Math.min(buttons.length - 1, next))]?.focus();
  }
  function resetFilters() { setQuery(''); setGeneration(0); setUnlockedOnly(false); setPage(0); }
  function turnPage(next: number) {
    setPage(next); setRovingId(null);
    requestAnimationFrame(() => { grid.current?.scrollTo({ top: 0 }); grid.current?.querySelector<HTMLButtonElement>('[data-starter-id]')?.focus(); });
  }

  return <section className="rogue-starters-screen" ref={root} aria-label="스타터 파티 편성" aria-busy={locked} onKeyDown={event => {
    if (event.key === 'Escape' && pane === 'detail' && !locked && !(event.target as HTMLElement).matches('select')) { event.preventDefault(); event.stopPropagation(); returnToList(); }
  }}>
    <header className="rss-header"><button className="rss-back" onClick={onCancel} disabled={locked} aria-label="스타터 선택에서 돌아가기"><ArrowLeft size={20} aria-hidden="true"/></button><div><span className="rss-eyebrow">CLASSIC / BUILD YOUR STARTING TEAM</span><h2>이번 모험의 파트너</h2><p>최대 6마리, 합계 {points(budget)}포인트 안에서 파티를 편성하세요.</p></div><div className={`rss-budget ${validation.remaining < 0 ? 'is-over' : ''}`} aria-label={`사용 포인트 ${points(validation.cost)}, 최대 ${points(budget)}`}><small>스타터 포인트</small><b>{points(validation.cost)}<span> / {points(budget)}</span></b><span>남은 포인트 {points(Math.max(0, validation.remaining))}</span></div></header>

    <div className="rss-party"><div className="rss-party-label"><Users size={18} aria-hidden="true"/><b>출발 파티</b><span>{team.length} / 6</span></div><ol className="rss-slots">{Array.from({ length: 6 }, (_, index) => {
      const member = team[index], entry = member ? entries.get(member.id) : null;
      return <li key={index} className={member ? 'is-filled' : ''}>{member && entry ? <><button className="rss-slot-main" onClick={() => inspect(entry)} disabled={locked} aria-label={`${index + 1}번 ${entry.name}, ${points(entry.cost)}포인트, 설정 보기`}><PokemonImage mon={{ ...entry, shiny: member.shiny }} variant="sprite" alt=""/><span><b>{entry.name}</b><small>{points(entry.cost)} PT{member.shiny && ' · 이로치'}</small></span></button><button className="rss-slot-remove" disabled={locked} onClick={() => remove(member.id)} aria-label={`${entry.name} 파티에서 제외`}><X size={16} aria-hidden="true"/></button></> : member ? <><span className="rss-slot-missing">정보 갱신 필요</span><button className="rss-slot-remove" disabled={locked} onClick={() => remove(member.id)} aria-label="정보가 없는 포켓몬 제외"><X size={16} aria-hidden="true"/></button></> : <button className="rss-slot-empty" disabled={locked} onClick={() => { setPane('catalog'); requestAnimationFrame(() => search.current?.focus()); }} aria-label={`${index + 1}번 빈 파티 자리, 포켓몬 찾기`}><span>0{index + 1}</span><Plus size={18} aria-hidden="true"/><small>파트너 추가</small></button>}</li>;
    })}</ol><div className="rss-point-track" role="meter" aria-label="스타터 포인트 사용량" aria-valuemin={0} aria-valuemax={budget} aria-valuenow={Math.min(budget, validation.cost)}><i className={validation.remaining < 0 ? 'is-over' : ''} style={{ transform: `scaleX(${Math.min(1, Math.max(0, validation.cost / Math.max(.001, budget)))})` }}/></div></div>

    <div className="rss-pane-nav"><button className={pane === 'catalog' ? 'is-active' : ''} aria-pressed={pane === 'catalog'} onClick={returnToList}><Search size={17} aria-hidden="true"/>포켓몬 목록</button><button className={pane === 'detail' ? 'is-active' : ''} aria-pressed={pane === 'detail'} disabled={!focused} onClick={() => setPane('detail')}>선택 포켓몬 설정<ChevronRight size={17} aria-hidden="true"/></button></div>

    <div className="rss-layout" data-pane={pane}>
      <div className="rss-catalog"><div className="rss-catalog-controls"><div className="rss-search-row"><label className="rss-search" htmlFor={`${id}-search`}><Search size={18} aria-hidden="true"/><input id={`${id}-search`} ref={search} type="search" autoComplete="off" value={query} placeholder="포켓몬 이름 · 도감 번호" aria-label="스타터 이름 또는 도감 번호 검색" disabled={locked} onChange={event => { setQuery(event.target.value); setPage(0); }}/></label><label className="rss-unlocked-filter"><input type="checkbox" checked={unlockedOnly} disabled={locked} onChange={event => { setUnlockedOnly(event.target.checked); setPage(0); }}/><span>해금만 보기</span></label></div><div className="rss-generations" aria-label="세대별 스타터 필터">{Array.from({ length: 10 }, (_, gen) => <button key={gen} className={generation === gen ? 'is-active' : ''} aria-pressed={generation === gen} disabled={locked} onClick={() => { setGeneration(gen); setPage(0); }}>{gen === 0 ? '전체' : `${gen}세대`}</button>)}</div><div className="rss-list-caption"><span>{filtered.length.toLocaleString('ko-KR')}종 · {starters.filter(entry => entry.unlocked).length.toLocaleString('ko-KR')}종 해금</span><span>한 페이지 {PAGE_SIZE}마리</span></div></div>
        {visible.length ? <div className="rss-mon-grid" ref={grid} onKeyDown={gridKeyboard} aria-label="스타터 목록">{visible.map(entry => {
          const teamIndex = team.findIndex(member => member.id === entry.id);
          return <button key={entry.id} className={`rss-mon ${entry.unlocked ? '' : 'is-locked'} ${focused?.id === entry.id ? 'is-focused' : ''} ${teamIndex >= 0 ? 'is-chosen' : ''}`} disabled={locked} tabIndex={tabStop === entry.id ? 0 : -1} data-starter-id={entry.id} onFocus={() => setRovingId(entry.id)} onClick={() => inspect(entry)} aria-pressed={focused?.id === entry.id} aria-label={`${entry.name}${entry.formName ? ` ${entry.formName}` : ''}, ${points(entry.cost)}포인트, ${teamIndex >= 0 ? `파티 ${teamIndex + 1}번` : entry.unlocked ? '해금됨' : '알 부화로 등록'}, 상세 보기`}><span className="rss-mon-meta"><span>{teamIndex >= 0 ? <><Check size={12} aria-hidden="true"/>{teamIndex + 1}</> : !entry.unlocked ? <LockKeyhole size={13} aria-hidden="true"/> : `#${entry.speciesId}`}</span><b>{points(entry.cost)}</b></span><PokemonImage mon={entry} variant="sprite" alt=""/><b className="rss-mon-name">{entry.name}</b>{entry.pokerus&&<span className="rss-pokerus">포켓러스</span>}{entry.formName && <small className="rss-mon-form">{entry.formName}</small>}{!entry.unlocked && <span className="rss-locked-label">알 부화로 등록</span>}</button>;
        })}</div> : <div className="rss-no-results"><Search size={30} aria-hidden="true"/><h3>조건에 맞는 포켓몬이 없습니다.</h3><p>이름이나 세대 필터를 바꿔보세요.</p><button className="rss-button rss-button-outline" disabled={locked} onClick={resetFilters}>필터 초기화</button></div>}
        <div className="rss-pagination"><button disabled={locked || currentPage === 0} onClick={() => turnPage(currentPage - 1)} aria-label="이전 스타터 목록 페이지"><ChevronLeft size={19} aria-hidden="true"/>이전</button><span><b>{currentPage + 1}</b> / {pages}</span><button disabled={locked || currentPage + 1 >= pages} onClick={() => turnPage(currentPage + 1)} aria-label="다음 스타터 목록 페이지">다음<ChevronRight size={19} aria-hidden="true"/></button></div>
      </div>

      <aside className="rss-detail" aria-label="선택한 스타터 설정">{focused && draft && selectedStats ? <><div className="rss-detail-heading"><button className="rss-detail-back" onClick={returnToList} aria-label="포켓몬 목록으로 돌아가기"><ArrowLeft size={18} aria-hidden="true"/>목록</button><span className="rss-eyebrow">PARTNER DATA / GEN {focused.generation}</span><div className="rss-detail-identity"><div className="rss-detail-sprite"><PokemonImage mon={{ ...focused, shiny: draft.shiny }} variant="battle" eager/></div><div><h3 ref={detailHeading} tabIndex={-1}>{focused.name}</h3>{focused.formName && <p>{focused.formName}</p>}<span className="rss-type-row">{focused.types.map(type => <span key={type}>{type}</span>)}</span><span className="rss-detail-cost">{points(focused.cost)}<small>포인트</small>{!!focused.costReduction && <span>감소 {focused.costReduction}회</span>}</span></div></div></div>
        {!focused.unlocked && <div className="rss-lock-note"><LockKeyhole size={18} aria-hidden="true"/><div><b>아직 해금되지 않았습니다.</b><p>알 상점에서 구매한 알을 부화하면 스타터로 등록됩니다.</p></div></div>}
        <div className="rss-detail-body"><div className="rss-config-grid"><label className="rss-field" htmlFor={`${id}-ability`}><span>특성</span><select id={`${id}-ability`} value={draft.ability} disabled={locked || !focused.unlocked || !focused.abilities.length} onChange={event => updateDraft({ ability: event.target.value })}>{focused.abilities.length ? focused.abilities.map(ability => <option key={ability.key} value={ability.key}>{ability.name}</option>) : <option value="">포획 후 확인</option>}</select></label><label className="rss-field" htmlFor={`${id}-nature`}><span>성격</span><select id={`${id}-nature`} value={draft.nature} disabled={locked || !focused.unlocked || !focused.natures.length} onChange={event => updateDraft({ nature: event.target.value })}>{focused.natures.length ? focused.natures.map(nature => <option key={nature.key} value={nature.key}>{nature.name}</option>) : <option value="hardy">노력</option>}</select></label><label className="rss-field" htmlFor={`${id}-gender`}><span>성별</span><select id={`${id}-gender`} value={draft.gender} disabled={locked || !focused.unlocked || !focused.genders.length} onChange={event => updateDraft({ gender: event.target.value })}>{focused.genders.length ? focused.genders.map(gender => <option key={gender} value={gender}>{genderName(gender)}</option>) : <option value="N">성별 없음</option>}</select></label><div className="rss-field"><span>색상</span><div className="rss-shiny-controls"><button aria-pressed={!draft.shiny} className={!draft.shiny ? 'is-active' : ''} disabled={locked || !focused.unlocked} onClick={() => updateDraft({ shiny: false })}>일반</button><button aria-pressed={draft.shiny} className={draft.shiny ? 'is-active' : ''} disabled={locked || !focused.unlocked || !focused.shinyUnlocked} onClick={() => updateDraft({ shiny: true })} aria-label={focused.shinyUnlocked ? '색이 다른 모습 선택' : '색이 다른 포켓몬을 알 부화로 등록'}><Sparkles size={14} aria-hidden="true"/>{focused.shinyUnlocked ? '이로치' : <LockKeyhole size={13} aria-hidden="true"/>}</button></div></div></div>
          <div className="rss-stats"><div className="rss-section-heading"><h4>능력치와 영구 IV</h4><span>Lv.5 · EV 0</span></div><table><thead><tr><th scope="col">능력</th><th scope="col">능력치</th><th scope="col">IV / 31</th></tr></thead><tbody>{STAT_NAMES.map(([stat, name]) => <tr key={stat}><th scope="row">{name}{natureEffect?.[0] === stat ? <span className="rss-nature-up" aria-label="성격으로 상승">↑</span> : natureEffect?.[1] === stat ? <span className="rss-nature-down" aria-label="성격으로 하락">↓</span> : null}</th><td>{selectedStats[stat]}</td><td><span className="rss-iv-track" aria-hidden="true"><i style={{ transform: `scaleX(${Math.max(0, Math.min(1, focused.ivs[stat] / 31))})` }}/></span><b>{focused.ivs[stat]}</b></td></tr>)}</tbody></table><p>포획한 개체 중 능력별로 가장 높은 IV가 유지됩니다.</p></div>
          <fieldset className="rss-moves" disabled={locked || !focused.unlocked}><legend>출발 기술 <span>고유 기술 1–4개</span></legend>{[0, 1, 2, 3].map(slot => <label key={slot} className="rss-move"><span>0{slot + 1}</span><select aria-label={`${slot + 1}번 출발 기술`} value={draft.moves[slot] || ''} onChange={event => updateMove(slot, event.target.value)}><option value="">선택하지 않음</option>{[...new Set(focused.moves)].map(move => <option key={move} value={move} disabled={draft.moves.some((chosen, index) => index !== slot && chosen === move)}>{move}</option>)}</select></label>)}</fieldset>
          {onReduceCost && focused.unlocked && (focused.reductionCost || 0) > 0 && <div className="rss-candy"><div><b>스타터 비용 감소</b><span>보유 사탕 {focused.candies || 0}개</span></div><button className="rss-button rss-button-outline" disabled={locked || (focused.candies || 0) < (focused.reductionCost || 0)} onClick={() => void reduceCost()}><Minus size={15} aria-hidden="true"/>{reducing ? '적용 중…' : `사탕 ${focused.reductionCost}개 사용`}</button>{(focused.candies || 0) < (focused.reductionCost || 0) && <p>사탕 {(focused.reductionCost || 0) - (focused.candies || 0)}개가 더 필요합니다.</p>}</div>}
          <div className="rss-add-area">{selected ? <><p><Check size={16} aria-hidden="true"/>파티에 편성됨 · 설정 변경은 바로 적용됩니다.</p><button className="rss-button rss-button-outline" disabled><Check size={18} aria-hidden="true"/>파티 편성 완료</button><button className="rss-remove-link" disabled={locked} onClick={() => remove(focused.id)}>이 포켓몬을 파티에서 제외</button></> : <><button className="rss-button rss-button-primary" disabled={locked || !!addReason || !!draftError} onClick={addFocused}><Plus size={19} aria-hidden="true"/>파티에 추가<span>{points(focused.cost)} PT</span></button>{(addReason || draftError) && <p className="rss-add-reason">{addReason || draftError}</p>}</>}</div>
        </div></> : <div className="rss-detail-empty"><Users size={34} aria-hidden="true"/><h3>첫 파트너를 찾아보세요.</h3><p>목록에서 포켓몬을 고르면 능력과 출발 기술을 확인할 수 있습니다.</p></div>}</aside>
    </div>

    <div className="rss-run-note"><Flag size={20} aria-hidden="true"/><p><b>새 도전은 모두 Lv.5 · EV 0으로 출발합니다.</b> 이전 도전의 레벨과 도구는 초기화되고, 영구 IV와 알 부화 등록 기록은 유지됩니다. 스타팅 포켓몬 27종 중 무작위 1종이 처음 등록됩니다.</p></div>
    <div className="rss-status" role="status" aria-live="polite" aria-atomic="true">{status}</div>
    {(error || localError) && <p className="rss-error" role="alert">{error || localError}</p>}
    <div className="rss-launchbar"><div><span className="rss-eyebrow">READY FOR FLOOR 1?</span><b>{team.length ? `${team.length}마리와 출발 준비` : '파트너를 기다리고 있습니다.'}</b><p>{validation.error || `${points(validation.cost)} / ${points(budget)}포인트 · Lv.5로 출발합니다.`}</p></div><button className="rss-button rss-button-start" disabled={locked || !validation.valid} onClick={() => void start()}>{submitting || busy ? '팀을 준비하는 중…' : '이 파티로 도전 시작'}<ArrowRight size={21} aria-hidden="true"/></button></div>
    <p className="rss-key-help">방향키: 목록 이동 · Enter: 상세 확인 · Esc: 목록으로 돌아가기</p>
  </section>;
}
