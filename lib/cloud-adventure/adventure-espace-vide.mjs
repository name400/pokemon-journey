// Espace Vide connects Estival Avenue (north), Bleu Sector 6 (south), and a
// lower canal passage (west). Tile widths, stairs and boundaries are provisional.
export function espaceVideMap(s={}){
 const lower=s.zaEspaceLower===true,g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':lower?'#':'.'));
 if(lower){for(let y=6;y<=10;y++)for(let x=1;x<=8;x++)g[y][x]=',';g[8][0]='W';g[8][5]='l';return g.map(row=>row.join(''));}
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let x=1;x<=12;x++)for(let y=7;y<=9;y++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=4;x<=8;x++)g[y][x]='#';
 for(let y=10;y<=13;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 for(let x=10;x<=12;x++){g[2][x]=':';g[14][x]=':';}g[8][5]='l';g[0][11]='X';g[16][11]='X';
 return g.map(row=>row.join(''));
}
// These end segments represent the named streets; their other connections are
// not yet modelled. Exact pavement, facades and entrance coordinates are draft.
export function espaceAdjacentRoadMap(kind){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=9;x<=13;x++)g[y][x]=',';
 for(let y=3;y<=6;y++)for(let x=3;x<=6;x++)g[y][x]='#';for(let y=10;y<=13;y++)for(let x=16;x<=19;x++)g[y][x]='#';
 if(kind==='bleu6')g[8][22]='X';
 g[kind==='estival'?16:0][11]='X';g[kind==='estival'?0:16][11]='X';return g.map(row=>row.join(''));
}
