// Coulant Waterway connects Vert Street and the south of Wild Zone 11. Two
// bridges are documented; waterline, paths and their exact positions are drafts.
export function coulantRouteMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=6;y<=10;y++)for(let x=2;x<=20;x++)g[y][x]='~';
 for(let y=6;y<=10;y++){g[y][6]=':';g[y][16]=':';}
 for(let x=1;x<=20;x++){g[5][x]=',';g[11][x]=',';}
 for(let y=1;y<=5;y++)g[y][10]=',';
 for(let y=12;y<=15;y++){g[y][6]=':';g[y][16]=':';}
 g[16][6]='X';g[16][16]='X';g[0][10]='X';g[12][0]='W';return g.map(row=>row.join(''));
}
