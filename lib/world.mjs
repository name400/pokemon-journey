import {isAdventureBattleOnlyForm} from './adventure-battle-forms.mjs';
import {species} from './game.mjs';
export const MAP=[
'###############',
'#....gggg.....#',
'#.H..gggg..M..#',
'#....gggg.....#',
'#....gggg.....#',
'#.............#',
'#....ggg..gg..#',
'#....ggg..gg..#',
'#....ggg......#',
'#.............#',
'###############'];
export const STARTERS=[1,4,7];
export const WILD=[43,37,54,25,133,74,92,147];
const capsule=(price,name,entries)=>{const eligible=entries.filter(s=>!isAdventureBattleOnlyForm(s));return {price,name,pool:eligible.map(s=>s.id),weights:eligible.map(()=>1)};};
export const GACHA={meadow:capsule(1000,'일반 탐험 캡슐',species.filter(s=>!s.legendary&&s.defaultForm)),blaze:capsule(1500,'불꽃과 번개 캡슐',species.filter(s=>!s.legendary&&s.types.some(t=>['불꽃','전기'].includes(t))&&s.defaultForm)),rare:capsule(3000,'전설·환상 캡슐',species.filter(s=>s.legendary&&s.defaultForm)),all:capsule(5000,'전종·폼 캡슐',species)};
export const tier=score=>score>=1600?'마스터':score>=1400?'하이퍼':score>=1200?'슈퍼':'몬스터';
export function weighted(pool,weights,n){let total=weights.reduce((a,b)=>a+b,0),target=n*total;for(let i=0;i<pool.length;i++){target-=weights[i];if(target<0)return pool[i]}return pool.at(-1)}
