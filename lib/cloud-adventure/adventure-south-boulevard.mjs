// The boulevard borders Bleu Sector 7 and serves the Pokémon Research Lab.
// Building geometry, route length and exact gate locations are provisional.
export function southBoulevardMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=1;y<=8;y++)for(let x=7;x<=9;x++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=12;x<=17;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=4;x<=9;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 g[0][20]='X';g[0][18]='X';g[0][16]='X';g[0][14]='X';g[0][11]='X';g[0][8]='X';g[0][4]='X';g[8][22]='X';return g.map(row=>row.join(''));
}
