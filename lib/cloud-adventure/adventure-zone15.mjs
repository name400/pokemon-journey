// Narrow North Boulevard / Jaune Sector area with a central grassy oval and
// Café Ultimo. Exact geometry and city connection are provisional.
export const ZONE15_VISIBLE=[
 {id:'pumpkaboo',tile:'a',species:710,level:42,name:'호바귀',x:11,y:8},
 {id:'scolipede',tile:'b',species:545,level:42,name:'펜드라',x:5,y:11,period:'day'},
 {id:'shuppet',tile:'b',species:353,level:40,name:'어둠대신',x:5,y:11,period:'night'},
];
export function zone15Visible(s,tile){return ZONE15_VISIBLE.find(p=>p.tile===tile&&(!p.period||p.period===(s.zaZone15Period||'day'))&&!s.zaZone15Spent?.[p.id])||null;}
export function zone15Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=6;y<=10;y++)for(let x=8;x<=14;x++)if(((x-11)/3)**2+((y-8)/2)**2<=1)g[y][x]='g';
 for(let y=10;y<=13;y++)for(let x=3;x<=7;x++)g[y][x]='g';
 for(let y=3;y<=5;y++)for(let x=16;x<=19;x++)g[y][x]='#';
 g[6][17]='q';g[8][0]='W';for(const p of ZONE15_VISIBLE)if(zone15Visible(s,p.tile)===p)g[p.y][p.x]=p.tile;
 return g.map(r=>r.join(''));
}
export function zone15Encounter(period,rng=Math.random){const pool=period==='night'?[[710,42,43],[353,40,41],[93,40,41]]:[[710,42,43],[545,42,43],[544,40,41],[15,41,42]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}
