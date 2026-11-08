// The west courtyard, canal and rooftop form distinct traversal areas.
// Tile geometry and the temporary west city connector remain provisional.
export const ZONE10_VISIBLE=[
 {id:'slowpoke',tile:'a',species:79,level:31,name:'야돈',x:5,y:5,upper:false},
 {id:'bellsprout',tile:'b',species:69,level:30,name:'모다피',x:8,y:5,upper:false},
 {id:'carvanha',tile:'c',species:318,level:30,name:'샤프니아',x:11,y:8,upper:false,water:true},
 {id:'staryu',tile:'d',species:120,level:31,name:'별가사리',x:14,y:8,upper:false,water:true},
 {id:'arbok',tile:'a',species:24,level:31,name:'아보크',x:5,y:5,upper:true},
 {id:'watchog',tile:'b',species:505,level:31,name:'보르그',x:11,y:5,upper:true},
 {id:'sharpedo-alpha',tile:'e',species:319,level:42,name:'샤크니아',x:17,y:8,upper:false,water:true,alpha:true},
 {id:'arbok-alpha',tile:'f',species:24,level:51,name:'아보크',x:7,y:5,upper:true,alpha:true},
 {id:'watchog-alpha',tile:'v',species:505,level:42,name:'보르그',x:15,y:5,upper:true,alpha:true},
];
export function zone10Visible(s,tile){return ZONE10_VISIBLE.find(p=>p.upper===(s.zaZone10Upper===true)&&p.tile===tile&&!s.zaZone10Spent?.[p.id])||null;}
export const ZONE10_ITEMS=[{id:'canal-quick',tile:'i',x:6,y:6,upper:false,name:'퀵볼',kind:'quickball'},{id:'ladder-net',tile:'j',x:16,y:4,upper:false,name:'네트볼',kind:'netball'},{id:'roof-hyper',tile:'i',x:18,y:4,upper:true,name:'고급상처약',kind:'hyper_potions'},{id:'west-ultra',tile:'j',x:3,y:4,upper:true,name:'하이퍼볼',kind:'ultraball'},{id:'roof-tm034',tile:'t',x:1,y:5,upper:true,name:'기술머신 034 깜짝베기',kind:'za-tm034'}];
export function zone10Item(s,tile){return ZONE10_ITEMS.find(p=>p.upper===(s.zaZone10Upper===true)&&p.tile===tile&&!(Array.isArray(s.zaZone10Items)&&s.zaZone10Items.includes(p.id)))||null;}
export function zone10Map(s={}){
 const upper=s.zaZone10Upper===true,g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':upper?'#':'.'));
 if(upper){for(let y=3;y<=7;y++)for(let x=3;x<=19;x++)g[y][x]='.';for(let y=4;y<=6;y++)for(let x=7;x<=13;x++)g[y][x]='g';
  // The roof above the ladder has benches; exact coordinates are provisional.
  // https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/wild-zones/
  g[3][17]='^';g[3][19]='^';
  // A sludge-obstructed rooftop alcove by Alpha Arbok; dimensions are draft.
  // https://raiderking.com/pokemon-legends-z-a-all-tms-locations/
  g[5][1]='.';g[5][2]=s.zaZone10SludgeCleared?'.':'r';}
 else{
  // The canal passes under buildings and continues beyond the district;
  // its tile width and banks are provisional.
  // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_10
  for(let y=8;y<=12;y++)for(let x=0;x<=22;x++)g[y][x]='~';for(let y=4;y<=6;y++)for(let x=3;x<=9;x++)g[y][x]='g';
  // A ground-level path follows the canal between its west and east sides.
  // Its exact width is draft; ordinary walkability and encounter tiles are unchanged.
  // https://www.gamerguides.com/pokemon-legends-z-a/guide/wild-zones/bleu-sector-10/all-wild-zone-10-pokemon-locations
  for(let x=2;x<=20;x++)g[7][x]=',';
  // Join both ends of the existing canal-side path to the entrances.
  for(const [x,y] of [[1,6],[1,7],[21,6],[21,7]])if(g[y][x]==='.')g[y][x]=',';
  g[6][0]='W';g[6][22]='E';g[0][11]='X';}
 g[4][17]='l';for(const p of ZONE10_VISIBLE)if(p.upper===upper&&!s.zaZone10Spent?.[p.id])g[p.y][p.x]=p.tile;for(const p of ZONE10_ITEMS)if(p.upper===upper&&zone10Item(s,p.tile))g[p.y][p.x]=p.tile;
 return g.map(r=>r.join(''));
}
export function zone10Encounter(s,rng=Math.random){const pool=s.zaZone10Upper===true?[[24,31,33],[505,30,32]]:[[79,30,32],[69,29,31]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}
