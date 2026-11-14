import {SIDE67_SPOTS,side67Available} from './adventure-side67.mjs';
// Coulant Waterway connects Vert Street and the south of Wild Zone 11. Two
// bridges are documented; waterline, paths and their exact positions are drafts.
export function coulantRouteMap(s={}){
 // A lower bank walkway beneath the bridge. Exact steps, width and overlap
 // are draft; its height is separate from the existing bridge surface.
 // https://allthings.how/how-to-complete-sylveon-the-soother-side-mission-67-in-pokemon-legends-z-a/
 if(s.zaCoulantLower===true){
  const lower=Array.from({length:17},()=>Array(23).fill('#'));
  for(let y=5;y<=6;y++)for(let x=2;x<=20;x++)lower[y][x]=',';
  for(let y=7;y<=9;y++)for(let x=2;x<=20;x++)lower[y][x]='~';
  // Continue the water beneath the adjoining screens; edges are provisional.
  for(let y=7;y<=9;y++)for(const x of [0,1,21,22])lower[y][x]='~';
  // The other bank also has a route beneath the bridge. Its stairs and
  // compressed shoreline are provisional; water separates the two banks.
  for(let y=10;y<=11;y++)for(let x=2;x<=20;x++)lower[y][x]=',';
  // Zone 17 has a north exit via steps to the waterway. Its tile and
  // connection to this compressed lower bank are provisional.
  // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_17
  // Each bank has a Vert Street access; the two gate tiles are draft.
  // https://www.pokepedia.fr/Canal_Lacoul%C3%A9e
  lower[6][0]='X';lower[6][1]=',';lower[10][0]='X';lower[10][1]=',';
  // Steps near Zone 11 connect the northern lower bank to the wild zone.
  // https://allthings.how/how-to-complete-sylveon-the-soother-side-mission-67-in-pokemon-legends-z-a/
  lower[4][10]='X';lower[4][16]='X';lower[5][3]='l';lower[5][19]='l';lower[11][3]='l';lower[11][19]='l';if(side67Available(s))for(const p of SIDE67_SPOTS.filter(p=>p.lower&&(p.id==='calma'||s.zaSide67Started&&!s.zaSide67Complete)))lower[p.y][p.x]='^';return lower.map(row=>row.join(''));
 }
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=6;y<=10;y++)for(let x=2;x<=20;x++)g[y][x]='~';
 // The canal continues towards the Saison Canal and Vert Avenue. Closing the
 // former dry end gaps keeps the two bridges as the crossings in this screen.
 // The edge width and the exact alignment across screens are provisional.
 // https://www.pokepedia.fr/Canal_Lacoul%C3%A9e
 for(let y=6;y<=10;y++)for(const x of [21,22])g[y][x]='~';
 for(let y=7;y<=10;y++)for(const x of [0,1])g[y][x]='~';
 for(let y=6;y<=10;y++){g[y][6]=':';g[y][16]=':';}
 for(let x=1;x<=20;x++){g[5][x]=',';g[11][x]=',';}
 for(let y=1;y<=5;y++)g[y][10]=',';
 // The approach to Zone 11 includes steps. Tile placement is provisional;
 // the lower bank beneath the bridge is not yet a separate elevation layer.
 // https://allthings.how/how-to-complete-sylveon-the-soother-side-mission-67-in-pokemon-legends-z-a/
 for(let y=2;y<=4;y++)g[y][10]=':';
 for(let y=12;y<=15;y++){g[y][6]=':';g[y][16]=':';}
 // Two eastern streets lead to Vert Sectors 6 and 7; tile coordinates are provisional.
 // https://www.pokepedia.fr/Canal_Lacoul%C3%A9e
 for(const y of [4,12])for(let x=17;x<=21;x++)if(g[y][x]==='.')g[y][x]=',';
 // Three western stair approaches connect the raised Vert Sector 3 side.
 // Their exact alignment is a draft in this compressed screen.
 // https://www.pokepedia.fr/Canal_Lacoul%C3%A9e
 for(const y of [2,4,6]){g[y][0]='X';g[y][1]=':';}
 g[5][3]='l';g[5][19]='l';g[11][3]='l';g[11][19]='l';g[4][22]='X';g[12][22]='X';
 g[16][6]='X';g[16][16]='X';g[0][9]='X';g[0][10]='X';g[4][0]='X';g[12][0]='W';if(side67Available(s)&&s.zaSide67Started&&!s.zaSide67Complete)for(const p of SIDE67_SPOTS.filter(p=>!p.lower))g[p.y][p.x]='^';return g.map(row=>row.join(''));
}
