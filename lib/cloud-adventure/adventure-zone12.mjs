// Snow park with a northwestern court and water. Exact shore and gate geometry
// and its temporary city connector are provisional.
export const ZONE12_VISIBLE=[
 {id:'delibird',tile:'a',species:225,level:34,name:'딜리버드',x:4,y:10},
 {id:'machoke',tile:'b',species:67,level:35,name:'근육몬',x:6,y:4},
 // Machop also appears on the court; this point is a provisional spawn.
 // https://pokemongohub.net/post/guide/all-wild-zones-pokemon-legends-z-a/
 {id:'machop',tile:'m',species:66,level:34,name:'알통몬',x:7,y:5},
 {id:'snover',tile:'c',species:459,level:33,name:'눈쓰개',x:12,y:11},
 {id:'bergmite',tile:'d',species:712,level:33,name:'꽁어름',x:7,y:12,water:true},
 {id:'snorunt',tile:'e',species:361,level:34,name:'눈꼬마',x:10,y:8},
 {id:'gogoat',tile:'f',species:673,level:34,name:'고고트',x:17,y:4},
 {id:'abomasnow-alpha',tile:'h',species:460,level:44,name:'눈설왕',x:8,y:7,alpha:true},
 {id:'avalugg-alpha',tile:'v',species:713,level:55,name:'크레베이스',x:6,y:12,water:true,alpha:true},
];
export function zone12Visible(s,tile){return ZONE12_VISIBLE.find(p=>p.tile===tile&&!s.zaZone12Spent?.[p.id])||null;}
export const ZONE12_ITEMS=[{id:'south-super',tile:'i',x:12,y:14,name:'좋은상처약',kind:'super_potions'},{id:'southwest-quick',tile:'j',x:3,y:14,name:'퀵볼',kind:'quickball'},{id:'court-ultra',tile:'k',x:3,y:3,name:'하이퍼볼',kind:'ultraball'},{id:'court-tm013',tile:'t',x:5,y:5,name:'기술머신 013 냉동빔',kind:'za-tm013'}];
export function zone12Item(s,tile){return ZONE12_ITEMS.find(p=>p.tile===tile&&!(Array.isArray(s.zaZone12Items)&&s.zaZone12Items.includes(p.id)))||null;}
// Rocks surround the court's TM; the number and tile layout are provisional.
// https://raiderking.com/pokemon-legends-z-a-all-tms-locations/
export const ZONE12_COURT_ROCKS=[{x:4,y:5},{x:6,y:5},{x:5,y:4},{x:5,y:6}];
export function zone12Map(s={}){
 // Southern steps descend to the southwest pond. Its shape and the small
 // accessible bank, icicle and bridge coordinates are draft.
 // https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-12-guide-all-pokemon-and-alphas
 if(s.zaZone12PondLower===true){
  const lower=Array.from({length:17},()=>Array(23).fill('#'));
  for(let y=11;y<=14;y++)for(let x=8;x<=10;x++)lower[y][x]=',';
  for(let y=12;y<=13;y++)for(let x=4;x<=7;x++)lower[y][x]='~';
  // A physical attack drops an icicle to form a crossing. Coordinates and
  // whether the bridge persists between visits are provisional.
  // https://game8.jp/pokemon-legends-z-a/729694
  if(s.zaZone12IceBridge===true)for(let x=4;x<=7;x++)lower[13][x]='=';
  else lower[14][7]='r';
  lower[13][8]='l';
  for(const p of ZONE12_VISIBLE)if(p.water&&!s.zaZone12Spent?.[p.id])lower[p.y][p.x]=p.tile;
  return lower.map(row=>row.join(''));
 }
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=3;y<=6;y++)for(let x=3;x<=8;x++)g[y][x]=','; // northwestern battle court
 for(let y=8;y<=12;y++)for(let x=7;x<=13;x++)g[y][x]='g';
 for(let y=12;y<=13;y++)for(let x=4;x<=7;x++)g[y][x]='~'; // southwestern pond
 // Steps mark the approach to the icy lower pond; height and exact tiles are provisional.
 for(const x of [8,9])g[13][x]=':';g[13][8]='l';
 for(const rock of ZONE12_COURT_ROCKS)if(!(Array.isArray(s.zaZone12CourtRocks)&&s.zaZone12CourtRocks.includes(`${rock.x},${rock.y}`)))g[rock.y][rock.x]='r';
 g[16][12]='X';g[0][6]='X';g[0][16]='X';g[5][0]='X';g[12][0]='X';g[10][0]='W';g[8][22]='E';for(const p of ZONE12_VISIBLE)if(!s.zaZone12Spent?.[p.id])g[p.y][p.x]=p.tile;for(const p of ZONE12_ITEMS)if(zone12Item(s,p.tile))g[p.y][p.x]=p.tile;
 return g.map(r=>r.join(''));
}
export function zone12Encounter(s,rng=Math.random){const pool=[[225,32,35],[459,32,33],[361,32,34],[673,32,34]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}
