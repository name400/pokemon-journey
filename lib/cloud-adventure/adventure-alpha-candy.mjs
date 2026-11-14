// Exact per-encounter drop probabilities are not established; this is a
// provisional level-based distribution, not an original-game rate table.
// https://pokemondb.net/pokebase/435253/whats-everything-important-to-know-about-alphas-in-legends
export const ALPHA_CANDY_KEYS=Object.freeze(['za-exp-candy-xs','za-exp-candy-s','za-exp-candy-m','za-exp-candy-l']);
export function alphaCandyDrop(level,rng=Math.random){
 if(!Number.isInteger(level)||level<1||level>100)return null;
 const chance=rng();if(!Number.isFinite(chance)||chance<0||chance>=.5)return null;
 const amount=rng();if(!Number.isFinite(amount)||amount<0||amount>=1)return null;
 return {item:ALPHA_CANDY_KEYS[level<20?0:level<40?1:level<60?2:3],quantity:1+Math.floor(amount*3)};
}
export function validAlphaCandyPending(value){return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).every(k=>ALPHA_CANDY_KEYS.includes(k)&&Number.isSafeInteger(value[k])&&value[k]>=0);}
