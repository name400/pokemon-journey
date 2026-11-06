import {CAFE_WOOF_DRINKS} from './adventure-cafe.mjs';
import {AREAS, TRAINERS, areaMap} from '../campaign.mjs';
import {surveyDialogue,habitatGuideDialogue,habitatLabAction,habitatStage,cityProjectStage,cityProjectHotelAction,wildStudyStage} from './adventure-story.mjs';
import {royaleDialogue,royaleZoneDialogue,naveenAction,lidaBagAction,lidaBattleAction,joseeAction,joseeRequired} from './adventure-royale.mjs';

export const MAP_VERSION = 2;
export const FIELD_SIZE = {width: 23, height: 17};
export const DIRECTIONS = Object.freeze({up: [0,-1], down: [0,1], left: [-1,0], right: [1,0]});
import {ADVENTURE_GOODS} from '../adventure-economy.mjs';
export const FIELD_GOODS=ADVENTURE_GOODS.filter(g=>typeof g.column==='string').map(g=>({...g,column:String(g.column)}));

/** Coordinates are authoritative on both the field and API. No new DB schema. */
export function adventureMap(area=0, expedition=false) {
  const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'t'));
  const put=(x,y,c)=>{grid[y][x]=c;};
  for(let y=2;y<15;y++)for(let x=1;x<22;x++){
    if((x>=7&&x<=12&&y<=6)||(x>=6&&x<=14&&y>=11)||(x>=19&&y>=12))put(x,y,'g');
  }
  if([2,5].includes(area)||expedition)for(let y=3;y<=6;y++)for(let x=8;x<=11;x++)put(x,y,'~');
  if([1,7,8].includes(area))for(let y=3;y<=6;y++)for(let x=9;x<=11;x++)put(x,y,'^');
  if([4,6].includes(area))for(let x=7;x<=12;x++)put(x,4,'#');
  // Three-by-four buildings. Only the door is walkable.
  const house=(x,y,door)=>{for(let j=y-3;j<=y;j++)for(let i=x-1;i<=x+1;i++)put(i,j,'#');put(x,y,door);};
  house(3,5,'H');house(18,11,'M');
  if(area!==9||expedition)house(18,4,area===0||expedition?'P':'G');
  if(area===9&&!expedition){
    for(let y=1;y<=5;y++)for(let x=7;x<=21;x++)put(x,y,y===5?'.':'#');
    [8,11,14,17,20].forEach((x,i)=>put(x,4,i===4?'C':'L'));
  }
  for(let x=0;x<=22;x++)put(x,8,'.');
  for(let y=5;y<=8;y++)put(3,y,'.');
  for(let y=5;y<=11;y++)put(18,y,'.');
  put(18,4,area===0||expedition?'P':area===9?'#':'G');
  put(3,5,'H');put(18,11,'M');
  for(let x=10;x<18;x++)put(x,10,'.');
  put(0,8,'W');if(area<9||expedition)put(22,8,'E');else put(22,8,'#');
  put(10,10,'N');put(6,8,'S');put(14,14,'I');put(5,9,'Q');
  return grid.map(row=>row.join(''));
}

export function labMap(){
  const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
  for(let x=4;x<=8;x++)grid[5][x]='#';
  for(let x=14;x<=18;x++)grid[5][x]='#';
  grid[5][11]='R';grid[15][11]='X';
  return grid.map(row=>row.join(''));
}
// An original, small city district rather than a reconstruction of the full city.
export function lumioseMap(s={}){
  const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
  const house=(x,y,tile)=>{for(let yy=y-3;yy<=y;yy++)for(let xx=x-1;xx<=x+1;xx++)grid[yy][xx]='#';grid[y][x]=tile;};
  house(3,5,'H');house(19,5,'M');house(11,5,'J');
  grid[9][11]='T';grid[10][4]='Q';grid[6][14]='h';grid[10][18]='x';if(s.zaRoyaleRank==='V'&&!s.zaMysteryTrail)grid[7][16]='d';grid[15][11]='X';grid[15][8]='s';grid[8][0]='W';grid[8][22]='E';
  return grid.map(row=>row.join(''));
}
// Draft rooftop route with a crystal blocking the way to Zone 2.
export function lumioseRooftopMap(s={}){
 const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let x=1;x<=21;x++)grid[9][x]='#';
 grid[9][11]=s.zaRooftopCrystalCleared?'.':'c';if(s.zaRoyaleRank==='V'&&s.zaMysteryTrail===1)grid[5][18]='d';else if(s.zaRoyaleRank==='V'&&s.zaMysteryTrail>=2)grid[5][18]='n';if(!s.zaRooftopIntroduced)grid[12][6]='u';grid[15][11]='X';grid[8][0]='W';return grid.map(row=>row.join(''));
}
// Provisional tile layout for Z-A Wild Zone 1, not the original 3D geography.
export function lumioseZone1Map(){
 const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=4;y<=12;y++)for(let x=6;x<=16;x++)grid[y][x]='g';
 grid[8][0]='W';grid[8][22]='E';return grid.map(row=>row.join(''));
}
// Research Lab is west of Wild Zone 1 on Floral Avenue; street dimensions remain provisional.
export function lumioseFloralMap(){const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));for(let y=2;y<=5;y++)for(let x=4;x<=6;x++)grid[y][x]='#';grid[5][5]='P';grid[0][11]='f';grid[8][22]='E';return grid.map(row=>row.join(''));}
// Road connections follow the documented Floral/Vernal/Vert Plaza sequence; tile geometry is provisional.
export function lumioseVernalMap(){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));for(let y=5;y<=6;y++)for(let x=18;x<=21;x++)g[y][x]='~';for(let y=6;y<=8;y++)for(let x=10;x<=14;x++)g[y][x]=',';g[8][0]='W';g[8][22]='E';g[15][11]='X';g[5][12]='q';return g.map(row=>row.join(''));}
export function lumioseVertPlazaMap(){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));g[8][0]='W';g[8][22]='E';return g.map(row=>row.join(''));}
// Source establishes a circular watery plaza, central island and bridge; precise contours remain provisional.
export function zone2IslandAlphaReady(s){return !!s?.zaZone2RockCleared&&s.zaBunnelbyQuest===3&&s.zaTradeQuest===2&&s.zaSableyeQuest===3&&s.zaZone2AlphaSpent!==true;}
export function zone2IslandAlphaTarget(s){
 if(s?.district!=='lumiose-zone2'||s.interior||!zone2IslandAlphaReady(s)||!Number.isInteger(s.x)||!Number.isInteger(s.y))return null;
 const map=lumioseZone2Map(s),target={x:20,y:11},queue=[{x:s.x,y:s.y,distance:0}],seen=new Set([`${s.x},${s.y}`]);
 for(let i=0;i<queue.length;i++){const q=queue[i];if(q.distance>0&&q.x===target.x&&q.y===target.y)return {...target,distance:q.distance};if(q.distance>=3)continue;for(const [dx,dy] of Object.values(DIRECTIONS)){const x=q.x+dx,y=q.y+dy,key=`${x},${y}`,tile=map[y]?.[x];if(!walkable(tile)||'EWX'.includes(tile)||seen.has(key))continue;seen.add(key);queue.push({x,y,distance:q.distance+1});}}
 return null;
}
const ZONE2_EAST_SHORE_WATER=[...[8,9,10,11,12,13].map(y=>[16,y]),[17,13],[17,14],[18,14],[18,15]];
export function lumioseZone2Map(s={}){
 const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=4;y<=12;y++)for(let x=6;x<=16;x++){const d=((x-11)/5)**2+((y-8)/4)**2;grid[y][x]=d>0.28&&d<0.95?'~':'g';}
 // Three crossings connect the island from the northwest, northeast and south-southwest.
 // Their tile coordinates and the shoreline remain provisional.
 for(let y=5;y<=7;y++)grid[y][8]='=';
 for(let y=5;y<=7;y++)grid[y][14]='=';
 // Small raised northwest landing, linked to the existing northern stairs.
 for(let x=7;x<=9;x++)grid[4][x]=';';
 // A wooden bridge is reached to the left when entering from the south.
 // The exact tiles and the other provisional crossings need visual verification.
 for(let y=9;y<=12;y++)grid[y][8]='=';
 grid[9][9]='=';
 // Approximate inlet separates the southern shore from the eastern bank.
 // The precise waterline remains provisional.
 for(const [x,y] of ZONE2_EAST_SHORE_WATER)grid[y][x]='~';
 // Eastern side area: rock and shallow passage are provisional positions.
 for(const [x,y] of [[19,10],[20,10],[21,10],[19,11],[21,11],[21,12],[19,13],[20,13],[21,13]])grid[y][x]='~';
 grid[11][20]=zone2IslandAlphaReady(s)?'p':'g';grid[12][20]='w';grid[12][19]=s.zaZone2RockCleared?'w':'r';
 // Grass lies just inside the southern entrance; the exact outline is provisional.
 for(let y=13;y<=14;y++)for(let x=9;x<=10;x++)grid[y][x]='g';
 // A small patch near the northwestern entrance represents the rear-gate habitat.
 for(let y=2;y<=3;y++)grid[y][5]='g';
 // Stairs are visible just inside the northwest gate; tile coordinates remain provisional.
 for(let y=1;y<=3;y++)grid[y][4]=':';
 grid[0][4]='W';grid[16][11]='E';return grid.map(row=>row.join(''));
}
// Connects the source-confirmed northwest gate to Vert Sector 2; street geometry is provisional.
export function lumioseVert2Map(){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));g[8][0]='W';g[8][22]='E';return g.map(row=>row.join(''));}
// The route passes Centrico Pokemon Center; exact street placement is provisional.
export function lumioseCentricoRouteMap(){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));for(let x=1;x<=21;x++){for(let y=7;y<=9;y++)g[y][x]=x===7||x===16?';':',';g[6][x]='k';g[10][x]='k';}for(let y=11;y<=13;y++)for(let x=10;x<=12;x++)g[y][x]='%';g[8][0]='W';g[8][22]='E';g[5][11]='H';return g.map(row=>row.join(''));}
function legacyZone2Walkable(x,y){if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>22||y<0||y>16)return false;if((x===4&&y===0)||(x===11&&y===16)||(y===8&&(x===0||x===22)))return true;if(x===0||x===22||y===0||y===16)return false;return !(y>=4&&y<=6&&x>=8&&x<=12);}
function nearestWalkableLand(map,x,y){const places=[];for(let yy=1;yy<16;yy++)for(let xx=1;xx<22;xx++)if(walkable(map[yy]?.[xx]))places.push({x:xx,y:yy,d:Math.abs(xx-x)+Math.abs(yy-y)});places.sort((a,b)=>a.d-b.d||a.y-b.y||a.x-b.x);return places[0];}

