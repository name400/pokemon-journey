// Rouge Sector 3 lies beside Autumnal Avenue and south of North Boulevard.
// Individual buildings, road widths and entrance positions remain provisional.
export function rougeSector3Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=18;x++)g[y][x]=',';
 for(let y=1;y<=9;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=14;x<=18;x++)g[y][x]='#';
 g[11][14]='^'; // Armie: existing impassable restaurant frontage.
 g[5][5]='q';g[14][16]='m';g[11][16]='u'; // Restaurant Le Yeah; exact door location is provisional.
 g[8][0]='X';g[8][22]='X';g[0][11]='X';g[16][16]='X';g[16][6]='X';return g.map(row=>row.join(''));
}
