// Bleu Sector 7 borders Aymlis Park to the northeast, Bleu Sector 5 to
// the northwest and Vernal Avenue to the east. Tile geometry is provisional.
export function bleuSector7Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=1;y<=8;y++)for(let x=15;x<=17;x++)g[y][x]=',';
 for(let y=4;y<=8;y++)for(let x=1;x<=3;x++)g[y][x]=',';
 for(let y=2;y<=4;y++)for(let x=6;x<=10;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=4;x<=8;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=14;x<=18;x++)g[y][x]='#';
 g[0][16]='X';g[5][0]='X';g[8][22]='X';return g.map(row=>row.join(''));
}
