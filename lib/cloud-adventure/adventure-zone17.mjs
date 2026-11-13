// Vert Sector 7: stairs, ground habitat and nearby rooftops are documented;
// tile geometry and the temporary Vert Sector connection are unverified.
export function zone17Unlocked(s){return ['C','B','A'].includes(s?.zaRoyaleRank)||s?.zaMission25Complete===true;}
export const ZONE17_VISIBLE=[
 {id:'chespin',tile:'a',species:650,level:22,name:'도치마론',x:5,y:7},
 {id:'diggersby',tile:'b',species:660,level:45,name:'파르토',x:9,y:11},
 {id:'klefki',tile:'c',species:707,level:45,name:'클레피',x:17,y:9},
 {id:'pyroar',tile:'d',species:668,level:45,name:'화염레오',x:16,y:5},
 {id:'pyroar-alpha',tile:'e',species:668,level:56,name:'화염레오',x:17,y:6,alpha:true},
 {id:'mawile-alpha',tile:'e',species:303,level:56,name:'입치트',x:14,y:7,alpha:true,upper:true},
 // Day and night rooftop encounters; exact tile positions are provisional.
 // https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-17-guide-all-pokemon-and-alphas
 {id:'klefki',tile:'f',species:707,level:45,name:'클레피',x:8,y:6,upper:true,period:'day'},
 {id:'lampent',tile:'f',species:608,level:45,name:'램프라',x:8,y:6,upper:true,period:'night'},
];
export function zone17Visible(s,tile){return ZONE17_VISIBLE.find(p=>p.tile===tile&&(!p.period||p.period===(s.zaZone17Period||'day'))&&!!p.upper===(s.zaZone17Upper===true)&&(!s.zaZone17Promenade||s.zaZone17Upper||['pyroar','pyroar-alpha'].includes(p.id))&&!s.zaZone17Spent?.[p.id])||null;}
// Rooftop TM and nugget are behind Alpha Mawile; exact 2D positions are draft.
// https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Legends:_Z-A/Part_18
export const ZONE17_ITEMS=[{id:'stairs-timer',tile:'i',x:14,y:11,name:'타이머볼',kind:'timerball'},{id:'roof-flamethrower',tile:'t',x:16,y:5,name:'기술머신 062 화염방사',kind:'za-tm062',upper:true},{id:'roof-nugget',tile:'j',x:16,y:6,name:'큰금구슬',kind:'bignugget',upper:true}];
export function zone17Item(s,tile){return ZONE17_ITEMS.find(p=>p.tile===tile&&!!p.upper===(s.zaZone17Upper===true)&&!(Array.isArray(s.zaZone17Items)&&s.zaZone17Items.includes(p.id)))||null;}
// Building beside the rooftop ladder is documented; 2D footprint is provisional.
// https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_17
export const ZONE17_PROMENADE_BUILDING=[[13,5],[14,5],[15,5]];
export function zone17Map(s={}){
 const upper=s.zaZone17Upper===true;
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 if(upper){for(let y=4;y<=11;y++)for(let x=5;x<=17;x++)g[y][x]='.';for(let x=0;x<23;x++){g[0][x]='#';g[16][x]='#';}for(let y=1;y<16;y++)for(let x=1;x<22;x++)if(y<4||y>11||x<5||x>17)g[y][x]='#';
 // Two roof surfaces with a connecting landing; exact edge positions are draft.
 for(const y of [4,5,6,9,10,11])g[y][11]='#';
 // Narrow roof landing joins both surfaces and the far side of the alpha.
 for(const [x,y] of [[6,8],[7,8],[8,8],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[15,8],[16,8],[16,7]])g[y][x]=',';
 g[10][6]='l';for(const p of ZONE17_ITEMS)if(zone17Item(s,p.tile))g[p.y][p.x]=p.tile;for(const p of ZONE17_VISIBLE)if(zone17Visible(s,p.tile)===p)g[p.y][p.x]=p.tile;return g.map(row=>row.join(''));}
 if(s.zaZone17Promenade===true){
  // Separate upper promenade, with the three northern approaches and the
  // staircase to the southern lawn. Tile geometry and heights are draft.
  // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_17
  for(let y=1;y<16;y++)for(let x=1;x<22;x++)g[y][x]='#';
  for(let y=1;y<=14;y++)for(let x=10;x<=12;x++)g[y][x]=',';
  for(const x of [6,16])g[1][x]=',';
  for(let y=2;y<=7;y++)for(let x=5;x<=17;x++)g[y][x]='.';
  for(let y=4;y<=7;y++)for(let x=13;x<=19;x++)g[y][x]='.';
  for(let y=4;y<=7;y++)for(let x=3;x<=9;x++)g[y][x]='.';
  for(const [y,west,east] of [[2,6,16],[3,7,15],[4,8,14],[5,9,13]])for(const x of [west-1,west,west+1,east-1,east,east+1])g[y][x]=',';
  for(let y=2;y<=14;y++)for(let x=10;x<=12;x++)g[y][x]=',';
  for(const [x,y] of ZONE17_PROMENADE_BUILDING)g[y][x]='#';
  g[3][4]='^';g[3][18]='^';g[5][9]='^';g[6][13]='l';g[14][11]='h';
  g[0][6]='X';g[0][11]='X';g[0][16]='X';
  for(const p of ZONE17_VISIBLE)if(zone17Visible(s,p.tile)===p)g[p.y][p.x]=p.tile;
  return g.map(row=>row.join(''));
 }
 for(let y=5;y<=12;y++)for(let x=3;x<=19;x++)g[y][x]='g';
 for(let y=2;y<=4;y++)for(let x=3;x<=8;x++)g[y][x]='#';
 for(let y=2;y<=4;y++)for(let x=14;x<=19;x++)g[y][x]='#';
 for(let y=2;y<=4;y++){g[y][6]=',';g[y][16]=',';}
 // Provisional Y-shaped northern promenade and stairs to the southern lawn.
 // Broaden the paved approaches to the three northern gates and the south
 // park while leaving grass/encounter cells and all entrances unchanged.
 // Footprints are a 2D draft of the documented northern Y-shaped promenade.
 for(const y of [1,2,3,4,13,14,15])for(const x of [10,11,12])if(g[y][x]==='.')g[y][x]=',';
 for(const [a,b] of [[5,7],[15,17]])for(let x=a;x<=b;x++)if(g[1][x]==='.')g[1][x]=',';
 for(let y=5;y<=15;y++)g[y][11]=',';
 for(let x=8;x<=14;x++)g[7][x]=',';
 for(let x=6;x<=8;x++)g[5][x]=',';
 for(let x=14;x<=16;x++)g[5][x]=',';
 for(let x=7;x<=9;x++)g[6][x]=',';
 for(let x=13;x<=15;x++)g[6][x]=',';
 for(let x=10;x<=12;x++)g[10][x]=':';g[10][11]='h';
 // Southern park has four benches and a stand; tile locations are provisional.
 // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_17
 for(const [x,y] of [[4,14],[6,14],[16,14],[18,14],[19,13]])g[y][x]='^';
 // Decorative statues use existing blocked cells, preserving saved positions.
 g[3][4]='^';g[3][18]='^';
 g[0][6]='X';g[0][16]='X';g[0][11]='X';g[16][11]='X';g[16][5]='X';g[8][0]='W';g[8][22]='X';g[6][13]='l';for(const p of ZONE17_ITEMS)if(zone17Item(s,p.tile))g[p.y][p.x]=p.tile;for(const p of ZONE17_VISIBLE)if(zone17Visible(s,p.tile)===p)g[p.y][p.x]=p.tile;
 return g.map(row=>row.join(''));
}
// Lampent is listed at night; Skarmory is documented in the area. Weather
// restrictions and exact spawn points are not modelled here.
// https://pokemongohub.net/post/guide/all-wild-zones-pokemon-legends-z-a/
export function zone17Encounter(s,rng=Math.random,period='day'){const pool=[[650,20,25],[660,44,46],[707,44,46],[668,44,47],[227,45,46],...(period==='night'?[[608,45,46]]:[])],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}
