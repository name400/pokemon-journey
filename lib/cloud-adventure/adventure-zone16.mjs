// Bleu Plaza: central monument/water and northeastern Florges fountain. The
// ring crossings, dimensions and connection to adjacent Zone 5 are provisional.
export function zone16Unlocked(s){return ['C','B','A'].includes(s?.zaRoyaleRank)||s?.zaMission24Complete===true;}
export const ZONE16_VISIBLE=[
 {id:'flaaffy',tile:'a',species:180,level:40,name:'보송송',x:5,y:4},
 {id:'falinks',tile:'b',species:870,level:41,name:'대여르',x:11,y:14},
 {id:'medicham',tile:'c',species:308,level:40,name:'요가램',x:18,y:7},
];
export function zone16Visible(s,tile){return ZONE16_VISIBLE.find(p=>p.tile===tile&&!s.zaZone16Spent?.[p.id])||null;}
export function zone16Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=4;y<=12;y++)for(let x=6;x<=16;x++)if(y===4||y===12||x===6||x===16)g[y][x]='~';
 for(let x=9;x<=13;x++)for(let y=6;y<=10;y++)g[y][x]='g';
 g[8][11]='#';g[4][11]=',';g[12][11]=',';g[8][6]=',';g[8][16]=',';
 for(let y=3;y<=5;y++)for(let x=18;x<=20;x++)g[y][x]='~';g[4][19]='#'; // northeastern fountain
 for(let y=3;y<=5;y++)for(let x=3;x<=7;x++)g[y][x]='g';
 g[0][11]='X';for(const p of ZONE16_VISIBLE)if(!s.zaZone16Spent?.[p.id])g[p.y][p.x]=p.tile;
 return g.map(r=>r.join(''));
}
export function zone16Encounter(s,rng=Math.random){const pool=[[180,40,41],[870,41,42],[308,40,42]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}
