// Magenta Sector 9: Northern Street and a ground-level grass patch are
// documented. Tile geometry and this draft's exact street connection are not.
export function zone18Unlocked(s){return ['B','A'].includes(s?.zaRoyaleRank)||s?.zaMission30Complete===true;}
export const ZONE18_VISIBLE=[
 {id:'bagon',tile:'a',species:371,level:45,name:'아공이',x:8,y:8},
 {id:'salamence-alpha',tile:'b',species:373,level:62,name:'보만다',x:14,y:8,alpha:true},
];
export function zone18Visible(s,tile){return ZONE18_VISIBLE.find(p=>p.tile===tile&&!s.zaZone18Spent?.[p.id])||null;}
export function zone18Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=6;y<=10;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=6;y<=10;y++)for(let x=4;x<=9;x++)g[y][x]='g';
 for(let y=2;y<=5;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 g[8][0]='W';for(const p of ZONE18_VISIBLE)if(zone18Visible(s,p.tile)===p)g[p.y][p.x]=p.tile;
 return g.map(row=>row.join(''));
}
export function zone18Encounter(s,rng=Math.random){const next=()=>Math.max(0,Math.min(.999999999999,rng()));return {speciesId:371,level:44+Math.floor(next()*2)};}
