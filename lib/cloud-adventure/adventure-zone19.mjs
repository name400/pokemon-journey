// Jaune Sector 8: garden, hedges and central pavilion are documented.
// Tile geometry and the temporary direct Zone 8 connection are unverified.
export function zone19Unlocked(s){return ['B','A'].includes(s?.zaRoyaleRank)||s?.zaMission30Complete===true;}
export const ZONE19_VISIBLE=[
 {id:'furfrou',tile:'a',species:676,level:49,name:'트리미앙',x:5,y:7},
 {id:'kangaskhan',tile:'b',species:115,level:50,name:'캥카',x:18,y:4},
 {id:'audino',tile:'c',species:531,level:50,name:'다부니',x:16,y:12},
];
export function zone19Visible(s,tile){return ZONE19_VISIBLE.find(p=>p.tile===tile&&!s.zaZone19Spent?.[p.id])||null;}
export function zone19Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'g'));
 for(let y=2;y<=14;y++)g[y][11]=',';for(let x=2;x<=20;x++)g[8][x]=',';
 for(let x=8;x<=14;x++){g[5][x]='#';g[11][x]='#';}for(let y=6;y<=10;y++){g[y][8]='#';g[y][14]='#';}g[5][11]=',';g[11][11]=',';g[8][8]=',';g[8][14]=',';g[7][11]='#';
 for(let x=3;x<=7;x++)g[4][x]='#';for(let x=15;x<=19;x++)g[13][x]='#';
 g[16][11]='X';for(const p of ZONE19_VISIBLE)if(zone19Visible(s,p.tile)===p)g[p.y][p.x]=p.tile;
 return g.map(row=>row.join(''));
}
export function zone19Encounter(s,rng=Math.random){const pool=[[676,48,51],[531,50,51],[115,50,51]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}
