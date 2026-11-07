// Bleu Plaza: central monument/water and northeastern Florges fountain. The
// ring crossings, dimensions and connection to adjacent Zone 5 are provisional.
export function zone16Unlocked(s){return ['C','B','A'].includes(s?.zaRoyaleRank)||s?.zaMission24Complete===true;}
export const ZONE16_VISIBLE=[
 {id:'flaaffy',tile:'a',species:180,level:40,name:'보송송',x:5,y:4},
 {id:'falinks',tile:'b',species:870,level:41,name:'대여르',x:11,y:14},
 {id:'ampharos-alpha',tile:'d',species:181,level:52,name:'전룡',x:18,y:2,alpha:true},
 {id:'medicham',tile:'c',species:308,level:40,name:'요가램',x:18,y:7},
 // Froakie sits on the central monument; its exact level is provisional.
 // https://www.gamerguides.com/pokemon-legends-z-a/guide/wild-zones/bleu-plaza
 {id:'froakie',tile:'f',species:656,level:23,name:'개구마르',x:11,y:8},
];
export function zone16Visible(s,tile){return ZONE16_VISIBLE.find(p=>p.tile===tile&&!s.zaZone16Spent?.[p.id])||null;}
export const ZONE16_ITEMS=[{id:'battle-ultra',tile:'i',x:19,y:13,name:'하이퍼볼',kind:'ultraball'}];
export function zone16Item(s,tile){return ZONE16_ITEMS.find(p=>p.tile===tile&&!(Array.isArray(s.zaZone16Items)&&s.zaZone16Items.includes(p.id)))||null;}
export function zone16Map(s={}){
 // The southwest apartment garden is reached from a rooftop ladder. Its
 // coordinates, footprint and placement within this compressed district are draft.
 // https://clair.6fast.com/pokemon-legends-z-a/guide/getting-started/pokemon-locations/evolve-swirlix
 if(s.zaZone16Upper===true){
  const roof=Array.from({length:17},()=>Array(23).fill('#'));
  for(let y=3;y<=9;y++)for(let x=3;x<=11;x++)roof[y][x]='.';
  for(let y=5;y<=11;y++)for(let x=14;x<=19;x++)roof[y][x]='.';
  for(let x=11;x<=14;x++)roof[7][x]=',';
  roof[10][4]='l';return roof.map(r=>r.join(''));
 }
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 // Overhead map shows an island encircled by water with northwest, east
 // and southwest crossings. Widths and tile coordinates are 2D approximations.
 // https://github.com/Insektaure/Shiny-Stash-Live-Map/blob/main/romfs/lumiose.png
 for(const [y,xs] of [[4,[9,10,11,12,13]],[5,[14,15]],[6,[6,16]],[7,[6,16]],[8,[6,16]],[9,[6,16]],[10,[6,16]],[11,[7,14,15]],[12,[9,10,11,12,13]]])for(const x of xs)g[y][x]='~';
 for(let x=9;x<=13;x++)for(let y=6;y<=10;y++)g[y][x]='g';
 g[8][11]='#';for(const [x,y] of [[8,5],[16,8],[8,11]])g[y][x]=',';
 for(let y=3;y<=5;y++)for(let x=18;x<=20;x++)g[y][x]='~';g[4][19]='#'; // northeastern fountain
 for(let y=3;y<=5;y++)for(let x=3;x<=7;x++)g[y][x]='g';
 g[0][11]='X';g[8][22]='X';g[12][0]='X';g[14][4]='l';for(const p of ZONE16_ITEMS)if(zone16Item(s,p.tile))g[p.y][p.x]=p.tile;for(const p of ZONE16_VISIBLE)if(!s.zaZone16Spent?.[p.id])g[p.y][p.x]=p.tile;
 return g.map(r=>r.join(''));
}
export function zone16Encounter(s,rng=Math.random){const pool=[[180,40,41],[870,41,42],[308,40,42]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}
