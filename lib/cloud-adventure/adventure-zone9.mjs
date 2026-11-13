import {ZONE9_CRYSTALS,crystalFieldsUnlocked} from './adventure-mega-crystals.mjs';
// Zone 9 has ground scaffolding and ladders to rooftops. Geometry and the
// temporary city connector are provisional; relative species areas are sourced.
export const ZONE9_VISIBLE=[
 {id:'sableye',tile:'a',species:302,level:28,name:'깜까미',x:11,y:9,upper:false},
 {id:'mawile',tile:'b',species:303,level:28,name:'입치트',x:5,y:11,upper:true},
 {id:'kadabra',tile:'c',species:64,level:29,name:'윤겔라',x:17,y:10,upper:true},
 {id:'carbink',tile:'d',species:703,level:29,name:'멜리시',x:18,y:4,upper:true},
 {id:'espurr',tile:'e',species:677,level:28,name:'냐스퍼',x:11,y:7,upper:true},
 {id:'meowstic-alpha',tile:'f',species:678,level:42,name:'냐오닉스',x:12,y:6,upper:true,alpha:true},
 {id:'manectric-alpha',tile:'v',species:310,level:41,name:'썬더볼트',x:4,y:4,upper:true,alpha:true},
];
export function zone9Visible(s,tile){return ZONE9_VISIBLE.find(p=>p.upper===(s.zaZone9Upper===true)&&p.tile===tile&&!s.zaZone9Spent?.[p.id])||null;}
export const ZONE9_ITEMS=[{id:'south-hyper',tile:'i',x:18,y:10,upper:false,name:'고급상처약',kind:'hyper_potions'},{id:'north-heal',tile:'j',x:12,y:5,upper:true,name:'힐볼',kind:'healball'},{id:'west-great',tile:'k',x:3,y:4,upper:true,name:'슈퍼볼',kind:'greatball'}];
export function zone9Item(s,tile){return ZONE9_ITEMS.find(p=>p.upper===(s.zaZone9Upper===true)&&p.tile===tile&&!(Array.isArray(s.zaZone9Items)&&s.zaZone9Items.includes(p.id)))||null;}
export function zone9Map(s={}){
 const upper=s.zaZone9Upper===true,g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':upper?'#':'.'));
 if(upper){for(let y=3;y<=12;y++)for(let x=3;x<=7;x++)g[y][x]='.';for(let y=3;y<=12;y++)for(let x=15;x<=19;x++)g[y][x]='.';for(let y=5;y<=9;y++)for(let x=8;x<=14;x++)g[y][x]='g';
  // Raised scaffolding joins the roofs; exact placement and width are draft.
  // https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-9-guide-all-pokemon-and-alphas
  for(let x=8;x<=14;x++)g[11][x]=',';
  g[11][7]='o';g[11][15]='o'; // Draft connections to a separate scaffold elevation.
  // North and west scaffold approaches use formerly blocked roof edges.
  // Their precise relationship and tiles are 2D estimates.
  g[8][2]='o';g[4][11]='o';
 }
 else{
  // Building blocks beneath the western and eastern roofs; exact outlines are draft.
  for(const [x0,y0,x1,y1] of [[2,2,4,4],[17,2,20,4],[2,11,4,13]])for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)g[y][x]='#';
  for(let y=6;y<=10;y++)for(let x=8;x<=14;x++)g[y][x]=',';g[0][11]='X';g[8][22]='X';g[16][11]='X';g[16][15]='X';
  // The two southern exits both lead to Estival Avenue. Continue the
  // existing ground road to each; the compressed path layout is a draft.
  // Only ordinary floor is changed, leaving encounters and objects intact.
  // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_9
  for(let y=11;y<=15;y++)for(let x=10;x<=12;x++)if(g[y][x]==='.')g[y][x]=',';
  for(let x=12;x<=15;x++)if(g[14][x]==='.')g[14][x]=',';
  if(g[15][15]==='.')g[15][15]=',';
  // North and east exits connect Magenta Sectors 6 and 3 respectively.
  // Their local road footprints remain provisional.
  for(let y=1;y<=5;y++)for(let x=10;x<=12;x++)if(g[y][x]==='.')g[y][x]=',';
  for(let y=7;y<=9;y++)for(let x=15;x<=21;x++)if(g[y][x]==='.')g[y][x]=',';
 }
 // The two ladders are near the northwest and south entrances respectively.
 // Their exact tile positions remain provisional.
 // https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-9-guide-all-pokemon-and-alphas
 if(upper)g[14][15]='.';
 g[5][5]='l';g[13][15]='h';for(const p of ZONE9_VISIBLE)if(p.upper===upper&&!s.zaZone9Spent?.[p.id])g[p.y][p.x]=p.tile;for(const p of ZONE9_ITEMS)if(p.upper===upper&&zone9Item(s,p.tile))g[p.y][p.x]=p.tile;
 // Mission 40's anomalous Pangoro appears on the southwest roof near Mawile.
 // Exact tile and roof geometry remain provisional.
 // https://www.nintendolife.com/guides/pokemon-legends-z-a-how-to-catch-xerneas-and-yveltal
 if(upper&&crystalFieldsUnlocked(s))for(const p of ZONE9_CRYSTALS)if(g[p.y][p.x]==='.')g[p.y][p.x]='*';
 if(upper&&s.zaMission40Stage===1&&!(Array.isArray(s.zaMission40Anomalies)&&s.zaMission40Anomalies.includes('pangoro')))g[9][5]='0';
 return g.map(r=>r.join(''));
}
// The southern scaffold is between rooftops; shape and ladder endpoints are draft.
// https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/wild-zones/
// Items on the southern scaffold are documented; individual tiles are drafts.
export const ZONE9_SOUTH_ITEMS=[{id:'south-scaffold-carbos',tile:'i',x:8,y:4,name:'알칼로이드',kind:'carbos'},{id:'south-scaffold-zinc',tile:'j',x:9,y:5,name:'키토산',kind:'zinc'},{id:'south-scaffold-fullheal',tile:'k',x:14,y:9,name:'만병통치약',kind:'fullheal'},{id:'south-scaffold-dusk',tile:'t',x:15,y:10,name:'다크볼',kind:'duskball'}];
export function zone9SouthScaffoldItem(s,tile){return ZONE9_SOUTH_ITEMS.find(p=>p.tile===tile&&!(Array.isArray(s.zaZone9Items)&&s.zaZone9Items.includes(p.id)))||null;}
export function zone9SouthScaffoldMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=6;y<=8;y++)for(let x=4;x<=18;x++)g[y][x]=',';
 for(let y=4;y<=10;y++)for(const x of [4,5,17,18])g[y][x]=',';
 // Additional north and south work decks connect to the existing crossing.
 // The shapes and exact item tiles are 2D estimates, not surveyed geometry.
 for(let y=4;y<=5;y++)for(let x=7;x<=10;x++)g[y][x]=',';
 for(let y=9;y<=10;y++)for(let x=13;x<=16;x++)g[y][x]=',';
 for(const item of ZONE9_SOUTH_ITEMS)if(zone9SouthScaffoldItem(s,item.tile))g[item.y][item.x]=item.tile;
 g[7][3]='o';g[7][19]='o';return g.map(row=>row.join(''));
}
// North and west scaffold items are documented; positions and joining route are draft.
// https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/wild-zones/
export const ZONE9_NW_ITEMS=[{id:'north-scaffold-ultra',tile:'i',x:15,y:3,name:'하이퍼볼',kind:'ultraball'},{id:'west-scaffold-nugget',tile:'j',x:5,y:11,name:'금구슬',kind:'nugget'},{id:'west-scaffold-bigpearl',tile:'k',x:7,y:10,name:'큰진주',kind:'bigpearl'},{id:'west-scaffold-calcium',tile:'t',x:4,y:12,name:'리보플라빈',kind:'calcium'},{id:'west-scaffold-timer',tile:'v',x:6,y:12,name:'타이머볼',kind:'timerball'}];
export function zone9NWScaffoldItem(s,tile){return ZONE9_NW_ITEMS.find(p=>p.tile===tile&&!(Array.isArray(s.zaZone9Items)&&s.zaZone9Items.includes(p.id)))||null;}
export function zone9NWScaffoldMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=6;y<=9;y++)for(let x=4;x<=18;x++)g[y][x]=',';
 for(let y=3;y<=5;y++)for(let x=12;x<=16;x++)g[y][x]=',';
 for(let y=10;y<=12;y++)for(let x=4;x<=8;x++)g[y][x]=',';
 for(const item of ZONE9_NW_ITEMS)if(zone9NWScaffoldItem(s,item.tile))g[item.y][item.x]=item.tile;
 g[9][3]='o';g[4][14]='o';return g.map(row=>row.join(''));
}
// Fletchinder inhabits the middle rooftop; equal encounter weights are draft.
// https://pokemongohub.net/post/guide/all-wild-zones-pokemon-legends-z-a/
export function zone9Encounter(s,rng=Math.random){const pool=s.zaZone9Upper===true?[[703,28,30],[64,28,30],[677,27,29],[303,27,29],[662,27,30]]:[[302,28,30]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}

// Magenta Sector 6: a large building complex with a central courtyard.
// The geometry, gate positions and city streets are provisional.
export function magentaSector6Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=3;y<=11;y++)for(let x=5;x<=17;x++)g[y][x]='#';
 for(let y=5;y<=9;y++)for(let x=7;x<=15;x++)g[y][x]=',';
 for(let y=1;y<=15;y++)g[y][11]=',';
 g[5][2]='l';g[7][5]='a';g[0][4]='X';g[0][11]='X';g[8][0]='X';g[8][22]='X';g[16][11]='X';g[12][22]='X';return g.map(row=>row.join(''));
}

// Magenta Sector 3 lies southwest of Magenta Plaza beside Autumnal Avenue.
// https://bulbapedia.bulbagarden.net/wiki/Magenta_Sector_3
// The Sector 6 and Zone 9 connectors and exact paths remain provisional.
export function magentaSector3Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=2;y<=6;y++)for(let x=8;x<=17;x++)g[y][x]='#';
 for(let y=3;y<=5;y++)for(let x=10;x<=15;x++)g[y][x]=',';
 g[6][12]=',';for(let x=1;x<=21;x++)for(let y=8;y<=9;y++)g[y][x]=',';
 g[10][22]='X';g[8][0]='X';g[12][0]='X';g[8][19]='j';g[8][22]='X';g[0][4]='X';return g.map(row=>row.join(''));
}
