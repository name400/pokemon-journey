// Mission 16 crosses two web bridges behind Hotel Z. Geometry is provisional.
// https://www.thonky.com/pokemon-legends-z-a/main-mission-16-a-rogue-mega-beedrill
export function mission16RoofMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=4;y<=12;y++)for(let x=1;x<=6;x++)g[y][x]='.';
 for(let y=4;y<=12;y++)for(let x=8;x<=13;x++)g[y][x]='.';
 for(let y=4;y<=12;y++)for(let x=15;x<=21;x++)g[y][x]='.';
 const open=Array.isArray(s.zaMission16Webs)?s.zaMission16Webs:[];
 g[8][0]='W';g[8][7]=open.includes('west')?',':'r';g[8][14]=open.includes('east')?',':'r';
 if((s.zaMission15Stage===2&&!s.zaMission16Complete)||s.zaMission16RewardPending===true)g[5][18]='d';
 return g.map(row=>row.join(''));
}
