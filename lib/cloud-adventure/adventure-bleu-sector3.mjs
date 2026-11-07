// Two entrances on the north side of Aymlis Park lead to Bleu Sector 3.
// Street geometry, buildings and exact gate positions are provisional.
export function bleuSector3Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(const column of [6,16])for(let x=column-1;x<=column+1;x++)for(let y=7;y<=15;y++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=2;y<=5;y++)for(let x=14;x<=18;x++)g[y][x]='#';
 // The stairs behind the Café Woof block lead toward the sewer approach.
 // Tile coordinates and surrounding buildings remain provisional.
 for(let x=16;x<=21;x++)g[3][x]=',';
 g[4][21]=':';g[5][21]=':';
 g[3][22]='X';g[8][22]='X';g[8][10]='j';
 g[16][6]='X';g[16][16]='X';return g.map(row=>row.join(''));
}

// Underground alley and sludge coordinates are an approximation of the route.
export function bleuSewerApproachMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]='.';
 if(!s.zaBleuSewerSludgeCleared&&!s.zaBleuSewerOpened)for(let y=7;y<=9;y++)g[y][9]='r';
 for(let y=1;y<=7;y++)for(let x=16;x<=18;x++)g[y][x]='.';
 g[0][17]='X';g[8][0]='W';g[8][18]='h';g[8][22]='X';return g.map(row=>row.join(''));
}
