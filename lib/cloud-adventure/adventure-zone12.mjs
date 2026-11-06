// Snow park with a northwestern court and water. Exact shore and gate geometry
// and its temporary city connector are provisional.
export const ZONE12_VISIBLE=[
 {id:'delibird',tile:'a',species:225,level:34,name:'딜리버드',x:4,y:10},
 {id:'machoke',tile:'b',species:67,level:35,name:'근육몬',x:6,y:4},
 {id:'snover',tile:'c',species:459,level:33,name:'눈쓰개',x:12,y:11},
 {id:'bergmite',tile:'d',species:712,level:33,name:'꽁어름',x:15,y:7,water:true},
 {id:'snorunt',tile:'e',species:361,level:34,name:'눈꼬마',x:10,y:8},
 {id:'gogoat',tile:'f',species:673,level:34,name:'고고트',x:17,y:4},
];
export function zone12Visible(s,tile){return ZONE12_VISIBLE.find(p=>p.tile===tile&&!s.zaZone12Spent?.[p.id])||null;}
export function zone12Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=3;y<=6;y++)for(let x=3;x<=8;x++)g[y][x]=','; // northwestern battle court
 for(let y=6;y<=9;y++)for(let x=15;x<=19;x++)g[y][x]='~';
 for(let y=8;y<=12;y++)for(let x=7;x<=13;x++)g[y][x]='g';
 g[10][0]='W';for(const p of ZONE12_VISIBLE)if(!s.zaZone12Spent?.[p.id])g[p.y][p.x]=p.tile;
 return g.map(r=>r.join(''));
}
export function zone12Encounter(s,rng=Math.random){const pool=[[225,32,35],[459,32,33],[361,32,34],[673,32,34]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}
