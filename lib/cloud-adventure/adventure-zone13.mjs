// A wooded section along North Boulevard. Exact trees, gates and city
// connector positions are provisional, while west/east path relations are sourced.
export const ZONE13_VISIBLE=[
 {id:'heracross',tile:'a',species:214,level:37,name:'헤라크로스',x:5,y:6},
 {id:'pinsir',tile:'b',species:127,level:37,name:'쁘사이저',x:11,y:11},
];
export function zone13Visible(s,tile){return ZONE13_VISIBLE.find(p=>p.tile===tile&&!s.zaZone13Spent?.[p.id])||null;}
export function zone13Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=3;y<=6;y++)for(let x=3;x<=19;x++)g[y][x]='g';
 for(let y=10;y<=13;y++)for(let x=3;x<=19;x++)g[y][x]='g';
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 g[8][0]='W';for(const p of ZONE13_VISIBLE)if(!s.zaZone13Spent?.[p.id])g[p.y][p.x]=p.tile;
 return g.map(r=>r.join(''));
}
export function zone13Encounter(period,rng=Math.random){const pool=period==='night'?[[708,36,37],[123,37,39],[214,36,38],[127,36,38]]:[[666,36,37],[70,36,37],[214,36,38],[127,36,38]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}
