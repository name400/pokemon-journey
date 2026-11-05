export type ClassicRewardMove = { index: number; name: string; pp: number; maxPp: number; canBoostPP?: boolean };
export type ClassicRewardTarget = {
  boxId: string;
  name: string;
  hp: number;
  maxHp: number;
  eligible: boolean;
  reason?: string;
  moves?: ClassicRewardMove[];
  learnableMoves?: string[];
};
export type RewardChoice = {
  id: string;
  name: string;
  description: string;
  image: string;
  tier: 0 | 1 | 2 | 3 | 4;
  quantity?: number;
  requiresTarget?: boolean;
  requiresFusion?: boolean;
  fusionPairs?: {primaryBoxId:string;donorBoxId:string}[];
  requiresMove?: boolean;
  moveSelectionMode?: 'ppup';
  requiresReplace?: boolean;
  requiresNewMove?: boolean;
  targets?: ClassicRewardTarget[];
  moveName?: string;
  moveDescription?: string;
  movePower?: number;
  moveCategory?: string;
  moveAccuracy?: number | boolean;
  moveType?: string;
  stackText?: string;
  disabledReason?: string;
};
export type ServiceChoice = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  requiresTarget?: boolean;
  requiresMove?: boolean;
  requiresReplace?: boolean;
  requiresNewMove?: boolean;
  targets?: ClassicRewardTarget[];
  disabledReason?: string;
};
export type ClassicRewardMon = {
  id: number | string;
  boxId: string;
  name: string;
  hp: number;
  maxHp: number;
  artId?: number | string;
  level?: number;
  shiny?: boolean;
};
export type RewardPayload = { rewardId: string; donorBoxId?: string; confirmFusion?: boolean; boxId?: string; moveIndex?: number; replaceIndex?: number; moveName?: string };
export type ServicePayload = { itemId: string; boxId?: string; moveIndex?: number; replaceIndex?: number; moveName?: string; expectedPrice: number };
export type RogueClassicRewardsProps = {
  wave: number;
  party: ClassicRewardMon[];
  money: number;
  choices: RewardChoice[];
  services: ServiceChoice[];
  rerollCost: number;
  rerolls: number;
  busy: boolean;
  error?: string;
  notice?: string;
  onChoose: (payload: RewardPayload) => Promise<unknown> | void;
  onService: (payload: ServicePayload) => Promise<unknown> | void;
  onReroll: () => Promise<unknown> | void;
  onOpenParty?: () => void;
  onEmptyContinue?: () => Promise<unknown> | void;
};

export type ActionChoice = RewardChoice | ServiceChoice;
export type Configuration = { boxId?: string; donorBoxId?: string; confirmFusion?: boolean; moveIndex?: number; replaceIndex?: number; moveName?: string };

export const moneyText = (value: number) => value.toLocaleString('ko-KR');
export const requiresReplacement = (choice: ActionChoice) => 'requiresReplace' in choice && !!choice.requiresReplace;
export const emptyMoveSlot = (target?: ClassicRewardTarget) => { const slots=target?.moves; return Array.isArray(slots) ? [0,1,2,3].find(index=>!slots.some(move=>move.index===index)) : undefined; };
export const requiresRewardTarget = (choice: ActionChoice) => !!choice.requiresTarget || !!choice.requiresMove || !!choice.requiresNewMove || requiresReplacement(choice);

/** Eligibility comes from the service/reward response; HP never decides it here. */
export function automaticRewardTarget(targets: readonly ClassicRewardTarget[] = []): string | undefined {
  const eligible = targets.filter(target => target.eligible);
  return eligible.length === 1 ? eligible[0].boxId : undefined;
}
export function eligibleRewardMoves(target?: ClassicRewardTarget, choice?: ActionChoice): ClassicRewardMove[] {
  return (target?.moves || []).filter(move => choice && 'moveSelectionMode' in choice && choice.moveSelectionMode === 'ppup' ? !!move.canBoostPP : move.pp < move.maxPp);
}
export function rewardTargetBlockReason(choice: ActionChoice): string | null {
  if (!requiresRewardTarget(choice)) return null;
  if (!choice.targets?.length) return '적용할 대상 정보가 없습니다.';
  if (!choice.targets.some(target => target.eligible)) return choice.targets.find(target => target.reason)?.reason || '현재 적용할 수 있는 포켓몬이 없습니다.';
  return null;
}
export function rewardActionError(choice: ActionChoice, configuration: Configuration): string | null {
  if ('disabledReason' in choice && choice.disabledReason) return choice.disabledReason;
  let target: ClassicRewardTarget | undefined;
  if (requiresRewardTarget(choice)) {
    target = choice.targets?.find(candidate => candidate.boxId === configuration.boxId);
    if (!target) return '아이템을 사용할 포켓몬을 선택하세요.';
    if (!target.eligible) return target.reason || '이 포켓몬에게는 사용할 수 없습니다.';
  }
  if ('requiresFusion' in choice && choice.requiresFusion && (!configuration.confirmFusion || !choice.fusionPairs?.some(pair=>pair.primaryBoxId===configuration.boxId&&pair.donorBoxId===configuration.donorBoxId))) return '두 번째 포켓몬과 소모 확인을 선택하세요.';
  if (choice.requiresMove && !eligibleRewardMoves(target, choice).some(move => move.index === configuration.moveIndex)) return 'moveSelectionMode' in choice && choice.moveSelectionMode === 'ppup' ? '최대 PP를 늘릴 수 있는 기술을 선택하세요.' : 'PP가 줄어든 기술을 선택하세요.';
  if (choice.requiresNewMove && (!configuration.moveName || !target?.learnableMoves?.includes(configuration.moveName))) return '다시 배울 수 있는 기술을 선택하세요.';
  const replacement=emptyMoveSlot(target) ?? configuration.replaceIndex;
  if (requiresReplacement(choice) && (!Number.isInteger(replacement) || Number(replacement) < 0 || Number(replacement) > 3)) return '잊을 기술을 선택하세요.';
  return null;
}
export function servicePurchaseError(service: ServiceChoice, money: number): string | null {
  if (service.disabledReason) return service.disabledReason;
  if (money < service.price) return `${moneyText(service.price - money)}원이 부족합니다.`;
  return rewardTargetBlockReason(service);
}

