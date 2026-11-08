// Saison Canal splits the two banks; their precise outlines and city connectors
// are provisional. Sources: Bulbapedia Wild Zone 11 and Nintendo Life's guide.
export function zone11Unlocked(s){return Number(s?.zaMission14Stage)>=12||Number(s?.zaMission15Stage)>=1||['E','D','C','B','A'].includes(s?.zaRoyaleRank)||Number(s?.zaMission40Stage)>=1;}
export const ZONE11_VISIBLE=[{id:'slowpoke',tile:'p',species:79,level:31,name:'야돈',x:17,y:3},{id:'stunfisk',tile:'s',species:618,level:32,name:'메더',x:6,y:5},{id:'furfrou',tile:'f',species:676,level:32,name:'트리미앙',x:15,y:12}];
export function zone11Visible(s,tile){return ZONE11_VISIBLE.find(p=>p.tile===tile&&!s.zaZone11Spent?.[p.id])||null;}
// A western fork is described; the branch direction, bank shape and scale are draft.
// https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-11-guide-all-pokemon-and-alphas
export const ZONE11_WEST_FORK=[[0,5],[1,5],[2,5],[1,6],[2,6]];
export function zone11Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 // The canal runs through both screen edges; both banks remain disconnected.
 for(let y=7;y<=9;y++)for(let x=0;x<=22;x++)g[y][x]='~';
 for(const [x,y] of ZONE11_WEST_FORK)g[y][x]='~';
 for(let y=2;y<=5;y++)for(let x=14;x<=19;x++)g[y][x]='g';
 for(let y=4;y<=6;y++)for(let x=3;x<=8;x++)g[y][x]='g';
 for(let y=11;y<=14;y++)for(let x=5;x<=17;x++)g[y][x]='g';
 // Separate bank approaches connect the documented exits; their precise paving is draft.
 // Only ordinary floor is changed, preserving grass encounters and bank separation.
 // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_11
 for(let x=1;x<=21;x++)for(const y of [1,15])if(g[y][x]==='.')g[y][x]=',';
 for(const x of [1,21])for(let y=1;y<=4;y++)if(g[y][x]==='.')g[y][x]=',';
 for(let y=10;y<=15;y++)if(g[y][20]==='.')g[y][20]=',';
 // The southern bank has a main path. Its extent and paving are draft.
 // https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-11-guide-all-pokemon-and-alphas
 for(let x=1;x<=20;x++)if(g[10][x]==='.')g[10][x]=',';
 for(const x of [2,19])for(let y=11;y<=14;y++)if(g[y][x]==='.')g[y][x]=',';
 g[4][0]='X';g[4][22]='X';g[0][5]='X';g[12][22]='X';g[16][11]='X';g[16][5]='X';g[16][6]='X';for(const p of ZONE11_VISIBLE)if(!s.zaZone11Spent?.[p.id])g[p.y][p.x]=p.tile;
 if(s.zaMission40Stage===2&&!s.zaMission40Complete)g[3][11]='0';
 return g.map(row=>row.join(''));
}
// Source level ranges; spawn weighting is provisional and excludes aquatic encounters.
export function zone11Encounter(s,rng=Math.random){const north=s.y<7,pool=north?[[79,30,31],[618,31,32]]:[[676,30,32],[618,31,32]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}
