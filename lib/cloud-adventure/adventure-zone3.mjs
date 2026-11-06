import {adventureDexEntries} from './adventure-dex.mjs';

// Six early Wild Zone 3 species; Flabébé appears during the day.
export const ZONE3_SPECIES=[672,667,25,677,674,669];
export function zone3Research(s){const seen=new Set(adventureDexEntries(s));const count=ZONE3_SPECIES.filter(id=>seen.has(id)).length;return {count,total:ZONE3_SPECIES.length,points:count===ZONE3_SPECIES.length?1000:0};}
// The current tile boundaries are provisional; habitats reflect the documented four gardens.
export function zone3Habitat(position){const {x,y}=position||{};if(!Number.isInteger(x)||!Number.isInteger(y))return null;if(x>=10&&x<=12&&y>=7&&y<=9)return 'center';if(x>=6&&x<=9&&y>=4&&y<=8)return 'northwest';if(x>=13&&x<=16&&y>=4&&y<=8)return 'northeast';if(x>=6&&x<=9&&y>=9&&y<=12)return 'southwest';if(x>=13&&x<=16&&y>=9&&y<=12)return 'southeast';return null;}
/** @param {{x?:number,y?:number}|null} position */
export function zone3Encounter(period,rng=Math.random,position=null){const fallback=period==='night'?ZONE3_SPECIES.filter(id=>id!==669):ZONE3_SPECIES;const pools={northwest:[667,674],northeast:[677],southwest:[672,674],southeast:[25],center:period==='night'?fallback:[669]};const pool=pools[zone3Habitat(position)]||fallback;const n=Math.floor(Math.max(0,Math.min(.999999999999,rng()))*pool.length);return {speciesId:pool[n],level:7};}
