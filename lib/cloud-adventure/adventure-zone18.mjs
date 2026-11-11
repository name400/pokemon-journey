// Magenta Sector 9: Northern Street and a ground-level grass patch are
// documented. Tile geometry and this draft's exact street connection are not.
export function zone18Unlocked(s){return ['B','A'].includes(s?.zaRoyaleRank)||s?.zaMission30Complete===true;}
export const ZONE18_VISIBLE=[
 {id:'bagon',tile:'a',species:371,level:45,name:'아공이',x:8,y:8},
 {id:'lopunny-alpha',tile:'c',species:428,level:56,name:'이어롭',x:12,y:5,alpha:true},
 // The old ground marker remains for existing routes; both markers share a
 // single encounter record. Exact alley coordinates are provisional.
 {id:'lopunny-alpha',tile:'c',species:428,level:56,name:'이어롭',x:17,y:5,alpha:true,construction:true},
 {id:'fennekin',tile:'d',species:653,level:22,name:'푸호꼬',x:16,y:7,upper:true},
 {id:'salamence-alpha',tile:'b',species:373,level:62,name:'보만다',x:14,y:8,alpha:true},
];
export function zone18Visible(s,tile){return ZONE18_VISIBLE.find(p=>p.tile===tile&&!!p.construction===(s.zaZone18Construction===true)&&!!p.upper===(s.zaZone18Upper===true)&&!s.zaZone18Spent?.[p.id])||null;}
export const ZONE18_ITEMS=[{id:'roof-quick',tile:'i',x:16,y:5,name:'퀵볼',kind:'quickball'}];
export function zone18Item(s,tile){return s.zaZone18Upper?ZONE18_ITEMS.find(p=>p.tile===tile&&!(Array.isArray(s.zaZone18Items)&&s.zaZone18Items.includes(p.id)))||null:null;}
// Scaffolding in the courtyard is documented; exact footprints are provisional.
// https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_18
export const ZONE18_SCAFFOLD=[[8,2],[9,2],[8,3],[9,3],[15,2],[16,2],[15,3],[16,3]];
export function zone18Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 if(s.zaZone18Construction===true){
  // Southeast alley between construction scaffolds. Shape and dimensions are
  // an approximation; the original guide places Lopunny among the scaffolds.
  // https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-18-guide-all-pokemon-and-alphas
  for(let y=1;y<16;y++)for(let x=1;x<22;x++)g[y][x]='#';
  for(let y=8;y<=13;y++)for(let x=2;x<=19;x++)g[y][x]=',';
  for(let y=3;y<=8;y++)for(let x=14;x<=20;x++)g[y][x]='.';
  for(const [x,y] of [[7,8],[7,9],[10,12],[10,13],[14,8],[19,8]])g[y][x]='^';
  g[13][2]='h';const alpha=ZONE18_VISIBLE.find(p=>p.construction&&zone18Visible(s,p.tile)===p);if(alpha)g[alpha.y][alpha.x]=alpha.tile;
  return g.map(row=>row.join(''));
 }
 if(s.zaZone18Upper){for(let y=1;y<16;y++)for(let x=1;x<22;x++)if(y<4||y>11||x<5||x>18)g[y][x]='#';
 // Opposing rooftops meet at the scaffold walkway; edge coordinates are draft.
 for(const y of [4,5,6,7,10,11])g[y][11]='#';
 // Provisional western rooftop gate to the neighboring outside roof.
 for(let x=1;x<=4;x++)g[8][x]=',';g[8][0]='W';
 // A second gate is described near the Fennekin rooftop. Its exact location
 // and relationship to the neighbouring roof are provisional.
 // https://game8.jp/pokemon-legends-z-a/729772
 for(let x=19;x<=21;x++)g[8][x]=',';g[8][22]='E';
 for(let x=6;x<=17;x++)g[9][x]=',';for(let y=5;y<=9;y++)g[y][12]=',';g[10][6]='l';for(const p of ZONE18_ITEMS)if(zone18Item(s,p.tile))g[p.y][p.x]=p.tile;for(const p of ZONE18_VISIBLE)if(zone18Visible(s,p.tile)===p)g[p.y][p.x]=p.tile;return g.map(row=>row.join(''));}
 for(let y=6;y<=10;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=6;y<=10;y++)for(let x=4;x<=9;x++)g[y][x]='g';
 for(let y=7;y<=9;y++)for(let x=13;x<=15;x++)g[y][x]='g';
 for(let y=11;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 // Northern Street and the southeastern alley have separate accesses.
 // Only existing floor is paved; exact footprints are provisional.
 // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_18
 for(let y=1;y<=5;y++)for(let x=10;x<=12;x++)if(g[y][x]==='.')g[y][x]=',';
 for(let x=12;x<=20;x++)if(g[15][x]==='.')g[15][x]=',';
 for(const [x,y] of ZONE18_SCAFFOLD)g[y][x]='^';
 g[8][0]='W';g[8][22]='E';g[0][11]='X';g[16][11]='X';g[16][20]='X';g[5][13]='l';g[13][14]='l';g[14][20]='h';for(const p of ZONE18_VISIBLE)if(zone18Visible(s,p.tile)===p)g[p.y][p.x]=p.tile;
 return g.map(row=>row.join(''));
}
export function zone18Encounter(s,rng=Math.random){const next=()=>Math.max(0,Math.min(.999999999999,rng()));return {speciesId:371,level:44+Math.floor(next()*2)};}

