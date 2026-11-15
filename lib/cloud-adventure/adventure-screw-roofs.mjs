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
 {district:'lumiose-jaune-sector7',roof:'lumiose-screw-jaune7',x:9,y:3},
]);
export function screwRoofConfig(s){return !s?.interior?SCREW_ROOFS.find(p=>p.district===s?.district||p.roof===s?.district):undefined;}
export const SCREW_GLIDE_ROOFS=Object.freeze(['lumiose-screw-rouge8','lumiose-screw-jaune9','lumiose-screw-jaune11','lumiose-screw-vert3','lumiose-screw-rouge1-court','lumiose-screw-jaune3','lumiose-screw-palais','lumiose-screw-bleu3','lumiose-screw-vert5','lumiose-screw-vert8','lumiose-screw-jaune6','lumiose-screw-jaune7']);
export function isScrewGlideRoof(district){return SCREW_GLIDE_ROOFS.includes(district);}
export function screwGlideVertical(district){return ['lumiose-screw-jaune3','lumiose-screw-palais','lumiose-screw-bleu3','lumiose-screw-vert8'].includes(district);}
export function screwGlideAt(district,x,y){return isScrewGlideRoof(district)&&(screwGlideVertical(district)?x===9&&(y===7||y===11):y===6&&(x===10||x===14));}
export function screwRoofDropSpot(district){return screwGlideVertical(district)?{x:14,y:6}:{x:14,y:11};}
// A nearby scaffold carries a Super Potion and Pearl; coordinates are draft.
// https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/magenta-sector-8.html
export const MAGENTA8_SCAFFOLD_ITEMS=[{id:'scaffold-super',tile:'i',x:6,y:6,name:'좋은상처약',kind:'super_potions'},{id:'scaffold-pearl',tile:'k',x:9,y:6,name:'진주',kind:'pearl'},{id:'southwest-nest',tile:'o',x:4,y:8,name:'네스트볼',kind:'nestball'},{id:'center-candy',tile:'p',x:14,y:5,name:'경험사탕 M',kind:'za-exp-candy-m'},{id:'south-revive',tile:'q',x:18,y:11,name:'기력의조각',kind:'revive'}];
export const MAGENTA8_EAST_ROOF_ITEMS=[{id:'east-zinc',tile:'i',x:9,y:11,name:'키토산',kind:'zinc'},{id:'east-hpup',tile:'k',x:4,y:5,name:'맥스업',kind:'hpup'},{id:'triste-max-revive',tile:'o',x:18,y:5,name:'기력의덩어리',kind:'maxrevive'}];
export function magenta8ScaffoldItem(s,tile){const items=s.district==='lumiose-screw-magenta8'?MAGENTA8_SCAFFOLD_ITEMS:s.district==='lumiose-magenta8-east-roof'?MAGENTA8_EAST_ROOF_ITEMS:[];return items.find(p=>p.tile===tile&&!(Array.isArray(s.zaMagenta8Items)&&s.zaMagenta8Items.includes(p.id)))||null;}
// Separate eastern and cafe rooftops connected by a provisional glide.
export function magenta8EastRoofMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=4;y<=12;y++)for(let x=3;x<=10;x++)g[y][x]='.';
 for(let y=4;y<=12;y++)for(let x=14;x<=19;x++)g[y][x]='.';
 for(const p of MAGENTA8_EAST_ROOF_ITEMS)if(magenta8ScaffoldItem(s,p.tile))g[p.y][p.x]=p.tile;
 return g.map(row=>row.join(''));
}
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
 if(s.district==='lumiose-screw-magenta8')for(const p of MAGENTA8_SCAFFOLD_ITEMS)if(magenta8ScaffoldItem(s,p.tile))g[p.y][p.x]=p.tile;
 g[12][4]='j';return g.map(row=>row.join(''));
}
export function screwRoofEntrance(s,spot){const p=screwRoofConfig(s);if(!p)return null;const tile=s.district==='lumiose-ombrage-arcade'?'$':'j';return s.district===p.district&&spot?.tile===tile&&spot.x===p.x&&spot.y===p.y?p:s.district===p.roof&&spot?.tile==='j'&&spot.x===4&&spot.y===12?p:null;}
