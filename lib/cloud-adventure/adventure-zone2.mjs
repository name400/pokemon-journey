import {adventureDexEntries} from './adventure-dex.mjs';

// Six documented zone-two species; Staryu appears there at night.
export const ZONE2_SPECIES=[14,504,688,129,406,120];
export function zone2Research(s){const seen=new Set(adventureDexEntries(s));const count=ZONE2_SPECIES.filter(id=>seen.has(id)).length;return {count,total:ZONE2_SPECIES.length,points:count===ZONE2_SPECIES.length?1000:0};}
// Provisional regions in the current tile draft, not original spawn coordinates.
export function zone2Habitat(position){const {x,y}=position||{};if(!Number.isInteger(x)||!Number.isInteger(y))return null;if((x>=9&&x<=10&&y>=13&&y<=14)||(x===5&&y>=2&&y<=3))return 'gate';if(x>=6&&x<=8&&y>=4&&y<=6)return 'trees';if(x>=9&&x<=13&&y>=6&&y<=9)return 'island';if(x===16&&y>=5&&y<=11)return 'shore';return null;}
/** @param {{x?:number,y?:number}|null} position */
export function zone2Encounter(period,rng=Math.random,position=null){const habitat=zone2Habitat(position),pools={gate:[406],trees:[14,406],island:[504,688],shore:period==='night'?[120,129]:[129]};const pool=pools[habitat]||(period==='night'?ZONE2_SPECIES:ZONE2_SPECIES.filter(id=>id!==120));const n=Math.floor(Math.max(0,Math.min(.999999999999,rng()))*pool.length);return {speciesId:pool[n],level:6};}
