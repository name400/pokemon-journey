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
    accuracy: typeof move.accuracy === 'number' ? `${move.accuracy}%` : '—',
    category: categoryName(move.category),
  };
}

