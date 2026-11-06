// Zone 11's north bank borders Jaune Sector 10 to the west and Sector 12
// to the east. Streets, buildings and precise entrance positions are drafts.
export function jauneCanalSectorMap(sector){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=1;y<=8;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 if(sector===10)g[8][22]='X';else{g[8][0]='X';g[0][11]='X';}
 return g.map(row=>row.join(''));
}
