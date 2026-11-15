import {adventureDexEntries} from './adventure-dex.mjs';

// Species documented in Lumiose Wild Zone 1. Spawn weighting is provisional.
export const ZONE1_SPECIES=[13,16,172,179,659,661,664];
export function zone1Research(s){const seen=new Set(adventureDexEntries(s));const count=ZONE1_SPECIES.filter(id=>seen.has(id)).length;return {count,total:ZONE1_SPECIES.length,points:count===ZONE1_SPECIES.length?1000:0};}
// Ordinary species ranges; equal species and level weights are provisional.
// https://www.serebii.net/pokearth/lumiosecity/wildzone1.shtml
const ZONE1_LEVELS={13:[3,4],16:[3,5],172:[4,5],179:[3,5],659:[3,4],661:[3,4],664:[3,4]};
export function zone1Encounter(rng=Math.random){const next=()=>Math.max(0,Math.min(.999999999999,rng())),n=Math.floor(next()*ZONE1_SPECIES.length),speciesId=ZONE1_SPECIES[n],[min,max]=ZONE1_LEVELS[speciesId];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}

// Source lists 5% alpha variants and these level ranges for Zone 1 spawns.
// https://www.serebii.net/pokearth/lumiosecity/wildzone1.shtml
const ZONE1_RANDOM_ALPHA_LEVELS={13:[15,16],16:[15,17],172:[16,17],179:[15,17],659:[15,16],661:[15,16],664:[15,16]};
export function zone1RandomAlphaLevel(s,speciesId,rng=Math.random){
 const range=ZONE1_RANDOM_ALPHA_LEVELS[speciesId];if(!range||!(s?.zaMission05Complete===true||s?.zaMission06Started===true))return null;
 const research=zone1Research(s);if(research.count!==research.total||rng()>=0.05)return null;
 return range[0]+Math.floor(Math.max(0,Math.min(.999999999999,rng()))*(range[1]-range[0]+1));
}
