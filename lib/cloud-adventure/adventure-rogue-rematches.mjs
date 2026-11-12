import {MISSION15_CASES} from './adventure-mission15.mjs';
import {MISSION20_CASES} from './adventure-mission20.mjs';
import {MISSION26_CASES} from './adventure-mission26-cases.mjs';
import {MISSION31_CASES} from './adventure-mission31-cases.mjs';

// Base-story simulators only; boss moves not documented in the existing
// dataset fall back to the engine's normal level-up moves.
// https://www.serebii.net/legendsz-a/roguerematch.shtml
export const ROGUE_REMATCHES=Object.freeze([
 {id:'absol',name:'메가앱솔',species:10057},
 {id:'slowbro',name:'메가야도란',species:10071,moves:['물의파동','환상빔']},
 {id:'camerupt',name:'메가폭타',species:10087,moves:['대지의힘','박치기']},
 {id:'victreebel',name:'메가우츠보트',species:10279,moves:['씨기관총','덩굴채찍']},
 ...[...MISSION15_CASES,...MISSION20_CASES,...MISSION26_CASES,...MISSION31_CASES].map(({id,name,species,moves})=>({id,name,species,...(moves?{moves}: {})})),
]);
export function rogueRematch(id){return ROGUE_REMATCHES.find(p=>p.id===id)||null;}
export function rogueRematchUnlocked(s){return s?.zaMission41Complete===true;}
export function rogueRematchPending(s){const n=s?.zaRogueRematchCandyPending;return Number.isSafeInteger(n)&&n>0?n:0;}
