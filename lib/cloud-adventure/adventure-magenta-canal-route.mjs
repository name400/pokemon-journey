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
 g[7][8]='u';g[6][22]='X';g[12][10]='z';g[0][10]='X';g[8][0]='X';g[12][0]='X';g[16][10]='X';g[16][19]='X';g[8][22]='X';g[12][22]='X';g[14][22]='X';return g.map(row=>row.join(''));
}

// A courtyard west of Wild Zone 7 is documented. This compressed U-shaped
// block and its entry are drafts; their exact original footprint is unverified.
// https://www.gamerguides.com/pokemon-legends-z-a/guide/getting-started/information/all-colorful-screw-locations
export function magentaWestCourtyardMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=3;y<=5;y++)for(let x=3;x<=8;x++)g[y][x]='%';
 for(let y=5;y<=12;y++)for(let x=3;x<=5;x++)g[y][x]='%';
 for(let y=11;y<=13;y++)for(let x=4;x<=18;x++)g[y][x]='%';
 for(let y=5;y<=10;y++)for(let x=16;x<=18;x++)g[y][x]='%';
 for(let y=5;y<=10;y++)for(let x=7;x<=14;x++)g[y][x]=',';
 for(let y=1;y<=5;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 g[0][11]='X';return g.map(row=>row.join(''));
}

// The contest is at the Electrical Substation. Question tiles, stage and
// entrance positions are draft approximations of the outdoor venue.
// https://www.serebii.net/legendsz-a/mainmissions/reachingranke.shtml
export function canariQuizMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=5;y<=11;y++)for(let x=3;x<=9;x++)g[y][x]=',';
 for(let y=5;y<=11;y++)for(let x=13;x<=19;x++)g[y][x]=';';
 g[5][11]='t';g[8][6]='v';g[8][16]='w';g[15][11]='X';return g.map(row=>row.join(''));
}
