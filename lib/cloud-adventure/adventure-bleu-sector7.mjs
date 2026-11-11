// Bleu Sector 7 borders Aymlis Park to the northeast, Bleu Sector 5 to
// the northwest and Vernal Avenue to the east. Tile geometry is provisional.
export function bleuSector7Map(s={}){
 // Scaffolding and a ladder lead from Bleu Sector 7 to nearby rooftops.
 // Roof footprints, passage and the ladder position are provisional.
 // https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/Exploring_Lumiose_City
 if(s.zaBleu7Upper===true){
  const roof=Array.from({length:17},()=>Array(23).fill('#'));
  for(let y=4;y<=10;y++)for(let x=3;x<=9;x++)roof[y][x]='.';
  for(let y=5;y<=11;y++)for(let x=12;x<=19;x++)roof[y][x]='.';
  for(let x=9;x<=12;x++)roof[8][x]=',';
  roof[10][5]='l';return roof.map(row=>row.join(''));
 }
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=1;y<=8;y++)for(let x=15;x<=17;x++)g[y][x]=',';
 for(let y=4;y<=8;y++)for(let x=1;x<=3;x++)g[y][x]=',';
 for(let y=2;y<=4;y++)for(let x=6;x<=10;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=4;x<=8;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=14;x<=18;x++)g[y][x]='#';
 for(let y=9;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 g[5][9]='l';g[12][13]='h';g[13][11]='H';g[16][11]='X';g[0][16]='X';g[5][0]='X';g[11][0]='X';g[8][22]='X';return g.map(row=>row.join(''));
}
