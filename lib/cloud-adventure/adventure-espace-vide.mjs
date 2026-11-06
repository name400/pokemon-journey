// Espace Vide lies east of Wild Zone 10, between buildings, with stairs at
// its north and south ends. Tile widths, exact stairs and entry are provisional.
export function espaceVideMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let x=1;x<=12;x++)for(let y=7;y<=9;y++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=4;x<=8;x++)g[y][x]='#';
 for(let y=10;y<=13;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 for(let x=10;x<=12;x++){g[2][x]=':';g[14][x]=':';}
 g[8][0]='W';return g.map(row=>row.join(''));
}
