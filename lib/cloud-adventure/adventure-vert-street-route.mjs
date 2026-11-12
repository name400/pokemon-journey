// Wild Zone 17 is northeast of Hotel Z with an entrance on Vert Street.
// Street geometry and the exact tile positions of buildings and gates are drafts.
export function vertStreetRouteMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let x=1;x<=18;x++)for(let y=7;y<=9;y++)g[y][x]=',';
 for(let y=1;y<=9;y++)for(let x=17;x<=19;x++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=5;x<=10;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=12;x<=17;x++)g[y][x]='#';
 // Gare de Lumiose faces the Vert Pokémon Center across South Boulevard.
 // Mark an already blocked footprint; exact size and tile location are draft.
 // https://bulbapedia.bulbagarden.net/wiki/Vert_District
 for(let y=2;y<=5;y++)for(let x=7;x<=10;x++)g[y][x]='%';
 g[5][8]='u'; // Station exterior interaction; coordinates are provisional.
 g[8][0]='W';g[6][22]='X';g[8][22]='E';g[10][22]='X';g[0][3]='X';g[0][12]='X';g[0][18]='X';g[0][20]='X';g[13][10]='H';g[16][10]='X';return g.map(row=>row.join(''));
}
