// The rooftops west of Aymlis Park are reachable from a nearby Holovator.
// The connection, roof outlines and exact tile coordinates are provisional.
// https://www.gamerguides.com/pokemon-legends-z-a/checklists/colorful-screw-locations
export function aymlisWestRoofMap(){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=5;y<=11;y++)for(let x=2;x<=9;x++)g[y][x]='.';
 for(let y=5;y<=11;y++)for(let x=13;x<=21;x++)g[y][x]='.';
 for(let x=10;x<=12;x++)g[8][x]=',';
 g[8][22]='E';return g.map(row=>row.join(''));
}
