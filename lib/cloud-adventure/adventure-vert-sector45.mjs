// Vert 4 is south of Vert 2 and west of Vert 5; Vert 5 is south of Vert Plaza.
// Building footprints, courtyard and road coordinates are provisional.
// https://bulbapedia.bulbagarden.net/wiki/Vert_Sector_4
// https://bulbapedia.bulbagarden.net/wiki/Vert_Sector_5
export function vertSector45Map(sector,s={}){
 // An enclosed grassy courtyard lies behind Cafe Classe and is reached from
 // rooftops. Dimensions, elevator, descent and return ladder are drafts.
 // https://www.nintendolife.com/guides/pokemon-legends-z-a-where-to-catch-ralts
 // https://game8.co/games/Pokemon-Legends-Z-A/archives/558130
 if(sector===4&&['roof','courtyard'].includes(s.zaVert4Layer)){
  const g=Array.from({length:17},()=>Array(23).fill('#'));
  if(s.zaVert4Layer==='roof'){
   for(let y=4;y<=10;y++)for(let x=3;x<=18;x++)g[y][x]='.';
   g[10][4]='j';g[8][13]='v';
  }else{
   for(let y=3;y<=13;y++)for(let x=3;x<=19;x++)g[y][x]='.';
   for(let x=6;x<=16;x++)g[7][x]=',';
   g[10][5]='l';
  }
  return g.map(row=>row.join(''));
 }
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 if(sector===4){
  // Cafe Classe and a courtyard are documented; placement is not surveyed.
  for(let y=3;y<=5;y++)for(let x=3;x<=7;x++)g[y][x]='%';
  for(let y=11;y<=14;y++)for(let x=14;x<=19;x++)g[y][x]='#';
  for(let y=10;y<=13;y++)for(let x=4;x<=7;x++)g[y][x]=';';
  g[5][9]='j';g[0][11]='X';g[8][0]='X';g[8][22]='X';
 }else{
  for(let y=3;y<=6;y++)for(let x=3;x<=7;x++)g[y][x]='#';
  for(let y=10;y<=13;y++)for(let x=15;x<=19;x++)g[y][x]='#';
  g[0][11]='X';g[8][0]='X';
 }
 return g.map(row=>row.join(''));
}
