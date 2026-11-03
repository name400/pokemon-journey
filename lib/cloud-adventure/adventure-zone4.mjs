import {adventureDexEntries} from './adventure-dex.mjs';

// The six ordinary Wild Zone 4 species; the mission Sableye is separate.
export const ZONE4_SPECIES=[23,92,167,504,665,679];
const LEVELS={23:[8,10],92:[9,10],167:[7,8],504:[8,9],665:[9,10],679:[10,11]};
const index=(rng,size)=>Math.floor(Math.max(0,Math.min(.999999999999,rng()))*size);
export function zone4Research(s){const seen=new Set(adventureDexEntries(s));const count=ZONE4_SPECIES.filter(id=>seen.has(id)).length;return {count,total:ZONE4_SPECIES.length,points:count===ZONE4_SPECIES.length?1000:0};}
// Uniform selection is provisional; disputed Ekans and Patrat time restrictions remain unrestricted.
export function zone4Encounter(period,rng=Math.random){const pool=ZONE4_SPECIES.filter(id=>period==='night'?id!==665:id!==679),speciesId=pool[index(rng,pool.length)],[min,max]=LEVELS[speciesId];return {speciesId,level:min+index(rng,max-min+1)};}
