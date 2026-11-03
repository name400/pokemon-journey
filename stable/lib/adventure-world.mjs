import {DIRECTIONS,FIELD_GOODS,walkable,validateAdventurePath,fieldPath,stepField as stepWithMap} from './adventure-field-core.mjs';
export {DIRECTIONS,FIELD_GOODS,walkable,validateAdventurePath,fieldPath};
import {AREAS, TRAINERS, areaMap} from './campaign.mjs';
import {cityMap,hotelMap,cityShopMap,cityWildMap,cityArenaMap} from './adventure-city.mjs';
import {arenaProgress,arenaTrainer,CITY_RANKS} from './adventure-arena.mjs';
import {cityIncident,pendingIncidentStone} from './adventure-incident.mjs';
import {centerMap,gymMap} from './adventure-interiors.mjs';
import {gymPuzzle} from './adventure-gym.mjs';
import {finaleAvailable} from './adventure-finale.mjs';
import {HABITAT_POINTS,habitatProgress} from './adventure-habitat.mjs';
import {CITY_TRAINERS} from './adventure-city-trainers.mjs';
import {mzRivalName} from './adventure-mz.mjs';
import {GARDEN_VISIBLE,visibleWildTile} from './adventure-visible-wild.mjs';

export const MAP_VERSION = 2;
export const FIELD_SIZE = {width: 23, height: 17};
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

