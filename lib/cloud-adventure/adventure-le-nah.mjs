// Restaurant Le Nah is in Vert Sector 6; Rintaro's promotion match is inside.
// Room dimensions, door and furnishings are provisional 2D placements.
// https://bulbapedia.bulbagarden.net/wiki/Restaurant_Le_Nah
// https://www.thonky.com/pokemon-legends-z-a/main-mission-08-reaching-rank-v
export function leNahMap(){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=3;y<=15;y++)for(let x=3;x<=19;x++)g[y][x]='.';
 for(let y=7;y<=12;y++)for(let x=5;x<=17;x++)g[y][x]=';';
 for(const [x,y] of [[6,7],[16,7],[6,11],[16,11]])g[y][x]='^';
 for(let x=8;x<=14;x++)g[4][x]='%';g[5][11]='R';g[16][11]='X';
 return g.map(row=>row.join(''));
}
