// The west courtyard, canal and rooftop form distinct traversal areas.
// Tile geometry and the temporary west city connector remain provisional.
export const ZONE10_VISIBLE=[
 {id:'slowpoke',tile:'a',species:79,level:31,name:'야돈',x:5,y:5,upper:false},
 {id:'bellsprout',tile:'b',species:69,level:30,name:'모다피',x:8,y:5,upper:false},
 {id:'carvanha',tile:'c',species:318,level:30,name:'샤프니아',x:11,y:8,upper:false,water:true},
 {id:'staryu',tile:'d',species:120,level:31,name:'별가사리',x:14,y:8,upper:false,water:true},
 {id:'arbok',tile:'a',species:24,level:31,name:'아보크',x:5,y:5,upper:true},
 {id:'watchog',tile:'b',species:505,level:31,name:'보르그',x:11,y:5,upper:true},
];
export function zone10Visible(s,tile){return ZONE10_VISIBLE.find(p=>p.upper===(s.zaZone10Upper===true)&&p.tile===tile&&!s.zaZone10Spent?.[p.id])||null;}
export function zone10Map(s={}){
 const upper=s.zaZone10Upper===true,g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':upper?'#':'.'));
 if(upper){for(let y=3;y<=7;y++)for(let x=3;x<=19;x++)g[y][x]='.';for(let y=4;y<=6;y++)for(let x=7;x<=13;x++)g[y][x]='g';}
 else{for(let y=8;y<=12;y++)for(let x=3;x<=19;x++)g[y][x]='~';for(let y=4;y<=6;y++)for(let x=3;x<=9;x++)g[y][x]='g';g[6][0]='W';}
 g[4][17]='l';for(const p of ZONE10_VISIBLE)if(p.upper===upper&&!s.zaZone10Spent?.[p.id])g[p.y][p.x]=p.tile;
 return g.map(r=>r.join(''));
}
export function zone10Encounter(s,rng=Math.random){const pool=s.zaZone10Upper===true?[[24,31,33],[505,30,32]]:[[79,30,32],[69,29,31]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}
