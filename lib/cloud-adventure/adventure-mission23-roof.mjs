// Mission 23 reaches Ampharos through a Holovator, scaffolding and a ladder.
// Roof outlines, heights and exact tile positions remain provisional.
// https://www.thonky.com/pokemon-legends-z-a/main-mission-23-a-rogue-mega-ampharos
export function mission23RoofMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=8;y<=14;y++)for(let x=2;x<=19;x++)g[y][x]='.';
 for(let y=2;y<=6;y++)for(let x=14;x<=20;x++)g[y][x]='.';
 for(let x=8;x<=13;x++)g[11][x]=',';
 g[14][2]='j';g[8][17]='l';g[6][17]='l';
 if((s.zaMission20Stage===5&&!s.zaMission23Complete)||s.zaMission23RewardPending===true)g[3][18]='v';
 return g.map(row=>row.join(''));
}
