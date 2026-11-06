// Electrical substation yard: north access, buildings, sandy areas and central
// equipment are sourced; exact coordinates and the city connector are draft.
export function zone14Unlocked(s){return ['D','C','B','A'].includes(s?.zaRoyaleRank)||s?.zaMission19Complete===true||Number(s?.zaMission19Stage)>=16;}
export const ZONE14_VISIBLE=[
 {id:'aron',tile:'a',species:304,level:30,name:'가보리',x:11,y:3},
 {id:'lairon',tile:'b',species:305,level:39,name:'갱도라',x:4,y:4},
 {id:'emolga',tile:'c',species:587,level:37,name:'에몽가',x:6,y:4},
 {id:'drilbur',tile:'d',species:529,level:30,name:'두더류',x:10,y:9},
 {id:'excadrill',tile:'e',species:530,level:39,name:'몰드류',x:12,y:9},
 {id:'onix',tile:'f',species:95,level:38,name:'롱스톤',x:17,y:11},
];
export function zone14Visible(s,tile){return ZONE14_VISIBLE.find(p=>p.tile===tile&&!s.zaZone14Spent?.[p.id])||null;}
export function zone14Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=6;y<=7;y++)for(let x=3;x<=6;x++)g[y][x]='#';
 for(let y=4;y<=6;y++)for(let x=16;x<=19;x++)g[y][x]='#';
 for(let y=8;y<=11;y++)for(let x=8;x<=14;x++)g[y][x]='g';
 for(let y=10;y<=12;y++)for(let x=15;x<=19;x++)g[y][x]='g';
 for(let x=9;x<=13;x++)g[6][x]=','; // equipment pad
 g[0][11]='X';for(const p of ZONE14_VISIBLE)if(!s.zaZone14Spent?.[p.id])g[p.y][p.x]=p.tile;
 return g.map(r=>r.join(''));
}
// Helioptile's sunny-day condition is not approximated as an unconditional spawn.
export function zone14Encounter(s,rng=Math.random){const pool=[[304,28,30],[305,38,39],[529,28,30],[95,37,39],[587,36,37]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}
