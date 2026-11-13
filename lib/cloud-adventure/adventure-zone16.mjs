// Bleu Plaza: central monument, blue paving and northeastern Florges fountain. The
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
export function zone16Visible(s,tile){return ZONE16_VISIBLE.find(p=>p.tile===tile&&(s.district!=='lumiose-zone16-garden'||['flaaffy','ampharos-alpha'].includes(p.id))&&!s.zaZone16Spent?.[p.id])||null;}
// Abandoned market stalls are documented, but their tile positions are draft.
// https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_16
export const ZONE16_STALLS=[[3,13],[20,13]];
export const ZONE16_ITEMS=[{id:'battle-ultra',tile:'i',x:19,y:13,name:'하이퍼볼',kind:'ultraball'}];
export const ZONE16_GARDEN_TM={id:'garden-tm076',tile:'t',x:7,y:5,name:'기술머신 076 아쿠아브레이크',kind:'za-tm076'};
export function zone16Item(s,tile){const items=s.district==='lumiose-zone16-garden'?[ZONE16_GARDEN_TM]:s.zaZone16Upper?[]:ZONE16_ITEMS;return items.find(p=>p.tile===tile&&!(Array.isArray(s.zaZone16Items)&&s.zaZone16Items.includes(p.id)))||null;}
// Legacy coordinate retained for restoring old saves. The formerly assumed
// moat is a walkable blue plaza ring; precise tile boundaries are provisional.
export const ZONE16_WEST_MOAT=[[7,6]];
export const ZONE16_BLUE_RING=[...[ [4,[9,10,11,12,13]],[5,[14,15]],[6,[6,16]],[7,[6,16]],[8,[6,16]],[9,[6,16]],[10,[6,16]],[11,[7,14,15]],[12,[9,10,11,12,13]] ].flatMap(([y,xs])=>xs.map(x=>[x,y])),[7,6],[8,5],[16,8],[8,11],[8,4],[14,4],[6,5],[7,5],[7,12],[8,12],[14,12],[15,12]];
const BLUE_RING_KEYS=new Set(ZONE16_BLUE_RING.map(([x,y])=>y*23+x));
export function zone16BlueRingAt(x,y){return BLUE_RING_KEYS.has(y*23+x);}
// Raised garden documented near Alpha Ampharos; stair location and layout are drafts.
// https://allthings.how/every-pokemon-in-wild-zone-16-in-pokemon-legends-z-a-and-how-to-catch-them/
// Florges fountain is documented; basin shape and its compressed 2D position are draft.
export const ZONE16_GARDEN_FOUNTAIN=[[8,3],[9,3],[10,3],[8,4],[9,4],[10,4],[8,5],[9,5],[10,5]];
export function zone16GardenMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=2;y<=11;y++)for(let x=3;x<=19;x++)g[y][x]='.';
 // Paving follows the existing staircase to the rear garden. Width and exact
 // garden outline are a compressed 2D draft; no occupied tile is blocked.
 for(let y=3;y<=11;y++)g[y][17]=',';
 for(let x=5;x<=17;x++)g[7][x]=',';
 for(const [x,y] of ZONE16_GARDEN_FOUNTAIN)g[y][x]='~';g[4][9]='^';
 g[12][17]='j';if(zone16Item({...s,district:'lumiose-zone16-garden'},'t'))g[ZONE16_GARDEN_TM.y][ZONE16_GARDEN_TM.x]='t';
 for(const p of ZONE16_VISIBLE)if(['flaaffy','ampharos-alpha'].includes(p.id)&&!s.zaZone16Spent?.[p.id])g[p.y][p.x]=p.tile;
 return g.map(row=>row.join(''));
}
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
 // Walkable blue paving surrounds the central grassy monument. The ring
 // occupies the previous provisional moat; the separate northeast fountain
 // remains water. Exact tile boundaries are a 2D approximation.
 for(const [x,y] of ZONE16_BLUE_RING)g[y][x]=',';
 for(let x=9;x<=13;x++)for(let y=6;y<=10;y++)g[y][x]='g';
 g[8][11]='#';for(const [x,y] of [[8,5],[16,8],[8,11]])g[y][x]=',';
 for(let y=3;y<=5;y++)for(let x=18;x<=20;x++)g[y][x]='~';g[4][19]='#'; // northeastern fountain
 for(let y=3;y<=5;y++)for(let x=3;x<=7;x++)g[y][x]='g';
 // Three plaza approaches join the paved ring. Tile positions are approximate;
 // preserve the existing access routes, grass, and encounter positions.
 // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_16
 for(let y=1;y<=3;y++)if(g[y][11]==='.')g[y][11]=',';
 for(let x=8;x<=11;x++)if(g[3][x]==='.')g[3][x]=',';
 if(g[4][8]==='.')g[4][8]=',';
 for(let x=17;x<=21;x++)if(g[8][x]==='.')g[8][x]=',';
 for(let x=1;x<=8;x++)if(g[12][x]==='.')g[12][x]=',';
 for(const [x,y] of ZONE16_STALLS)g[y][x]='^';
 // The northwest approach faces the Rust Syndicate Office; this extra
 // screen edge is a draft connection while the older plaza route remains.
 // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_16
 g[0][8]='X';g[0][11]='X';g[8][22]='X';g[12][0]='X';g[14][4]='l';g[6][17]='j';for(const p of ZONE16_ITEMS)if(zone16Item(s,p.tile))g[p.y][p.x]=p.tile;for(const p of ZONE16_VISIBLE)if(!s.zaZone16Spent?.[p.id])g[p.y][p.x]=p.tile;
 return g.map(r=>r.join(''));
}
// Fountain species differ by period in the source; their exact points and
// weights on this compressed map remain provisional.
// https://allthings.how/every-pokemon-in-wild-zone-16-in-pokemon-legends-z-a-and-how-to-catch-them/
export function zone16Encounter(s,rng=Math.random,period='day'){const pool=[[180,40,41],[870,41,42],[308,40,42],...(period==='night'?[[689,41,43],[121,41,43]]:[[671,42,43]])],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}
