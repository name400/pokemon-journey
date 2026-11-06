// Aymlis Park has two west entrances to Bleu Sector 5. Street dimensions,
// building outlines and exact entrance coordinates are provisional.
export function bleuSector5Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=9;x<=11;x++)g[y][x]=',';
 for(const row of [5,12])for(let y=row-1;y<=row+1;y++)for(let x=9;x<=21;x++)g[y][x]=',';
 for(let y=3;y<=5;y++)for(let x=3;x<=6;x++)g[y][x]='#';
 for(let y=10;y<=13;y++)for(let x=3;x<=6;x++)g[y][x]='#';
 g[5][22]='X';g[12][22]='X';return g.map(row=>row.join(''));
}
