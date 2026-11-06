// Wild Zone 6's north/south access, canal and rooftop context are source based.
// Individual tile positions, bridge shape and intermediate city link are drafts.
export const ZONE6_VISIBLE=[{id:'houndour',tile:'a',species:228,level:18,name:'델빌',x:6,y:5},{id:'meditite',tile:'b',species:307,level:20,name:'요가랑',x:15,y:5},{id:'buneary',tile:'d',species:427,level:18,name:'이어롤',x:8,y:13}];
export function zone6Visible(s,tile){return ZONE6_VISIBLE.find(p=>p.tile===tile&&!s.zaZone6Spent?.[p.id])||null;}
export function zone6Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=9;y<=12;y++)for(let x=1;x<=21;x++)g[y][x]='~';
 for(let y=9;y<=12;y++)for(let x=10;x<=12;x++)g[y][x]=';';
 for(let y=3;y<=7;y++)for(let x=3;x<=8;x++)g[y][x]='g';
 for(let y=3;y<=6;y++)for(let x=13;x<=16;x++)g[y][x]='g';
 g[0][11]='X';g[16][11]='X';g[3][18]='q';for(const p of ZONE6_VISIBLE)if(!s.zaZone6Spent?.[p.id])g[p.y][p.x]=p.tile;
 return g.map(row=>row.join(''));
}
// Initial ground species and source level ranges; probabilities are provisional.
export function zone6Encounter(rng=Math.random){const pool=[[228,17,18],[307,19,20],[427,17,18]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}
