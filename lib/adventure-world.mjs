import {AREAS, TRAINERS, areaMap} from './campaign.mjs';
import {surveyDialogue,habitatGuideDialogue,habitatLabAction,habitatStage,cityProjectStage,cityProjectHotelAction,wildStudyStage} from './adventure-story.mjs';
import {royaleDialogue,royaleZoneDialogue,naveenAction,lidaBagAction,lidaBattleAction,joseeAction,joseeRequired} from './adventure-royale.mjs';

export const MAP_VERSION = 2;
export const FIELD_SIZE = {width: 23, height: 17};
export const DIRECTIONS = Object.freeze({up: [0,-1], down: [0,1], left: [-1,0], right: [1,0]});
export const FIELD_GOODS = [
  {id:'ball', name:'몬스터볼', column:'balls', price:100, description:'야생 포켓몬을 잡는 볼'},
  {id:'potion', name:'상처약', column:'potions', price:100, description:'HP 20 회복'},
  {id:'super', name:'좋은상처약', column:'super_potions', price:180, description:'HP 60 회복'},
  {id:'hyper', name:'고급상처약', column:'hyper_potions', price:600, description:'HP 120 회복'},
  {id:'max', name:'풀회복약', column:'max_potions', price:1200, description:'HP 전부 회복'},
  {id:'fullrestore', name:'회복약', column:'full_restores', price:1500, description:'HP와 상태이상 회복'},
  {id:'antidote', name:'해독제', column:'antidotes', price:80, description:'독·맹독 치료'},
];

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
  grid[9][11]='T';grid[10][4]='Q';grid[6][14]='h';grid[10][18]='x';if(s.zaRoyaleRank==='V'&&!s.zaMysteryTrail)grid[7][16]='d';grid[15][11]='X';grid[8][0]='W';grid[8][22]='E';
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
// A provisional second wild zone; source geography and spawn positions differ.
export function lumioseZone2Map(){
 const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=4;y<=12;y++)for(let x=6;x<=16;x++)grid[y][x]='g';
 for(let y=4;y<=6;y++)for(let x=8;x<=13;x++)grid[y][x]='~';
 grid[8][0]='W';grid[8][22]='E';grid[6][19]='j';return grid.map(row=>row.join(''));
}
// Provisional Wild Zone 3 layout, not the original city geography.
export function lumioseZone3Map(){
 const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=4;y<=12;y++)for(let x=6;x<=16;x++)grid[y][x]='g';
 grid[8][0]='W';grid[8][22]='E';grid[6][19]='b';grid[10][19]='t';grid[11][20]='q';grid[10][2]='m';grid[12][3]='v';return grid.map(row=>row.join(''));
}
// Provisional cemetery layout; original paths and graves differ.
export function lumioseZone4Map(){
 const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=4;y<=12;y++)for(let x=6;x<=16;x++)grid[y][x]='g';
 grid[8][22]='E';grid[6][18]='z';return grid.map(row=>row.join(''));
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
const CITY_DISTRICTS=['lumiose','lumiose-rooftop','lumiose-zone1','lumiose-zone2','lumiose-zone3','lumiose-zone4','lumiose-bureau','lumiose-garden','lumiose-site','lumiose-wild','lumiose-observation','lumiose-royale'];
export function hotelMap(){
  const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
  for(let x=7;x<=15;x++)if(x!==11)grid[5][x]='#';
  grid[5][11]='F';grid[15][11]='X';return grid.map(row=>row.join(''));
}
export function fieldMap(s){return s.interior==='lab'?labMap():s.interior==='hotel'?hotelMap():s.district==='lumiose'?lumioseMap(s):s.district==='lumiose-rooftop'?lumioseRooftopMap(s):s.district==='lumiose-zone1'?lumioseZone1Map():s.district==='lumiose-zone2'?lumioseZone2Map():s.district==='lumiose-zone3'?lumioseZone3Map():s.district==='lumiose-zone4'?lumioseZone4Map():s.district==='lumiose-bureau'?lumioseBureauMap():s.district==='lumiose-garden'?lumioseGardenMap():s.district==='lumiose-site'?lumioseSiteMap(s):s.district==='lumiose-wild'?lumioseWildMap(s):s.district==='lumiose-observation'?lumioseObservationMap():s.district==='lumiose-royale'?lumioseRoyaleMap():adventureMap(s.area,!!s.expedition);}
// Keep the primary coordinates safe for clients predating interiors. The revision
// detects any older-client write, even one that returns to the same coordinates.
export function storeAdventurePosition(s,revision){
  if(CITY_DISTRICTS.includes(s.district))return {...s,x:5,y:9,facing:'down',interior:null,regionId:s.districtReturnRegion??1,districtPosition:{x:s.x,y:s.y,facing:s.facing,interior:s.interior||null,revision}};
  if(s.districtPosition){s={...s};delete s.districtPosition;}
  if(s.interior!=='lab'){const copy={...s};delete copy.interiorPosition;return copy;}
  return {...s,x:18,y:5,facing:'down',interiorPosition:{x:s.x,y:s.y,facing:s.facing,revision}};
}
export function restoreAdventurePosition(s,revision){
  // An older client may discard the position payload for an unknown district.
  if(CITY_DISTRICTS.includes(s?.district)&&!s.districtPosition){s.district=null;delete s.districtReturnRegion;return s;}
  if(CITY_DISTRICTS.includes(s?.district)&&s.districtPosition){
    const p=s.districtPosition;
    const indoor=p.interior||null,map=indoor==='hotel'&&s.district==='lumiose'?hotelMap():s.district==='lumiose'?lumioseMap(s):s.district==='lumiose-rooftop'?lumioseRooftopMap(s):s.district==='lumiose-zone1'?lumioseZone1Map():s.district==='lumiose-zone2'?lumioseZone2Map():s.district==='lumiose-zone3'?lumioseZone3Map():s.district==='lumiose-zone4'?lumioseZone4Map():s.district==='lumiose-bureau'?lumioseBureauMap():s.district==='lumiose-garden'?lumioseGardenMap():s.district==='lumiose-site'?lumioseSiteMap(s):s.district==='lumiose-wild'?lumioseWildMap(s):s.district==='lumiose-royale'?lumioseRoyaleMap():lumioseObservationMap();
    if(p.revision!==revision||s.area!==3||s.expedition||s.interior||s.x!==5||s.y!==9||(indoor&&!(indoor==='hotel'&&s.district==='lumiose'))||!Number.isInteger(p.x)||!Number.isInteger(p.y)||!walkable(map[p.y]?.[p.x])){s.district=null;delete s.districtPosition;delete s.districtReturnRegion;return s;}
    s.districtReturnRegion=s.regionId??1;s.regionId=6;s.interior=indoor;s.x=p.x;s.y=p.y;s.facing=Object.hasOwn(DIRECTIONS,p.facing)?p.facing:'down';return s;
  }
  if(s?.interior!=='lab'||!s.interiorPosition)return s; // original development saves
  const p=s.interiorPosition;
  if(p.revision!==revision||s.area!==0||s.expedition||s.x!==18||s.y!==5||!Number.isInteger(p.x)||!Number.isInteger(p.y)||!walkable(labMap()[p.y]?.[p.x])){
    s.interior=null;delete s.interiorPosition;return s;
  }
  s.x=p.x;s.y=p.y;s.facing=Object.hasOwn(DIRECTIONS,p.facing)?p.facing:'down';return s;
}
export function walkable(tile){return !!tile&&!['#','~','^','r','c'].includes(tile);}
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
  if(s.interior==='lab'&&tile==='X')return {x:18,y:5,area:s.area,interior:null,transitioned:true,tile};
  if(s.interior==='hotel'&&tile==='X')return {x:11,y:6,area:s.area,interior:null,transitioned:true,tile};
  if(s.district==='lumiose-rooftop'&&tile==='X')return {x:14,y:7,area:s.area,district:'lumiose',transitioned:true,tile};
  if(s.district==='lumiose-rooftop'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-zone2',transitioned:true,tile};
  if(s.district==='lumiose-bureau'&&tile==='X')return {x:19,y:7,area:s.area,district:'lumiose-zone3',transitioned:true,tile};
  if(s.district==='lumiose-royale'&&tile==='X')return {x:11,y:10,area:s.area,district:'lumiose',transitioned:true,tile};
  if(s.district==='lumiose'&&tile==='X')return {x:5,y:9,area:s.area,district:null,regionId:s.districtReturnRegion??1,districtReturnRegion:null,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-zone1',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone1'&&tile==='W')return /^[A-Y]$/.test(s.zaRoyaleRank||'')?{x:21,y:8,area:s.area,district:'lumiose-zone2',transitioned:true,tile}:{blocked:true,reason:'야생 구역 2는 로열 랭크 Y 이후에 준비됩니다.'};
  if(!s.interior&&s.district==='lumiose-zone2'&&tile==='W')return /^[A-Y]$/.test(s.zaRoyaleRank||'')&&!joseeRequired(s)?{x:21,y:8,area:s.area,district:'lumiose-zone3',transitioned:true,tile}:{blocked:true,reason:'야생 구역 3에 가기 전 Josée를 만나세요.'};
  if(!s.interior&&s.district==='lumiose-zone3'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-zone4',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone4'&&tile==='E')return {x:1,y:8,area:s.area,district:'lumiose-zone3',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone3'&&tile==='E')return {x:1,y:8,area:s.area,district:'lumiose-zone2',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone2'&&tile==='E')return {x:1,y:8,area:s.area,district:'lumiose-zone1',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone1'&&tile==='E')return {x:1,y:8,area:s.area,district:'lumiose',transitioned:true,tile};
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
export function interactionAt(s){
  const map=fieldMap(s),[dx,dy]=DIRECTIONS[s.facing]||DIRECTIONS.down;
  for(const [x,y]of [[s.x,s.y],[s.x+dx,s.y+dy]]){
    const tile=map[y]?.[x];if('HMGNLCPQSIRJTFKYDZABOUVrajbetqmzvhucxdn'.includes(tile||'!'))return {x,y,tile};
  }
  return null;
}
export function leagueIndex(s){const spot=interactionAt(s);return spot?.y===4?[8,11,14,17,20].indexOf(spot.x):-1;}
export function fieldDialogue(s){
  const spot=interactionAt(s);if(!spot)return null;
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
    Q:s.district==='lumiose'?{name:'도시 안내원',text:'서쪽은 야생 구역 1 초안, 동쪽은 정원 지구예요. 남쪽 정류장에서는 항구로 돌아갈 수 있어요.'}:s.district==='lumiose-garden'&&lidaBattleAction(s)?{name:'팀 MZ Lida',text:'Lida가 정원에서 연습 중이다. 맡아 온 물건을 전할 수 있다.',actions:[lidaBattleAction(s)]}:s.district==='lumiose-garden'?{name:'정원 안내원',text:'사람과 포켓몬이 쉬어 가는 정원이에요. 서쪽은 광장, 동쪽은 공사 현장으로 이어져요.'}:!s.expedition&&s.area===3&&habitatStage(s)===4?{name:'항구 조사단 안내원',text:'조사단이 미르시티의 첫 구역으로 가는 배편을 준비했어요. 항구로 돌아올 수도 있답니다.',action:'visitLumiose',label:'미르시티로 가기'}:habitatGuideDialogue(s)||surveyDialogue(s)||{name:'마을 안내원',text:s.completed?'챔피언이 되었군요! 여행 수첩에서 세계의 진화 장소와 명예의 전당을 살펴보세요.':`이곳은 ${area.name}. 풀숲에서 포켓몬을 만나고, 동쪽 길을 따라 체육관에 도전하세요. 몬스터볼은 숍에서 구할 수 있어요.`},
    a:s.zaWildAlphaSpent?{name:'우두머리 포켓몬의 자리',text:'현재 이 자리의 구구는 보이지 않는다. 야생 구역에 다시 들어오면 만날 수 있다.'}:{name:'우두머리 구구',text:s.zaWildAlphaAlert?'구구가 이미 나를 알아챘다. 필드 배치와 시야는 시범 구성이다.':'표식의 화살표는 구구가 보는 방향이다. 뒤에서 다가가면 들키지 않고 기본 볼을 던질 수 있다. 가까운 직선 방향에서 조준할 수 있으며 배치와 시야는 시범 구성이다.',actions:[{action:'encounterWildAlpha',label:'우두머리와 배틀'},...(spot.x!==s.x||spot.y!==s.y?[{action:'throwWildAlpha',label:'기본 볼 던지기'}]:[])]},
    r:{name:'길을 막은 바위',text:'파트너가 바위깨기를 알고 있으면 이 길을 열 수 있다. 이 공사 현장 지형은 초안이다.',action:'smashSiteRock',label:'바위깨기 사용'},
    n:{name:'AZ (초안)',text:s.zaMysteryTrail===2?'앱솔이 폭주하려 한다. 루카리오와 메가링을 빌려주겠네.':'루카리오와 메가링의 임시 대여 배틀은 준비 중이다.',...(s.zaMysteryTrail===2?{action:'meetAZForAbsol',label:'AZ의 이야기 듣기'}:{})},
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
    j:{name:'정의단 Josée',text:joseeAction(s)?'야생 구역에 대한 생각을 배틀로 확인해 보자. 이 만남의 위치는 임시 배치다.':'임무 05의 나머지 장면은 준비 중이다.',...(joseeAction(s)||{})},
    T:royaleDialogue(s),
    O:royaleZoneDialogue(s,'O'),U:royaleZoneDialogue(s,'U'),V:royaleZoneDialogue(s,'V'),
    J:{name:'호텔',text:naveenAction(s)?'호텔 앞에서 팀 MZ의 Naveen이 기다리고 있다. 로비에도 들어갈 수 있다.':s.zaNaveenComplete?'Naveen에게 패션 디자이너가 되고 싶은 꿈을 들었다. 호텔 로비에 들어갈 수 있다.':'여행자와 포켓몬을 위한 호텔이다. 로비에 들어갈 수 있다.',action:'enterHotel',label:'호텔에 들어가기',...(naveenAction(s)?{actions:[{action:'enterHotel',label:'호텔에 들어가기'},naveenAction(s)]}: {})},
    F:{name:'호텔 안내 직원',text:cityProjectStage(s)===4?'정원 조사 결과를 들려주세요. 파트너도 쉬어 갈 수 있어요.':'어서 오세요. 파트너들과 쉬거나 도시 조사단의 의뢰를 살펴보세요.',actions:[{action:'hotelRest',label:'파티 쉬게 하기'},cityProjectHotelAction(s),lidaBagAction(s)].filter(Boolean)},
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
      if(!walkable(tile)||('EW'.includes(tile)&&key(n)!==key(target)))continue;
      const c=cost.get(key(p))+(tile==='g'?4:1),k=key(n);
      if(c<(cost.get(k)??Infinity)){cost.set(k,c);prev.set(k,{p,direction});open.push(n);}
    }
  }
  const path=[];let p=target;while(key(p)!==key(start)){const step=prev.get(key(p));if(!step)return [];path.unshift(step.direction);p=step.p;}return path;
}
