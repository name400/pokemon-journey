// Wild Zone 18 has a Magenta Sector 8 approach and a North Boulevard approach.
// This connecting street's layout, boundaries, and gate coordinates are drafts.
export function magentaSector8RouteMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=8;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let x=10;x<=21;x++)for(let y=7;y<=9;y++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=4;x<=9;x++)g[y][x]='#';
 for(let y=10;y<=13;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 g[14][12]='H';g[0][11]='X';g[8][0]='X';g[16][11]='X';g[8][22]='X';return g.map(row=>row.join(''));
}
