// Bleu Sector 7 borders Aymlis Park to the northeast, Bleu Sector 5 to
// the northwest and Vernal Avenue to the east. Tile geometry is provisional.
import {side45Available} from './adventure-side45.mjs';
import {side28Available} from './adventure-side28.mjs';
// The southeast roof and its TM require Roto-Glide; exact tiles are draft.
// https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/bleu-sector-7.html
export function bleu7EastRoofMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=4;y<=12;y++)for(let x=3;x<=19;x++)g[y][x]='.';
 for(let x=4;x<=18;x++)g[8][x]=',';
 if(s.zaBleu7Tm058===undefined||s.zaBleu7Tm058===false)g[5][15]='i';
 return g.map(row=>row.join(''));
}
// A staircase and raised area exist in the western courtyard; 2D geometry is provisional.
// https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/bleu-sector-7.html
export function bleu7WestRaisedMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=4;y<=12;y++)for(let x=4;x<=18;x++)g[y][x]='.';
 for(let x=6;x<=16;x++)g[8][x]=',';
 g[12][7]='u';if(s.zaBleu7WestRevive!==true)g[6][15]='i';return g.map(row=>row.join(''));
}
export function bleuSector7Map(s={}){
 // Scaffolding and a ladder lead from Bleu Sector 7 to nearby rooftops.
 // Roof footprints, passage and the ladder position are provisional.
 // https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/Exploring_Lumiose_City
 if(s.zaBleu7Upper===true){
  const roof=Array.from({length:17},()=>Array(23).fill('#'));
  for(let y=4;y<=10;y++)for(let x=3;x<=9;x++)roof[y][x]='.';
  for(let y=5;y<=11;y++)for(let x=12;x<=19;x++)roof[y][x]='.';
  for(let x=9;x<=12;x++)roof[8][x]=',';
  roof[10][5]='l';if([2,3].includes(s.zaSide45Stage))roof[12][18]='j';return roof.map(row=>row.join(''));
 }
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=1;y<=8;y++)for(let x=15;x<=17;x++)g[y][x]=',';
 for(let y=4;y<=8;y++)for(let x=1;x<=3;x++)g[y][x]=',';
 for(let y=2;y<=4;y++)for(let x=6;x<=10;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=4;x<=8;x++)g[y][x]='#';
 // Western courtyard: the exact entrance and the elevated stair area are
 // unverified, so only the ground-level approach is represented here.
 for(let y=12;y<=13;y++)for(let x=5;x<=7;x++)g[y][x]=',';
 g[14][6]=',';g[12][5]='u'; // Draft stair approach; previously walkable.
 for(let y=11;y<=14;y++)for(let x=14;x<=18;x++)g[y][x]='#';
 // The eastern courtyard has north and south approaches. Its compressed
 // footprint and entrance coordinates are provisional.
 for(let y=12;y<=13;y++)for(let x=15;x<=17;x++)g[y][x]=',';
 g[11][16]=',';g[14][16]=',';
 for(let y=9;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 if(side45Available(s))g[14][14]='j'; // Durstin's Holovator; exact position is a draft.
 g[15][16]='q'; // TM101 giver near the southern courtyard entrance; position is provisional.
 g[5][9]='l';g[12][8]='^';g[12][13]='h';g[13][8]='M';g[13][11]='H';if(side28Available(s))g[11][6]='t';g[16][11]='X';g[0][16]='X';g[5][0]='X';g[11][0]='X';g[8][22]='X';return g.map(row=>row.join(''));
}