export function fieldMap(s){return s.interior==='hotel'?hotelMap():s.interior==='shop'?cityShopMap():s.interior==='citywild'?cityWildMap(s):s.interior==='cityarena'?cityArenaMap():s.interior==='center'?centerMap():s.interior==='gym'?gymMap():s.cityVisit?cityMap():adventureMap(s.area,!!s.expedition);}
export function findTile(map,tile){for(let y=0;y<map.length;y++){const x=map[y].indexOf(tile);if(x>=0)return {x,y};}return null;}
export function normalizeField(s){
  if(!s)return s;
  if(s.mapVersion===MAP_VERSION){
    // Older city saves may stand where the new central landmark is built.
    if(s.cityVisit&&!s.interior){const map=fieldMap(s);if(!walkable(map[s.y]?.[s.x])){
      const queue=[[Number(s.x)||3,Number(s.y)||8]],seen=new Set();let target=null;
      while(queue.length){const [x,y]=queue.shift(),key=`${x},${y}`;if(seen.has(key)||x<1||x>=map[0].length-1||y<1||y>=map.length-1)continue;seen.add(key);if(walkable(map[y]?.[x])&&!['E','W'].includes(map[y][x])){target={x,y};break;}queue.push([x-1,y],[x+1,y],[x,y+1],[x,y-1]);}
      Object.assign(s,target||{x:3,y:8});
    }}
    return s;
  }
  const old=areaMap(s.expedition?0:s.area),tile=old[s.y]?.[s.x],map=fieldMap(s);
  let target=['H','M','G','N'].includes(tile)?findTile(map,tile):null;
  if(s.area===9&&['L','C'].includes(tile))target={x:[8,11,14,17,20][Math.max(0,[4,6,8,10,12].indexOf(s.x))],y:4};
  const x=Math.max(1,Math.min(21,Math.round((Number(s.x)||3)*22/14))),y=Math.max(1,Math.min(15,Math.round((Number(s.y)||5)*16/10)));
  if(!target)target=walkable(map[y]?.[x])?{x,y}:{x:3,y:8};
  Object.assign(s,target,{mapVersion:MAP_VERSION,facing:'down'});return s;
}
export function stepField(s,direction){return stepWithMap(s,direction,fieldMap(s));}
export function interactionAt(s){
  const map=fieldMap(s),[dx,dy]=DIRECTIONS[s.facing]||DIRECTIONS.down;
  for(const [x,y]of [[s.x,s.y],[s.x+dx,s.y+dy]]){
    const tile=map[y]?.[x];if(visibleWildTile(tile)||'HMGNLCPQSIJBRKAOTFUVZY0123456789abd'.includes(tile||'!'))return {x,y,tile};
  }
  return null;
}
export function leagueIndex(s){const spot=interactionAt(s);return spot?.y===4?[8,11,14,17,20].indexOf(spot.x):-1;}
export function fieldDialogue(s){
  const spot=interactionAt(s);if(!spot)return null;
  const area=AREAS[s.area],gym=TRAINERS[Math.max(0,s.area-1)],rival=mzRivalName(s);
  const entries={
    '6':{name:'야생 정원 입구',text:'도시 안의 더 넓은 야생 구역을 탐험할까요?',action:'enterCityWild',label:'야생 정원으로 들어가기'},
    '7':s.citySurvey>=11?{name:'야간 배틀존 입구',text:'밤의 분위기로 꾸며진 배틀존에서 랭크전에 도전할 수 있습니다.',action:'enterCityArena',label:'야간 배틀존 들어가기'}:{name:'야간 배틀존 입구',text:'도시 조사를 마치면 배틀존에 입장할 수 있어요.'},
    ...Object.fromEntries(Object.entries(GARDEN_VISIBLE).map(([key,pokemon])=>[key,{name:`야생 ${pokemon.name}`,text:`야생 ${pokemon.name} 발견! ${pokemon.alpha?'일반 개체보다 강하고 잡기 어렵다. ':''}볼을 던지거나 배틀할 수 있다. 포획에 실패하면 배틀이 시작된다.`,choices:[{action:'gardenVisibleCatch',label:'몬스터볼 던지기'},{action:'gardenVisibleBattle',label:'야생 포켓몬과 배틀'}]}])),
    '8':s.pcGardenRare?{name:'조용한 풀숲',text:'이곳에서 만난 포켓몬의 흔적이 남아 있다.'}:{name:'흔들리는 풀숲',text:'풀숲에서 낯선 포켓몬의 움직임이 느껴진다. 살펴볼까?',action:'gardenEncounter',label:'풀숲 살펴보기'},
    '9':s.citySurvey<11?{name:'루디',text:'나는 루디야. 별가사리와 함께 댄스 연습을 하고 있어. 도시 조사도 힘내!'}:s.pcMZLida===2?{name:'루디',text:'다시 연습하면 경험치를 1.5배 줄게! 내 앞에서 기술 관리에 들어가면 교습도 받을 수 있어.',action:'mzLidaRematch',label:'루디와 다시 연습하기'}:s.pcMZLida===1?{name:'루디',text:'함께 연습해 줘서 고마워! 약속한 선물을 받아 줘.',action:'mzLidaReport',label:'연습 결과 이야기하기'}:{name:'루디',text:'나는 MZ단의 루디야. 별가사리와 호흡을 맞춰 보려고 하는데, 연습 배틀을 함께해 줄래?',action:'mzLidaBattle',label:'루디와 연습 배틀'},
    '0':pendingIncidentStone(s)?{name:'이노',text:'이전에 해결한 메가진화 사건의 보상이 남아 있어. 메가스톤을 받아 줄래?',action:'mzStoneClaim',label:'남은 메가스톤 받기'}:s.citySurvey<11?{name:'이노',text:'안녕, 나는 MZ단의 이노야. 사람과 포켓몬이 함께 어울릴 수 있는 옷을 만들고 싶어.'}:s.pcMZNaveen===3?{name:'이노',text:'네 관찰 덕분에 곤율랭이 움직이기 편한 디자인을 생각해 냈어. 고마워!'}:s.pcMZNaveen===2?{name:'이노',text:'곤율랭을 만났구나! 움직이는 모습을 이야기해 줄래?',action:'mzNaveen',label:'관찰한 모습 이야기하기'}:s.pcMZNaveen===1?{name:'이노',text:'도시 조사단 지구의 풀숲에서 곤율랭을 만나 움직이는 모습을 살펴봐 줘.'}:{name:'이노',text:'나는 패션 디자이너를 꿈꾸는 이노야. 곤율랭에게 어울리는 옷을 만들 수 있게 움직임을 관찰해 줄래?',action:'mzNaveen',label:'곤율랭 관찰 의뢰 받기'},
    d:s.citySurvey<11?{name:'도시 연구원',text:'도시 조사가 끝나면 새로운 파트너를 소개해 줄게요.'}:s.pcZAPartner?{name:'도시 연구원',text:'새로운 파트너와도 즐거운 여행을 해 주세요!'}:{name:'도시 연구원',text:'치코리타, 뚜꾸리, 리아코 중 한 마리만 받을 수 있어요. 기존 파티는 유지되며 보유함으로 보냅니다.',choices:[{action:'cityPartnerGift',choice:'152',label:'치코리타 받기'},{action:'cityPartnerGift',choice:'498',label:'뚜꾸리 받기'},{action:'cityPartnerGift',choice:'158',label:'리아코 받기'}]},
    ...Object.fromEntries(Object.entries(CITY_TRAINERS).map(([key,trainer])=>{const defeated=s.pcCityLocalDefeated?.includes(trainer.id);return [key,{name:trainer.name,text:defeated?'좋은 배틀이었어! 도시를 천천히 둘러봐.':trainer.intro,...(!defeated?{action:'cityLocalBattle',label:'트레이너와 배틀'}:{})}];})),
    Y:(()=>{const p=habitatProgress(s);return {name:'도시 생태 조사원',text:s.citySurvey<11?'도시 조사가 끝나면 야생 구역을 함께 살펴봐 주세요.':p.claimed?'기록 덕분에 사람과 포켓몬이 함께 쉴 자리를 더 잘 지킬 수 있게 됐어요.':!p.started?'야생 구역의 꽃밭, 그늘, 산책길 세 곳을 기록해 주시겠어요?':p.complete?'세 곳을 모두 살펴봤군요! 조사 기록을 전달해 주세요.':`세 곳을 조사해 주세요. 현재 ${p.points.length}/3곳을 기록했어요.`,...(s.citySurvey>=11&&!p.claimed&&(!p.started||p.complete)?{action:'cityHabitat',label:p.started?'조사 기록 전달하기':'생태 조사 맡기'}:{})};})(),
    ...Object.fromEntries(Object.entries(HABITAT_POINTS).map(([key,point])=>{const p=habitatProgress(s),done=p.points.includes(key);return [key,{name:point.name,text:done?`${point.text} 이미 기록한 곳입니다.`:!p.started?'도시 생태 조사원과 먼저 이야기해 보자.':point.text,...(p.started&&!p.claimed&&!done?{action:'cityHabitatPoint',label:'조사 기록하기'}:{})}];})),
    H:{name:'포켓몬 센터',text:'파티를 쉬게 하거나 센터 안으로 들어갈 수 있어요.',choices:[{action:'enterCenter',choice:'enter',label:'센터 안으로 들어가기'},{action:'heal',choice:'heal',label:'파티 바로 회복하기'}]},
    T:{name:'포켓몬 센터 간호사',text:'어서 오세요! 포켓몬을 편히 쉬게 해 드릴게요.',action:'heal',label:'파티 전체 회복'},
    M:s.cityVisit?{name:'프렌들리숍',text:'모험에 필요한 도구를 파는 가게입니다. 안으로 들어갈까요?',action:'enterCityShop',label:'가게 안으로 들어가기'}:{name:'프렌들리숍',text:'모험에 필요한 몬스터볼과 회복 도구를 준비하세요.',action:'shop',label:'상품 보기'},
    O:{name:'프렌들리숍 점원',text:'어서 오세요! 몬스터볼과 모험 도구를 살펴보세요.',action:'shop',label:'상품 보기'},
    G:{name:gym.title,text:'관장이 체육관 안에서 기다리고 있습니다. 안으로 들어갈까요?',action:'enterGym',label:'체육관 안으로 들어가기'},
    F:(()=>{const puzzle=gymPuzzle(s),unlocked=puzzle.ready||s.badges?.includes(gym.id);return unlocked?{name:gym.name,text:`${gym.title}에 온 것을 환영한다! ${gym.type} 타입 포켓몬들과 겨뤄 보겠나?`,action:'challenge',label:'관장에게 도전하기'}:{name:gym.name,text:`관장에게 도전하려면 먼저 ${puzzle.theme} 순서를 완성하세요. 입구 안내판을 확인해 보세요.`};})(),
    U:(()=>{const p=gymPuzzle(s);return {name:`왼쪽 ${p.theme}`,text:p.ready?'장치 순서를 완성했습니다.':p.next==='U'?`다음 장치입니다. (${p.stage}/${p.order.length})`:`다음은 오른쪽 장치입니다. (${p.stage}/${p.order.length})`,...(p.next==='U'?{action:'gymSwitch',label:'장치 작동하기'}:{})};})(),
    V:(()=>{const p=gymPuzzle(s);return {name:`오른쪽 ${p.theme}`,text:p.ready?'장치 순서를 완성했습니다.':p.next==='V'?`다음 장치입니다. (${p.stage}/${p.order.length})`:`다음은 왼쪽 장치입니다. (${p.stage}/${p.order.length})`,...(p.next==='V'?{action:'gymSwitch',label:'장치 작동하기'}:{})};})(),
    N:s.interior==='gym'?(()=>{const id=`pc-gym-${s.area}-${spot.x}-${spot.y}`,defeated=s.pcGymDefeated?.includes(id);return defeated?{name:'체육관 트레이너',text:'좋은 배틀이었어! 관장에게도 도전해 봐.'}:{name:'체육관 트레이너',text:`${gym.type} 타입의 힘을 보여줄게! 관장에게 도전하기 전에 나와 겨뤄 볼래?`,action:'challenge',label:'체육관 트레이너와 배틀'};})():s.area===2&&!s.expedition&&s.citySurvey===5?{name:'조사단 트레이너',text:'물가의 이상한 에너지를 조사하기 전에 서로의 실력을 확인하자. 준비가 됐니?',action:'storyChallenge',label:'조사단 트레이너와 배틀'}:{name:'길목의 트레이너',text:'포켓몬과 눈이 마주쳤으니 실력을 겨뤄 볼까? 수련이나 돌보기도 함께 할 수 있어.',action:'challenge',label:'트레이너와 배틀'},
    L:{name:TRAINERS[8+Math.max(0,leagueIndex(s))]?.name||'사천왕',text:'리그는 순서대로 도전해야 합니다. 도전 중에는 센터에서 회복할 수 없어요.',action:'challenge',label:'리그에 도전하기'},
    C:{name:'챔피언 그린',text:'사천왕을 모두 이겼구나. 이제 마지막 승부다!',action:'challenge',label:'챔피언에게 도전'},
    P:{name:'포켓몬 연구소',text:'포켓몬을 잡고 도감을 채워 보렴. 레벨이 올라도 자동으로 진화하지 않아. 파티 관리에서 조건을 살피고 직접 선택하렴.'},
    Q:s.area===0&&!s.expedition?{name:'도시 조사단 연락원',text:!s.citySurvey?'미르시티에서 왔어요. 사람과 포켓몬이 함께 살 수 있는 도시를 만들기 위해 야생 포켓몬의 보금자리를 조사하고 있어요. 함께해 주실래요?':s.citySurvey===1?'야생 포켓몬을 한 마리 포획한 뒤 다시 찾아와 주세요. 이미 포획한 포켓몬이 있어도 괜찮아요.':s.citySurvey===2?'회색 산길로 가서 여행 안내판의 조사 지점을 살펴봐 주세요.':s.citySurvey===3?'조사 기록을 가져왔군요! 함께 살아갈 도시를 만드는 데 소중히 쓸게요.':s.citySurvey===4?'블루 물가에서 이상한 에너지가 감지됐어요. 그곳의 조사단 트레이너와 힘을 합쳐 단서를 찾아 주세요.':s.citySurvey===5?'블루 물가의 조사단 트레이너를 찾아 주세요. 배틀 준비를 하고 가세요.':s.citySurvey===6?'물가의 단서를 찾았군요. 조사 결과를 미르시티에 전할게요.':'조사단이 미르시티의 조사단 지구에서 기다리고 있어요. 함께 가볼까요?',...([2,5].includes(s.citySurvey)?{}:s.citySurvey>=7?{action:'travelCity',label:'미르시티로 가기'}:{action:'storySurvey',label:!s.citySurvey?'조사에 참가하기':s.citySurvey===1?'포획 기록 보여주기':s.citySurvey===4?'다음 조사 맡기':'조사 기록 전달하기'})}:{name:'마을 안내원',text:s.completed?'챔피언이 되었군요! 여행 수첩에서 세계의 진화 장소와 명예의 전당을 살펴보세요.':`이곳은 ${area.name}. 풀숲에서 포켓몬을 만나고, 동쪽 길을 따라 체육관에 도전하세요. 몬스터볼은 숍에서 구할 수 있어요.`},
    S:s.interior==='gym'?(()=>{const p=gymPuzzle(s);return {name:'체육관 안내판',text:`${p.theme} 순서: ${p.order.map(key=>key==='U'?'왼쪽':'오른쪽').join(' → ')}. 현재 ${p.stage}/${p.order.length}회 완료.`};})():s.interior==='citywild'?{name:'야생 정원 안내판',text:'풀숲에서 야생 포켓몬을 만날 수 있습니다. 남쪽 출구로 조사단 지구에 돌아갑니다.'}:s.interior==='cityarena'?{name:'배틀존 안내판',text:'북쪽 안내원에게 랭크전을 신청하세요. 남쪽 출구로 도시로 돌아갑니다.'}:s.cityVisit?{name:'미르시티 안내판',text:'서쪽은 초록마을로 돌아가는 길, 북서쪽은 호텔 Z, 동쪽은 배틀 광장과 프렌들리숍, 남쪽 풀숲은 야생 구역입니다.'}:s.area===1&&!s.expedition&&s.citySurvey===2?{name:'회색 산길 조사 지점',text:'바위틈의 발자국과 주변 식물을 기록했다. 조사단 연락원에게 돌아가자.',action:'storySurvey',label:'조사 기록하기'}:{name:'여행 안내판',text:`${area.name} · 야생 Lv.${area.min}–${area.max}. 방향키 / WASD: 걷기, E / Space: 대화, J: 여행 수첩.`},
    I:{name:'필드의 반짝이는 물건',text:s.fieldPickups?.includes(`${s.area}:${spot.x}:${spot.y}`)?'이곳에서 찾은 물건은 이미 챙겼습니다.':'길에서 200코인이 든 작은 주머니를 발견했다!',action:'pickup',label:'주머니 줍기'},
    J:{name:'호텔 Z',text:'미르시티 조사단의 거점입니다. 안으로 들어갈까요?',action:'enterHotel',label:'호텔 안으로 들어가기'},
    K:s.citySurvey===7?{name:'호텔 Z 접수처',text:'미르시티에 온 것을 환영해요! 함께 도시를 살펴볼 동료를 선택해 주세요.',choices:[{action:'storyCity',choice:'gai',label:'가이와 함께하기'},{action:'storyCity',choice:'tani',label:'타니와 함께하기'}]}:s.citySurvey===10?{name:'호텔 Z 접수처',text:'배틀 기록을 가져왔군요! 도시의 이상 현상을 조사하는 데 큰 도움이 될 거예요.',action:'storyCity',label:'조사 결과 보고'}:{name:'호텔 Z 접수처',text:'여행으로 지친 포켓몬들을 편히 쉬게 해 주세요.',action:'hotelRest',label:'파티 회복하기'},
    R:s.citySurvey===8?{name:rival,text:'도시 곳곳의 에너지 신호가 강해지고 있어요. 배틀 광장에서 실력을 확인하고 현장으로 가요.',action:'storyCity',label:'동료와 이야기하기'}:(()=>{const incident=cityIncident(s),stage=Number(s.pcCityIncident)||0;if(s.citySurvey>=11&&incident&&(stage===incident.start||stage===incident.report))return {name:rival,text:stage===incident.start?incident.intro:'포켓몬이 진정됐군요! 조사 기록을 전달해 주세요.',action:'cityIncident',label:stage===incident.start?'이상 현상 조사 맡기':'조사 결과 전달하기'};if(finaleAvailable(s)&&[0,2].includes(Number(s.pcCityFinale)||0))return {name:rival,text:s.pcCityFinale===2?'지켜낸 도시의 균형을 함께 기록해요.':'세 이상 현상을 조사한 뒤에도 광장에서 강한 신호가 감지됐어요. 함께 마지막 조사를 해 주실래요?',action:'cityFinale',label:s.pcCityFinale===2?'마지막 조사 보고하기':'마지막 조사 맡기'};if(s.citySurvey>=11&&arenaProgress(s).rank>=1&&(!s.pcCityMegaClaim||(s.pcZAPartner&&!s.pcZAMegaClaim)))return {name:rival,text:'승급 축하해요! 관동 첫 파트너나 연구원에게 받은 새 파트너를 선두로 두면 어울리는 메가스톤을 드릴게요. 최종 진화형이 지니면 배틀에서 직접 선택할 수 있어요.',action:'cityMegaGift',label:'파트너의 메가스톤 받기'};return {name:rival,text:incident&&stage===incident.active?'야생 구역의 빛나는 지점에서 불안해진 포켓몬을 찾아 주세요.':s.citySurvey===9?'배틀 광장에 도착했으면 트레이너에게 말을 걸어 주세요.':'사람과 포켓몬이 안심하고 함께 살 수 있는 도시를 만들어요.'};})(),
    A:(()=>{const incident=cityIncident(s),stage=Number(s.pcCityIncident)||0;return incident&&stage===incident.active?{name:'야생 구역의 이상 신호',text:incident.name+'이(가) 불안해하고 있다! 조심스럽게 다가가 진정시키자.',action:'cityIncidentBattle',label:'포켓몬 진정시키기'}:{name:'야생 구역',text:'풀숲에서 포켓몬들이 조용히 쉬고 있다.'};})(),
    Z:finaleAvailable(s)&&s.pcCityFinale===1?{name:'도시의 균형 신호',text:'광장에 나타난 지가르데가 도시와 포켓몬의 균형을 살피고 있다. 조심스럽게 다가가자.',action:'cityFinaleBattle',label:'지가르데와 대면하기'}:{name:'도시 광장',text:'도시와 야생 구역이 만나는 조용한 광장이다.'},
    B:s.citySurvey===9?{name:'배틀 광장 안내원',text:`도시 조사에 나서기 전에 ${rival}와 배틀해 실력을 확인해요.`,action:'storyCityBattle',label:'광장 배틀 시작'}:s.citySurvey>=11?(()=>{const p=arenaProgress(s),trainer=arenaTrainer(s);return trainer?{name:'배틀 광장 안내원',text:`현재 ${CITY_RANKS[p.rank]} 랭크 · 도전 포인트 ${p.points}/2. 다음 상대는 ${trainer.name}입니다. 추가 목표를 고르면 달성 시 보너스를 받아요.`,choices:[{action:'cityArenaBattle',choice:'none',label:`${trainer.title} · 기본전`},{action:'cityArenaBattle',choice:'steady',label:'기절 없이 승리 · 300코인'},{action:'cityArenaBattle',choice:'careful',label:'가방 도구 없이 승리 · 200코인'}]}:s.pcCityWish?{name:'배틀 광장 안내원',text:'A 랭크까지 승급했어요! 도시 최고의 트레이너가 되었군요.'}:{name:'배틀 광장 안내원',text:'A 랭크 달성을 축하해요! 여행을 이어갈 선물 하나를 골라 주세요.',choices:[{action:'cityWish',choice:'coins',label:'5,000코인 받기'},{action:'cityWish',choice:'balls',label:'몬스터볼 10개 받기'},{action:'cityWish',choice:'healing',label:'상처약 5개 받기'}]};})():{name:'배틀 광장 안내원',text:'이곳에서는 트레이너와 포켓몬이 함께 실력을 가다듬습니다.'},
  };
  return {...entries[spot.tile],...spot};
}

