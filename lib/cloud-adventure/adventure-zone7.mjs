// Magenta Plaza is circular and contains the obelisk. Coordinates and the
// temporary city connector are approximations, not a surveyed original map.
export function zone7Unlocked(s){return ['F','E','D','C','B','A'].includes(s?.zaRoyaleRank)||Number(s?.zaMission14Stage)>=12||Number(s?.zaMission15Stage)>=1;}
export function zone7Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=2;y<=14;y++)for(let x=2;x<=20;x++)if(((x-11)/9)**2+((y-8)/6)**2<=1)g[y][x]='g';
 // The central sandy plaza is ringed by grass and exterior paths.
 for(let y=4;y<=12;y++)for(let x=6;x<=16;x++)if(((x-11)/5)**2+((y-8)/4)**2<=1)g[y][x]=',';
 for(let x=2;x<=8;x++)g[8][x]=',';for(let i=0;i<=4;i++)g[3+i][3+i]=',';
 for(let y=6;y<=10;y++)for(let x=9;x<=13;x++)g[y][x]=',';
 for(let y=7;y<=9;y++)g[y][11]='#'; // central obelisk footprint
 if(!s.zaZone7AlphaSpent)g[8][11]='a'; // Fletchinder roosting on the central monument
 g[16][11]='X';return g.map(row=>row.join(''));
}
// The central species depend on day/night. Encounter weights are temporary.
export function zone7Encounter(period,rng=Math.random){const pool=period==='night'?[[353,20,22],[531,20,22],[406,20,22],[582,19,21]]:[[449,20,22],[531,20,22],[406,20,22],[582,19,21]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}
