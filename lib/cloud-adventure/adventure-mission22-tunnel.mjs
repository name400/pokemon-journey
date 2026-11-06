// Mission 22 reaches the encounter by stairs, a tunnel and an ice bridge.
// Exact shape, elevations and coordinates are provisional.
// https://www.thonky.com/pokemon-legends-z-a/main-mission-22-a-rogue-mega-barbaracle
export function mission22TunnelMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=8;y<=14;y++)for(let x=8;x<=14;x++)g[y][x]='.';
 for(let y=3;y<=6;y++)for(let x=4;x<=18;x++)g[y][x]='.';
 for(let x=8;x<=14;x++)g[7][x]='~';
 g[7][11]=s.zaMission22IceBridge?',':'r';g[15][11]='X';
 if((s.zaMission20Stage===5&&!s.zaMission22Complete)||s.zaMission22RewardPending===true)g[4][17]='o';
 return g.map(row=>row.join(''));
}
