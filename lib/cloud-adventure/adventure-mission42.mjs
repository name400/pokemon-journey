// Zone 20: ruined Prism Tower, surrounding grass and paths. Exact geometry and
// individual wild Pokémon positions are provisional.
export const ZONE20_VISIBLE=[
 {id:'bulbasaur',tile:'a',species:1,level:55,name:'이상해씨',x:7,y:10},
 {id:'charmander',tile:'b',species:4,level:55,name:'파이리',x:16,y:11},
 {id:'lucario',tile:'c',species:448,level:55,name:'루카리오',x:9,y:9},
];
export function zone20Visible(s,tile){return ZONE20_VISIBLE.find(p=>p.tile===tile&&!s.zaZone20Spent?.[p.id])||null;}
export function zone20Map(s={}){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));for(let y=3;y<=12;y++)for(let x=5;x<=17;x++)g[y][x]='g';for(let y=8;y<=14;y++)g[y][11]=',';g[6][11]='n';g[15][11]='X';for(const p of ZONE20_VISIBLE)if(zone20Visible(s,p.tile)===p)g[p.y][p.x]=p.tile;return g.map(r=>r.join(''));}
export function zone20Encounter(s,rng=Math.random){const pool=[1,4,152,448],next=()=>Math.max(0,Math.min(.999999999999,rng()));return {speciesId:pool[Math.floor(next()*pool.length)],level:55};}
