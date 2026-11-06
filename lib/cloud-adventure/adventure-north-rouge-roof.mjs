// North Boulevard Holovator leads to a Rouge Sector 3 rooftop route.
// Bridge, beam and upper roof positions are schematic, not measured coordinates.
// https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/Exploring_Lumiose_City
export function northRougeRoofMap(){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=9;y<=13;y++)for(let x=2;x<=7;x++)g[y][x]='.';
 for(let x=8;x<=11;x++)g[11][x]='b';
 for(let y=7;y<=12;y++)for(let x=12;x<=16;x++)g[y][x]='.';
 for(let y=4;y<=6;y++)g[y][14]='n';
 for(let y=2;y<=3;y++)for(let x=12;x<=19;x++)g[y][x]='.';
 g[14][3]='j';g[3][14]='l';g[3][18]='q';return g.map(row=>row.join(''));
}
