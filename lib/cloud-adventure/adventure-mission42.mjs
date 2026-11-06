// Zone 20: ruined Prism Tower, surrounding grass and paths. Exact geometry and
// individual wild Pokémon positions are provisional.
export const ZONE20_VISIBLE=[
 {id:'bulbasaur',tile:'a',species:1,level:55,name:'이상해씨',x:7,y:10,alpha:false},
 {id:'charmander',tile:'b',species:4,level:55,name:'파이리',x:16,y:11,alpha:false},
 {id:'lucario',tile:'c',species:448,level:55,name:'루카리오',x:9,y:9,alpha:false},
];
export const ZONE20_ALPHA=[{species:448,name:'루카리오'},{species:282,name:'가디안'},{species:306,name:'보스로라'}];
export function zone20Visible(s,tile){if(tile==='d'&&Number.isInteger(s.zaZone20AlphaSpecies)&&!s.zaZone20Spent?.alpha){const p=ZONE20_ALPHA.find(p=>p.species===s.zaZone20AlphaSpecies);return p?{...p,id:'alpha',tile:'d',level:64,x:13,y:7,alpha:true}:null;}return ZONE20_VISIBLE.find(p=>p.tile===tile&&!s.zaZone20Spent?.[p.id])||null;}
export const ZONE20_ITEMS=[{id:'south-seed',tile:'i',x:6,y:14,name:'숙달의씨',kind:'seedofmasteryza'},{id:'southwest-full',tile:'j',x:5,y:12,name:'풀회복약',kind:'full_restores'}];
export function zone20Item(s,tile){return ZONE20_ITEMS.find(p=>p.tile===tile&&!(Array.isArray(s.zaZone20Items)&&s.zaZone20Items.includes(p.id)))||null;}

export function zone20Map(s={}){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));for(let y=3;y<=12;y++)for(let x=5;x<=17;x++)g[y][x]='g';for(let y=8;y<=14;y++)g[y][11]=',';for(let y=5;y<=7;y++)for(let x=18;x<=20;x++)g[y][x]='~';g[6][11]='n';g[15][11]='X';for(const p of ZONE20_ITEMS)if(zone20Item(s,p.tile))g[p.y][p.x]=p.tile;if(zone20Visible(s,'d'))g[7][13]='d';for(const p of ZONE20_VISIBLE)if(zone20Visible(s,p.tile)===p)g[p.y][p.x]=p.tile;return g.map(r=>r.join(''));}
export function zone20Encounter(s,rng=Math.random){const pool=[1,4,152,448],next=()=>Math.max(0,Math.min(.999999999999,rng()));return {speciesId:pool[Math.floor(next()*pool.length)],level:55};}
