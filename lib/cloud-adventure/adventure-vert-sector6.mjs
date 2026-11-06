// Sector 6 joins South Boulevard and a northern Wild Zone 17 entrance.
// Water, bridge, street shapes and exact gate coordinates are provisional.
export function vertSector6Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=5;y<=6;y++)for(let x=1;x<=21;x++)g[y][x]='~';
 for(let y=5;y<=6;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=8;y<=10;y++)for(let x=1;x<=10;x++)g[y][x]=',';
 for(let y=9;y<=12;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 g[8][0]='W';g[16][11]='X';return g.map(row=>row.join(''));
}
