// Zone 14 is reached by following the Saison Canal northwest past Zone 7.
// Magenta Plaza stands on the Saison Canal bridge:
// https://bulbapedia.bulbagarden.net/wiki/Lumiose#Plazas
// The canal outline, walkway width and gate positions here are provisional.
export function magentaCanalRouteMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=0;y<=5;y++)for(let x=14;x<=22;x++)g[y][x]='~';
 for(let y=7;y<=9;y++)for(let x=2;x<=21;x++)g[y][x]=',';
 for(let y=1;y<=9;y++)for(let x=9;x<=11;x++)g[y][x]=',';
 for(let y=11;y<=13;y++)for(let x=4;x<=8;x++)g[y][x]='#';
 // Canal-side building blocks are a compressed draft; keep all existing gates and paths.
 for(const [x0,y0,x1,y1] of [[2,2,5,4],[16,12,19,14]])for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(g[y][x]==='.')g[y][x]='%';
 g[12][10]='z';g[0][10]='X';g[8][0]='X';g[12][0]='X';g[16][10]='X';g[8][22]='X';g[12][22]='X';g[14][22]='X';return g.map(row=>row.join(''));
}
