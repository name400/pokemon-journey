// Jaune Plaza: central dirt and a surrounding sand ring. Grid dimensions,
// entrances and fixed field positions are draft representations.
export const ZONE8_VISIBLE=[{id:'numel',tile:'a',species:322,level:23,name:'둔타',x:6,y:12},{id:'machop',tile:'b',species:66,level:24,name:'알통몬',x:10,y:7},{id:'gible',tile:'c',species:443,level:24,name:'딥상어동',x:14,y:8}];
export function zone8Visible(s,tile){return ZONE8_VISIBLE.find(p=>p.tile===tile&&!s.zaZone8Spent?.[p.id])||null;}
export function zone8Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=2;y<=14;y++)for(let x=2;x<=20;x++){const r=((x-11)/9)**2+((y-8)/6)**2;if(r<=1)g[y][x]=r>.45?'g':',';}
 for(let y=6;y<=10;y++)for(let x=8;x<=14;x++)g[y][x]='g';
 g[16][11]='X';for(const p of ZONE8_VISIBLE)if(!s.zaZone8Spent?.[p.id])g[p.y][p.x]=p.tile;
 return g.map(row=>row.join(''));
}
// Species and approximate levels follow source lists; weights are provisional.
export function zone8Encounter(s,rng=Math.random){const central=s.x>=7&&s.x<=15&&s.y>=5&&s.y<=11,pool=central?[[66,24,26],[443,24,25],[529,23,25]]:[[322,23,24],[551,23,24],[552,29,30],[529,23,25]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}
