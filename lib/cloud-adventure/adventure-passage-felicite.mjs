// Passage de la Félicité links Bleu Street to the Bleu Sector 6 side.
// Storefront placement, interior dimensions and door coordinates are provisional.
export function passageFeliciteMap(){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=5;y<=11;y++)for(let x=1;x<=21;x++)g[y][x]='.';
 for(let x=3;x<=19;x+=4){g[5][x]='c';g[11][x]='c';}
 g[8][0]='W';g[8][22]='E';return g.map(row=>row.join(''));
}
