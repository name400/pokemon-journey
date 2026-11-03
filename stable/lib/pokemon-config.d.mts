export type StatKey='hp'|'atk'|'def'|'spa'|'spd'|'spe';
export const statKeys:StatKey[];
export const rules:{moves:Record<string,any>;abilities:Record<string,{name:string}>;items:Record<string,{name:string}>;natures:Record<string,{name:string;plus?:string;minus?:string}>;species:Record<number,{key:string;abilities:string[];baseStats:Record<StatKey,number>}>};
export function defaultIVs():Record<StatKey,number>;
export function defaultEVs():Record<StatKey,number>;
export function learnableMoves(species:any,level:number):string[];
export function tutorMoves(mon:any):string[];
export function levelMoves(species:any,level:number):string[];
export function calculateStats(mon:any):Record<StatKey,number>;
export function configure(mon:any,patch?:any):any;
export const moveNameByKey:Record<string,string>;

export function tutorMoves(mon:any):string[];
