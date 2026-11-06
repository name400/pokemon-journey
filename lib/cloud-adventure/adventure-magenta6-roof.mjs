// Mission 21 reaches a rooftop in Magenta Sector 6 via scaffolding.
// Coordinates, roof heights and the connecting platform are provisional.
// https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/magenta-sector-6.html
export function magenta6RoofMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=4;y<=13;y++)for(let x=1;x<=8;x++)g[y][x]='.';
 for(let y=3;y<=11;y++)for(let x=15;x<=21;x++)g[y][x]='.';
 for(let y=6;y<=8;y++)for(let x=9;x<=14;x++)g[y][x]=',';
 g[14][2]='l';
 if((s.zaMission20Stage===5&&!s.zaMission21Complete)||s.zaMission21RewardPending===true)g[5][18]='m';
 return g.map(row=>row.join(''));
}
