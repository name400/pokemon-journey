import {adventureDexEntries} from './adventure-dex.mjs';

// Six documented zone-two species; Staryu appears there at night.
export const ZONE2_SPECIES=[14,504,688,129,406,120];
export function zone2Research(s){const seen=new Set(adventureDexEntries(s));const count=ZONE2_SPECIES.filter(id=>seen.has(id)).length;return {count,total:ZONE2_SPECIES.length,points:count===ZONE2_SPECIES.length?1000:0};}
export function zone2Encounter(period,rng=Math.random){const pool=period==='night'?ZONE2_SPECIES:ZONE2_SPECIES.filter(id=>id!==120);const n=Math.floor(Math.max(0,Math.min(.999999999999,rng()))*pool.length);return {speciesId:pool[n],level:6};}
