import {findVisibleWild} from './adventure-visible-wild.mjs';
// The north/south street, waterway, ladder and rooftop are based on Zone 6
// references. Exact coordinates, layer links and building shapes are provisional.
export const ZONE6_VISIBLE=[
 {id:'houndour',tile:'a',species:228,level:18,name:'델빌',x:6,y:5,layer:'ground'},
 {id:'meditite',tile:'b',species:307,level:20,name:'요가랑',x:15,y:5,layer:'ground',period:'day'},
 {id:'buneary',tile:'d',species:427,level:18,name:'이어롤',x:8,y:13,layer:'ground'},
 {id:'magikarp',tile:'a',species:129,level:18,name:'잉어킹',x:12,y:8,layer:'canal',water:true},
 {id:'binacle',tile:'b',species:688,level:20,name:'거북손손',x:5,y:6,layer:'canal'},
 {id:'flaaffy',tile:'a',species:180,level:20,name:'보송송',x:7,y:5,layer:'roof'},
 {id:'swablu',tile:'b',species:333,level:19,name:'파비코',x:9,y:7,layer:'roof'},
 {id:'houndoom-alpha',tile:'e',species:229,level:33,name:'헬가',x:8,y:3,layer:'ground',alpha:true},
 {id:'binacle-alpha',tile:'d',species:688,level:33,name:'거북손손',x:17,y:6,layer:'canal',alpha:true},
 {id:'pikachu-alpha',tile:'a',species:25,level:40,name:'피카츄',x:10,y:5,layer:'high',alpha:true},
];
// Faye's battle court is documented; the 2D tile is provisional.
// Ticien appears after the Mission 8 battle with Lida. The court tile is a draft.
export function zone6TicienAvailable(s){return Number(s?.zaLidaStage)>=2||s?.zaMission08Complete===true||['V','F','E','D','C','B','A'].includes(s?.zaRoyaleRank);}
export function zone6FayeAvailable(s){return Number(s?.zaMission15Stage)>=1||['D','C','B','A'].includes(s?.zaRoyaleRank)||Number(s?.zaMission20Stage)>0;}
export function zone6Layer(s){return ['canal','roof','high'].includes(s.zaZone6Layer)?s.zaZone6Layer:'ground';}
export function zone6Visible(s,tile){return findVisibleWild(s,ZONE6_VISIBLE,p=>p.tile===tile&&p.layer===zone6Layer(s)&&(!p.period||p.period===(s.zaZone6Period||'day'))&&!s.zaZone6Spent?.[p.id])||null;}
export const ZONE6_ITEMS=[{id:'south-potion',tile:'i',layer:'ground',x:19,y:14,name:'좋은상처약',kind:'super_potions'},{id:'canal-potion',tile:'i',layer:'canal',x:18,y:6,name:'좋은상처약',kind:'super_potions'},{id:'roof-luxury',tile:'i',layer:'high',x:8,y:5,name:'럭셔리볼',kind:'luxuryball'}];
export function zone6Item(s,tile){return ZONE6_ITEMS.find(p=>p.tile===tile&&p.layer===zone6Layer(s)&&!(Array.isArray(s.zaZone6Items)&&s.zaZone6Items.includes(p.id)))||null;}
// Café Bataille is documented in the zone; its footprint is a 2D draft.
// https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-6-guide-all-pokemon-and-alphas
export const ZONE6_CAFE_FOOTPRINT=[[17,1],[18,1],[19,1],[17,2],[18,2],[19,2]];
// Market stalls are near the street's Houndoom; exact positions and count are draft.
// https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-6-guide-all-pokemon-and-alphas
export const ZONE6_MARKET_STALLS=[[4,2],[5,2],[7,2],[8,2]];
export function zone6Map(s={}){
 const layer=zone6Layer(s),g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 if(layer==='canal'){
  for(let y=1;y<16;y++)for(let x=1;x<22;x++)g[y][x]='#';
  for(let y=4;y<=12;y++)for(let x=2;x<=20;x++)g[y][x]='.';
  for(let y=8;y<=11;y++)for(let x=4;x<=18;x++)g[y][x]='~';
  // Shallow passage below the ground-layer bridge footprint; width is provisional.
  // Keep the adjacent deeper water and its existing encounter cells unchanged.
  // https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-6-guide-all-pokemon-and-alphas
  for(let y=8;y<=11;y++)for(let x=10;x<=11;x++)g[y][x]='w';
  g[5][3]='l';
  // Southern waterside access below the bridge; exact bank coordinates are draft.
  // https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-6-guide-all-pokemon-and-alphas
  for(let y=12;y<=15;y++)for(const x of [3,5])g[y][x]='.';
  g[16][3]='X';g[16][5]='X';
 }else if(layer==='high'){
  for(let y=1;y<16;y++)for(let x=1;x<22;x++)g[y][x]='#';
  for(let y=3;y<=10;y++)for(let x=4;x<=18;x++)g[y][x]='.';
  // The café has a roof; connect the draft high layer above its ground footprint.
  // https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-6-guide-all-pokemon-and-alphas
  for(let y=1;y<=2;y++)for(let x=17;x<=19;x++)g[y][x]='.';
  g[3][17]='j';g[10][12]='v';
 }else if(layer==='roof'){
  for(let y=1;y<16;y++)for(let x=1;x<22;x++)g[y][x]='#';
  for(let y=3;y<=13;y++)for(let x=4;x<=18;x++)g[y][x]='.';
  g[3][17]='h';if(!s.zaZone6Tm041)g[12][12]='t';
 }else{
  // The canal continues beyond both sides of the ground-level view.
  for(let y=9;y<=12;y++)for(let x=0;x<=22;x++)g[y][x]='~';
  for(let y=9;y<=12;y++)for(let x=10;x<=12;x++)g[y][x]=';';
  for(let y=3;y<=7;y++)for(let x=3;x<=8;x++)g[y][x]='g';
  for(let y=3;y<=6;y++)for(let x=13;x<=16;x++)g[y][x]='g';
  // Ground approaches join the existing bridge to the north and south gates.
  // Only ordinary floor changes; these widths and coordinates are provisional.
  // https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-6-guide-all-pokemon-and-alphas
  for(const [y0,y1] of [[1,8],[13,15]])for(let y=y0;y<=y1;y++)for(let x=10;x<=12;x++)if(g[y][x]==='.')g[y][x]=',';
  for(let x=10;x<=15;x++)if(g[1][x]==='.')g[1][x]=',';
  for(let x=12;x<=18;x++)if(g[15][x]==='.')g[15][x]=',';
  // Connect the northern approach to the café frontage around its entrance.
  // The paving coordinates are a 2D approximation, not surveyed geometry.
  for(const [x,y] of [[16,1],[16,2],[16,3],[17,3],[17,4],[17,5],[18,5],[19,5],[19,4],[19,3]])if(g[y][x]==='.')g[y][x]=',';
  // North Boulevard crosses the zone; exact gate coordinates are provisional.
  // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_6
  for(const [x,y] of ZONE6_CAFE_FOOTPRINT)g[y][x]='%';
  for(const [x,y] of ZONE6_MARKET_STALLS)g[y][x]='%';
  if(zone6FayeAvailable(s))g[4][10]='F';if(zone6TicienAvailable(s))g[4][12]='T';g[0][11]='X';g[0][14]='X';g[0][15]='X';g[16][18]='X';g[16][16]='X';g[16][11]='X';g[3][18]='q';g[8][5]='l';g[4][18]='h';g[4][20]='j';
 }
 // The original uses a Holovator for the Flaaffy/Swablu roof and a
 // separate ladder to the Alpha Pikachu roof. These 2D coordinates are draft.
 // https://www.gamersheroes.com/game-guides/pokemon-legends-z-a-wild-zone-guide/
 if(layer==='ground'){g[7][16]='u';g[7][19]='k';}
 else if(layer==='roof')g[7][16]='u';
 else if(layer==='high')g[7][16]='k';
 for(const p of ZONE6_VISIBLE)if(p.layer===layer&&zone6Visible(s,p.tile)===p)g[p.y][p.x]=p.tile;
 for(const p of ZONE6_ITEMS)if(p.layer===layer&&!(Array.isArray(s.zaZone6Items)&&s.zaZone6Items.includes(p.id)))g[p.y][p.x]=p.tile;
 return g.map(row=>row.join(''));
}
// Initial ground species and source level ranges; probabilities are provisional.
export function zone6Encounter(rng=Math.random,period='day'){const pool=[[228,17,18],...(period==='night'?[]:[[307,19,20]]),[427,17,18]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}

// Jaune Sector 11 adjoins Zone 6's northern entrance; local geometry is provisional.
export function jauneSector11Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=3;y<=6;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=9;y<=12;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 g[0][11]='X';g[8][0]='X';g[8][22]='X';g[16][11]='X';return g.map(row=>row.join(''));
}
