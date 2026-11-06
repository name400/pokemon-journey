// Mission 27 crosses a southern arch and then an ice bridge; geometry is provisional.
// https://www.thonky.com/pokemon-legends-z-a/main-mission-27-a-rogue-mega-froslass
// https://www.gamerguides.com/pokemon-legends-z-a/guide/main-missions/027/a-rogue-mega-froslass
export function mission27RoofMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=4;y<=12;y++)for(let x=1;x<=6;x++)g[y][x]='.';
 for(let y=4;y<=12;y++)for(let x=8;x<=13;x++)g[y][x]='.';
 for(let y=4;y<=12;y++)for(let x=15;x<=21;x++)g[y][x]='.';
 const ice=Array.isArray(s.zaMission27Bridges)?s.zaMission27Bridges:[];
 g[13][2]='j';g[11][7]=','; // southern arch to the adjoining roof
 // Preserve the old bridge for saves that opened it, including saved positions on it.
 if(ice.includes('west'))g[8][7]=',';
 g[8][14]=ice.includes('east')?',':'r';
 if((s.zaMission26Stage===3&&!s.zaMission27Complete)||s.zaMission27RewardPending===true)g[5][18]='7';
 return g.map(row=>row.join(''));
}
