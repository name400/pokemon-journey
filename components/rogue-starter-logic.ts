export type StarterStat = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe';
export type StarterStats = Record<StarterStat, number>;
export type StarterEntry = {
  id: number;
  speciesId: number;
  sourceId?: number;
  formIndex?: number;
  artId: number;
  name: string;
  types: string[];
  generation: number;
  challengeRibbons?: {generations: number[]; types: number[]; other?: string[]};
  pokerus?: boolean;
  /** The current effective cost, including any permanent reductions. */
  cost: number;
  unlocked: boolean;
  ivs: StarterStats;
  /** Neutral-nature level-5 stats, with no EVs. */
  stats: StarterStats;
  abilities: Array<{ key: string; name: string }>;
  natures: Array<{ key: string; name: string }>;
  defaultNature?: string | null;
  genders: Array<'M' | 'F' | 'N'>;
  shinyUnlocked: boolean;
  shinyVariants?: number[];
  luck?: number;
  passive?: {key: string | null; name: string; unlocked: boolean; cost: number | null};
  moves: string[];
  defaultMoves: string[];
  candies?: number;
  sameEggCandies?: number;
  sameEggCost?: number | null;
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
  variant?: number;
  passive?: boolean;
  moves: string[];
};
export type StarterTeamValidation = { valid: boolean; cost: number; remaining: number; error: string | null };
export type StarterChallenge = { id: 0 | 1 | 5 | 6 | 8; value: number };
export const EXTRA_CHALLENGES: Array<{id: StarterChallenge['id']; name: string; options: string[]; description: string}> = [
 {id:5,name:'거꾸로 배틀',options:['켜기'],description:'타입의 약점과 내성이 반대로 적용됩니다. 특성·도구의 면역은 유지됩니다.'},
 {id:6,name:'종족값 반전',options:['켜기'],description:'모든 포켓몬의 HP·공격·방어·특공·특방·스피드 종족값 순서를 뒤집습니다.'},
 {id:8,name:'지원 제한',options:['구간 회복 금지','상점 금지','구간 회복·상점 금지'],description:'10층마다 회복 또는 전투 후 유료 보급을 제한합니다. 무료 보상은 받을 수 있습니다.'},
];
export const CHALLENGE_RIBBON_NAMES: Record<string,string> = {inverse:'거꾸로 배틀',flipStats:'종족값 반전',noHeal:'회복 금지',noShop:'상점 금지',noSupport:'지원 금지'};
export const CHALLENGE_TYPES = ['노말','격투','비행','독','땅','바위','벌레','고스트','강철','불꽃','물','풀','전기','에스퍼','얼음','드래곤','악','페어리'];
export type RogueStarterSelectProps = {
  starters: StarterEntry[];
  budget?: number;
  busy: boolean;
  error?: string;
  onStart: (team: StarterSelection[], challenges?: StarterChallenge[]) => Promise<unknown> | void;
  onCancel: () => void;
  onReduceCost?: (id: number) => Promise<unknown> | void;
  onBuySpeciesEgg?: (id:number,cost:number) => Promise<unknown> | void;
  onUnlockPassive?: (id: number, cost: number) => Promise<unknown> | void;
};

export function starterChallengeError(starters: StarterEntry[], team: StarterSelection[], generation: number, type: number): string | null {
  for (const choice of team) {
    const entry = starters.find(candidate => candidate.id === choice.id);
    if (!entry) return '스타터 정보를 다시 확인하세요.';
    if (generation && entry.generation !== generation) return `${entry.name}은(는) 선택한 세대에 속하지 않습니다.`;
    if (type && !entry.types.includes(CHALLENGE_TYPES[type - 1])) return `${entry.name}은(는) 선택한 타입이 아닙니다.`;
    const id = entry.sourceId ?? entry.speciesId;
    let required: string | null = null;
    if (generation === 4 && id === 280 || type === 2 && id === 280 || type === 3 && id === 412) required = 'M';
    if (generation === 4 && id === 361 || type === 8 && id === 361 || [5,9,12].includes(type) && id === 412) required = 'F';
    if (required && choice.gender !== required) return `${entry.name}의 성별이 선택한 챌린지 조건에 맞지 않습니다.`;
  }
  return null;
}


