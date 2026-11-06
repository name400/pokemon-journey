// Topology from the Zone 5 guide: west/south access, west clearing, northwest
// ladder and eastern rooftop. Tile dimensions and approaches remain provisional.
export function zone5Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 if(s.zaZone5Upper===true){for(let y=1;y<16;y++)for(let x=1;x<22;x++)g[y][x]='#';for(let y=3;y<=6;y++)for(let x=3;x<=9;x++)g[y][x]='.';for(let x=9;x<=17;x++)g[4][x]='.';for(let y=3;y<=6;y++)for(let x=17;x<=20;x++)g[y][x]='.';g[4][4]='l';g[3][19]='c';return g.map(r=>r.join(''));}
 for(let y=5;y<=12;y++)for(let x=2;x<=9;x++)g[y][x]='g';
 for(let y=2;y<=5;y++)for(let x=11;x<=15;x++)g[y][x]='g';
 for(let y=7;y<=11;y++)for(let x=18;x<=21;x++)g[y][x]='~';
 for(let y=3;y<=6;y++)for(let x=17;x<=20;x++)g[y][x]='#';
 g[4][4]='l';g[8][0]='W';g[16][11]='X';
 if(s.zaMission40Stage===1&&!(Array.isArray(s.zaMission40Anomalies)&&s.zaMission40Anomalies.includes('gallade')))g[6][5]='0';
 return g.map(r=>r.join(''));
}
// The listed ground species and level follow the original; probabilities are provisional.
export function zone5Encounter(rng=Math.random){const ids=[16,69,504,543,659,661],v=Math.max(0,Math.min(.999999999999,rng()));return {speciesId:ids[Math.floor(v*ids.length)],level:13};}
