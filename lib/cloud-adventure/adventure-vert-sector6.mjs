// Sector 6 joins South Boulevard and a northern Wild Zone 17 entrance.
// Water, bridge, street shapes and exact gate coordinates are provisional.
export function vertSector6Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=5;y<=6;y++)for(let x=1;x<=21;x++)g[y][x]='~';
 for(let y=5;y<=6;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=8;y<=10;y++)for(let x=1;x<=10;x++)g[y][x]=',';
 for(let y=9;y<=12;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 g[8][0]='W';g[12][22]='X';g[16][11]='X';return g.map(row=>row.join(''));
}

// Vert Sector 3 links the Saison bridge to Vert Plaza. Exact geometry is provisional.
export function vertSector3Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=4;y<=12;y++)for(let x=3;x<=8;x++)g[y][x]='g';
 for(let y=2;y<=5;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 g[0][11]='X';g[7][0]='X';g[7][22]='X';g[16][11]='X';g[16][17]='X';
 return g.map(row=>row.join(''));
}

// Vert Sector 1 is west of Sector 3, near Vert Street. Exact geometry is provisional.
export function vertSector1Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=9;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=3;x<=8;x++)g[y][x]='#';
 for(let y=2;y<=6;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 g[7][22]='X';g[16][11]='X';
 return g.map(row=>row.join(''));
}
