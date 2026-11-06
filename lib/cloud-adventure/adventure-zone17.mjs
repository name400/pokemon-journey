// Vert Sector 7: stairs, ground habitat and nearby rooftops are documented;
// tile geometry and the temporary Vert Sector connection are unverified.
export function zone17Unlocked(s){return ['C','B','A'].includes(s?.zaRoyaleRank)||s?.zaMission25Complete===true;}
export const ZONE17_VISIBLE=[
 {id:'chespin',tile:'a',species:650,level:22,name:'도치마론',x:5,y:7},
 {id:'diggersby',tile:'b',species:660,level:45,name:'파르토',x:9,y:11},
 {id:'klefki',tile:'c',species:707,level:45,name:'클레피',x:17,y:9},
 {id:'pyroar',tile:'d',species:668,level:45,name:'화염레오',x:16,y:5},
 {id:'pyroar-alpha',tile:'e',species:668,level:56,name:'화염레오',x:17,y:6,alpha:true},
 {id:'mawile-alpha',tile:'e',species:303,level:56,name:'입치트',x:14,y:7,alpha:true,upper:true},
];
export function zone17Visible(s,tile){return ZONE17_VISIBLE.find(p=>p.tile===tile&&!!p.upper===(s.zaZone17Upper===true)&&!s.zaZone17Spent?.[p.id])||null;}
export const ZONE17_ITEMS=[{id:'stairs-timer',tile:'i',x:14,y:11,name:'타이머볼',kind:'timerball'}];
export function zone17Item(s,tile){return s.zaZone17Upper?null:ZONE17_ITEMS.find(p=>p.tile===tile&&!(Array.isArray(s.zaZone17Items)&&s.zaZone17Items.includes(p.id)))||null;}
export function zone17Map(s={}){
 const upper=s.zaZone17Upper===true;
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 if(upper){for(let y=4;y<=11;y++)for(let x=5;x<=17;x++)g[y][x]='.';for(let x=0;x<23;x++){g[0][x]='#';g[16][x]='#';}for(let y=1;y<16;y++)for(let x=1;x<22;x++)if(y<4||y>11||x<5||x>17)g[y][x]='#';g[10][6]='l';for(const p of ZONE17_VISIBLE)if(zone17Visible(s,p.tile)===p)g[p.y][p.x]=p.tile;return g.map(row=>row.join(''));}
 for(let y=5;y<=12;y++)for(let x=3;x<=19;x++)g[y][x]='g';
 for(let y=2;y<=4;y++)for(let x=3;x<=8;x++)g[y][x]='#';
 for(let y=2;y<=4;y++)for(let x=14;x<=19;x++)g[y][x]='#';
 for(let y=5;y<=15;y++)g[y][11]=',';
 g[0][11]='X';g[16][11]='X';g[8][0]='W';g[6][13]='l';for(const p of ZONE17_ITEMS)if(zone17Item(s,p.tile))g[p.y][p.x]=p.tile;for(const p of ZONE17_VISIBLE)if(zone17Visible(s,p.tile)===p)g[p.y][p.x]=p.tile;
 return g.map(row=>row.join(''));
}
export function zone17Encounter(s,rng=Math.random){const pool=[[650,20,25],[660,44,46],[707,44,46],[668,44,47]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}
