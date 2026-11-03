import {AREAS, TRAINERS, areaMap} from './campaign.mjs';
import {surveyDialogue,habitatGuideDialogue,habitatLabAction,habitatStage} from './adventure-story.mjs';

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
export function fieldMap(s){return s.interior==='lab'?labMap():adventureMap(s.area,!!s.expedition);}
// Keep the primary coordinates safe for clients predating interiors. The revision
// detects any older-client write, even one that returns to the same coordinates.
export function storeAdventurePosition(s,revision){
  if(s.interior!=='lab'){const copy={...s};delete copy.interiorPosition;return copy;}
  return {...s,x:18,y:5,facing:'down',interiorPosition:{x:s.x,y:s.y,facing:s.facing,revision}};
}
export function restoreAdventurePosition(s,revision){
  if(s?.interior!=='lab'||!s.interiorPosition)return s; // original development saves
  const p=s.interiorPosition;
  if(p.revision!==revision||s.area!==0||s.expedition||s.x!==18||s.y!==5||!Number.isInteger(p.x)||!Number.isInteger(p.y)||!walkable(labMap()[p.y]?.[p.x])){
    s.interior=null;delete s.interiorPosition;return s;
  }
  s.x=p.x;s.y=p.y;s.facing=Object.hasOwn(DIRECTIONS,p.facing)?p.facing:'down';return s;
}
export function walkable(tile){return !!tile&&!['#','~','^'].includes(tile);}
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
export function interactionAt(s){
  const map=fieldMap(s),[dx,dy]=DIRECTIONS[s.facing]||DIRECTIONS.down;
  for(const [x,y]of [[s.x,s.y],[s.x+dx,s.y+dy]]){
    const tile=map[y]?.[x];if('HMGNLCPQSIR'.includes(tile||'!'))return {x,y,tile};
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
    Q:habitatGuideDialogue(s)||surveyDialogue(s)||{name:'마을 안내원',text:s.completed?'챔피언이 되었군요! 여행 수첩에서 세계의 진화 장소와 명예의 전당을 살펴보세요.':`이곳은 ${area.name}. 풀숲에서 포켓몬을 만나고, 동쪽 길을 따라 체육관에 도전하세요. 몬스터볼은 숍에서 구할 수 있어요.`},
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
