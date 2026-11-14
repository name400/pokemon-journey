import {side48Available} from './adventure-side48.mjs';
// Rouge Sector 5 sits north of Rouge Plaza and south of Sector 7.
// Its building footprints, street widths and gate positions are provisional.
// https://bulbapedia.bulbagarden.net/wiki/Rouge_Sector_5
// https://bulbapedia.bulbagarden.net/wiki/Rouge_Sector_7
export function rougeSector5Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=7;y<=9;y++)for(let x=10;x<=21;x++)g[y][x]=',';
 for(let y=3;y<=6;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=10;y<=13;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 if(side48Available(s))g[10][15]='^'; // Rescue tree; exact location is a draft.
 g[6][5]='b';g[0][11]='X';g[16][11]='X';g[8][22]='X';g[8][0]='W';return g.map(row=>row.join(''));
}
