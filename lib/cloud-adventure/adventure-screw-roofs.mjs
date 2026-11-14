import {side82Available} from './adventure-side82.mjs';
// Provisional 2D access to documented rooftop/scaffold screw locations.
// https://www.gamerguides.com/pokemon-legends-z-a/checklists/colorful-screw-locations/
// Exact entrance locations, roof geometry and glide landings are approximations.
export const SCREW_ROOFS=Object.freeze([
 {district:'lumiose-vert-sector1',roof:'lumiose-screw-vert1',x:9,y:1},
 {district:'lumiose-rouge-sector5',roof:'lumiose-screw-rouge5',x:9,y:3},
 {district:'lumiose-rouge-sector8',roof:'lumiose-screw-rouge8',x:9,y:3},
 {district:'lumiose-jaune-sector11',roof:'lumiose-screw-jaune11',x:9,y:3},
 // Keep boutique approach (7,14) free for the shop interaction.
 {district:'lumiose-ombrage-arcade',roof:'lumiose-screw-ombrage',x:11,y:13},
 {district:'lumiose-jaune-sector9',roof:'lumiose-screw-jaune9',x:9,y:3},
 {district:'lumiose-bleu-sector7',roof:'lumiose-screw-bleu7',x:12,y:3},
 {district:'lumiose-passage-palais',roof:'lumiose-screw-palais',x:8,y:14},
 {district:'lumiose-mission12-jaune3',roof:'lumiose-screw-jaune3',x:9,y:3},
 {district:'lumiose-rouge-sector1',roof:'lumiose-screw-rouge1-court',x:18,y:6},
 {district:'lumiose-bleu-sector3',roof:'lumiose-screw-bleu3',x:9,y:3},
 {district:'lumiose-vert-sector3',roof:'lumiose-screw-vert3',x:9,y:3},
 {district:'lumiose-vert-sector4',roof:'lumiose-screw-vert4',x:9,y:3},
 {district:'lumiose-vert-sector5',roof:'lumiose-screw-vert5',x:9,y:3},
 {district:'lumiose-vert-sector8',roof:'lumiose-screw-vert8',x:9,y:3},
 {district:'lumiose-magenta-sector1',roof:'lumiose-screw-magenta1',x:9,y:3},
 {district:'lumiose-magenta-sector2',roof:'lumiose-screw-magenta2',x:9,y:3},
 {district:'lumiose-magenta-sector8-route',roof:'lumiose-screw-magenta8',x:2,y:2},
 {district:'lumiose-magenta-sector9',roof:'lumiose-screw-magenta9',x:9,y:3},
 {district:'lumiose-jaune-sector8',roof:'lumiose-screw-jaune8',x:9,y:3},
 {district:'lumiose-jaune-sector6',roof:'lumiose-screw-jaune6',x:9,y:3},
]);
export function screwRoofConfig(s){return !s?.interior?SCREW_ROOFS.find(p=>p.district===s?.district||p.roof===s?.district):undefined;}
export const SCREW_GLIDE_ROOFS=Object.freeze(['lumiose-screw-rouge8','lumiose-screw-jaune9','lumiose-screw-jaune11','lumiose-screw-vert3','lumiose-screw-rouge1-court','lumiose-screw-jaune3','lumiose-screw-palais','lumiose-screw-bleu3','lumiose-screw-vert5','lumiose-screw-vert8','lumiose-screw-jaune6']);
export function isScrewGlideRoof(district){return SCREW_GLIDE_ROOFS.includes(district);}
export function screwGlideVertical(district){return ['lumiose-screw-jaune3','lumiose-screw-palais','lumiose-screw-bleu3','lumiose-screw-vert8'].includes(district);}
export function screwGlideAt(district,x,y){return isScrewGlideRoof(district)&&(screwGlideVertical(district)?x===9&&(y===7||y===11):y===6&&(x===10||x===14));}
export function screwRoofDropSpot(district){return screwGlideVertical(district)?{x:14,y:6}:{x:14,y:11};}
export function screwRoofMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=4;y<=12;y++)for(let x=3;x<=19;x++)g[y][x]='.';
 for(let x=7;x<=15;x++)g[8][x]=',';
 if(screwGlideVertical(s.district)){
  // A north/south street gap and two rooftops; shape and landing are draft.
  for(let y=8;y<=10;y++)for(let x=3;x<=19;x++)g[y][x]='#';
  if(s.district==='lumiose-screw-palais'){for(let x=16;x<=19;x++)g[4][x]='#';}
  else if(s.district==='lumiose-screw-jaune3'){for(let x=3;x<=5;x++)g[4][x]='#';for(let x=17;x<=19;x++)g[7][x]='#';}
  else if(s.district==='lumiose-screw-bleu3'){for(let x=3;x<=5;x++)g[4][x]='#';for(let x=17;x<=19;x++)g[6][x]='#';}
  else if(s.district==='lumiose-screw-vert8'){for(let x=16;x<=19;x++)g[4][x]='#';for(let x=17;x<=19;x++)g[5][x]='#';}
  g[6][14]='v';
 }else if(isScrewGlideRoof(s.district)){
  // Two scaffold platforms separated by a glide gap; geometry is provisional.
  for(let y=4;y<=12;y++)for(let x=11;x<=13;x++)g[y][x]='#';
  for(let y=4;y<=5;y++)for(let x=3;x<=4;x++)g[y][x]='#';
  for(let y=11;y<=12;y++)for(let x=18;x<=19;x++)g[y][x]='#';
  if(s.district==='lumiose-screw-jaune9'){
   for(let y=4;y<=7;y++)for(let x=3;x<=5;x++)g[y][x]='#';
   for(let y=7;y<=10;y++)for(let x=18;x<=19;x++)g[y][x]='#';
  }
  if(s.district==='lumiose-screw-jaune11'){
   for(let y=4;y<=6;y++)for(let x=3;x<=5;x++)g[y][x]='#';
   for(let y=8;y<=10;y++)for(let x=14;x<=15;x++)g[y][x]='#';
  }
  if(s.district==='lumiose-screw-vert3'){
   for(let y=4;y<=7;y++)for(let x=3;x<=5;x++)g[y][x]='#';
   for(let y=4;y<=6;y++)for(let x=18;x<=19;x++)g[y][x]='#';
   for(let y=8;y<=10;y++)for(let x=14;x<=15;x++)g[y][x]='#';
  }
  if(s.district==='lumiose-screw-rouge1-court'){
   for(let y=4;y<=7;y++)for(let x=3;x<=5;x++)g[y][x]='#';
   for(let y=9;y<=10;y++)for(let x=18;x<=19;x++)g[y][x]='#';
  }
  if(s.district==='lumiose-screw-vert5'){
   for(let y=4;y<=6;y++)for(let x=3;x<=5;x++)g[y][x]='#';
   for(let y=8;y<=10;y++)for(let x=18;x<=19;x++)g[y][x]='#';
  }
  if(s.district==='lumiose-screw-jaune6'){
   for(let y=4;y<=7;y++)for(let x=3;x<=5;x++)g[y][x]='#';
   for(let y=8;y<=10;y++)for(let x=14;x<=15;x++)g[y][x]='#';
  }
  g[11][14]='v'; // Older saves on the far platform can always descend.
 }
 if(s.district==='lumiose-screw-jaune8'&&side82Available(s)){g[3][15]='^';if(s.zaSide82Stage===1)g[3][18]='r';}
 g[12][4]='j';return g.map(row=>row.join(''));
}
export function screwRoofEntrance(s,spot){const p=screwRoofConfig(s);if(!p)return null;const tile=s.district==='lumiose-ombrage-arcade'?'$':'j';return s.district===p.district&&spot?.tile===tile&&spot.x===p.x&&spot.y===p.y?p:s.district===p.roof&&spot?.tile==='j'&&spot.x===4&&spot.y===12?p:null;}
