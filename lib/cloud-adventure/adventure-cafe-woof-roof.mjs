// Ladder behind Café Woof leads across a bridge to a bramble-covered rooftop.
// Platform dimensions, ladder tile and bramble coordinates are provisional.
// https://raiderking.com/pokemon-legends-z-a-all-tms-locations/
export function cafeWoofRoofMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=6;y<=10;y++)for(let x=2;x<=8;x++)g[y][x]='.';
 for(let y=6;y<=10;y++)for(let x=12;x<=20;x++)g[y][x]='.';
 for(let x=9;x<=11;x++)g[8][x]=',';
 g[10][4]='l';
 if(!s.zaCafeWoofBrambleCleared)for(let y=6;y<=10;y++)g[y][16]='r';
 if(!s.zaCafeWoofTm056)g[9][19]='t';
 return g.map(row=>row.join(''));
}
