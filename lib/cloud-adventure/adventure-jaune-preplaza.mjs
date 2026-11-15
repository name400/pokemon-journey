import {zone7Unlocked} from './adventure-zone7.mjs';

// The early market and later Wild Zone are different states of Jaune Plaza.
// Exact paths, stalls and their arrangement are a 2D approximation.
// https://bulbapedia.bulbagarden.net/wiki/Jaune_Plaza
export function jaunePrePlazaAvailable(s){
 if(!s||!['Z','Y','X','W','V'].includes(s.zaRoyaleRank)||zone7Unlocked(s))return false;
 for(const key of ['zaMission10Stage','zaMission14Stage','zaMission15Stage'])if(s[key]!==undefined&&(!Number.isSafeInteger(s[key])||s[key]<0))return false;
 if(s.zaMysteryTrail!==undefined&&s.zaMysteryTrail!==false&&(!Number.isSafeInteger(s.zaMysteryTrail)||s.zaMysteryTrail<0))return false;
 return true;
}
export function jaunePrePlazaMap(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=3;y<=13;y++)for(let x=3;x<=19;x++)if(((x-11)/8)**2+((y-8)/5)**2<=1)g[y][x]=',';
 if(jaunePrePlazaAvailable(s))for(const [x,y] of [[7,5],[11,5],[15,5],[8,9],[14,9]])g[y][x]='^';
 g[16][11]='X';return g.map(row=>row.join(''));
}
const PRE_BERRIES=Object.freeze([
 Object.freeze(['kasibberry','habanberry','colburberry','babiriberry','chilanberry','roseliberry']),
 Object.freeze(['kebiaberry','shucaberry','cobaberry','payapaberry','tangaberry','chartiberry']),
 Object.freeze(['occaberry','passhoberry','wacanberry','rindoberry','yacheberry','chopleberry']),
]);
export function jaunePrePlazaBerryStock(s,spot){
 if(s?.district!=='lumiose-jaune-preplaza'||s.interior||!jaunePrePlazaAvailable(s)||spot?.tile!=='^'||spot.y!==5)return null;
 const index=[7,11,15].indexOf(spot.x);return index<0?null:PRE_BERRIES[index];
}
