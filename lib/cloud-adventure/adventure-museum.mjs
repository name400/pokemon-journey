// Lumiose Museum is on North Boulevard. Its 1F, 2F Hisui exhibition and
// closed third floor are documented; map footprints and exhibit tiles are drafts.
// https://bulbapedia.bulbagarden.net/wiki/Lumiose_Museum
export function museumFrontMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=2;y<=6;y++)for(let x=3;x<=19;x++)g[y][x]='#';
 for(let y=7;y<=15;y++)for(let x=6;x<=16;x++)g[y][x]=',';
 g[6][11]='u';g[16][11]='X';return g.map(row=>row.join(''));
}
export function museumFloorMap(floor){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=3;y<=15;y++)for(let x=3;x<=19;x++)g[y][x]='.';
 for(let y=7;y<=12;y++)for(let x=7;x<=15;x++)g[y][x]=';';
 for(const [x,y] of [[7,8],[15,8],[7,11],[15,11]])g[y][x]='^';
 g[4][5]='t';g[4][17]='t';g[5][18]='l';if(floor===1)g[16][11]='X';
 return g.map(row=>row.join(''));
}