// Magenta Sector 9 borders Zone 18 and Quasartico. Precise geometry is provisional.
export function magentaSector9Map(s={}){
 // Outside scaffolding leads to a roof before crossing the Zone 18 gate.
 // The roof outline, gate tile and connection are provisional.
 // https://game8.jp/pokemon-legends-z-a/729772
 if(s.zaMagenta9Upper===true){
  const roof=Array.from({length:17},()=>Array(23).fill('#'));
  for(let y=4;y<=11;y++)for(let x=4;x<=17;x++)roof[y][x]='.';
  // Draft approach to a second Wild Zone 18 rooftop gate.
  for(let x=18;x<=21;x++)roof[8][x]=',';roof[8][22]='E';
  for(let y=1;y<=3;y++)roof[y][11]=',';
  roof[0][11]='X';roof[10][6]='l';return roof.map(row=>row.join(''));
 }
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=3;y<=6;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=10;y<=13;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 // A scaffold outside the south side reaches Zone 18's roofs; this exact
 // position and route are a draft in the compressed district screen.
 // https://www.gamerguides.com/pokemon-legends-z-a/guide/wild-zones/magenta-sector-9/all-wild-zone-18-pokemon-locations
 g[13][14]='l';
 // Mission 13 occurs in Magenta Sector 9; exact location is provisional.
 // https://bulbapedia.bulbagarden.net/wiki/Magenta_Sector_9
 if((s.zaMission10Stage===10&&!s.zaMission13Complete)||s.zaMission13RewardPending)g[8][12]='d';
 g[0][11]='X';g[8][0]='X';g[8][22]='X';g[16][3]='X';g[16][11]='X';return g.map(row=>row.join(''));
}

// Autumnal Avenue connects Centrico, Magenta Sector 9 and Zone 18; layout is provisional.
export function autumnalApproachMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=9;x<=13;x++)g[y][x]=',';
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=3;y<=6;y++)for(let x=3;x<=6;x++)g[y][x]='#';
 for(let y=10;y<=13;y++)for(let x=16;x<=19;x++)g[y][x]='#';
 for(let x=1;x<=9;x++)g[12][x]=',';
 g[0][11]='X';g[4][0]='X';g[6][0]='X';g[8][0]='X';g[10][0]='X';g[12][0]='X';g[14][0]='X';g[8][22]='X';g[16][11]='X';return g.map(row=>row.join(''));
}
