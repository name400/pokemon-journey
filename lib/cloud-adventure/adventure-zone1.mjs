import {adventureDexEntries} from './adventure-dex.mjs';

// Species documented in Lumiose Wild Zone 1. Spawn weighting is provisional.
export const ZONE1_SPECIES=[13,16,172,179,659,661,664];
export function zone1Research(s){const seen=new Set(adventureDexEntries(s));const count=ZONE1_SPECIES.filter(id=>seen.has(id)).length;return {count,total:ZONE1_SPECIES.length,points:count===ZONE1_SPECIES.length?1000:0};}
export function zone1Encounter(rng=Math.random){const n=Math.floor(Math.max(0,Math.min(.999999999999,rng()))*ZONE1_SPECIES.length);return {speciesId:ZONE1_SPECIES[n],level:5};}
