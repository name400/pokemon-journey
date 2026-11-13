// Narrow North Boulevard / Jaune Sector area with Café Ultimo. Exact geometry,
// outside holovator position and rooftop outlines remain provisional.
export const ZONE15_VISIBLE=[
 {id:'pumpkaboo',tile:'a',species:710,level:42,name:'호바귀',x:11,y:8,upper:false},
 {id:'scolipede',tile:'b',species:545,level:42,name:'펜드라',x:5,y:11,upper:false,period:'day'},
 {id:'shuppet',tile:'b',species:353,level:40,name:'어둠대신',x:5,y:11,upper:false,period:'night'},
 {id:'gourgeist-alpha',tile:'c',species:711,level:52,name:'펌킨인',x:13,y:8,upper:false,alpha:true},
 {id:'beedrill-alpha',tile:'d',species:15,level:52,name:'독침붕',x:6,y:12,upper:false,alpha:true,period:'day'},
 {id:'banette-alpha',tile:'d',species:354,level:52,name:'다크펫',x:6,y:12,upper:false,alpha:true,period:'night'},
 {id:'larvitar',tile:'a',species:246,level:41,name:'애버라스',x:16,y:7,upper:true},
];
export function zone15Visible(s,tile){return ZONE15_VISIBLE.find(p=>p.upper===(s.zaZone15Upper===true)&&p.tile===tile&&(!p.period||p.period===(s.zaZone15Period||'day'))&&!s.zaZone15Spent?.[p.id])||null;}
export const ZONE15_ITEMS=[{id:'cafe-ultra',tile:'i',x:18,y:7,name:'하이퍼볼',kind:'ultraball'},{id:'cafe-hyper',tile:'j',x:15,y:7,name:'고급상처약',kind:'hyper_potions'},{id:'south-timer',tile:'k',x:4,y:14,name:'타이머볼',kind:'timerball'}];
export function zone15Item(s,tile){return s.zaZone15Upper===true?null:ZONE15_ITEMS.find(p=>p.tile===tile&&!(Array.isArray(s.zaZone15Items)&&s.zaZone15Items.includes(p.id)))||null;}
// Zone 15 has trees and benches around its small park; coordinates are draft.
// https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-15-guide-all-pokemon-and-alphas
export const ZONE15_TREES=[[2,10],[8,10],[7,14]];
export const ZONE15_BENCHES=[[8,11],[8,12]];
export function zone15Map(s={}){
 const upper=s.zaZone15Upper===true,g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':upper?'#':'.'));
 if(upper){for(let y=4;y<=10;y++){for(let x=3;x<=10;x++)g[y][x]='.';for(let x=12;x<=19;x++)g[y][x]='.';}g[7][11]=s.zaZone15WebOpen?'.':'r';g[7][4]='l';
  // The northern upper exit reaches the adjacent Jaune Sector 7 roofs.
  // Exact height and approach coordinates are provisional.
  for(let y=1;y<=3;y++)g[y][15]='.';g[0][15]='X';
 }
 else{for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';for(let y=6;y<=10;y++)for(let x=8;x<=14;x++)if(((x-11)/3)**2+((y-8)/2)**2<=1)g[y][x]='g';for(let y=10;y<=13;y++)for(let x=3;x<=7;x++)g[y][x]='g';for(let y=3;y<=5;y++)for(let x=16;x<=19;x++)g[y][x]='#';
  // North and south approaches to the documented central street; exact
  // widths are draft. Do not replace grass or other gameplay tiles.
  // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_15
  for(const [y0,y1] of [[1,6],[10,15]])for(let y=y0;y<=y1;y++)for(let x=10;x<=12;x++)if(g[y][x]==='.')g[y][x]=',';
  for(let x=12;x<=17;x++)if(g[15][x]==='.')g[15][x]=',';
  // West-facing café entrance, on a previously blocked boundary tile. The
  // eastern service point remains for older saves; exact coordinates are draft.
  g[6][0]='q';
  for(let x=1;x<=7;x++)if(g[6][x]==='.')g[6][x]=',';
  // A bent approach connects the north-west edge and the southern street;
  // preserve encounter grass, objects, exits and collision on every cell.
  for(const [x,y] of [[5,2],[6,2],[7,2],[8,2],[9,2],[5,3],[6,3],[6,4],[7,4],[7,5],[13,11],[14,11],[14,12],[15,12],[15,13],[16,13],[16,14]])if(g[y][x]==='.')g[y][x]=',';
  // Northwest approach and southeast bend around the park. Only convert
  // existing ordinary floor; encounter grass and every exit remain unchanged.
  // The reference establishes the overall bend, not these 2D tile positions.
  for(const [x,y] of [[4,1],[5,1],[6,1],[4,2],[4,3],[4,4],[5,4],[5,5],[6,5],[16,10],[16,11],[17,11],[16,12],[17,12],[17,13],[17,14]])if(g[y][x]==='.')g[y][x]=',';
  // Extend the irregular central planting towards the north-west and south-east.
  // The source confirms a vegetated park; the exact 2D outline is provisional.
  // Only ordinary floor becomes grass: routes, objects and collisions remain.
  // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_15
  for(const [x,y] of [[8,5],[9,5],[13,5],[14,5],[15,5],[9,6],[13,6],[14,6],[15,6],[9,10],[10,10],[13,10],[14,10],[15,10],[9,11],[9,12],[8,13],[9,13]])if(g[y][x]==='.')g[y][x]='g';
  for(const [x,y] of [...ZONE15_TREES,...ZONE15_BENCHES])g[y][x]='^';
  g[6][17]='q';g[8][0]='W';g[13][0]='X';g[0][11]='X';g[16][11]='X';g[16][17]='X';g[13][2]='l';if(!s.zaZone15LiftUnlocked)g[13][3]='n';for(const p of ZONE15_ITEMS)if(zone15Item(s,p.tile))g[p.y][p.x]=p.tile;}
 for(const p of ZONE15_VISIBLE)if(zone15Visible(s,p.tile)===p)g[p.y][p.x]=p.tile;
 return g.map(r=>r.join(''));
}
export function zone15Encounter(period,rng=Math.random){const pool=period==='night'?[[710,42,43],[353,40,41],[93,40,41]]:[[710,42,43],[545,42,43],[544,40,41],[15,41,42]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}


// The original dispute is beside the Hibernal Avenue holovator after Lebanne.
// Preserve the older Zone 15 starting location and its existing save gate.
// https://www.serebii.net/legendsz-a/sidemissions/ashockingterritorialdispute.shtml
export function zone15Side80At(s,spot){
 if(s?.interior||s?.zaZone15LiftUnlocked||!spot)return false;
 const legacy=s.district==='lumiose-zone15'&&s.zaZone15Upper!==true&&spot.tile==='n'&&(s.zaMission26Stage>=1||s.zaMission26Complete===true);
 const street=s.district==='lumiose-hibernal-approach'&&spot.tile==='j'&&spot.x===14&&spot.y===5&&(s.zaMission26Complete===true||s.zaMission30Started===true);
 return legacy||street;
}
// Hibernal Avenue runs between Centrico and the north city edge. Geometry is provisional.
export function hibernalApproachMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=9;x<=13;x++)g[y][x]=',';
 for(let y=3;y<=6;y++)for(let x=3;x<=6;x++)g[y][x]='#';
 for(let y=10;y<=13;y++)for(let x=16;x<=19;x++)g[y][x]='#';
 // South-eastern Rouge Plaza access; compressed local positions are draft.
 // https://www.pokepedia.fr/Place_Rouge
 for(let x=1;x<=8;x++)if(g[12][x]==='.')g[12][x]=',';
 g[0][11]='X';g[16][11]='X';g[8][0]='W';g[5][0]='X';g[6][0]='X';g[12][0]='X';g[8][22]='X';g[5][14]='j';return g.map(row=>row.join(''));
}

// A separate height layer for the roof entrance listed by Poképédia.
// Building outlines, passage width and screen alignment are provisional.
// https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_15
export function jaune7RoofMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=4;y<=10;y++)for(let x=3;x<=9;x++)g[y][x]='.';
 for(let y=3;y<=12;y++)for(let x=12;x<=19;x++)g[y][x]='.';
 for(let x=9;x<=12;x++)g[8][x]=',';
 for(let y=12;y<=15;y++)g[y][11]='.';
 g[12][12]='.';g[6][6]='j';g[8][10]=s.zaZone15WebOpen?',':'r';g[16][11]='X';return g.map(row=>row.join(''));
}
