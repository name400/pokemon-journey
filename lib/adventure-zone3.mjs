import {adventureDexEntries} from './adventure-dex.mjs';

// Six early Wild Zone 3 species; Flabébé appears during the day.
export const ZONE3_SPECIES=[672,667,25,677,674,669];
export function zone3Research(s){const seen=new Set(adventureDexEntries(s));const count=ZONE3_SPECIES.filter(id=>seen.has(id)).length;return {count,total:ZONE3_SPECIES.length,points:count===ZONE3_SPECIES.length?1000:0};}
// Provisional uniform selection and level; original positions and rates differ.
export function zone3Encounter(period,rng=Math.random){const pool=period==='night'?ZONE3_SPECIES.filter(id=>id!==669):ZONE3_SPECIES;const n=Math.floor(Math.max(0,Math.min(.999999999999,rng()))*pool.length);return {speciesId:pool[n],level:7};}
