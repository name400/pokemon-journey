export type Pokemon=Record<string,any>&{id:number;name:string;level:number;hp:number;maxHp:number;moves:string[];type:string;types:string[]};
export const species:(Pokemon&{speciesId:number;artId:number;defaultForm:boolean;legendary:boolean;generation:number})[];
export const moves:Record<string,{key:string;type:string;power:number;acc:number;pp:number;priority?:number;[key:string]:any}>;
export const stages:{name:string;kind:string;ids:number[]}[];
export function makeMon(id:number,level?:number):Pokemon;
export function effectiveness(type:string,defend:string|string[]):number;
export function pick<T>(a:T[],n?:number):T[];
