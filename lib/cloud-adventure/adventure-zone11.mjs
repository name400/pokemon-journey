// Saison Canal splits the two banks; their precise outlines and city connectors
// are provisional. Sources: Bulbapedia Wild Zone 11 and Nintendo Life's guide.
export function zone11Unlocked(s){return Number(s?.zaMission14Stage)>=12||Number(s?.zaMission15Stage)>=1||['E','D','C','B','A'].includes(s?.zaRoyaleRank)||Number(s?.zaMission40Stage)>=1;}
export const ZONE11_VISIBLE=[{id:'slowpoke',tile:'p',species:79,level:31,name:'야돈',x:17,y:3},{id:'stunfisk',tile:'s',species:618,level:32,name:'메더',x:6,y:5},{id:'furfrou',tile:'f',species:676,level:32,name:'트리미앙',x:15,y:12}];
export function zone11Visible(s,tile){return ZONE11_VISIBLE.find(p=>p.tile===tile&&!s.zaZone11Spent?.[p.id])||null;}
export function zone11Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]='~';
 for(let y=2;y<=5;y++)for(let x=14;x<=19;x++)g[y][x]='g';
 for(let y=4;y<=6;y++)for(let x=3;x<=8;x++)g[y][x]='g';
 for(let y=11;y<=14;y++)for(let x=5;x<=17;x++)g[y][x]='g';
 g[0][5]='X';g[16][11]='X';for(const p of ZONE11_VISIBLE)if(!s.zaZone11Spent?.[p.id])g[p.y][p.x]=p.tile;
 if(s.zaMission40Stage===2&&!s.zaMission40Complete)g[3][11]='0';
 return g.map(row=>row.join(''));
}
// Source level ranges; spawn weighting is provisional and excludes aquatic encounters.
export function zone11Encounter(s,rng=Math.random){const north=s.y<7,pool=north?[[79,30,31],[618,31,32]]:[[676,30,32],[618,31,32]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}
