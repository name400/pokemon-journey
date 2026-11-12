// Jaune Plaza: central dirt and a surrounding sand ring. Grid dimensions,
// entrances and fixed field positions are draft representations.
export const ZONE8_VISIBLE=[{id:'numel',tile:'a',species:322,level:23,name:'둔타',x:6,y:12},{id:'machop',tile:'b',species:66,level:24,name:'알통몬',x:10,y:7},{id:'gible',tile:'c',species:443,level:24,name:'딥상어동',x:14,y:8},{id:'camerupt-alpha',tile:'d',species:323,level:40,name:'폭타',x:8,y:10,alpha:true},{id:'krokorok-alpha',tile:'e',species:552,level:38,name:'악비르',x:18,y:8,alpha:true}];
export function zone8Visible(s,tile){return ZONE8_VISIBLE.find(p=>p.tile===tile&&!s.zaZone8Spent?.[p.id])||null;}
export const ZONE8_ITEMS=[{id:'north-great',tile:'i',x:11,y:3,name:'슈퍼볼',kind:'greatball'},{id:'east-great',tile:'j',x:19,y:7,name:'슈퍼볼',kind:'greatball'},{id:'center-hyper',tile:'k',x:12,y:6,name:'고급상처약',kind:'hyper_potions'},{id:'center-heal',tile:'l',x:12,y:10,name:'힐볼',kind:'healball'}];
export function zone8Item(s,tile){return ZONE8_ITEMS.find(p=>p.tile===tile&&!(Array.isArray(s.zaZone8Items)&&s.zaZone8Items.includes(p.id)))||null;}
// Stalls on the east and south sides are documented; tile positions are draft.
// https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_8
export const ZONE8_STALLS=[[21,8],[15,15]];
export function zone8Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=2;y<=14;y++)for(let x=2;x<=20;x++){const r=((x-11)/9)**2+((y-8)/6)**2;if(r<=1)g[y][x]=r>.45?'g':',';}
 for(let y=6;y<=10;y++)for(let x=8;x<=14;x++)g[y][x]='g';
 for(const [x,y] of ZONE8_STALLS)g[y][x]='^';
 g[16][9]='X';g[16][11]='X';g[0][19]='X';g[0][11]='X';g[10][22]='X';for(const p of ZONE8_VISIBLE)if(!s.zaZone8Spent?.[p.id])g[p.y][p.x]=p.tile;for(const p of ZONE8_ITEMS)if(zone8Item(s,p.tile))g[p.y][p.x]=p.tile;
 return g.map(row=>row.join(''));
}
// Species and approximate levels follow source lists; weights are provisional.
export function zone8Encounter(s,rng=Math.random){const central=s.x>=7&&s.x<=15&&s.y>=5&&s.y<=11,pool=central?[[66,24,26],[443,24,25],[529,23,25]]:[[322,23,24],[551,23,24],[552,29,30],[529,23,25]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}

// Original stock; east/south assignment is an approximate mapping to this 2D draft.
export const ZONE8_BERRY_STOCK=Object.freeze([
 Object.freeze(['pomegberry','kelpsyberry','qualotberry','hondewberry','grepaberry','tamatoberry']),
 Object.freeze(['occaberry','passhoberry','wacanberry','rindoberry','yacheberry','chopleberry']),
]);
export function zone8BerryStock(s,spot){if(s?.district!=='lumiose-zone8'||s.interior||spot?.tile!=='^')return null;const index=ZONE8_STALLS.findIndex(([x,y])=>spot.x===x&&spot.y===y);return ZONE8_BERRY_STOCK[index]||null;}
