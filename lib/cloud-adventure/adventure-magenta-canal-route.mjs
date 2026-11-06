// Zone 14 is reached by following the Saison Canal northwest past Zone 7.
// The canal outline, walkway width and gate positions here are provisional.
export function magentaCanalRouteMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=2;y<=5;y++)for(let x=14;x<=20;x++)g[y][x]='~';
 for(let y=7;y<=9;y++)for(let x=2;x<=21;x++)g[y][x]=',';
 for(let y=1;y<=9;y++)for(let x=9;x<=11;x++)g[y][x]=',';
 for(let y=11;y<=13;y++)for(let x=4;x<=8;x++)g[y][x]='#';
 g[0][10]='X';g[8][0]='X';g[16][10]='X';g[8][22]='X';return g.map(row=>row.join(''));
}