// Rouge Street north of the plaza meets North Boulevard; geometry is provisional.
export function lumioseRougeNorthMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=3;y<=15;y++){for(let x=9;x<=13;x++)g[y][x]=',';g[y][8]='k';g[y][14]='k';}
 for(let y=3;y<=5;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=1;y<=3;y++)for(let x=18;x<=20;x++)g[y][x]='#';
 g[4][19]='l';g[7][16]='H';g[6][19]='m';g[16][11]='X';g[4][22]='E';return g.map(row=>row.join(''));
}
// Provisional Wild Zone 3 layout, not the original city geography.
export function lumioseZone3Map(){
 const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 // Rouge Plaza is a round ornamental garden; scale and exact paths are provisional.
 for(let y=3;y<=13;y++)for(let x=5;x<=17;x++){const d=((x-11)/5)**2+((y-8)/4)**2;if(d<=1)grid[y][x]='g';else if(d<=1.45)grid[y][x]='k';}
 // Central avenue and provisional gaps divide the four fenced gardens.
 for(let y=4;y<=12;y++)for(let x=10;x<=12;x++)grid[y][x]='.';
 grid[8][11]='g';
 for(const y of [4,5,7,9,11,12])for(const x of [9,13])grid[y][x]='|';
 for(const x of [6,7,8,14,15])grid[8][x]='|';
 grid[2][11]='H'; // Travelling Pokémon Center on the north side.
 grid[7][7]='i'; // Western tower; detailed footprint is provisional.
 grid[8][22]='E';grid[0][11]='X';grid[16][11]='X';grid[4][17]='j';grid[6][19]='b';grid[10][19]='t';grid[11][20]='q';grid[12][3]='v';return grid.map(row=>row.join(''));
}
// Small tower upper floor; its exact shape and furniture are not yet verified.
export function lumioseZone3TowerMap(){const g=Array.from({length:17},()=>Array(23).fill('#'));for(let y=5;y<=11;y++)for(let x=8;x<=14;x++)g[y][x]='.';g[9][11]='i';return g.map(row=>row.join(''));}
// Provisional cemetery layout; original paths and graves differ.
export function lumioseZone4Map(s={}){
 const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=4;y<=12;y++)for(let x=6;x<=16;x++)grid[y][x]='g';
 grid[8][22]='E';grid[6][18]='z';if(s.zaBunnelbyQuest===3&&!s.zaZone4AlphaSpent)grid[10][4]='p';return grid.map(row=>row.join(''));
}
// Provisional interior of the Looker Bureau.
export function lumioseBureauMap(){
 const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let x=7;x<=15;x++)if(x!==11)grid[5][x]='#';
 grid[5][11]='e';grid[15][11]='X';return grid.map(row=>row.join(''));
}
export function lumioseGardenMap(){
  const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
  for(let y=4;y<=12;y++)for(let x=8;x<=16;x++)grid[y][x]='k';
  grid[8][0]='W';grid[8][22]='E';grid[6][10]='Q';grid[9][11]='K';grid[5][18]='Y';
  return grid.map(row=>row.join(''));
}
export function lumioseSiteMap(s={}){
  const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
  for(let y=3;y<=6;y++)for(let x=12;x<=19;x++)grid[y][x]='#';
  for(let x=12;x<=19;x++)grid[11][x]='#';
  grid[8][0]='W';grid[8][22]='E';grid[9][15]='D';grid[6][7]='Z';grid[11][12]=s.zaSiteRockCleared===true?'.':'r';return grid.map(row=>row.join(''));
}
export function lumioseWildMap(s={}){
  const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
  for(let y=4;y<=12;y++)for(let x=6;x<=18;x++)grid[y][x]='g';
  for(let x=8;x<=16;x++)grid[3][x]='#';
  grid[8][0]='W';grid[8][22]='E';grid[8][3]='A';const alpha=wildAlphaPosition(s);grid[alpha.y][alpha.x]='a';return grid.map(row=>row.join(''));
}
export function lumioseObservationMap(){
  const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
  for(let y=3;y<=6;y++)for(let x=13;x<=19;x++)grid[y][x]='g';
  for(let y=11;y<=14;y++)for(let x=5;x<=10;x++)grid[y][x]='g';
  grid[8][0]='W';grid[8][12]='B';return grid.map(row=>row.join(''));
}
// A playable, provisional battle-zone layout; not a reconstruction of Lumiose.
export function lumioseRoyaleMap(){
 const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let x=5;x<=17;x++)if(x!==11)grid[8][x]='#';
 grid[11][5]='O';grid[5][7]='U';grid[5][17]='V';grid[15][11]='X';return grid.map(row=>row.join(''));
}
const CITY_DISTRICTS=['lumiose','lumiose-floral','lumiose-vernal','lumiose-vert-plaza','lumiose-vert2','lumiose-centrico-route','lumiose-rouge-north','lumiose-rooftop','lumiose-zone1','lumiose-zone2','lumiose-zone3','lumiose-zone4','lumiose-bureau','lumiose-garden','lumiose-site','lumiose-wild','lumiose-observation','lumiose-royale'];
export function hotelMap(){
  const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
  for(let x=7;x<=15;x++)if(x!==11)grid[5][x]='#';
  grid[5][11]='F';grid[5][14]='i';grid[15][11]='X';return grid.map(row=>row.join(''));
}
// Layout coordinates are provisional; the elevator and left-hand 202 door follow the source route.
export function hotelSecondFloorMap(){const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));for(let x=5;x<=17;x++)grid[5][x]='#';grid[5][8]='o';grid[5][14]='b';grid[13][11]='i';return grid.map(row=>row.join(''));}
export function hotelRoom202Map(){const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));grid[4][8]='z';grid[15][11]='X';return grid.map(row=>row.join(''));}
// The rooftop's furnishings are source-confirmed; their exact tile positions are provisional.
export function hotelRoofMap(){const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));grid[13][11]='i';grid[5][7]='1';grid[5][11]='2';grid[5][15]='1';grid[9][7]='3';grid[9][15]='4';grid[3][4]='5';grid[3][18]='5';return grid.map(row=>row.join(''));}
const HOTEL_INTERIORS=['hotel','hotel2f','hotel202','hotelRoof'];
export function fieldMap(s){return ['lab','lumioseLab'].includes(s.interior)?labMap():s.interior==='hotel'?hotelMap():s.interior==='hotel2f'?hotelSecondFloorMap():s.interior==='hotel202'?hotelRoom202Map():s.interior==='hotelRoof'?hotelRoofMap():s.district==='lumiose'?lumioseMap(s):s.district==='lumiose-floral'?lumioseFloralMap():s.district==='lumiose-vernal'?lumioseVernalMap():s.district==='lumiose-vert-plaza'?lumioseVertPlazaMap():s.district==='lumiose-vert2'?lumioseVert2Map():s.district==='lumiose-centrico-route'?lumioseCentricoRouteMap():s.district==='lumiose-rouge-north'?lumioseRougeNorthMap():s.district==='lumiose-rooftop'?lumioseRooftopMap(s):s.district==='lumiose-zone1'?lumioseZone1Map():s.district==='lumiose-zone2'?lumioseZone2Map(s):s.district==='lumiose-zone3'?(s.zaZone3TowerUpper?lumioseZone3TowerMap():lumioseZone3Map()):s.district==='lumiose-zone4'?lumioseZone4Map(s):s.district==='lumiose-bureau'?lumioseBureauMap():s.district==='lumiose-garden'?lumioseGardenMap():s.district==='lumiose-site'?lumioseSiteMap(s):s.district==='lumiose-wild'?lumioseWildMap(s):s.district==='lumiose-observation'?lumioseObservationMap():s.district==='lumiose-royale'?lumioseRoyaleMap():adventureMap(s.area,!!s.expedition);}
// Keep the primary coordinates safe for clients predating interiors. The revision
// detects any older-client write, even one that returns to the same coordinates.
export function storeAdventurePosition(s,revision){
  if(CITY_DISTRICTS.includes(s.district))return {...s,x:5,y:9,facing:'down',interior:null,regionId:s.districtReturnRegion??1,districtPosition:{x:s.x,y:s.y,facing:s.facing,interior:s.interior||null,revision,...(s.district==='lumiose-zone2'?{zone2Layout:6}:{}),...(s.district==='lumiose-zone3'?{zone3Layout:2}:{}),...(s.district==='lumiose-vernal'?{vernalLayout:1}:{}),...(s.district==='lumiose-rouge-north'?{rougeNorthLayout:1}:{}),...(s.district==='lumiose-centrico-route'?{centricoLayout:1}:{})}};
  if(s.districtPosition){s={...s};delete s.districtPosition;}
  if(s.interior!=='lab'){const copy={...s};delete copy.interiorPosition;return copy;}
  return {...s,x:18,y:5,facing:'down',interiorPosition:{x:s.x,y:s.y,facing:s.facing,revision}};
}
export function restoreAdventurePosition(s,revision){
  // An older client may discard the position payload for an unknown district.
  if(CITY_DISTRICTS.includes(s?.district)&&!s.districtPosition){s.district=null;delete s.districtReturnRegion;return s;}
  if(CITY_DISTRICTS.includes(s?.district)&&s.districtPosition){
    let p=s.districtPosition;
    // Older saves can contain former side-gate tiles; keep them in Zone 2 safely.
    if(s.district==='lumiose-zone2'&&!p.interior&&p.y===8&&(p.x===0||p.x===22))p={...p,x:p.x===0?1:21};
    const indoor=p.interior||null,map=indoor==='lumioseLab'&&s.district==='lumiose-floral'?labMap():indoor==='hotel'&&s.district==='lumiose'?hotelMap():indoor==='hotel2f'&&s.district==='lumiose'?hotelSecondFloorMap():indoor==='hotel202'&&s.district==='lumiose'?hotelRoom202Map():indoor==='hotelRoof'&&s.district==='lumiose'?hotelRoofMap():s.district==='lumiose'?lumioseMap(s):s.district==='lumiose-floral'?lumioseFloralMap():s.district==='lumiose-vernal'?lumioseVernalMap():s.district==='lumiose-vert-plaza'?lumioseVertPlazaMap():s.district==='lumiose-vert2'?lumioseVert2Map():s.district==='lumiose-centrico-route'?lumioseCentricoRouteMap():s.district==='lumiose-rouge-north'?lumioseRougeNorthMap():s.district==='lumiose-rooftop'?lumioseRooftopMap(s):s.district==='lumiose-zone1'?lumioseZone1Map():s.district==='lumiose-zone2'?lumioseZone2Map(s):s.district==='lumiose-zone3'?(s.zaZone3TowerUpper?lumioseZone3TowerMap():lumioseZone3Map()):s.district==='lumiose-zone4'?lumioseZone4Map(s):s.district==='lumiose-bureau'?lumioseBureauMap():s.district==='lumiose-garden'?lumioseGardenMap():s.district==='lumiose-site'?lumioseSiteMap(s):s.district==='lumiose-wild'?lumioseWildMap(s):s.district==='lumiose-royale'?lumioseRoyaleMap():lumioseObservationMap();
    // Relocate older positions from the new gated island to the accessible bank.
    if(s.district==='lumiose-zone2'&&!indoor&&p.revision===revision&&(p.zone2Layout==null||p.zone2Layout<4)&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=19&&p.x<=21&&p.y>=10&&p.y<=13)p={...p,x:18,y:12};
    if(s.district==='lumiose-zone2'&&!indoor&&p.revision===revision&&(p.zone2Layout==null||p.zone2Layout<5)&&p.x===14&&p.y>=9&&p.y<=11&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    if(s.district==='lumiose-zone2'&&!indoor&&p.revision===revision&&(p.zone2Layout==null||p.zone2Layout<6)&&ZONE2_EAST_SHORE_WATER.some(([x,y])=>p.x===x&&p.y===y)&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Layout 2's southern bridge could be occupied when this shoreline changed.
    const wasOldZone2Tile=p.zone2Layout===2?(p.x===11&&p.y>=9&&p.y<=12)||(p.x>=19&&p.x<=21&&p.y>=10&&p.y<=13):p.zone2Layout===3?(p.x>=19&&p.x<=21&&p.y>=10&&p.y<=13):p.zone2Layout==null&&legacyZone2Walkable(p.x,p.y);
    if(s.district==='lumiose-zone2'&&!indoor&&p.revision===revision&&wasOldZone2Tile&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Old Zone 3 saves can stand on a newly placed fence: move to adjacent walkable ground.
    if(s.district==='lumiose-zone3'&&!s.zaZone3TowerUpper&&!indoor&&p.zone3Layout==null&&p.revision===revision&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&map[p.y]?.[p.x]==='|'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    if(s.district==='lumiose-zone3'&&!s.zaZone3TowerUpper&&!indoor&&p.revision===revision&&(p.zone3Layout==null||p.zone3Layout<2)&&p.x===0&&p.y===8)p={...p,x:1};
    if(s.district==='lumiose-rouge-north'&&!indoor&&p.revision===revision&&p.rougeNorthLayout==null&&p.x>=18&&p.x<=20&&p.y>=1&&p.y<=3){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Preserve old Vernal saves that occupied tiles now used for the waterside.
    if(s.district==='lumiose-vernal'&&!indoor&&p.vernalLayout==null&&p.revision===revision&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=18&&p.x<=21&&p.y>=5&&p.y<=6){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Old Centrico-route saves can stand on the newly represented tower footprint.
    if(s.district==='lumiose-centrico-route'&&!indoor&&p.centricoLayout==null&&p.revision===revision&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=10&&p.x<=12&&p.y>=11&&p.y<=13){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    if(p.revision!==revision||s.area!==3||s.expedition||s.interior||s.x!==5||s.y!==9||(indoor&&!((HOTEL_INTERIORS.includes(indoor)&&s.district==='lumiose')||(indoor==='lumioseLab'&&s.district==='lumiose-floral')))||!Number.isInteger(p.x)||!Number.isInteger(p.y)||!walkable(map[p.y]?.[p.x])){s.district=null;delete s.districtPosition;delete s.districtReturnRegion;return s;}
    s.districtReturnRegion=s.regionId??1;s.regionId=6;s.interior=indoor;s.x=p.x;s.y=p.y;s.facing=Object.hasOwn(DIRECTIONS,p.facing)?p.facing:'down';return s;
  }
  if(s?.interior!=='lab'||!s.interiorPosition)return s; // original development saves
  const p=s.interiorPosition;
  if(p.revision!==revision||s.area!==0||s.expedition||s.x!==18||s.y!==5||!Number.isInteger(p.x)||!Number.isInteger(p.y)||!walkable(labMap()[p.y]?.[p.x])){
    s.interior=null;delete s.interiorPosition;return s;
  }
  s.x=p.x;s.y=p.y;s.facing=Object.hasOwn(DIRECTIONS,p.facing)?p.facing:'down';return s;
}
export function walkable(tile){return !!tile&&!['#','~','^','r','c','%','|','1','2','3','4','5'].includes(tile);}
// A representative Budew near Zone 2's south gate. Distances and timing are provisional.
export function zone2BudewPosition(s){
 if(!s||s.district!=='lumiose-zone2'||s.interior)return null;
 const p=s.zaZone2Budew;if(p?.escaped===true)return null;
 if(p!=null){if(!Number.isInteger(p.x)||!Number.isInteger(p.y)||p.x<1||p.x>21||p.y<1||p.y>15||!walkable(lumioseZone2Map(s)[p.y]?.[p.x]))return null;return {x:p.x,y:p.y,alert:Number.isInteger(p.alert)?Math.max(0,Math.min(3,p.alert)):0};}
 return {x:9,y:14,alert:0};
}
export function zone2BudewTarget(s){const p=zone2BudewPosition(s);if(!p||!Number.isInteger(s.x)||!Number.isInteger(s.y))return null;const map=lumioseZone2Map(s),queue=[{x:s.x,y:s.y,distance:0}],visited=new Set([`${s.x},${s.y}`]);for(let i=0;i<queue.length;i++){const q=queue[i];if(q.distance>0&&q.x===p.x&&q.y===p.y)return {...p,distance:q.distance};if(q.distance>=3)continue;for(const [dx,dy]of Object.values(DIRECTIONS)){const x=q.x+dx,y=q.y+dy,tile=map[y]?.[x],key=`${x},${y}`;if(!walkable(tile)||'EWX'.includes(tile)||visited.has(key))continue;visited.add(key);queue.push({x,y,distance:q.distance+1});}}return null;}
export function stepZone2Budew(s){
 const p=zone2BudewPosition(s);if(!p||Math.abs(p.x-s.x)+Math.abs(p.y-s.y)>1)return false;
 const alert=p.alert+1,map=lumioseZone2Map(s),distance=(x,y)=>Math.abs(x-s.x)+Math.abs(y-s.y);
 const candidates=[[p.x-1,p.y],[p.x,p.y-1],[p.x+1,p.y],[p.x,p.y+1]].filter(([x,y])=>x>0&&x<22&&y>0&&y<16&&walkable(map[y]?.[x])&&distance(x,y)>distance(p.x,p.y));
 candidates.sort((a,b)=>distance(b[0],b[1])-distance(a[0],a[1]));
 if(alert>=3||!candidates.length)s.zaZone2Budew={...p,alert,escaped:true};else s.zaZone2Budew={x:candidates[0][0],y:candidates[0][1],alert};return true;
}
// Kakuna hangs from a perimeter tree; the precise tree and throwing range are provisional.
export function zone2KakunaPosition(s){return s?.district==='lumiose-zone2'&&!s.interior&&!s.zaZone2KakunaSpent?{x:0,y:4}:null;}
export function zone2KakunaTarget(s){
 const p=zone2KakunaPosition(s);if(!p||!Number.isInteger(s.x)||!Number.isInteger(s.y))return null;
 const map=lumioseZone2Map(s),queue=[{x:s.x,y:s.y,distance:0}],seen=new Set([`${s.x},${s.y}`]);
 for(let i=0;i<queue.length;i++){const q=queue[i];if(q.x===1&&q.y===p.y)return {...p,distance:q.distance+1};if(q.distance>=2)continue;for(const [dx,dy] of Object.values(DIRECTIONS)){const x=q.x+dx,y=q.y+dy,tile=map[y]?.[x],key=`${x},${y}`;if(!walkable(tile)||'EWX'.includes(tile)||seen.has(key))continue;seen.add(key);queue.push({x,y,distance:q.distance+1});}}
 return null;
}
// Positions and levels are provisional, while habitats and night-only Staryu follow the area guides.
export const ZONE2_FIELD_SPECIES=Object.freeze([
 {id:'patrat',speciesId:504,name:'보르쥐',x:11,y:8,level:6,water:false,reaction:'roam',contactBattle:true},
 {id:'patrat2',speciesId:504,name:'보르쥐',x:10,y:7,level:6,water:false,reaction:'roam',contactBattle:true},
 {id:'binacle',speciesId:688,name:'거북손손',x:13,y:9,level:6,water:false},
 {id:'magikarp',speciesId:129,name:'잉어킹',x:7,y:10,level:6,water:true,reaction:'bridgeJump'},
 {id:'staryu',speciesId:120,name:'별가사리',x:8,y:8,level:6,water:true,nightOnly:true,reaction:'waterRoam'},
]);
export function zone2FieldMonsters(s,period){
 if(!s||s.district!=='lumiose-zone2'||s.interior)return [];
 return ZONE2_FIELD_SPECIES.filter(p=>!(s.zaZone2FieldSpent&&s.zaZone2FieldSpent[p.id]===true)&&(!p.nightOnly||period==='night')).map(p=>{const v=s.zaZone2FieldPositions?.[p.id];if(!Number.isInteger(v?.x)||!Number.isInteger(v?.y))return p;const tile=lumioseZone2Map(s)[v.y]?.[v.x],near=Math.abs(v.x-p.x)+Math.abs(v.y-p.y)<=3;if(p.reaction==='bridgeJump'&&Number.isInteger(v.ttl)&&v.ttl>0&&tile==='=')return {...p,x:v.x,y:v.y,water:false};if(near&&((p.reaction==='roam'&&tile==='g')||(p.reaction==='waterRoam'&&tile==='~')))return {...p,x:v.x,y:v.y};return p;});
}
// A bridge-side reaction is advanced by authoritative player movement and stored for reload.
export function stepZone2Field(s,period){
 if(s?.district!=='lumiose-zone2'||s.interior)return false;
 const map=lumioseZone2Map(s),positions={...(s.zaZone2FieldPositions||{})};let jumped=false,changed=false;
 for(const p of zone2FieldMonsters(s,period)){
  if((p.reaction==='roam'||p.reaction==='waterRoam')&&((s.steps||0)+1)%4===0){
   const base=ZONE2_FIELD_SPECIES.find(q=>q.id===p.id),candidates=[[p.x+1,p.y],[p.x,p.y+1],[p.x-1,p.y],[p.x,p.y-1]].filter(([x,y])=>Math.abs(x-base.x)+Math.abs(y-base.y)<=3&&(x!==s.x||y!==s.y)&&((p.reaction==='roam'&&map[y]?.[x]==='g')||(p.reaction==='waterRoam'&&map[y]?.[x]==='~'))&&!zone2FieldMonsters({...s,zaZone2FieldPositions:positions},period).some(q=>q.id!==p.id&&q.x===x&&q.y===y));
   if(candidates.length){const i=Math.floor(((s.steps||0)+1)/4)%candidates.length;positions[p.id]={x:candidates[i][0],y:candidates[i][1]};changed=true;}continue;
  }
  if(p.reaction!=='bridgeJump')continue;
  const v=positions[p.id];if(v?.ttl>0){if(v.ttl<=1)delete positions[p.id];else positions[p.id]={...v,ttl:v.ttl-1};changed=true;continue;}
  if(map[s.y]?.[s.x]!=='='||Math.abs(s.x-p.x)+Math.abs(s.y-p.y)>2)continue;
  const cells=map.flatMap((row,y)=>[...row].flatMap((tile,x)=>tile==='='&&(x!==s.x||y!==s.y)?[[x,y]]:[]));
  cells.sort((a,b)=>(Math.abs(a[0]-p.x)+Math.abs(a[1]-p.y))-(Math.abs(b[0]-p.x)+Math.abs(b[1]-p.y)));
  if(cells.length){positions[p.id]={x:cells[0][0],y:cells[0][1],ttl:3};changed=true;jumped=true;}
 }
 if(changed)s.zaZone2FieldPositions=positions;return jumped;
}
export function zone2FieldContact(s,period){return zone2FieldMonsters(s,period).find(p=>p.contactBattle&&p.x===s.x&&p.y===s.y)||null;}
export function zone2FieldTarget(s,period,id){
 const p=zone2FieldMonsters(s,period).find(m=>m.id===id);if(!p||!Number.isInteger(s.x)||!Number.isInteger(s.y))return null;
 const map=lumioseZone2Map(s),queue=[{x:s.x,y:s.y,distance:0}],seen=new Set([`${s.x},${s.y}`]);
 for(let i=0;i<queue.length;i++){const q=queue[i],d=Math.abs(q.x-p.x)+Math.abs(q.y-p.y);if((p.water&&d===1)||(!p.water&&d===0))return {...p,distance:q.distance+(p.water?1:0)};if(q.distance>=2)continue;for(const [dx,dy] of Object.values(DIRECTIONS)){const x=q.x+dx,y=q.y+dy,tile=map[y]?.[x],key=`${x},${y}`;if(!walkable(tile)||'EWX'.includes(tile)||seen.has(key))continue;seen.add(key);queue.push({x,y,distance:q.distance+1});}}
 return null;
}
// Provisional individual positions within the documented four Rouge gardens.
export const ZONE3_FIELD_SPECIES=Object.freeze([
 {id:'litleo',speciesId:667,name:'사자코',x:8,y:5,level:7,reaction:'contact'},
 {id:'pancham',speciesId:674,name:'판짱',x:7,y:6,level:7,reaction:'contact'},
 {id:'espurr',speciesId:677,name:'냐스퍼',x:15,y:6,level:7,reaction:'flee'},
 {id:'skiddo',speciesId:672,name:'메이클',x:8,y:10,level:7,reaction:'contact'},
 {id:'pikachu',speciesId:25,name:'피카츄',x:15,y:10,level:7,reaction:'contact'},
 {id:'flabebe',speciesId:669,name:'플라베베',x:11,y:8,level:7,reaction:'calm',dayOnly:true},
]);
export function zone3FieldMonsters(s,period){
 if(!s||s.district!=='lumiose-zone3'||s.interior||s.zaZone3TowerUpper||joseeRequired(s))return [];
 const map=lumioseZone3Map();return ZONE3_FIELD_SPECIES.filter(p=>s.zaZone3FieldSpent?.[p.id]!==true&&(!p.dayOnly||period==='day')).map(p=>{const v=s.zaZone3FieldPositions?.[p.id];return p.reaction==='flee'&&Number.isInteger(v?.x)&&Number.isInteger(v?.y)&&map[v.y]?.[v.x]==='g'&&v.x>=13&&v.y<=8?{...p,x:v.x,y:v.y,alert:Number.isInteger(v.alert)?v.alert:0}:{...p,alert:0};});
}
export function zone3FieldTarget(s,period,id){
 const p=zone3FieldMonsters(s,period).find(m=>m.id===id);if(!p||!Number.isInteger(s.x)||!Number.isInteger(s.y))return null;
 const map=lumioseZone3Map(),queue=[{x:s.x,y:s.y,distance:0}],seen=new Set([`${s.x},${s.y}`]);for(let i=0;i<queue.length;i++){const q=queue[i];if(q.x===p.x&&q.y===p.y)return {...p,distance:q.distance};if(q.distance>=2)continue;for(const [dx,dy] of Object.values(DIRECTIONS)){const x=q.x+dx,y=q.y+dy,key=`${x},${y}`,tile=map[y]?.[x];if(!walkable(tile)||'EWX'.includes(tile)||seen.has(key))continue;seen.add(key);queue.push({x,y,distance:q.distance+1});}}return null;
}
export function zone3FieldContact(s,period){return zone3FieldMonsters(s,period).find(p=>p.reaction==='contact'&&p.x===s.x&&p.y===s.y)||null;}
export function stepZone3Field(s,period){
 const p=zone3FieldMonsters(s,period).find(m=>m.reaction==='flee');if(!p||Math.abs(s.x-p.x)+Math.abs(s.y-p.y)>1)return false;
 const map=lumioseZone3Map(),distance=(x,y)=>Math.abs(x-s.x)+Math.abs(y-s.y),candidates=[[p.x-1,p.y],[p.x,p.y-1],[p.x+1,p.y],[p.x,p.y+1]].filter(([x,y])=>x>=13&&x<=16&&y>=4&&y<=8&&map[y]?.[x]==='g'&&distance(x,y)>distance(p.x,p.y));
 const alert=p.alert+1;if(alert>=2||!candidates.length)s.zaZone3FieldSpent={...(s.zaZone3FieldSpent||{}),[p.id]:true};else{s.zaZone3FieldPositions={...(s.zaZone3FieldPositions||{}),[p.id]:{x:candidates[0][0],y:candidates[0][1],alert}};}return true;
}
export function findTile(map,tile){for(let y=0;y<map.length;y++){const x=map[y].indexOf(tile);if(x>=0)return {x,y};}return null;}
export function normalizeField(s){
  if(!s||s.mapVersion===MAP_VERSION)return s;
  const old=areaMap(s.expedition?0:s.area),tile=old[s.y]?.[s.x],map=fieldMap(s);
  let target=['H','M','G','N'].includes(tile)?findTile(map,tile):null;
  if(s.area===9&&['L','C'].includes(tile))target={x:[8,11,14,17,20][Math.max(0,[4,6,8,10,12].indexOf(s.x))],y:4};
  const x=Math.max(1,Math.min(21,Math.round((Number(s.x)||3)*22/14))),y=Math.max(1,Math.min(15,Math.round((Number(s.y)||5)*16/10)));
  if(!target)target=walkable(map[y]?.[x])?{x,y}:{x:3,y:8};
  Object.assign(s,target,{mapVersion:MAP_VERSION,facing:'down'});return s;
}
export function validateAdventurePath(path){
  if(!Array.isArray(path)||!path.length||path.length>8||path.some(d=>typeof d!=='string'||!Object.hasOwn(DIRECTIONS,d)))throw Error('이동 경로는 올바른 방향 1–8개여야 합니다.');
  return path;
}
export function stepField(s,direction){
  if(!Object.hasOwn(DIRECTIONS,direction))return {blocked:true,reason:'방향을 확인하세요.'};
  const [dx,dy]=DIRECTIONS[direction],x=s.x+dx,y=s.y+dy,tile=fieldMap(s)[y]?.[x];
  if(!walkable(tile))return {blocked:true,reason:tile==='~'?'물가 너머로는 걸어갈 수 없습니다.':'그곳으로 갈 수 없습니다.'};
  if(!s.interior&&s.district==='lumiose-zone3'&&(tile==='g'||tile==='i')&&!s.zaZone3TowerUpper&&fieldMap(s)[s.y]?.[s.x]!=='g'&&joseeRequired(s))return {blocked:true,reason:'야생 구역에 들어가기 전 Rouge Plaza에서 Josée와 배틀하세요.'};
  if(s.interior==='lumioseLab'&&tile==='X')return {x:5,y:6,area:s.area,interior:null,transitioned:true,tile};
  if(s.interior==='lab'&&tile==='X')return {x:18,y:5,area:s.area,interior:null,transitioned:true,tile};
  if(s.interior==='hotel202'&&tile==='X')return {x:8,y:6,area:s.area,interior:'hotel2f',transitioned:true,tile};
  if(s.interior==='hotel'&&tile==='X')return {x:11,y:6,area:s.area,interior:null,transitioned:true,tile};
  if(s.district==='lumiose-rooftop'&&tile==='X')return {x:14,y:7,area:s.area,district:'lumiose',transitioned:true,tile};
  if(s.district==='lumiose-rooftop'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-zone2',transitioned:true,tile};
  if(s.district==='lumiose-bureau'&&tile==='X')return {x:19,y:7,area:s.area,district:'lumiose-zone3',transitioned:true,tile};
  if(s.district==='lumiose-royale'&&tile==='X')return {x:11,y:10,area:s.area,district:'lumiose',transitioned:true,tile};
  if(s.district==='lumiose'&&tile==='X')return {x:5,y:9,area:s.area,district:null,regionId:s.districtReturnRegion??1,districtReturnRegion:null,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose'&&tile==='s')return {x:21,y:8,area:s.area,district:'lumiose-zone1',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose'&&tile==='W')return {x:1,y:8,area:s.area,district:'lumiose-vernal',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vernal'&&tile==='W')return {x:1,y:8,area:s.area,district:'lumiose',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vernal'&&tile==='E')return {x:1,y:8,area:s.area,district:'lumiose-vert-plaza',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-plaza'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-vernal',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-plaza'&&tile==='E')return {x:11,y:15,area:s.area,district:'lumiose-zone2',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-floral'&&tile==='f')return {x:11,y:14,area:s.area,district:'lumiose-vernal',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vernal'&&tile==='X')return {x:11,y:1,area:s.area,district:'lumiose-floral',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone1'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-floral',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-floral'&&tile==='E')return {x:1,y:8,area:s.area,district:'lumiose-zone1',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone2'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-vert2',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert2'&&tile==='E')return {x:4,y:1,area:s.area,district:'lumiose-zone2',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert2'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-north'&&tile==='E')return {x:21,y:8,area:s.area,district:'lumiose-zone4',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone4'&&tile==='E')return {x:21,y:4,area:s.area,district:'lumiose-rouge-north',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='E')return {x:1,y:8,area:s.area,district:'lumiose-vert2',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='W')return {x:11,y:15,area:s.area,district:'lumiose-zone3',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone3'&&tile==='X')return y===0?{x:11,y:15,area:s.area,district:'lumiose-rouge-north',transitioned:true,tile}:{x:1,y:8,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-north'&&tile==='X')return {x:11,y:1,area:s.area,district:'lumiose-zone3',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone3'&&tile==='E')return {x:1,y:8,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone2'&&tile==='E')return {x:21,y:8,area:s.area,district:'lumiose-vert-plaza',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone1'&&tile==='E')return {x:8,y:14,area:s.area,district:'lumiose',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose'&&tile==='E')return {x:1,y:8,area:s.area,district:'lumiose-garden',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-garden'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-garden'&&tile==='E')return {x:1,y:8,area:s.area,district:'lumiose-site',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-site'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-garden',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-site'&&tile==='E')return cityProjectStage(s)===5?{x:1,y:8,area:s.area,district:'lumiose-wild',transitioned:true,tile}:{blocked:true,reason:'호텔에 정원 조사 결과를 보고한 뒤 야생 구역에 갈 수 있습니다.'};
  if(!s.interior&&s.district==='lumiose-wild'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-site',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-wild'&&tile==='E')return wildStudyStage(s)>=3?{x:1,y:8,area:s.area,district:'lumiose-observation',transitioned:true,tile}:{blocked:true,reason:'야생 구역 안내원에게 조사 결과를 먼저 보고하세요.'};
  if(!s.interior&&s.district==='lumiose-observation'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-wild',transitioned:true,tile};
  if(['E','W'].includes(tile)&&s.expedition)return {x:3,y:8,area:9,expedition:null,regionId:1,locationId:0,nearSpecialRock:false,transitioned:true,tile};
  if(tile==='E'){
    if(s.area>0&&s.area<=8&&!s.badges.includes(TRAINERS[s.area-1].id))return {blocked:true,reason:`${TRAINERS[s.area-1].name}의 배지를 먼저 획득하세요.`};
    return {x:1,y:8,area:Math.min(9,s.area+1),transitioned:true,tile};
  }
  if(tile==='W'){
    if(s.area<=0)return {blocked:true,reason:'이곳이 모험의 시작점입니다.'};
    return {x:21,y:8,area:s.area-1,league:s.area===9&&s.league>0&&s.league<5?0:s.league,transitioned:true,tile};
  }
  return {x,y,area:s.area,tile,transitioned:false};
}
// Saved alpha positions are restricted to ordinary, traversable wild-zone tiles.
export function wildAlphaPosition(s){
 const p=s?.zaWildAlphaPosition;
 const valid=p&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=1&&p.x<=21&&p.y>=1&&p.y<=15&&!(p.y===8&&p.x===3)&&!(p.y===3&&p.x>=8&&p.x<=16)&&Object.hasOwn(DIRECTIONS,p.facing);
 return valid?{x:p.x,y:p.y,facing:p.facing}:{x:3,y:5,facing:'down'};
}
function isBehindAlpha(s,target){
 const [fx,fy]=DIRECTIONS[wildAlphaPosition(s).facing],[dx,dy]=[s.x-target.x,s.y-target.y],dot=dx*fx+dy*fy,cross=dx*fy-dy*fx;
 return dot<0&&Math.abs(cross)<=-dot;
}
// Step-based pursuit is a provisional adaptation of Z-A's real-time chase.
export function stepWildAlphaPursuit(s){
 if(s.district!=='lumiose-wild'||s.interior||s.zaWildAlphaAlert!==true||s.zaWildAlphaSpent===true)return false;
 const p=wildAlphaPosition(s),dx=s.x-p.x,dy=s.y-p.y;if(Math.abs(dx)+Math.abs(dy)<=1)return false;
 const candidates=[...(dx?[[Math.sign(dx),0,dx>0?'right':'left']]:[]),...(dy?[[0,Math.sign(dy),dy>0?'down':'up']]:[])];
 if(Math.abs(dy)>Math.abs(dx))candidates.reverse();const map=fieldMap(s);
 for(const [mx,my,facing] of candidates){const x=p.x+mx,y=p.y+my,tile=map[y]?.[x];if((x===s.x&&y===s.y)||!['.','g'].includes(tile))continue;s.zaWildAlphaPosition={x,y,facing};return true;}
 return false;
}
// A provisional three-tile, unobstructed straight aim on the tile map.
export function wildAlphaAim(s,grid){
 if(!s||s.district!=='lumiose-wild'||s.interior||s.zaWildAlphaSpent===true||!Object.hasOwn(DIRECTIONS,s.facing))return null;
 const [dx,dy]=DIRECTIONS[s.facing],map=grid||fieldMap(s);
 for(let distance=1;distance<=3;distance++){
  const x=s.x+dx*distance,y=s.y+dy*distance,tile=map[y]?.[x];
  if(tile==='a')return {x,y,distance,back:isBehindAlpha(s,{x,y})};
  if(!walkable(tile)||'HMJDNQABOUV'.includes(tile))return null;
 }
 return null;
}
// Selecting the visible target permits a provisional grid ray in any direction.
export function wildAlphaTarget(s,grid){
 if(!s||s.district!=='lumiose-wild'||s.interior||s.zaWildAlphaSpent===true||!Number.isInteger(s.x)||!Number.isInteger(s.y))return null;
 const map=grid||fieldMap(s),target=findTile(map,'a');if(!target||!walkable(map[s.y]?.[s.x]))return null;
 const dx=target.x-s.x,dy=target.y-s.y,distance=Math.max(Math.abs(dx),Math.abs(dy));if(distance<1||distance>3)return null;
 let x=s.x,y=s.y,err=Math.abs(dx)-Math.abs(dy);const sx=Math.sign(dx),sy=Math.sign(dy);
 while(x!==target.x||y!==target.y){const e=2*err,oldX=x,oldY=y;if(e> -Math.abs(dy)){err-=Math.abs(dy);x+=sx;}if(e<Math.abs(dx)){err+=Math.abs(dx);y+=sy;}
  if(x!==oldX&&y!==oldY&&!walkable(map[oldY]?.[x])&&!walkable(map[y]?.[oldX]))return null;
  const tile=map[y]?.[x];if(x===target.x&&y===target.y)break;if(!walkable(tile)||'HMJDNQABOUV'.includes(tile))return null;
 }
 return {...target,distance,back:isBehindAlpha(s,target)};
}
// Provisional fixed, one-tile view for the south-facing wild alpha.
export function wildAlphaSees(s){
 if(s.district!=='lumiose-wild'||s.interior||s.zaWildAlphaSpent===true)return false;
 const p=wildAlphaPosition(s),dx=s.x-p.x,dy=s.y-p.y;if(Math.abs(dx)+Math.abs(dy)>1)return false;const [fx,fy]=DIRECTIONS[p.facing];return dx*fx+dy*fy>=0;
}
// Lowercase terrain codes must never be treated as district NPCs on route maps.
export function cloudNpcTile(tile,s){if('NQRF DABOUV'.replaceAll(' ','').includes(tile||'!'))return true;const districtNpc={j:'lumiose-zone3',e:'lumiose-bureau',t:'lumiose-zone3',m:'lumiose-rouge-north',v:'lumiose-zone3',u:'lumiose-rooftop',n:'lumiose-rooftop'};return !!tile&&districtNpc[tile]===s.district&&!!s.district;}
export function cloudInteractionTile(tile,s){return !!tile&&('HMGNLCPQSIRJTFKYDZABOUV'.includes(tile)||(tile==='l'&&s.district==='lumiose-rouge-north')||(!!s.district&&'rajbetqmzvhucxdnpio'.includes(tile)));}
export function interactionAt(s){
  const map=fieldMap(s),[dx,dy]=DIRECTIONS[s.facing]||DIRECTIONS.down;
  for(const [x,y]of [[s.x,s.y],[s.x+dx,s.y+dy]]){
    const tile=map[y]?.[x];if(cloudInteractionTile(tile,s))return {x,y,tile};
  }
  return null;
}
export function leagueIndex(s){const spot=interactionAt(s);return spot?.y===4?[8,11,14,17,20].indexOf(spot.x):-1;}
export function fieldDialogue(s){
  const spot=interactionAt(s);if(!spot)return null;
  if(spot.tile==='l'&&s.district==='lumiose-rouge-north'&&!s.interior)return {name:'스시 하이 롤러 (배치 초안)',text:'루주 거리에 있는 음식점이다. 건물 내부와 식사 배틀은 준비 중이다.'};
  if(spot.tile==='i'&&s.district==='lumiose-zone3'&&!s.interior)return s.zaZone3TowerUpper?{name:'정원 탑 사다리 (초안)',text:'사다리를 타고 정원으로 내려간다.',action:'zone3TowerDown',label:'정원으로 내려가기'}:{name:'정원 탑 사다리 (초안)',text:'사다리를 타고 작은 흰 탑의 위층으로 올라간다.',action:'zone3TowerUp',label:'위층으로 올라가기'};
  if(spot.tile==='H'&&s.district==='lumiose-zone3'&&!s.interior)return {name:'루주 광장 이동식 포켓몬센터',text:'북쪽 노점에서 파티의 HP와 상태이상, PP를 회복할 수 있다.',action:'heal',label:'파티 회복하기'};
  if(spot.tile==='p'&&s.district==='lumiose-zone2'&&!s.interior)return {name:'동남쪽 섬의 우두머리 (초안)',text:'낮과 밤에 서로 다른 우두머리 포켓몬이 나타난다.',action:'encounterZone2Alpha',label:'우두머리와 배틀'};
  if(spot.tile==='r'&&s.district==='lumiose-zone2'&&!s.interior)return {name:'동쪽 물가의 바위 (초안)',text:'바위깨기로 통로를 열고 얕은 물을 지나갈 수 있다. 지형 배치는 초안이다.',action:'smashZone2Rock',label:'바위깨기 사용'};
  if(spot.tile==='q'&&s.district==='lumiose-vernal'&&!s.interior)return {name:'뚜뚜 카페 · Café Woof (위치 초안)',text:'음료를 주문하면 파티를 회복하고 선두 포켓몬과 친해질 수 있다.',actions:CAFE_WOOF_DRINKS.map(drink=>({action:drink.action,label:`${drink.name} · ${drink.price}코인`}))};
  if(spot.tile==='P'&&s.district==='lumiose-floral'&&!s.interior)return {name:'미르시티 포켓몬 연구소 (초안)',text:'Floral Avenue의 연구소다. 건물 위치와 내부 크기는 초안이다.',action:'enterLumioseLab',label:'연구소에 들어가기'};
  if(spot.tile==='R'&&s.interior==='lumioseLab')return {name:'포켓몬 연구원',text:'선두 포켓몬을 연구 수첩에 기록할 수 있다. 원작의 시설과 대화는 아직 구현 중이다.',actions:[{action:'recordResearch',label:'선두 포켓몬 기록하기'}]};
  if(spot.tile==='i'&&['hotel','hotel2f','hotelRoof'].includes(s.interior))return {name:'호텔 엘리베이터',text:'로비, 2층과 호텔 옥상을 오갈 수 있다. 배치와 크기는 초안이다.',actions:[...(s.interior!=='hotel'?[{action:'hotelLiftDown',label:'로비로 가기'}]:[]),...(s.interior!=='hotel2f'?[{action:'hotelLiftUp',label:'2층으로 가기'}]:[]),...(s.interior!=='hotelRoof'?[{action:'hotelLiftRoof',label:'옥상으로 가기'}]:[])]};
  if(spot.tile==='b'&&s.interior==='hotel2f')return {name:'다른 객실',text:'이쪽 문은 다른 객실이다. 202호는 왼쪽 문이다.'};
  if(spot.tile==='o'&&s.interior==='hotel2f')return {name:'202호',text:'왼쪽 문은 내가 머무르는 202호다.',action:'enterHotel202',label:'202호에 들어가기'};
  if(spot.tile==='z'&&s.interior==='hotel202')return {name:'침대',text:'호텔 202호의 침대다. 시간 변경은 아직 준비 중이다.'};
  const area=AREAS[s.area],gym=TRAINERS[Math.max(0,s.area-1)];
  const entries={
    H:{name:'포켓몬 센터',text:'어서 오세요! 파티의 HP와 상태이상, 기술 PP를 모두 회복해 드릴게요.',action:'heal',label:'포켓몬을 쉬게 하기'},
    M:{name:'프렌들리숍',text:'모험에 필요한 몬스터볼과 회복 도구를 준비하세요.',action:'shop',label:'상품 보기'},
    G:{name:gym.name,text:`${gym.title}에 온 것을 환영한다! ${gym.type} 타입 포켓몬들과 겨뤄 보겠나?`,action:'challenge',label:'체육관에 도전하기'},
    N:!s.expedition&&s.area===4&&habitatStage(s)===2?{name:'현장 트레이너',text:'공사 준비를 맡고 있지만 포켓몬들의 보금자리도 걱정이야. 배틀을 통해 서로의 마음을 확인하고 함께 해결책을 찾자.',action:'challenge',label:'현장 트레이너와 배틀'}:{name:'길목의 트레이너',text:'포켓몬과 눈이 마주쳤으니 실력을 겨뤄 볼까? 수련이나 돌보기도 함께 할 수 있어.',action:'challenge',label:'트레이너와 배틀'},
    L:{name:TRAINERS[8+Math.max(0,leagueIndex(s))]?.name||'사천왕',text:'리그는 순서대로 도전해야 합니다. 도전 중에는 센터에서 회복할 수 없어요.',action:'challenge',label:'리그에 도전하기'},
    C:{name:'챔피언 그린',text:'사천왕을 모두 이겼구나. 이제 마지막 승부다!',action:'challenge',label:'챔피언에게 도전'},
    P:s.area===0&&!s.expedition?{name:'포켓몬 연구소',text:'연구소에 들어가 포켓몬 연구원과 이야기할 수 있어요.',action:'enterLab',label:'연구소에 들어가기'}:{name:'포켓몬 연구소',text:'포켓몬을 잡고 도감을 채워 보렴. 레벨이 올라도 자동으로 진화하지 않아. 파티 관리에서 조건을 살피고 직접 선택하렴.'},
    R:{name:'포켓몬 연구원',text:habitatStage(s)===3?'숲의 상황을 듣고 싶구나. 기록도 언제든 남길 수 있어.':'함께 여행한 선두 포켓몬을 연구 수첩에 기록해 줄게. 진화는 기술·성장 메뉴에서 직접 선택할 수 있단다.',actions:[{action:'recordResearch',label:'선두 포켓몬 기록하기'},habitatLabAction(s)].filter(Boolean)},
    Q:s.district==='lumiose'?{name:'도시 안내원',text:'호텔 남쪽은 야생 구역 1, 동쪽은 정원 지구예요. 남쪽 정류장에서는 항구로 돌아갈 수 있어요. 현재 도시 배치는 초안이에요.'}:s.district==='lumiose-garden'&&lidaBattleAction(s)?{name:'팀 MZ Lida',text:'Lida가 정원에서 연습 중이다. 맡아 온 물건을 전할 수 있다.',actions:[lidaBattleAction(s)]}:s.district==='lumiose-garden'?{name:'정원 안내원',text:'사람과 포켓몬이 쉬어 가는 정원이에요. 서쪽은 광장, 동쪽은 공사 현장으로 이어져요.'}:!s.expedition&&s.area===3&&habitatStage(s)===4?{name:'항구 조사단 안내원',text:'조사단이 미르시티의 첫 구역으로 가는 배편을 준비했어요. 항구로 돌아올 수도 있답니다.',action:'visitLumiose',label:'미르시티로 가기'}:habitatGuideDialogue(s)||surveyDialogue(s)||{name:'마을 안내원',text:s.completed?'챔피언이 되었군요! 여행 수첩에서 세계의 진화 장소와 명예의 전당을 살펴보세요.':`이곳은 ${area.name}. 풀숲에서 포켓몬을 만나고, 동쪽 길을 따라 체육관에 도전하세요. 몬스터볼은 숍에서 구할 수 있어요.`},
    p:{name:'우두머리 페이검',text:'이 페이검의 타일 위치와 재등장은 시범 구성이다.',action:'encounterZone4Alpha',label:'우두머리와 배틀'},
    a:s.zaWildAlphaSpent?{name:'우두머리 포켓몬의 자리',text:'현재 이 자리의 구구는 보이지 않는다. 야생 구역에 다시 들어오면 만날 수 있다.'}:{name:'우두머리 구구',text:s.zaWildAlphaAlert?'구구가 이미 나를 알아챘다. 필드 배치와 시야는 시범 구성이다.':'표식의 화살표는 구구가 보는 방향이다. 뒤에서 다가가면 들키지 않고 기본 볼을 던질 수 있다. 가까운 직선 방향에서 조준할 수 있으며 배치와 시야는 시범 구성이다.',actions:[{action:'encounterWildAlpha',label:'우두머리와 배틀'},...(spot.x!==s.x||spot.y!==s.y?[{action:'throwWildAlpha',label:'기본 볼 던지기'}]:[])]},
    r:{name:'길을 막은 바위',text:'파트너가 바위깨기를 알고 있으면 이 길을 열 수 있다. 이 공사 현장 지형은 초안이다.',action:'smashSiteRock',label:'바위깨기 사용'},
    n:{name:'AZ',text:s.zaMysteryTrail===2?'앱솔이 폭주하려 한다. 루카리오와 메가링을 빌려주겠네.':s.zaMysteryTrail===3?'준비가 되었다면 루카리오와 함께 앱솔을 진정시켜 주게.':s.zaMysteryTrail===4?'앱솔이 자네와 함께하고 싶어 하는구나. 앱솔나이트와 메가링도 받아 주게.':'도와줘서 고맙네.',...(s.zaMysteryTrail===2?{action:'meetAZForAbsol',label:'AZ의 이야기 듣기'}:s.zaMysteryTrail===3?{action:'battleAZLoan',label:'대여 배틀 시작'}:s.zaMysteryTrail===4?{action:'claimAZAbsol',label:'앱솔과 보상 받기'}:{})},
    d:{name:'정체불명의 포켓몬 (초안)',text:s.zaMysteryTrail===1?'정체불명의 포켓몬이 옥상으로 이끌고 있다.':'정체불명의 포켓몬이 나타나 따라오라는 듯 바라본다.',action:s.zaMysteryTrail===1?'investigateMystery':'followMystery',label:s.zaMysteryTrail===1?'옥상에서 주변 살피기':'포켓몬 따라가기'},
    x:{name:'메가조각 교환 안내 (초안)',text:s.zaShardExchangeUnlocked?'메가조각으로 메가스톤을 교환할 수 있다. 여행 수첩에서 목록을 확인하자.':'메가조각 교환소는 원작의 메인 임무 10에서 열린다. 해당 진행은 아직 준비 중이다.'},
    h:{name:'옥상으로 가는 길 (초안)',text:'랭크 Y부터 호텔 부근의 옥상 길을 살펴볼 수 있다. 실제 도시 지형과 동행은 아직 재현 중이다.',action:'enterRooftop',label:'옥상으로 올라가기'},
    u:{name:'여행 동료 (초안)',text:s.zaRooftopIntroduced?'공격 기술로 결정을 부수고 옥상 길을 따라가자.':'함께 옥상 길을 따라 프리즘타워를 살펴보자.',...(s.zaRooftopIntroduced?{}:{action:'meetRooftopCompanion',label:'동료와 이야기하기'})},
    c:{name:'메가스톤 결정',text:s.zaRooftopIntroduced?'선두 포켓몬이 공격 기술을 알고 있으면 결정을 부술 수 있다.':'동료의 안내를 먼저 들어 보자.',...(s.zaRooftopIntroduced?{action:'smashRooftopCrystal',label:'공격 기술로 결정 부수기'}:{})},
    b:{name:'핸섬 탐정사무소 (초안)',text:'Emma를 만날 수 있다. 이 건물의 위치와 내부는 임시 배치다.',action:'enterBureau',label:'사무소에 들어가기'},
    t:{name:'의뢰인 Trevelle',text:!s.zaEmmaMet?'여기서 누군가를 기다리는 듯하다.':s.zaBunnelbyQuest===2?'큰 파르빗을 살펴봐 줘서 고마워요.':s.zaBunnelbyQuest===3?'파르빗 사건을 해결해 줘서 고마워요.':s.zaBunnelbyQuest===1?'근처 골목에 있는 큰 파르빗을 살펴봐 주세요.':'야생 구역 밖에서 큰 파르빗을 봤어요. 살펴봐 주시겠어요?',...(s.zaEmmaMet&&s.zaBunnelbyQuest!==1&&s.zaBunnelbyQuest!==3?{action:s.zaBunnelbyQuest===2?'reportBunnelby':'startBunnelby',label:s.zaBunnelbyQuest===2?'의뢰 보고하기':'파르빗 의뢰 받기'}:{})},
    q:{name:'골목 (초안)',text:s.zaBunnelbyQuest===1?'골목에 큰 파르빗이 있다.':'조용한 골목이다.',...(s.zaBunnelbyQuest===1?{action:'battleBunnelby',label:'우두머리 파르빗 살피기'}:{})},
    m:{name:'의뢰인 Moire',text:!s.zaEmmaMet?'묘지 앞에서 누군가를 기다리고 있다.':s.zaSableyeQuest===2?'소중한 반지를 찾았나요?':s.zaSableyeQuest===3?'반지를 찾아줘서 고마워요.':s.zaSableyeQuest===1?'묘지 깊은 곳에서 반지를 찾아 주세요.':'묘지에서 깜까미에게 놀라 반지를 떨어뜨렸어요.',...(s.zaEmmaMet&&s.zaSableyeQuest!==1&&s.zaSableyeQuest!==3?{action:s.zaSableyeQuest===2?'reportSableye':'startSableye',label:s.zaSableyeQuest===2?'반지 돌려주기':'반지 찾기 의뢰 받기'}:{})},
    z:{name:'묘지 안쪽 (초안)',text:s.zaSableyeQuest===1?'이곳에서 반지를 찾아보자.':'묘지의 조용한 자리다.',...(s.zaSableyeQuest===1?{action:'battleSableye',label:'반지 찾기'}:{})},
    v:{name:'의뢰인 Tracie',text:!s.zaEmmaMet?'진화에 관심이 많은 트레이너다.':s.zaTradeQuest===2?'교환한 피카츄와 함께할게요.':s.zaTradeQuest===1?'피카츄를 헤라크로스와 교환해요. 여행 수첩에서 개체를 직접 선택해 주세요.':'피카츄를 진화시키고 싶어요. 헤라크로스와 교환해 주시겠어요?',...(s.zaEmmaMet&&!s.zaTradeQuest?{action:'startPikachuTrade',label:'교환 의뢰 받기'}:{})},
    e:{name:'탐정 Emma',text:!s.zaEmmaMet?'사건 의뢰를 함께 도와줄 수 있을까?':s.zaEmmaBattleComplete?(s.zaEmmaMegaSeen?'전룡의 메가진화 이야기를 들었다. 동행 장면은 준비 중이다.':'배틀을 마쳤구나. 전룡의 메가진화를 보여 줄게.'):s.zaBunnelbyQuest===3&&s.zaTradeQuest===2&&s.zaSableyeQuest===3?'세 의뢰를 마쳤구나. 준비가 되면 나와 배틀하자.':'파르빗·교환·묘지 의뢰를 살펴보세요. 임무 05의 나머지는 준비 중이다.',...(!s.zaEmmaMet?{action:'meetEmma',label:'의뢰 이야기 듣기'}:s.zaEmmaBattleComplete&&!s.zaEmmaMegaSeen?{action:'seeEmmaMega',label:'전룡의 메가진화 살펴보기'}:s.zaBunnelbyQuest===3&&s.zaTradeQuest===2&&s.zaSableyeQuest===3&&!s.zaEmmaBattleComplete?{action:'battleEmma',label:'Emma와 배틀'}:{})},
    j:{name:'정의단 Josée',text:joseeAction(s)?'Rouge Plaza에서 야생 구역에 대한 생각을 배틀로 확인해 보자. 정확한 위치는 임시 배치다.':'임무 05의 나머지 장면은 준비 중이다.',...(joseeAction(s)||{})},
    T:royaleDialogue(s),
    O:royaleZoneDialogue(s,'O'),U:royaleZoneDialogue(s,'U'),V:royaleZoneDialogue(s,'V'),
    J:{name:'호텔',text:naveenAction(s)?'호텔 앞에서 팀 MZ의 Naveen이 기다리고 있다. 로비에도 들어갈 수 있다.':s.zaNaveenComplete?'Naveen에게 패션 디자이너가 되고 싶은 꿈을 들었다. 호텔 로비에 들어갈 수 있다.':'여행자와 포켓몬을 위한 호텔이다. 로비에 들어갈 수 있다.',action:'enterHotel',label:'호텔에 들어가기',...(naveenAction(s)?{actions:[{action:'enterHotel',label:'호텔에 들어가기'},naveenAction(s)]}: {})},
    F:{name:'호텔 안내 직원',text:s.zaMysteryTrail>=5&&!s.zaMission10Stage?'팀 MZ 동료가 로비에서 기다리고 있어요. 함께 이야기를 들어 보세요.':cityProjectStage(s)===4?'정원 조사 결과를 들려주세요. 파트너도 쉬어 갈 수 있어요.':'어서 오세요. 파트너들과 쉬거나 도시 조사단의 의뢰를 살펴보세요.',actions:[...(s.zaMysteryTrail>=5&&!s.zaMission10Stage?[{action:'startMegaMission',label:'팀 MZ 동료와 이야기하기'}]:[]),{action:'hotelRest',label:'파티 쉬게 하기'},cityProjectHotelAction(s),lidaBagAction(s)].filter(Boolean)},
    K:cityProjectStage(s)===3?{name:'정원 화단',text:'꽃 사이에 포켓몬이 쉬어 갈 자리가 보인다. 현장에 제안한 방안과 함께 기록하자.',action:'cityProjectGarden',label:'쉼터 기록하기'}:{name:'정원 화단',text:'사람과 포켓몬이 함께 가꾸는 작은 화단이다.'},
    Y:cityProjectStage(s)===1?{name:'도시 조사 게시판',text:'정원 동쪽 공사와 포켓몬의 쉼터를 함께 고려할 방안을 찾고 있다. 현장 담당자의 이야기를 들어 보자.',action:'cityProjectBoard',label:'의뢰 내용 확인하기'}:{name:'도시 조사 게시판',text:'도시 조사단이 정원의 이용과 서식지를 함께 살필 계획이다.'},
    D:cityProjectStage(s)===2?{name:'공사 현장 담당자',text:'정원의 쉼터를 지키면서 일을 진행해야 해요. 어떤 방안을 제안하시겠어요?',actions:[{action:'cityProjectDetour',label:'이동 경로를 우회하기'},{action:'cityProjectHours',label:'작업 시간을 조정하기'}]}:{name:'공사 현장 담당자',text:cityProjectStage(s)>=3?(s.cityProject?.plan==='detour'?'이동 경로를 우회하는 제안을 검토하고 있어요. 정원 방향은 서쪽 길입니다.':'작업 시간을 조정하는 제안을 검토하고 있어요. 정원 방향은 서쪽 길입니다.'):'작업 구역은 안전하게 둘러 두었어요. 정원 방향은 서쪽 길입니다.'},
    Z:{name:'현장 안내판',text:cityProjectStage(s)===5?'동쪽은 야생 구역, 서쪽은 정원이다.':'동쪽 야생 구역은 정원 조사 보고 후 출입할 수 있다. 서쪽은 정원이다.'},
    A:wildStudyStage(s)===0?{name:'야생 구역 안내원',text:'풀숲의 포켓몬을 살피는 조사를 도와주시겠어요?',action:'wildStudyStart',label:'야생 조사 받기'}:wildStudyStage(s)===2?{name:'야생 구역 안내원',text:'야생 포켓몬을 살폈군요. 조사 결과를 들려주세요.',action:'wildStudyReport',label:'야생 조사 보고하기'}:{name:'야생 구역 안내원',text:wildStudyStage(s)===1?'야생 포켓몬 한 마리를 이기거나 포획한 뒤 돌아오세요.':'동쪽 관측 정원에는 조사 트레이너가 있어요. 서쪽은 공사 현장입니다.'},
    B:wildStudyStage(s)===3?{name:'관측 정원 트레이너',text:'야생 구역의 포켓몬을 살펴봤군요. 함께 배틀하며 파트너와의 호흡을 확인해요.',action:'challenge',label:'관측 트레이너와 배틀'}:{name:'관측 정원 트레이너',text:'파트너와 쌓은 경험을 소중히 해요. 야생 구역은 서쪽입니다.'},
    S:{name:'여행 안내판',text:`${area.name} · 야생 Lv.${area.min}–${area.max}. 붉은 지붕은 센터, 파란 지붕은 프렌들리숍입니다. 방향키 / WASD: 걷기, E / Space: 대화, J: 여행 수첩.`},
    I:{name:'필드의 반짝이는 물건',text:s.fieldPickups?.includes(`${s.area}:${spot.x}:${spot.y}`)?'이곳에서 찾은 물건은 이미 챙겼습니다.':'길에서 200코인이 든 작은 주머니를 발견했다!',action:'pickup',label:'주머니 줍기'},
  };
  return {...entries[spot.tile],...spot};
}

/** Tap-to-walk chooses safe paths, prefers roads, and never crosses an exit en route. */
export function fieldPath(map,start,target){
  if(!walkable(map[target.y]?.[target.x]))return [];
  const key=(p)=>`${p.x},${p.y}`,open=[start],cost=new Map([[key(start),0]]),prev=new Map();
  while(open.length){
    open.sort((a,b)=>cost.get(key(a))-cost.get(key(b)));const p=open.shift();if(key(p)===key(target))break;
    for(const [direction,[dx,dy]]of Object.entries(DIRECTIONS)){
      const n={x:p.x+dx,y:p.y+dy},tile=map[n.y]?.[n.x];
      if(!walkable(tile)||('EWsf'.includes(tile)&&key(n)!==key(target)))continue;
      const c=cost.get(key(p))+(tile==='g'?4:1),k=key(n);
      if(c<(cost.get(k)??Infinity)){cost.set(k,c);prev.set(k,{p,direction});open.push(n);}
    }
  }
  const path=[];let p=target;while(key(p)!==key(start)){const step=prev.get(key(p));if(!step)return [];path.unshift(step.direction);p=step.p;}return path;
}