export const STAT_NAMES: Array<[StarterStat, string]> = [['hp', 'HP'], ['atk', '공격'], ['def', '방어'], ['spa', '특수공격'], ['spd', '특수방어'], ['spe', '스피드']];
export const NATURE_EFFECTS: Partial<Record<string, [StarterStat, StarterStat]>> = {
  lonely: ['atk', 'def'], brave: ['atk', 'spe'], adamant: ['atk', 'spa'], naughty: ['atk', 'spd'],
  bold: ['def', 'atk'], relaxed: ['def', 'spe'], impish: ['def', 'spa'], lax: ['def', 'spd'],
  timid: ['spe', 'atk'], hasty: ['spe', 'def'], jolly: ['spe', 'spa'], naive: ['spe', 'spd'],
  modest: ['spa', 'atk'], mild: ['spa', 'def'], quiet: ['spa', 'spe'], rash: ['spa', 'spd'],
  calm: ['spd', 'atk'], gentle: ['spd', 'def'], sassy: ['spd', 'spe'], careful: ['spd', 'spa'],
};
export const genderName = (gender: string) => gender === 'M' ? '수컷 ♂' : gender === 'F' ? '암컷 ♀' : '성별 없음';
const pointUnits = (value: number) => Math.round(value * 1000);
export const points = (value: number) => value.toLocaleString('ko-KR', { maximumFractionDigits: 3 });
export const normalizeMoves = (moves: readonly string[]) => moves.filter(Boolean);

/** Deterministic defaults can also be used by the server integration and unit checks. */
export function defaultStarterSelection(entry: StarterEntry): StarterSelection {
  const defaultMoves = [...new Set(entry.defaultMoves)].filter(move => entry.moves.includes(move)).slice(0, 4);
  return {
    id: entry.id,
    ability: entry.abilities[0]?.key || '',
    nature: entry.natures.find(nature => nature.key === entry.defaultNature)?.key || entry.natures.find(nature => nature.key === 'hardy')?.key || entry.natures[0]?.key || 'hardy',
    gender: entry.genders[0] || 'N',
    shiny: false,
    variant: entry.shinyVariants?.at(-1) ?? 0,
    passive: !!entry.passive?.unlocked,
    moves: defaultMoves.length ? defaultMoves : [...new Set(entry.moves)].slice(0, 4),
  };
}

export function starterCostTotal(starters: readonly StarterEntry[], team: readonly StarterSelection[]): number {
  const entries = new Map(starters.map(entry => [entry.id, entry]));
  return team.reduce((sum, member) => sum + pointUnits(entries.get(member.id)?.cost || 0), 0) / 1000;
}

export function starterSelectionError(entry: StarterEntry, selection: StarterSelection): string | null {
  if (!entry.unlocked) return '알을 부화하면 스타터로 등록됩니다.';
  if (selection.id !== entry.id) return '선택한 포켓몬 정보를 다시 확인하세요.';
  if (!entry.abilities.some(ability => ability.key === selection.ability)) return '해금된 특성을 선택하세요.';
  if (!entry.natures.some(nature => nature.key === selection.nature)) return '선택 가능한 성격을 골라주세요.';
  if (!entry.genders.some(gender => gender === selection.gender)) return '선택 가능한 성별을 골라주세요.';
  if (selection.shiny && !entry.shinyUnlocked) return '색이 다른 모습을 먼저 해금해야 합니다.';
  if (selection.shiny && selection.variant !== undefined && entry.shinyVariants && !entry.shinyVariants.includes(selection.variant)) return '해금한 이로치 변종을 선택하세요.';
  if (selection.passive && (!entry.passive?.unlocked || !entry.passive.key)) return '해금한 패시브 특성을 선택하세요.';
  if (selection.moves.length < 1 || selection.moves.length > 4) return '기술을 1개에서 4개까지 선택하세요.';
  if (new Set(selection.moves).size !== selection.moves.length) return '같은 기술을 두 번 선택할 수 없습니다.';
  if (selection.moves.some(move => !entry.moves.includes(move))) return '이 포켓몬이 사용할 수 있는 기술을 선택하세요.';
  return null;
}

export function starterAddReason(starters: readonly StarterEntry[], team: readonly StarterSelection[], id: number, budget = 10): string | null {
  const entry = starters.find(candidate => candidate.id === id);
  if (!entry) return '포켓몬 정보를 다시 불러와 주세요.';
  if (!entry.unlocked) return '알을 부화하면 스타터로 등록됩니다.';
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

