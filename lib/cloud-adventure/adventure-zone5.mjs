import {fieldMove} from './adventure-field-moves.mjs';

// Topology from the Zone 5 guide: west/south access, west clearing, northwest
// ladder and eastern rooftop. Tile dimensions and approaches remain provisional.
// Mission 40's Gallade is beside a stall on the western side. Exact tiles are draft.
// https://www.nintendolife.com/guides/pokemon-legends-z-a-how-to-catch-xerneas-and-yveltal
export const ZONE5_WEST_STALL=[[2,6],[3,6]];
export function zone5Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 if(s.zaZone5Upper===true){for(let y=1;y<16;y++)for(let x=1;x<22;x++)g[y][x]='#';for(let y=3;y<=6;y++)for(let x=3;x<=9;x++)g[y][x]='.';for(let x=9;x<=17;x++)g[4][x]='.';for(let y=3;y<=6;y++)for(let x=17;x<=20;x++)g[y][x]='.';// Separate roof reached across a deployable web; geometry is provisional.
 // https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/wild-zones/
 g[5][11]='.';g[6][11]=s.zaZone5WebOpen?',':'r';
 for(let y=7;y<=10;y++)for(let x=10;x<=14;x++)g[y][x]='.';
 if(!s.zaZone5WebFullHeal)g[9][12]='k';
 g[4][4]='l';g[6][17]='h';g[3][19]='c';if(!s.zaZone5Tm040)g[6][18]='t';for(const p of ZONE5_VISIBLE.filter(p=>p.upper&&!s.zaZone5Spent?.[p.id]))g[p.y][p.x]=p.tile;return g.map(r=>r.join(''));}
 // The northwest roof is above buildings beside the ladder; these ground
 // footprints are provisional and leave the ladder and drain rock accessible.
 for(const [x0,x1] of [[2,4],[8,9]])for(let y=1;y<=3;y++)for(let x=x0;x<=x1;x++)g[y][x]='#';
 // Bleu Street's northbound alignment through Zone 5 is approximate.
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=5;y<=12;y++)for(let x=2;x<=9;x++)g[y][x]='g';
 for(const [x,y] of ZONE5_WEST_STALL)g[y][x]='#';
 for(let y=2;y<=5;y++)for(let x=11;x<=15;x++)g[y][x]='g';
 for(let y=7;y<=11;y++)for(let x=18;x<=21;x++)g[y][x]='~';
 for(let y=3;y<=6;y++)for(let x=17;x<=20;x++)g[y][x]='#';
 // Southern accesses to Bleu Sector 3 and Bleu Plaza share the approach to
 // the existing north–south street. The road's compressed footprint is draft.
 // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_5
 for(let y=14;y<=15;y++)for(let x=5;x<=17;x++)if(g[y][x]==='.')g[y][x]=',';
 g[2][6]=s.zaZone5DrainFirstCleared?'s':'r';g[4][4]='l';g[8][0]='W';g[10][0]='X';g[12][0]='X';g[0][11]='X';g[16][5]='X';g[16][11]='X';g[16][17]='X';g[13][22]='X';for(const p of ZONE5_VISIBLE.filter(p=>!p.upper&&!p.drain&&!s.zaZone5Spent?.[p.id]))g[p.y][p.x]=p.tile;
 if(s.zaMission40Stage===1&&!(Array.isArray(s.zaMission40Anomalies)&&s.zaMission40Anomalies.includes('gallade')))g[6][5]='0';
 return g.map(r=>r.join(''));
}
// The listed ground species and level follow the original; probabilities are provisional.
export function zone5Encounter(rng=Math.random){const ids=[16,69,504,543,659,661],v=Math.max(0,Math.min(.999999999999,rng()));return {speciesId:ids[Math.floor(v*ids.length)],level:13};}

// Relative landmarks are documented; exact coordinates and encounters are provisional.
export const ZONE5_VISIBLE=[{id:'abra',tile:'a',x:6,y:3,upper:true,species:63,level:13,name:'캐이시'},{id:'electrike',tile:'e',x:7,y:3,upper:true,species:309,level:17,name:'썬더라이'},{id:'pidgeotto',tile:'d',x:19,y:5,upper:true,species:17,level:19,name:'피죤'},{id:'bellsprout-alpha',tile:'b',x:4,y:10,upper:false,species:69,level:25,name:'모다피',alpha:true},{id:'whirlipede-alpha',tile:'v',x:18,y:5,upper:false,drain:true,species:544,level:28,name:'휠구',alpha:true}];
export function zone5Visible(s,tile){if(s.zaZone5DrainLanding)return null;return ZONE5_VISIBLE.find(p=>p.tile===tile&&(s.district==='lumiose-zone5-drain'?p.drain===true:!p.drain&&p.upper===(s.zaZone5Upper===true))&&!s.zaZone5Spent?.[p.id])||null;}

// Underground stairs, tunnel and eastern clearing: topology from Zone 5 guides;
// tile dimensions and exact stairs, sludge and bank positions remain provisional.
export function zone5DrainMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 if(s.zaZone5DrainLanding===true){
  // A landing between the two documented southeast ladders. Position and
  // shape are draft. https://game8.co/games/Pokemon-Legends-Z-A/archives/557826
  for(let y=6;y<=8;y++)for(let x=9;x<=15;x++)g[y][x]='.';
  g[9][10]='h';g[5][14]='j';return g.map(row=>row.join(''));
 }

 for(let y=11;y<=13;y++)for(let x=1;x<=9;x++)g[y][x]='.';
 for(let y=4;y<=13;y++)for(let x=7;x<=9;x++)g[y][x]='.';
 for(let y=4;y<=6;y++)for(let x=7;x<=21;x++)g[y][x]='.';
 for(let y=3;y<=8;y++)for(let x=15;x<=20;x++)g[y][x]='.';
 // Traversable shallow water leads through the underground canal; exact outline is draft.
 // https://www.powerpyx.com/pokemon-legends-z-a-electrike-location/
 for(let y=7;y<=12;y++)for(let x=7;x<=9;x++)if(g[y][x]==='.')g[y][x]='w';
 for(let x=1;x<=9;x++)if(g[12][x]==='.')g[12][x]='w';
 if(!s.zaZone5DrainSecondCleared)for(let y=4;y<=6;y++)g[y][12]='r';
 const alpha=ZONE5_VISIBLE.find(p=>p.drain&&!s.zaZone5Spent?.[p.id]);if(alpha)g[alpha.y][alpha.x]=alpha.tile;
 g[7][19]='h';g[12][0]='W';g[4][22]='X';return g.map(row=>row.join(''));
}

// https://bulbapedia.bulbagarden.net/wiki/Obstruction#Sludge_piles
const SLUDGE_MOVES=new Set(['firespin','confusion','psychic','sandtomb','hurricane','boomburst']);
export function canClearZone5Sludge(active){
 return !!(active?.hp>0&&Array.isArray(active.moves)&&active.moves.some(name=>{const move=fieldMove(name);return move&&(SLUDGE_MOVES.has(move.key)||(move.type==='물'&&Number(move.power)>0));}));
}
