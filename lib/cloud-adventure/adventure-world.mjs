import {zone5Map} from './adventure-zone5.mjs';
import {zone20Map} from './adventure-mission42.mjs';
import {anomalyIds,researchMap} from './adventure-mission40.mjs';
import {infinitePoints,infiniteRewardWins,infiniteNextReward} from './adventure-infinite-royale.mjs';
import {PROTECT_WAVES,protectWave,protectMap} from './adventure-mission37.mjs';
import {mission31Case,mission31CasesComplete} from './adventure-mission31-cases.mjs';
import {mission26Case,mission26CasesComplete} from './adventure-mission26-cases.mjs';
import {CRYSTAL_POSITIONS,clearedCrystals} from './adventure-mission20-jobs.mjs';
import {mission20Case,mission20Complete,mission20Ghost,mission20GhostsCaught} from './adventure-mission20.mjs';
import {sewerInspected} from './adventure-mission19.mjs';
import {rankEPoints} from './adventure-rank-d.mjs';
import {mission15CaseDialogue,mission15Complete} from './adventure-mission15.mjs';
import {rankFPoints} from './adventure-rank-e.mjs';
import {CAFE_WOOF_DRINKS} from './adventure-cafe.mjs';
import {AREAS, TRAINERS, areaMap} from '../campaign.mjs';
import {surveyDialogue,habitatGuideDialogue,habitatLabAction,habitatStage,cityProjectStage,cityProjectHotelAction,wildStudyStage} from './adventure-story.mjs';
import {royaleDialogue,royaleZoneDialogue,royaleVReady,naveenAction,lidaBagAction,lidaBattleAction,joseeAction,joseeRequired} from './adventure-royale.mjs';

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
  if(s.zaMission10Stage===1)grid[7][12]='n';
  return grid.map(row=>row.join(''));
}
// Draft rooftop route with a crystal blocking the way to Zone 2.
export function lumioseRooftopMap(s={}){
 const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let x=1;x<=21;x++)grid[9][x]='#';
 grid[9][11]=s.zaRooftopCrystalCleared?'.':'c';if(s.zaRoyaleRank==='V'&&s.zaMysteryTrail===1)grid[5][18]='d';else if(s.zaRoyaleRank==='V'&&s.zaMysteryTrail>=2)grid[5][18]='n';if(!s.zaRooftopIntroduced)grid[12][6]='u';if(s.zaMission15Stage>=1)grid[5][18]='d';grid[4][17]='m';grid[6][15]='7';grid[7][17]='6';grid[15][11]='X';grid[8][0]='W';return grid.map(row=>row.join(''));
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
// Playable provisional lab, not a reproduction of the original floor plan.
export function lysandreLabMap(s={}){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));g[15][11]='X';if(s.zaLysandreFloor===3){g[4][6]='a';g[4][10]='b';g[4][14]='e';g[4][18]='k';g[8][11]='j';}else{g[4][4]='a';g[4][9]='b';g[4][14]='e';g[4][19]='g';g[8][15]='k';}g[13][18]='l';return g.map(row=>row.join(''));}
export function lumioseVernalMap(){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));for(let y=5;y<=6;y++)for(let x=18;x<=21;x++)g[y][x]='~';for(let y=6;y<=8;y++)for(let x=10;x<=14;x++)g[y][x]=',';g[8][0]='W';g[8][22]='E';g[15][11]='X';g[5][12]='q';g[10][17]='d';g[12][17]='h';g[10][5]='v';g[12][6]='b';g[12][19]='z';return g.map(row=>row.join(''));}
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
export function lumioseCentricoRouteMap(){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));for(let x=1;x<=21;x++){for(let y=7;y<=9;y++)g[y][x]=x===7||x===16?';':',';g[6][x]='k';g[10][x]='k';}for(let y=11;y<=13;y++)for(let x=10;x<=12;x++)g[y][x]='%';g[8][0]='W';g[8][22]='E';g[5][11]='H';g[5][15]='q';g[5][18]='m';g[16][16]='W';g[16][18]='X';g[11][17]='o';g[12][18]='d';return g.map(row=>row.join(''));}
function legacyZone2Walkable(x,y){if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>22||y<0||y>16)return false;if((x===4&&y===0)||(x===11&&y===16)||(y===8&&(x===0||x===22)))return true;if(x===0||x===22||y===0||y===16)return false;return !(y>=4&&y<=6&&x>=8&&x<=12);}
function nearestWalkableLand(map,x,y){const places=[];for(let yy=1;yy<16;yy++)for(let xx=1;xx<22;xx++)if(walkable(map[yy]?.[xx]))places.push({x:xx,y:yy,d:Math.abs(xx-x)+Math.abs(yy-y)});places.sort((a,b)=>a.d-b.d||a.y-b.y||a.x-b.x);return places[0];}

