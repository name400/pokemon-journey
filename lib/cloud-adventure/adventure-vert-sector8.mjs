// Vert Sector 8 is near Hotel Z and Wild Zone 1's northeastern exit; the
// nearby battle court is documented. Tile positions and street layout are drafts.
// https://thegamesedge.com/pokemon-legends-z-a-flabebe-flower-locations-guide/
// https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-1-guide-all-pokemon-and-alphas
export function vertSector8Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=3;y<=6;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=10;y<=13;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=4;y<=10;y++)for(let x=15;x<=20;x++)g[y][x]=';';
 for(let x=12;x<=15;x++)g[8][x]=',';
 g[0][11]='X';g[16][11]='X';return g.map(row=>row.join(''));
}
