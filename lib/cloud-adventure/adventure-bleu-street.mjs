// Bleu Street joins Bleu Plaza with South Boulevard, west of Sector 7.
// Tile dimensions, building shapes and exact turn locations are provisional.
export function bleuStreetMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=7;y<=9;y++)for(let x=10;x<=21;x++)g[y][x]=',';
 for(let y=3;y<=6;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 g[8][0]='X';g[0][11]='X';g[16][11]='X';g[8][22]='X';return g.map(row=>row.join(''));
}
