// Wild Zone 17 is northeast of Hotel Z with an entrance on Vert Street.
// Street geometry and the exact tile positions of buildings and gates are drafts.
export function vertStreetRouteMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let x=1;x<=18;x++)for(let y=7;y<=9;y++)g[y][x]=',';
 for(let y=1;y<=9;y++)for(let x=17;x<=19;x++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=5;x<=10;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=12;x<=17;x++)g[y][x]='#';
 g[8][0]='W';g[8][22]='E';g[0][12]='X';g[0][18]='X';return g.map(row=>row.join(''));
}