// Rouge Street north of the plaza meets North Boulevard; geometry is provisional.
export function lumioseRougeNorthMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=3;y<=15;y++){for(let x=9;x<=13;x++)g[y][x]=',';g[y][8]='k';g[y][14]='k';}
 for(let y=3;y<=5;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=1;y<=3;y++)for(let x=18;x<=20;x++)g[y][x]='#';
 g[4][19]='l';g[8][18]='0';g[7][16]='H';g[6][19]='m';g[6][17]='t';g[5][17]='v';g[16][11]='X';g[4][22]='E';g[4][0]='W';return g.map(row=>row.join(''));
}
// The boulevard and company court connect known landmarks; dimensions are provisional.
export function lumioseNorthBoulevardMap(){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';g[8][0]='W';g[8][22]='E';g[5][15]='d';g[5][12]='t';g[5][18]='8';g[6][18]='6';return g.map(row=>row.join(''));}
export function lumioseQuasarticoMap(s={}){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));for(let y=1;y<=4;y++)for(let x=8;x<=14;x++)g[y][x]='#';for(let y=7;y<=11;y++)for(let x=7;x<=15;x++)g[y][x]=',';if(s.zaMission10Stage===2){g[6][11]='y';g[6][12]='y';}else if(s.zaMission10Stage>=3)g[6][11]='j';g[8][22]='E';return g.map(row=>row.join(''));}
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
 grid[8][22]='E';grid[0][11]='X';grid[16][11]='X';grid[4][17]='j';grid[6][19]='b';grid[10][19]='t';grid[11][20]='q';grid[12][3]='v';grid[10][3]='0';return grid.map(row=>row.join(''));
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
  grid[8][0]='W';grid[8][22]='E';grid[9][15]='D';grid[12][7]='9';grid[12][8]='6';grid[12][9]='0';grid[10][7]='d';grid[6][7]='Z';grid[11][12]=s.zaSiteRockCleared===true?'.':'r';return grid.map(row=>row.join(''));
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
const CITY_DISTRICTS=['lumiose-zone5','lumiose-zone20','lumiose-research-zone','lumiose-protect','lumiose-lysandre-lab','lumiose-crystal-sewer','lumiose-ghost-house','lumiose-rust','lumiose-sewer','lumiose','lumiose-floral','lumiose-vernal','lumiose-vert-plaza','lumiose-vert2','lumiose-centrico-route','lumiose-rouge-north','lumiose-north-boulevard','lumiose-quasartico','lumiose-rooftop','lumiose-zone1','lumiose-zone2','lumiose-zone3','lumiose-zone4','lumiose-bureau','lumiose-garden','lumiose-site','lumiose-wild','lumiose-observation','lumiose-royale'];
export function hotelMap(){
  const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
  for(let x=7;x<=15;x++)if(x!==11)grid[5][x]='#';
  grid[5][11]='F';grid[5][14]='i';grid[15][11]='X';return grid.map(row=>row.join(''));
}
// Layout coordinates are provisional; the elevator and left-hand 202 door follow the source route.
export function hotelSecondFloorMap(){const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));for(let x=5;x<=17;x++)grid[5][x]='#';grid[5][8]='o';grid[5][14]='b';grid[13][11]='i';return grid.map(row=>row.join(''));}
export function hotelRoom202Map(){const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));grid[4][8]='z';grid[15][11]='X';return grid.map(row=>row.join(''));}
// Reception and battle court are known; room dimensions and furniture are provisional.
export function sushiRestaurantMap(){const g=Array.from({length:17},()=>Array(23).fill('#'));for(let y=3;y<=15;y++)for(let x=4;x<=18;x++)g[y][x]='.';for(let y=6;y<=11;y++)for(let x=7;x<=15;x++)g[y][x]=';';g[5][16]='R';g[16][11]='X';return g.map(row=>row.join(''));}
// Office and furniture positions are provisional.
export function quasarticoOfficeMap(){const g=Array.from({length:17},()=>Array(23).fill('#'));for(let y=3;y<=15;y++)for(let x=4;x<=18;x++)g[y][x]='.';g[5][11]='j';g[12][15]='R';g[16][11]='X';return g.map(row=>row.join(''));}
// The rooftop's furnishings are source-confirmed; their exact tile positions are provisional.
export function hotelRoofMap(){const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));grid[13][11]='i';grid[5][7]='1';grid[5][11]='2';grid[5][15]='1';grid[9][7]='3';grid[9][15]='4';grid[3][4]='5';grid[3][18]='5';return grid.map(row=>row.join(''));}
const HOTEL_INTERIORS=['hotel','hotel2f','hotel202','hotelRoof'];
// Sewer paths, room dimensions and object positions are provisional.
export function lumioseSewerMap(){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));g[11][11]='t';g[10][16]='q';g[5][6]='a';g[5][16]='b';g[9][6]='e';g[9][16]='d';g[3][11]='i';g[2][11]='u';g[4][17]='o';g[16][11]='X';return g.map(row=>row.join(''));}
// Rust Syndicate meeting area: exterior and office are a provisional combined map.
export function lumioseRustMap(){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));g[6][11]='d';g[16][11]='X';return g.map(row=>row.join(''));}
// Empty house: actual room shape and positions are provisional.
export function lumioseGhostHouseMap(){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));g[5][6]='q';g[5][11]='a';g[5][16]='b';g[9][17]='n';g[16][11]='X';return g.map(row=>row.join(''));}
// The 27 crystal positions and sewer geometry are provisional.
export function lumioseCrystalSewerMap(s={}){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));const cleared=new Set(clearedCrystals(s));for(const p of CRYSTAL_POSITIONS)if(!cleared.has(p.key))g[p.y][p.x]='c';g[16][11]='X';return g.map(row=>row.join(''));}
export function fieldMap(s){return s.district==='lumiose-zone5'&&!s.interior?zone5Map(s):s.district==='lumiose-zone20'&&!s.interior?zone20Map():s.district==='lumiose-research-zone'&&!s.interior?researchMap(s):s.district==='lumiose-protect'&&!s.interior?protectMap():s.district==='lumiose-lysandre-lab'&&!s.interior?lysandreLabMap(s):s.district==='lumiose-crystal-sewer'&&!s.interior?lumioseCrystalSewerMap(s):s.district==='lumiose-ghost-house'&&!s.interior?lumioseGhostHouseMap():s.district==='lumiose-rust'&&!s.interior?lumioseRustMap():s.district==='lumiose-sewer'&&!s.interior?lumioseSewerMap():s.interior==='quasarticoOffice'?quasarticoOfficeMap():s.interior==='sushi'?sushiRestaurantMap():['lab','lumioseLab'].includes(s.interior)?labMap():s.interior==='hotel'?hotelMap():s.interior==='hotel2f'?hotelSecondFloorMap():s.interior==='hotel202'?hotelRoom202Map():s.interior==='hotelRoof'?hotelRoofMap():s.district==='lumiose'?lumioseMap(s):s.district==='lumiose-floral'?lumioseFloralMap():s.district==='lumiose-vernal'?lumioseVernalMap():s.district==='lumiose-vert-plaza'?lumioseVertPlazaMap():s.district==='lumiose-vert2'?lumioseVert2Map():s.district==='lumiose-centrico-route'?lumioseCentricoRouteMap():s.district==='lumiose-rouge-north'?lumioseRougeNorthMap():s.district==='lumiose-north-boulevard'?lumioseNorthBoulevardMap():s.district==='lumiose-quasartico'?lumioseQuasarticoMap(s):s.district==='lumiose-rooftop'?lumioseRooftopMap(s):s.district==='lumiose-zone1'?lumioseZone1Map():s.district==='lumiose-zone2'?lumioseZone2Map(s):s.district==='lumiose-zone3'?(s.zaZone3TowerUpper?lumioseZone3TowerMap():lumioseZone3Map()):s.district==='lumiose-zone4'?lumioseZone4Map(s):s.district==='lumiose-bureau'?lumioseBureauMap():s.district==='lumiose-garden'?lumioseGardenMap():s.district==='lumiose-site'?lumioseSiteMap(s):s.district==='lumiose-wild'?lumioseWildMap(s):s.district==='lumiose-observation'?lumioseObservationMap():s.district==='lumiose-royale'?lumioseRoyaleMap():adventureMap(s.area,!!s.expedition);}
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
    const indoor=p.interior||null,map=!indoor&&s.district==='lumiose-zone5'?zone5Map(s):!indoor&&s.district==='lumiose-zone20'?zone20Map():!indoor&&s.district==='lumiose-research-zone'?researchMap(s):!indoor&&s.district==='lumiose-protect'?protectMap():!indoor&&s.district==='lumiose-lysandre-lab'?lysandreLabMap(s):!indoor&&s.district==='lumiose-crystal-sewer'?lumioseCrystalSewerMap(s):!indoor&&s.district==='lumiose-ghost-house'?lumioseGhostHouseMap():!indoor&&s.district==='lumiose-rust'?lumioseRustMap():!indoor&&s.district==='lumiose-sewer'?lumioseSewerMap():indoor==='quasarticoOffice'&&s.district==='lumiose-quasartico'?quasarticoOfficeMap():indoor==='sushi'&&s.district==='lumiose-rouge-north'?sushiRestaurantMap():indoor==='lumioseLab'&&s.district==='lumiose-floral'?labMap():indoor==='hotel'&&s.district==='lumiose'?hotelMap():indoor==='hotel2f'&&s.district==='lumiose'?hotelSecondFloorMap():indoor==='hotel202'&&s.district==='lumiose'?hotelRoom202Map():indoor==='hotelRoof'&&s.district==='lumiose'?hotelRoofMap():s.district==='lumiose'?lumioseMap(s):s.district==='lumiose-floral'?lumioseFloralMap():s.district==='lumiose-vernal'?lumioseVernalMap():s.district==='lumiose-vert-plaza'?lumioseVertPlazaMap():s.district==='lumiose-vert2'?lumioseVert2Map():s.district==='lumiose-centrico-route'?lumioseCentricoRouteMap():s.district==='lumiose-rouge-north'?lumioseRougeNorthMap():s.district==='lumiose-north-boulevard'?lumioseNorthBoulevardMap():s.district==='lumiose-quasartico'?lumioseQuasarticoMap(s):s.district==='lumiose-rooftop'?lumioseRooftopMap(s):s.district==='lumiose-zone1'?lumioseZone1Map():s.district==='lumiose-zone2'?lumioseZone2Map(s):s.district==='lumiose-zone3'?(s.zaZone3TowerUpper?lumioseZone3TowerMap():lumioseZone3Map()):s.district==='lumiose-zone4'?lumioseZone4Map(s):s.district==='lumiose-bureau'?lumioseBureauMap():s.district==='lumiose-garden'?lumioseGardenMap():s.district==='lumiose-site'?lumioseSiteMap(s):s.district==='lumiose-wild'?lumioseWildMap(s):s.district==='lumiose-royale'?lumioseRoyaleMap():lumioseObservationMap();
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
    if(p.revision!==revision||s.area!==3||s.expedition||s.interior||s.x!==5||s.y!==9||(indoor&&!((HOTEL_INTERIORS.includes(indoor)&&s.district==='lumiose')||(indoor==='lumioseLab'&&s.district==='lumiose-floral')||(indoor==='sushi'&&s.district==='lumiose-rouge-north')||(indoor==='quasarticoOffice'&&s.district==='lumiose-quasartico')))||!Number.isInteger(p.x)||!Number.isInteger(p.y)||!walkable(map[p.y]?.[p.x])){s.district=null;delete s.districtPosition;delete s.districtReturnRegion;return s;}
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
// One explicitly marked provisional roof-to-roof landing; never infer paths over walls.
export function rotoGlideLanding(s){if(!s||s.district!=='lumiose-rooftop'||s.interior||!Number.isSafeInteger(s.zaMission15Stage)||s.zaMission15Stage<2||s.zaRooftopCrystalCleared!==true||s.x!==6||s.y!==8)return null;const map=fieldMap(s);if(map[9]?.[6]!=='#'||!walkable(map[10]?.[6]))return null;return {x:6,y:10,facing:'down'};}
export function validateAdventurePath(path){
  if(!Array.isArray(path)||!path.length||path.length>8||path.some(d=>typeof d!=='string'||!Object.hasOwn(DIRECTIONS,d)))throw Error('이동 경로는 올바른 방향 1–8개여야 합니다.');
  return path;
}
export function stepField(s,direction){
  if(!Object.hasOwn(DIRECTIONS,direction))return {blocked:true,reason:'방향을 확인하세요.'};
  const [dx,dy]=DIRECTIONS[direction],x=s.x+dx,y=s.y+dy,tile=fieldMap(s)[y]?.[x];
  if(!walkable(tile))return {blocked:true,reason:tile==='~'?'물가 너머로는 걸어갈 수 없습니다.':'그곳으로 갈 수 없습니다.'};
  if(!s.interior&&s.district==='lumiose-zone3'&&(tile==='g'||tile==='i')&&!s.zaZone3TowerUpper&&fieldMap(s)[s.y]?.[s.x]!=='g'&&joseeRequired(s))return {blocked:true,reason:'야생 구역에 들어가기 전 Rouge Plaza에서 Josée와 배틀하세요.'};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&y===16&&(x===16||x===18))return {x:x===16?1:11,y:x===16?8:15,area:s.area,district:'lumiose-zone5',zaZone5Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone5'&&tile==='X')return {x:18,y:15,area:s.area,district:'lumiose-centrico-route',zaZone5Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone5'&&tile==='W')return {x:16,y:15,area:s.area,district:'lumiose-centrico-route',zaZone5Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone20'&&tile==='X')return {x:15,y:6,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-research-zone'&&tile==='X')return {x:15,y:6,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-protect'&&tile==='X')return {x:15,y:6,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-lysandre-lab'&&tile==='X')return {x:9,y:13,area:s.area,district:'lumiose-site',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-crystal-sewer'&&tile==='X')return {x:19,y:11,area:s.area,district:'lumiose-vernal',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-ghost-house'&&tile==='X')return {x:6,y:13,area:s.area,district:'lumiose-vernal',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rust'&&tile==='X')return {x:5,y:11,area:s.area,district:'lumiose-vernal',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-sewer'&&tile==='X')return {x:17,y:11,area:s.area,district:'lumiose-vernal',transitioned:true,tile};
  if(s.interior==='lumioseLab'&&tile==='X')return {x:5,y:6,area:s.area,interior:null,transitioned:true,tile};
  if(s.interior==='quasarticoOffice'&&tile==='X'&&s.zaMission10Stage===7)return {blocked:true,reason:'나가기 전에 안내 직원의 교환 설명을 들어 주세요.'};
  if(s.interior==='quasarticoOffice'&&tile==='X')return {x:11,y:7,area:s.area,interior:null,transitioned:true,tile};
  if(s.interior==='sushi'&&tile==='X')return {x:19,y:5,area:s.area,interior:null,transitioned:true,tile};
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
  if(!s.interior&&s.district==='lumiose-rouge-north'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-north-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='E')return {x:1,y:4,area:s.area,district:'lumiose-rouge-north',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-quasartico',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-quasartico'&&tile==='E')return {x:1,y:8,area:s.area,district:'lumiose-north-boulevard',transitioned:true,tile};
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
export function cloudNpcTile(tile,s){if('NQRF DABOUV'.replaceAll(' ','').includes(tile||'!'))return true;if(tile==='n'&&s.district==='lumiose'&&!s.interior&&s.zaMission10Stage===1)return true;if(tile==='j'&&s.district==='lumiose-quasartico')return true;const districtNpc={j:'lumiose-zone3',e:'lumiose-bureau',t:'lumiose-zone3',m:'lumiose-rouge-north',v:'lumiose-zone3',u:'lumiose-rooftop',n:'lumiose-rooftop'};return !!tile&&districtNpc[tile]===s.district&&!!s.district;}
export function cloudInteractionTile(tile,s){return !!tile&&((tile==='0'&&['lumiose-research-zone','lumiose-zone5'].includes(s.district)&&!s.interior)||(tile==='l'&&s.district==='lumiose-zone5'&&!s.interior)|| (tile==='0'&&s.district==='lumiose-zone3'&&!s.interior&&s.zaMission40Stage===1&&!(Array.isArray(s.zaMission40Anomalies)&&s.zaMission40Anomalies.includes('steelix')))|| (tile==='0'&&s.district==='lumiose-rouge-north'&&!s.interior&&s.zaMission41Stage===3)|| (s.district==='lumiose-protect'&&!s.interior&&!!protectWave(s,tile))|| (!!s.district&&s.district==='lumiose-lysandre-lab'&&'abegkjl'.includes(tile))||(tile==='0'&&s.district==='lumiose-site'&&!s.interior&&[3,4,5].includes(s.zaMission35Stage))|| (!!mission31Case(s,tile)&&(s.zaMission31Stage===3||s[`zaMission${mission31Case(s,tile).n}RewardPending`]===true))|| (!!mission26Case(s,tile)&&(s.zaMission26Stage===3||s[`zaMission${mission26Case(s,tile).n}RewardPending`]===true))||'HMGNLCPQSIRJTFKYDZABOUV'.includes(tile)||(tile==='l'&&s.district==='lumiose-rouge-north')||(tile==='y'&&s.district==='lumiose-quasartico')||(!!s.district&&'rajbetqmzvhucxdnpio'.includes(tile)));}
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
  if(spot.tile==='e'&&s.district==='lumiose-bureau'&&!s.interior&&s.zaMission35Started&&!s.zaMission35Stage)return {name:'Emma',text:'Grisham의 단서를 얻기 위해 배틀하자.',action:'mission35Emma',label:'Emma와 배틀'};
  if(spot.tile==='n'&&s.district==='lumiose-zone20'&&!s.interior&&s.zaMission42Stage>=1&&!s.zaMission42Complete)return s.zaMission42Stage===3?{name:'지가르데',text:'볼을 선택해 지가르데를 포획하자.',action:'mission42OfferCapture',label:'볼 선택하기'}:s.zaMission42Stage===4?{name:'L',text:'지가르데큐브를 받자.',action:'mission42Cube',label:'지가르데큐브 받기'}:{name:'지가르데 (위치 초안)',text:`지가르데와 배틀하자 (${Math.min(3,(s.zaMission42Phase||0)+1)}/3).`,actions:[{action:'mission42Battle',label:'지가르데와 배틀'},...(s.zaMission42Stage===2?[{action:'mission42Cancel',label:'연속 배틀 중단'}]:[])]};
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission42Stage>=1&&!s.zaMission42Complete)return {name:'야생 구역 20 (임시 경로)',text:'지가르데가 기다리는 곳으로 향하자. 실제 지형은 초안이다.',action:'mission42Enter',label:'구역 20으로 가기'};
  if(spot.tile==='l'&&s.district==='lumiose-zone5'&&!s.interior)return {name:'야생 구역 5 사다리 (위치 초안)',text:s.zaZone5Upper?'지상으로 내려가자.':'북서쪽 사다리로 옥상에 올라가자.',action:'zone5Ladder',label:s.zaZone5Upper?'내려가기':'올라가기'};
  if(spot.tile==='0'&&s.district==='lumiose-zone5'&&!s.interior)return {name:'이상한 우두머리 엘레이드 (위치 초안)',text:'Mable의 조사 대상을 살펴보자.',action:'mission40OtherAlpha',label:'조사 배틀'};
  if(spot.tile==='0'&&s.district==='lumiose-research-zone'&&!s.interior){const id=s.zaMission40Zone==='5'?'gallade':s.zaMission40Zone==='9'?'pangoro':'';return s.zaMission40Zone==='11'&&s.zaMission40Stage===2?{name:'제르네아스 (강가 초안)',text:'제르네아스를 찾아 포획하자.',action:'mission40Xerneas',label:'제르네아스와 배틀'}:id&&s.zaMission40Stage===1&&!anomalyIds(s).includes(id)?{name:'이상한 우두머리 (위치 초안)',text:'포획하거나 쓰러뜨려 조사하자.',action:'mission40OtherAlpha',label:'우두머리 조사'}:{name:'조사 현장 (초안)',text:'이 구간은 조사 전용 임시 지도다.'};}
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&[1,2].includes(s.zaMission40Stage)){const actions=[...(s.zaMission41Started&&!s.zaMission41Stage?[{action:'mission41Grisham',label:'Grisham과 이야기하기'}]:[]),...(s.zaMission40Stage===1?[{action:'mission40Zone5',label:'구역 5 조사 현장 (임시 이동)'},{action:'mission40Zone9',label:'구역 9 조사 현장 (임시 이동)'}]:[{action:'mission40Zone11',label:'구역 11 조사 현장 (임시 이동)'}])];return {name:'조사 현장 임시 이동',text:'도시 연결과 지형은 아직 원작 대조 중이다.',actions};}
  if(spot.tile==='0'&&s.district==='lumiose-zone3'&&!s.interior&&s.zaMission40Stage===1&&!(Array.isArray(s.zaMission40Anomalies)&&s.zaMission40Anomalies.includes('steelix')))return {name:'이상한 우두머리 강철톤 (위치 초안)',text:'포획하거나 쓰러뜨려 조사하자.',action:'mission40Steelix',label:'강철톤 조사'};
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission41Started&&!s.zaMission41Stage)return {name:'Grisham (누보 카페 위치 초안)',text:'빼앗는 존재의 단서를 묻자.',action:'mission41Grisham',label:'Grisham과 이야기하기'};
  if(spot.tile==='0'&&s.district==='lumiose-rouge-north'&&!s.interior&&s.zaMission41Stage===3)return {name:'이벨타르 (옥상 위치 초안)',text:'이벨타르를 찾아 포획하자.',action:'mission41Yveltal',label:'이벨타르와 배틀'};
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission38Stage===1)return {name:'Centrico 광장 (위치 초안)',text:'동료들과 미르시티의 미래를 이야기하자.',action:'mission38Wish',label:'모두 함께 배틀하고 싶어'};
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission37Started&&!s.zaMission37Complete)return {name:'미르시티 방어 작전 (경로 초안)',text:s.zaMission37Stage>=7?'지가르데와 최종 대결은 준비 중이다.':'동료들과 방어 작전 구간을 진행하자.',action:'mission37Enter',label:'방어 작전으로 가기'};
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission36Started&&!s.zaMission36Complete)return !s.zaMission36Stage?{name:'프리즘타워 · 팀 MZ (위치 초안)',text:'Vinnie와 동료를 만나자.',action:'mission36Tower',label:'팀 MZ 만나기'}:s.zaMission36Stage===1?(!['grass','fire','water'].includes(s.zaMission10Starter)?{name:'팀 MZ 동료 (위치 초안)',text:'이전 스타터 기록이 없어 사용한 타입을 선택하세요.',actions:[{action:'mission36Grass',label:'풀 타입'},{action:'mission36Fire',label:'불꽃 타입'},{action:'mission36Water',label:'물 타입'}]}:{name:'팀 MZ 동료 (위치 초안)',text:'동료와 배틀하자.',action:'mission36Rival',label:'동료와 배틀'}):{name:'Vinnie (위치 초안)',text:'미르시티 방어 작전을 듣자.',action:'mission36Vinnie',label:'작전 듣기'};
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission35Stage===7)return s.zaMission35Won?{name:'Grisham (카페 위치 초안)',text:'랭크 A 승급 보상을 받자.',action:'mission35Reward',label:'승급 보상 받기'}:{name:'Grisham (카페 위치 초안)',text:'도전권을 얻은 뒤 승급전을 치르자.',action:'mission35GrishamBattle',label:'Grisham과 승급전'};
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission35Stage===2)return {name:'누보 카페 (위치 초안)',text:'Grisham의 단서를 묻자.',action:'mission35Cafe',label:'단서 묻기'};
  if(spot.tile==='0'&&s.district==='lumiose-site'&&!s.interior&&[3,4,5].includes(s.zaMission35Stage))return s.zaMission35Stage===3?{name:'폐점한 카페 · Griselle (위치 초안)',text:'Griselle과 배틀하자.',action:'mission35Griselle',label:'Griselle과 배틀'}:s.zaMission35Stage===4?{name:'Lysandre 카페 (위치 초안)',text:'숨겨진 연구소에 들어가자.',action:'mission35LabEnter',label:'연구소 들어가기'}:{name:'Grisham (위치 초안)',text:'연구 내용을 이야기하자.',action:'mission35GrishamTalk',label:'Grisham과 이야기하기'};
  if(spot.tile==='n'&&s.district==='lumiose-protect'&&!s.interior&&s.zaMission37Stage===7&&!s.zaMission37Complete){const phase=s.zaMission37FinalPhase||0;return phase<6?{name:'지가르데와 앙주 (대결 초안)',text:phase%2?'지가르데가 공격할 차례다.':`붉은 꽃과 푸른 꽃을 진정시키자 (${Math.floor(phase/2)+1}/3).`,action:'mission37FinalBattle',label:phase%2?'지가르데 공격':'꽃과 배틀'}:phase===6?{name:'반응하는 돌',text:'돌을 꼭 쥐자.',action:'mission37Grip',label:'돌을 꼭 쥐기'}:{name:'메가 지가르데',text:'니힐라이트로 마지막 빛을 막자.',action:'mission37Nihil',label:'니힐라이트 사용'};}
  if(s.district==='lumiose-protect'&&!s.interior){const w=protectWave(s,spot.tile);if(w)return {name:`${w.name} (경로 초안)`,text:'이 구간의 폭주 포켓몬을 진정시키자. 동시 전투는 순차 턴제로 진행한다.',action:'mission37Wave',label:'방어 작전 배틀'};}
  if(s.district==='lumiose-lysandre-lab'&&!s.interior){const tile=spot.tile,floor=s.zaLysandreFloor||1;if('abek'.includes(tile))return {name:floor===3?'연구 자료 (배치 초안)':'연구소 단서 (배치 초안)',text:floor===3?'자료를 읽자.':tile==='k'?'승강기 열쇠를 찾자.':'키카드를 찾자.',action:'mission35LabInspect',label:'조사하기'};if(tile==='g'&&floor===1)return {name:'킬가르도',text:'세 키카드를 찾고 길을 열자.',action:'mission35Aegislash',label:'킬가르도와 배틀'};if(tile==='l')return {name:'승강기 (초안)',text:'승강기를 이용하자.',action:'mission35Elevator',label:'승강기 사용'};if(tile==='j'&&floor===3)return {name:'L',text:'자료를 모두 읽고 L의 이야기를 듣자.',action:'mission35LabL',label:'L의 이야기 듣기'};}
  {const c=mission31Case(s,spot.tile);if(c){if(s[`zaMission${c.n}RewardPending`])return {name:`${c.name} (위치 초안)`,text:'사건 보상을 받자.',action:'mission31ClaimStone',label:'메가스톤 받기'};if(s.zaMission31Stage===3&&!s[`zaMission${c.n}Complete`])return c.n===34&&!s.zaMission34PhilippeWon?{name:'Philippe (위치 초안)',text:'아쿠스타에게 가기 전 Philippe와 배틀하자.',action:'mission34Philippe',label:'Philippe와 배틀'}:{name:`폭주 ${c.name} (위치 초안)`,text:'현장 경로와 레벨은 초안이다.',action:'mission31CaseBattle',label:`${c.name}와 배틀`};}}
  {const c=mission26Case(s,spot.tile);if(c){if(s[`zaMission${c.n}RewardPending`])return {name:`${c.name} (위치 초안)`,text:'사건 보상을 받자.',action:'mission26ClaimStone',label:'메가스톤 받기'};if(s.zaMission26Stage===3&&!s[`zaMission${c.n}Complete`])return {name:`폭주 ${c.name} (위치 초안)`,text:'폭주 메가진화를 진정시키자. 실제 경로와 레벨은 초안이다.',action:'mission26CaseBattle',label:`${c.name}와 배틀`};}}
  if(spot.tile==='j'&&s.district==='lumiose-quasartico'&&s.interior==='quasarticoOffice'&&[1,2].includes(s.zaMission41Stage))return s.zaMission41Stage===1?{name:'Vinnie',text:'시뮬레이터 이야기를 듣자.',action:'mission41Vinnie',label:'Vinnie와 이야기하기'}:{name:'Vinnie의 시뮬레이터',text:`폭주 메가진화 훈련 ${(s.zaMission41Sim||0)}/3`,action:'mission41Sim',label:'다음 시뮬레이션'};
  if(spot.tile==='j'&&s.district==='lumiose-quasartico'&&s.interior==='quasarticoOffice'&&s.zaMission31Stage===1)return {name:'Jett (사무실 초안)',text:'도시 재개발과 폭주 사건에 관해 들어 보자.',action:'mission31Jett',label:'Jett와 이야기하기'};
  if(spot.tile==='j'&&s.district==='lumiose-quasartico'&&s.interior==='quasarticoOffice')return s.zaMission10Stage===6?{name:'Vinnie',text:'폭주한 메가진화와 도시의 상황에 관해 들어 보자.',action:'mission10OfficeTalk',label:'Vinnie의 설명 듣기'}:{name:'Vinnie',text:'도시의 포켓몬을 위해 함께 힘을 모으자.'};
  if(spot.tile==='R'&&s.interior==='quasarticoOffice'&&s.zaInfiniteFloettePending&&!s.zaMission39Complete)return {name:'팀 MZ 동료',text:'영원의꽃 플라엣테와 플라엣테나이트를 받자.',action:'mission39Floette',label:'선물 받기'};
  if(spot.tile==='R'&&s.interior==='quasarticoOffice'&&infiniteRewardWins(s)===14&&!['grass','fire','water'].includes(s.zaMission10Starter))return {name:'무한 로열 접수처',text:'기존 스타터 타입 기록이 없습니다. 사용했던 타입을 선택하세요.',actions:[{action:'mission39StarterGrass',label:'풀 타입'},{action:'mission39StarterFire',label:'불꽃 타입'},{action:'mission39StarterWater',label:'물 타입'}]};
  if(spot.tile==='R'&&s.interior==='quasarticoOffice'&&s.zaInfiniteSecondWon&&infiniteNextReward(s))return infinitePoints(s)>=50000?{name:'무한 로열 접수처',text:`도전권으로 ${infiniteNextReward(s).name}와 보상 배틀을 치르자.`,action:'mission39NextReward',label:'보상 배틀 시작'}:{name:'무한 로열 접수처',text:`다음 도전권을 모으자 (${infinitePoints(s)}/50000).`};
  if(spot.tile==='R'&&s.interior==='quasarticoOffice'&&s.zaInfiniteFirstWon&&!s.zaInfiniteSecondWon)return infinitePoints(s)>=50000?{name:'무한 로열 접수처',text:'도전권으로 Griselle과 두 번째 보상 배틀을 치르자.',action:'mission39Griselle',label:'두 번째 보상 배틀'}:{name:'무한 로열 접수처',text:`두 번째 도전권을 모으자 (${infinitePoints(s)}/50000).`};
  if(spot.tile==='R'&&s.interior==='quasarticoOffice'&&s.zaMission39Started&&!s.zaInfiniteFirstWon)return infinitePoints(s)>=50000?{name:'무한 로열 접수처',text:'도전권으로 Zach와 첫 보상 배틀을 치르자.',action:'mission39Zach',label:'첫 보상 배틀'}:{name:'무한 로열 접수처',text:`도전권을 모으자 (${infinitePoints(s)}/50000).`};
  if(spot.tile==='R'&&s.interior==='quasarticoOffice')return s.zaMission10Stage===7?{name:'콰자르티코 안내 직원',text:'메가조각 교환에 관해 안내해 드릴게요.',action:'mission10Reception',label:'교환 안내 듣기'}:{name:'콰자르티코 안내 직원',text:'메가조각을 메가스톤과 교환할 수 있습니다. 광장의 임시 교환처를 이용하세요.'};
  if(spot.tile==='t'&&s.district==='lumiose-north-boulevard'&&!s.interior){const stage=s.zaMission14Stage;if(stage===2)return {name:'변전소 입구 (위치 초안)',text:'암호를 확인하고 Canari 퀴즈에 들어가자.',action:'rankEPassword',label:'암호: 레츠 고 DYN4MO!'};if(stage>=3&&stage<=5)return {name:'Canari 퀴즈 (초안)',text:stage===3?'Canari는 낙하 블록 게임을 잘한다.':stage===4?'Canari가 가장 좋아하는 음식은 마카롱이다.':'Canari가 가장 좋아하는 타입은 전기다.',actions:[{action:'rankETrue',label:'맞다'},{action:'rankEFalse',label:'아니다'}]};if(stage===6)return {name:'Canari 퀴즈',text:'카페에서 특별한 미르갈레트를 찾아오자.'};if(stage===7)return {name:'Mani',text:'다음 문제에 앞서 Mani와 배틀하자.',action:'rankEMani',label:'Mani와 배틀'};if(stage===8)return {name:'Canari 퀴즈',text:'Canari가 처음 게임한 노트북은 누구의 것이었을까?',actions:[{action:'rankEGrandpa',label:'할아버지'},{action:'rankEWrong',label:'다른 가족'}]};}
  if(spot.tile==='m'&&s.district==='lumiose-centrico-route'&&!s.interior)return s.zaMission14Stage===6?{name:'카페 갈랑 (임시 위치)',text:'저리더프가 좋아하는 특별한 미르갈레트를 받자.',action:'rankEGalette',label:'미르갈레트 받기'}:{name:'카페 갈랑 (임시 위치)',text:'정확한 위치와 시설은 초안이다.'};
  if(spot.tile==='d'&&s.district==='lumiose-rooftop'&&!s.interior&&[2,3].includes(s.zaMission15Stage)&&mission15Complete(s)&&!s.zaMission15SceneSeen)return {name:'지가르데와 L (위치 초안)',text:'세 사건 뒤 옥상에서 지가르데와 L을 만났다.',action:'mission15MeetL',label:'L의 이야기 듣기'};
  if(spot.tile==='q'&&s.district==='lumiose-vernal'&&!s.interior&&s.zaMission25Complete&&!s.zaMission26Stage)return {name:'Asami · 부티크 (위치 초안)',text:'SBC 초대를 위한 옷을 살펴보고 Asami와 배틀하자. 메가진화 조건은 준비 중이다.',action:'mission26Asami',label:'Asami와 배틀'};
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission30Started&&!s.zaMission30Complete)return s.zaMission30Won?{name:'Jacinthe (호텔 위치 초안)',text:'랭크 B 승급 보상을 받자.',action:'mission30Reward',label:'승급 보상 받기'}:{name:'Lebanne (호텔 위치 초안)',text:'도전권을 모은 뒤 토너먼트를 진행하자.',action:'mission30Round',label:'다음 배틀 시작'};
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission26Stage===1)return {name:'초대받은 호텔 (위치 초안)',text:'Lebanne의 이야기를 듣자.',action:'mission26Invitation',label:'SBC 초대 확인'};
  if(spot.tile==='q'&&s.district==='lumiose-vernal'&&!s.interior&&s.zaMission25Started&&!s.zaMission25Complete)return s.zaMission25Stage===2?{name:'Naveen (배틀코트 위치 초안)',text:'Lida와의 배틀을 마쳤다. Naveen에게 도전하자.',action:'mission25Naveen',label:'Naveen과 배틀'}:{name:'Lida (배틀코트 위치 초안)',text:'팀 MZ 동료와 배틀하자.',action:'mission25Lida',label:'Lida와 배틀'};
  if(spot.tile==='b'&&s.district==='lumiose-vernal'&&!s.interior&&s.zaMission20Stage>=7)return {name:'빈집 (위치 초안)',text:'Syndicate의 첫 의뢰 현장이다.',action:'mission20EnterHouse',label:'빈집 들어가기'};
  if(s.district==='lumiose-ghost-house'&&!s.interior){const g=mission20Ghost(s,spot.tile),caught=mission20GhostsCaught(s);if(g)return caught.includes(g.id)?{name:g.name,text:'이미 포획했다.'}:s.zaMission20Stage===7?{name:g.name,text:'빈집의 포켓몬을 살펴보자. 레벨과 위치는 초안이다.',action:'mission20GhostBattle',label:`${g.name}와 배틀`}:{name:g.name,text:'빈집을 살펴보았다.'};if(spot.tile==='n')return s.zaMission20Stage===7&&caught.length===3?{name:'집의 입주자',text:'세 포켓몬을 살펴보았다. 입주자와 이야기하자.',action:'mission20HouseReport',label:'입주자와 이야기하기'}:{name:'집의 입주자',text:s.zaMission20Stage===7?`고스트 포켓몬 ${caught.length}/3 확인`:'집의 입주자와 이야기했다.'};}
  if(spot.tile==='c'&&s.district==='lumiose-crystal-sewer'&&!s.interior&&s.zaMission20Stage===9)return {name:'메가결정',text:`공격 기술로 결정을 부수자 (${clearedCrystals(s).length}/27).`,action:'mission20BreakCrystal',label:'결정 부수기'};
  if(spot.tile==='o'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission20Stage===11)return s.zaMission20SBCSeries==='vivica'?{name:'SBC 연전 (위치 초안)',text:'회복 없이 Vivica와 이어서 배틀하자.',actions:[{action:'mission20SBCNext',label:'Vivica와 배틀'},{action:'mission20SBCCancel',label:'연전 중단'}]}:{name:'SBC 배틀 (위치 초안)',text:'François와 Vivica를 연속으로 상대한다.',action:'mission20SBCStart',label:'SBC 연전 시작'};
  if(spot.tile==='d'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission20Stage===12)return {name:'은행 주변 (위치 초안)',text:'안전 단체 대표와 배틀하자.',action:'mission20SafetyBattle',label:'안전 단체와 배틀'};
  if(spot.tile==='v'&&s.district==='lumiose-vernal'&&!s.interior&&s.zaMission20Stage>=1)return {name:'Rust Syndicate 사무소 (위치 초안)',text:'사무소로 향하자.',action:'mission20EnterRust',label:'사무소로 가기'};
  if(spot.tile==='z'&&s.district==='lumiose-vernal'&&!s.interior&&s.zaMission20Stage>=5){const stage=s.zaMission20Stage;return {name:'하수도 접근 (위치 초안)',text:stage===8?'Syndicate의 결정 정리 의뢰를 받자.':stage===9?`메가결정 ${clearedCrystals(s).length}/27 정리 중.`:stage===10?'결정 정리 결과를 보고하자.':'하수도로 들어갈 수 있다.',actions:[...(stage===8?[{action:'mission20CrystalStart',label:'결정 정리 의뢰 받기'}]:[]),...(stage===9?[{action:'mission20CrystalEnter',label:'결정 정리 하수도 들어가기'}]:[]),...(stage===10?[{action:'mission20CrystalReport',label:'정리 결과 보고하기'}]:[]),{action:'mission20EnterSewer',label:'기존 하수도 들어가기'}]};}
  if(spot.tile==='d'&&s.district==='lumiose-rust'&&!s.interior){if(s.zaMission20Stage===1)return {name:'Rust Syndicate 단원',text:'사무소 앞에서 단원과 배틀하자.',action:'mission20Guard',label:'단원과 배틀'};if(s.zaMission20Stage===2)return {name:'Philippe',text:'Philippe와 배틀하자.',action:'mission20Philippe',label:'Philippe와 배틀'};if(s.zaMission20Stage===14)return {name:'Philippe',text:'의뢰를 마쳤다고 보고하자.',action:'mission20Finish',label:'의뢰 완료 보고'};if(s.zaMission20Complete&&!s.zaMission24Complete)return s.zaMission24Won?{name:'Corbeau',text:'승급 보상을 받자.',action:'mission24Reward',label:'승급 보상 받기'}:{name:'Philippe',text:'도전권을 얻은 뒤 Corbeau와 승급전을 치르자.',action:'mission24Corbeau',label:'Corbeau에게 도전'};if(s.zaMission20Stage===6)return {name:'Philippe',text:'첫 의뢰인 빈집의 상황을 확인해 달라고 한다.',action:'mission20JobStart',label:'첫 의뢰 받기'};if(s.zaMission20Stage===3)return {name:'Philippe와 Corbeau',text:'팀 MZ의 빚과 의뢰에 대한 이야기를 듣자.',action:'mission20Deal',label:'이야기 듣기'};return {name:'Rust Syndicate 사무소',text:'의뢰 내용과 실내 배치는 아직 초안이다.'};}
  if(s.zaMission20Stage>=5&&!s.interior){const c=mission20Case(s,spot.tile);if(c){if(s[`zaMission${c.n}RewardPending`])return {name:`폭주 ${c.name} (위치 초안)`,text:'사건 보상을 받자.',action:'mission20ClaimStone',label:'메가스톤 받기'};if(s.zaMission20Stage===5&&!s[`zaMission${c.n}Complete`])return c.n===23&&!s.zaMission23GwynnWon?{name:'Gwynn (위치 초안)',text:'메가전룡에게 가기 전에 Gwynn과 배틀하자.',action:'mission23Gwynn',label:'Gwynn과 배틀'}:{name:`폭주 ${c.name} (위치 초안)`,text:'동료 동시 전투와 원작 경로는 준비 중이다.',action:'mission20CaseBattle',label:`${c.name}와 배틀`};}}
  if(spot.tile==='t'&&s.district==='lumiose-rouge-north'&&!s.interior&&s.zaMission19Stage===4)return {name:'시청 단서 (위치 초안)',text:'Gwynn을 본 사람에게 물어보자.',action:'mission19CityClue',label:'주변 사람에게 묻기'};
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission19Stage===5)return {name:'누보 카페 (위치 초안)',text:'Emma와 함께 Gwynn의 흔적을 살펴보자.',action:'mission19CafeClue',label:'카페에서 묻기'};
  if(spot.tile==='d'&&s.district==='lumiose-site'&&!s.interior&&[6,14,15].includes(s.zaMission19Stage))return s.zaMission19Stage===6?{name:'Canari (장소 초안)',text:'단서를 얻기 위해 다시 배틀하자.',action:'mission19Canari',label:'Canari와 배틀'}:s.zaMission19Stage===14?{name:'Ivor (도장 초안)',text:'Gwynn을 찾았다. 승급전에 도전하자.',action:'mission19Ivor',label:'Ivor와 배틀'}:{name:'Ivor',text:'승급 보상을 받자.',action:'mission19Reward',label:'보상 받기'};
  if(spot.tile==='h'&&s.district==='lumiose-vernal'&&!s.interior&&s.zaMission19Stage>=7&&s.zaMission19Stage<=13)return s.zaMission19Stage===7?{name:'블로스터 분수 (위치 초안)',text:'냉동빔을 아는 선두 포켓몬으로 분수를 얼리자.',action:'mission19Freeze',label:'냉동빔 사용'}:{name:'하수도 입구 (위치 초안)',text:'얼어붙은 분수 아래의 문으로 들어가자.',action:'mission19EnterSewer',label:'하수도 들어가기'};
  if(s.district==='lumiose-sewer'&&!s.interior){const stage=s.zaMission19Stage;if(spot.tile==='t'&&stage===9)return {name:'잠긴 문',text:'문을 살펴보고 Emma의 볼을 받자.',action:'mission19Lock',label:'잠긴 문 조사'};if(spot.tile==='q'&&stage===10)return {name:'클레피',text:'클레피와 배틀해 포획하자.',action:'mission19Klefki',label:'클레피와 배틀'};if('abed'.includes(spot.tile)&&stage===11){const seen=sewerInspected(s);return {name:'하수도 조사 지점',text:`전기판·기계·파이프·상자 ${seen.length}/4 조사`,...(!seen.includes(spot.tile)?{action:`mission19Inspect${spot.tile.toUpperCase()}`,label:'살펴보기'}:{})};}if(spot.tile==='i'&&stage===12)return {name:'수상한 벽',text:'환상으로 만들어진 벽을 지나가자.',action:'mission19Wall',label:'벽 통과'};if(spot.tile==='u'&&stage===13)return {name:'Gwynn',text:'Gwynn과 배틀해 이야기를 들어 보자.',action:'mission19Gwynn',label:'Gwynn과 배틀'};}
  if(spot.tile==='e'&&s.district==='lumiose-bureau'&&!s.interior&&s.zaMission19Stage===3)return {name:'탐정사무소 · Emma',text:'Ivor의 여동생 Gwynn을 찾는 일을 이야기하자.',action:'mission19Bureau',label:'Emma와 이야기하기'};
  if(spot.tile==='d'&&s.district==='lumiose-site'&&!s.interior&&s.zaMission19Stage===1&&rankEPoints(s)>=35000&&!s.zaMission19JoseeWon)return {name:'정의단 도장 (임시 위치)',text:'Ivor를 만나기 전에 Josée와 배틀하자.',action:'mission19Josee',label:'Josée와 배틀'};
  if(spot.tile==='d'&&s.district==='lumiose-site'&&!s.interior&&s.zaMission19SeedPending)return {name:'Josée (임시 위치)',text:'승리 보상을 받자.',action:'mission19Seed',label:'숙달의씨 받기'};
  if(spot.tile==='d'&&s.district==='lumiose-rooftop'&&!s.interior&&s.zaMission15Stage===1)return {name:'팀 MZ 동료',text:'옥상 길과 로토글라이드에 관한 설명을 들어 보자.',action:'mission15Rooftop',label:'옥상에서 동료 만나기'};
  if(spot.tile==='d'&&!s.interior&&s.zaMission15Stage>=2&&!((s.district==='lumiose-site'&&s.zaMission12RewardPending)||(s.district==='lumiose-north-boulevard'&&s.zaMission13RewardPending))){const scene=mission15CaseDialogue(s);if(scene)return scene;}
  if(spot.tile==='d'&&s.district==='lumiose-site'&&!s.interior&&[9,10,11].includes(s.zaMission14Stage))return s.zaMission14Stage===9?{name:'Tarragon (장소 초안)',text:'승급전 전 Tarragon과 배틀하자.',action:'rankETarragon',label:'Tarragon과 배틀'}:s.zaMission14Stage===10?{name:'Canari (장소 초안)',text:'랭크 E 승급전에 도전하자.',action:'rankECanari',label:'Canari와 배틀'}:{name:'Canari',text:'승급 보상을 받자.',action:'rankEReward',label:'승급 보상 받기'};
  if(spot.tile==='d'&&s.district==='lumiose-site'&&!s.interior){if(s.zaMission12RewardPending)return {name:'폭주 메가폭타 사건 (장소 초안)',text:'폭타나이트를 받자.',action:'claimMission12Stone',label:'폭타나이트 받기'};if(s.zaMission10Stage===10&&!s.zaMission12Complete)return s.zaMission12WorkerWon?{name:'폭주 메가폭타 사건 (장소 초안)',text:'비계 경로는 초안이다. 폭주 메가폭타를 진정시키자.',action:'battleMission12Camerupt',label:'메가폭타와 배틀'}:{name:'공사 현장 (장소 초안)',text:'현장에 들어가기 전 Tony와 배틀하자.',action:'battleMission12Worker',label:'Tony와 배틀'};return {name:'공사 현장 (초안)',text:'폭타 사건의 실제 위치와 경로는 확인 중이다.'};}
  if(spot.tile==='d'&&s.district==='lumiose-north-boulevard'&&!s.interior){if(s.zaMission13RewardPending)return {name:'폭주 메가우츠보트 사건 (위치 초안)',text:'우츠보트나이트를 받자.',action:'claimMission13Stone',label:'우츠보트나이트 받기'};if(s.zaMission10Stage===10&&!s.zaMission13Complete)return {name:'폭주 메가우츠보트 사건 (위치 초안)',text:'Naveen이 응원하고 있다. 동료 동시 전투는 준비 중이다.',action:'battleMission13Victreebel',label:'메가우츠보트와 배틀'};return {name:'북쪽 큰길 (초안)',text:'우츠보트 사건의 실제 위치는 확인 중이다.'};}
  if(spot.tile==='d'&&s.district==='lumiose-vernal'&&!s.interior){if(s.zaMission11RewardPending)return {name:'폭주 메가야도란 사건 (위치 초안)',text:'진정된 야도란의 야도란나이트를 받자.',action:'claimMission11Stone',label:'야도란나이트 받기'};if(s.zaMission10Stage===10&&!s.zaMission11Complete)return {name:'폭주 메가야도란 사건 (위치 초안)',text:'남쪽 수변에서 폭주 메가야도란을 진정시키자. 동료 동시 전투는 준비 중이다.',action:'battleMission11Slowbro',label:'메가야도란과 배틀'};return {name:'남쪽 수변 (초안)',text:'수변으로 가는 길이다. 실제 위치와 동선은 확인 중이다.'};}
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior)return s.zaMission10Stage===8?{name:'누보 카페 (위치 초안)',text:'팀 MZ와 누보 카페에서 만나자.',action:'mission10Cafe',label:'동료와 이야기하기'}:{name:'누보 카페 (위치 초안)',text:'센트리코 광장 근처의 카페 트럭이다. 정확한 좌표는 초안이다.'};
  if(spot.tile==='y'&&s.district==='lumiose-quasartico'&&!s.interior&&s.zaMission10Stage===2)return {name:'콰자르티코 경비 데덴네',text:'데덴네 두 마리가 앞을 막았다. 동료와 함께 물러나게 하자.',action:'battleQuasarticoGuard',label:'데덴네와 배틀'};
  if(spot.tile==='j'&&s.district==='lumiose-quasartico'&&!s.interior){if(s.zaMission31Started&&!s.zaMission31Stage)return {name:'Vinnie',text:'Jett의 요청을 들어 보자.',action:'mission31Vinnie',label:'Vinnie와 이야기하기'};if(s.zaMission10Stage===3)return {name:'Vinnie',text:'폭주한 메가진화에 관한 이야기를 들어 보자.',action:'meetMission10Vinnie',label:'Vinnie와 이야기하기'};if(s.zaMission10Stage===4)return royaleVReady(s)?{name:'Vinnie',text:'도전권이 있다면 밤에 승급전을 시작하자.',action:'battleMission10Vinnie',label:'Vinnie와 승급전'}:{name:'Vinnie',text:'밤의 배틀존에서 도전권을 얻어 오자.'};if(s.zaMission10Stage===5&&s.zaVinnieTM051Pending)return {name:'Vinnie',text:'승급전 보상으로 기술머신을 받자.',action:'claimVinnieTM',label:'기술머신 받기'};if(s.zaMission10Stage>=6)return {name:'콰자르티코 사무실 (초안)',text:'회사 안으로 들어갈 수 있다.',action:'enterQuasarticoOffice',label:'사무실에 들어가기'};}
  if(spot.tile==='n'&&s.district==='lumiose'&&!s.interior&&s.zaMission10Stage===1){const choice=s.zaMission10Starter;return {name:'팀 MZ 동료',text:choice?`앱솔에게 앱솔나이트를 지니게 한 뒤 함께 배틀하자. 선택한 스타터 타입: ${{grass:'풀',fire:'불꽃',water:'물'}[choice]||'미선택'}.`:'상대 스타터를 정하려면 Z-A의 스타터 타입을 선택해 줘.',actions:[{action:'mission10Grass',label:'풀 타입 선택'},{action:'mission10Fire',label:'불꽃 타입 선택'},{action:'mission10Water',label:'물 타입 선택'},...(choice?[{action:'battleMission10Rival',label:'동료와 배틀'}]:[])]};}
  if(spot.tile==='l'&&s.district==='lumiose-rouge-north'&&!s.interior)return {name:'스시 하이 롤러 (배치 초안)',text:'루주 거리에 있는 음식점이다.',action:'enterSushi',label:'음식점에 들어가기'};
  if(spot.tile==='R'&&s.district==='lumiose-rouge-north'&&s.interior==='sushi'){
    if(s.zaSushiRewardPending)return {name:'음식점 안내원',text:'코스를 마친 보상이 준비됐습니다.',action:'claimSushiReward',label:'보상 받기'};
    if(s.zaSushiRun)return {name:'음식점 안내원',text:`다음은 ${s.zaSushiRun.course+1}코스입니다. 코스 사이에는 회복할 수 없습니다.`,actions:[{action:'sushiNext',label:'다음 코스 시작'},{action:'sushiCancel',label:'도전 중단'}]};
    if(s.zaMission24Started!==true)return {name:'음식점 안내원',text:'식사 배틀은 메인 미션 24부터 도전할 수 있습니다.'};
    return s.zaSushiCompleted?{name:'음식점 안내원',text:'30,000코인으로 5코스에 다시 도전할 수 있습니다.',action:'sushiRepeat',label:'재도전 · 30,000코인'}:{name:'음식점 안내원',text:'5코스를 연속으로 배틀합니다. 코스 사이에 회복할 수 없습니다.',action:'sushiStart',label:'식사 배틀 도전'};
  }
  if(spot.tile==='i'&&s.district==='lumiose-zone3'&&!s.interior)return s.zaZone3TowerUpper?{name:'정원 탑 사다리 (초안)',text:'사다리를 타고 정원으로 내려간다.',action:'zone3TowerDown',label:'정원으로 내려가기'}:{name:'정원 탑 사다리 (초안)',text:'사다리를 타고 작은 흰 탑의 위층으로 올라간다.',action:'zone3TowerUp',label:'위층으로 올라가기'};
  if(spot.tile==='H'&&s.district==='lumiose-zone3'&&!s.interior)return {name:'루주 광장 이동식 포켓몬센터',text:'북쪽 노점에서 파티의 HP와 상태이상, PP를 회복할 수 있다.',action:'heal',label:'파티 회복하기'};
  if(spot.tile==='p'&&s.district==='lumiose-zone2'&&!s.interior)return {name:'동남쪽 섬의 우두머리 (초안)',text:'낮과 밤에 서로 다른 우두머리 포켓몬이 나타난다.',action:'encounterZone2Alpha',label:'우두머리와 배틀'};
  if(spot.tile==='r'&&s.district==='lumiose-zone2'&&!s.interior)return {name:'동쪽 물가의 바위 (초안)',text:'바위깨기로 통로를 열고 얕은 물을 지나갈 수 있다. 지형 배치는 초안이다.',action:'smashZone2Rock',label:'바위깨기 사용'};
  if(spot.tile==='q'&&s.district==='lumiose-vernal'&&!s.interior)return {name:'뚜뚜 카페 · Café Woof (위치 초안)',text:'음료를 주문하면 파티를 회복하고 선두 포켓몬과 친해질 수 있다.',actions:CAFE_WOOF_DRINKS.map(drink=>({action:drink.action,label:`${drink.name} · ${drink.price}코인`}))};
  if(spot.tile==='P'&&s.district==='lumiose-floral'&&!s.interior)return {name:'미르시티 포켓몬 연구소 (초안)',text:'Floral Avenue의 연구소다. 건물 위치와 내부 크기는 초안이다.',action:'enterLumioseLab',label:'연구소에 들어가기'};
  if(spot.tile==='R'&&s.interior==='lumioseLab')return {name:'포켓몬 연구원',text:'선두 포켓몬을 연구 수첩에 기록할 수 있다. 원작의 시설과 대화는 아직 구현 중이다.',actions:[...(s.zaMission40Stage===1&&['steelix','gallade','pangoro'].every(x=>anomalyIds(s).includes(x))?[{action:'mission40Report',label:'세 조사 보고하기'}]:[]),...(s.zaMission40Started&&!s.zaMission40Stage?[{action:'mission40Mable',label:'Mable에게 묻기'}]:[]),...(s.zaMission35Stage===1?[{action:'mission35Mable',label:'Mable에게 묻기'}]:[]),{action:'recordResearch',label:'선두 포켓몬 기록하기'}]};
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
    J:{name:'호텔',text:naveenAction(s)?'호텔 앞에서 팀 MZ의 Naveen이 기다리고 있다. 로비에도 들어갈 수 있다.':s.zaNaveenComplete?'Naveen에게 패션 디자이너가 되고 싶은 꿈을 들었다. 호텔 로비에 들어갈 수 있다.':'여행자와 포켓몬을 위한 호텔이다. 로비에 들어갈 수 있다.',action:'enterHotel',label:'호텔에 들어가기',...((s.zaMission10Stage===10&&s.zaMission11Complete&&s.zaMission12Complete&&s.zaMission13Complete)||s.zaMission10Stage===11||(s.zaMission10Stage===12&&!s.zaMission14Stage)||naveenAction(s)?{actions:[{action:'enterHotel',label:'호텔에 들어가기'},...(s.zaMission10Stage===10&&s.zaMission11Complete&&s.zaMission12Complete&&s.zaMission13Complete?[{action:'battleMission10Zygarde',label:'지가르데와 배틀'}]:[]),...(s.zaMission10Stage===11?[{action:'claimMission10Pebble',label:'수수께끼 돌 받기'}]:[]),...(s.zaMission10Stage===12&&!s.zaMission14Stage?[{action:'battleMission14Naveen',label:'Naveen과 배틀'}]:[]),naveenAction(s)].filter(Boolean)}:{})},
    F:{name:'호텔 안내 직원',text:s.zaMysteryTrail>=5&&!s.zaMission10Stage?'팀 MZ 동료가 로비에서 기다리고 있어요. 함께 이야기를 들어 보세요.':cityProjectStage(s)===4?'정원 조사 결과를 들려주세요. 파트너도 쉬어 갈 수 있어요.':'어서 오세요. 파트너들과 쉬거나 도시 조사단의 의뢰를 살펴보세요.',actions:[...((s.zaMission42Ready||(s.zaMission40Complete&&s.zaMission41Complete))&&!s.zaMission42Stage?[{action:'mission42L',label:'L과 배틀'}]:[]),...(s.zaMission42Stage===4&&!s.zaMission42Complete?[{action:'mission42Cube',label:'지가르데큐브 받기'}]:[]),...(s.zaInfiniteFirstWon&&!s.zaMission40Started?[{action:'mission39Lida',label:'Lida와 L의 이야기 듣기'}]:[]),...(s.zaMission38Started&&!s.zaMission38Stage?[{action:'mission38Lobby',label:'동료와 이야기하기'}]:[]),...(s.zaMission35Stage===6?[{action:'mission35AZ',label:'AZ의 이야기 듣기'}]:[]),...(s.zaMission31Stage===2?[{action:'mission31Meeting',label:'팀 MZ 작전 회의'}]:[]),...(s.zaMission31Stage===3&&mission31CasesComplete(s)?[{action:'mission31Report',label:'세 사건 보고'}]:[]),...(s.zaMission26Stage===3&&mission26CasesComplete(s)&&!s.zaMission26Complete?[{action:'mission26SBC',label:`SBC와 배틀 (${Math.min(3,(s.zaMission26SBCStage||0)+1)}/3)`}]:[]),...(s.zaMission26Stage===2?[{action:'mission26Meeting',label:'SBC와 폭주 사건 회의'}]:[]),...(s.zaMission20Stage===13?[{action:'mission20HotelAfterBank',label:'팀 MZ와 상황 정리'}]:[]),...(s.zaMission19Stage===17&&!s.zaMission20Stage?[{action:'mission20Start',label:'Rust Syndicate 연락 받기'}]:[]),...(s.zaMission20Stage===4?[{action:'mission20Meeting',label:'팀 MZ와 작전 회의'}]:[]),...(s.zaMission20Stage===5&&mission20Complete(s)?[{action:'mission20Report',label:'세 사건 보고하기'}]:[]),...(s.zaMission19Stage===16?[{action:'mission19Sneakers',label:'Naveen에게 신발 받기'}]:[]),...(s.zaMission14Stage===12&&!s.zaMission15Stage?[{action:'mission15Meeting',label:'팀 MZ와 작전 회의'}]:[]),...(s.zaMission15Stage===2&&mission15Complete(s)&&s.zaMission15SceneSeen?[{action:'mission15Report',label:'세 사건 보고하기'}]:[]),...(s.zaMission15Stage===3&&s.zaMission15SceneSeen?[{action:'mission15Continue19',label:'팀 MZ와 이야기하기'}]:[]),...(s.zaMission14Stage===1&&rankFPoints(s)>=32000?[{action:'rankEShowTicket',label:'Naveen에게 도전권 보여주기'}]:[]),...(s.zaMission10Stage===9?[{action:'mission10HotelMeeting',label:'팀 MZ와 작전 회의'}]:[]),...(s.zaMysteryTrail>=5&&!s.zaMission10Stage?[{action:'startMegaMission',label:'팀 MZ 동료와 이야기하기'}]:[]),{action:'hotelRest',label:'파티 쉬게 하기'},cityProjectHotelAction(s),lidaBagAction(s)].filter(Boolean)},
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
