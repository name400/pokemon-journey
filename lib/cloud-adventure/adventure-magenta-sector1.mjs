// Magenta Sector 1 sits between Centrico and Sector 3, beside Estival Avenue.
// Screen edges, roads and buildings are provisional 2D approximations.
// https://bulbapedia.bulbagarden.net/wiki/Magenta_Sector_1
export function magentaSector1Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(const [x0,y0,x1,y1] of [[2,2,6,4],[15,2,19,5],[2,11,6,13],[15,11,19,13]])for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)g[y][x]='#';
 g[5][4]='H';g[6][17]='u';g[0][11]='X';g[16][11]='X';g[8][0]='X';g[8][22]='X';return g.map(row=>row.join(''));
}
// The café interior, furnishings and Naveen's tile are a draft.
export function cafeGallantMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let x=5;x<=17;x++)g[4][x]='k';g[5][11]='n';g[15][11]='X';return g.map(row=>row.join(''));
}
