import {arenaProgress,CITY_RANKS} from './adventure-arena.mjs';
import {cityIncident,incidentGoal,pendingIncidentStone} from './adventure-incident.mjs';
import {finaleAvailable,finaleGoal} from './adventure-finale.mjs';
import {habitatProgress} from './adventure-habitat.mjs';
import {mzRivalName} from './adventure-mz.mjs';
// Derived from existing progress, so installing the story never resets a save.
export function adventureStory(world,box=[]){
 const badges=world.badges?.length||0,league=world.league||0,caught=box.filter(p=>p.origin==='capture').length,rival=mzRivalName(world);
 const chapters=[
  {id:'arrival',title:'도시에서 온 편지',condition:true,text:'사람과 포켓몬이 함께 살 도시를 만들기 위해 미르시티 조사단이 도움을 요청했다. 먼저 파트너와 여행을 시작하자.',goal:'첫 배지를 획득하자.'},
  {id:'survey',title:'함께 살아갈 자리',condition:badges>=1,text:'조사단은 야생 포켓몬의 보금자리가 줄어들지 않도록 각 지역의 생태를 기록하고 있다. 풀숲에서 포켓몬을 만나 조사에 참여하자.',goal:caught?'다른 지역을 탐험하고 배지를 모으자.':'야생 포켓몬을 포획해 조사 기록을 남기자.'},
  {id:'mega',title:'메가진화의 흔적',condition:badges>=3,text:'도시 주변에서 강한 에너지 반응이 보고됐다. 조사단은 포켓몬이 위험해지지 않도록 메가진화의 단서를 조사한다.',goal:'여행을 계속하며 여덟 배지를 모으자.'},
  {id:'league',title:'트레이너의 결의',condition:badges>=8,text:'조사단의 동료들은 사람과 포켓몬이 서로 믿는 힘이 사태를 해결할 열쇠라고 말한다. 리그에서 함께 쌓아 온 실력을 시험하자.',goal:`사천왕과 챔피언에게 도전하자. (${Math.min(league,5)}/5)`},
  {id:'future',title:'이어지는 도시의 꿈',condition:!!world.completed,text:'챔피언이 된 뒤에도 조사단의 모험은 계속된다. 세계 곳곳을 여행하며 포켓몬과 공존할 미래를 찾아보자.',goal:'세계 탐험을 떠나 새로운 장소를 발견하자.'},
 ];
 const goals=['초록마을의 도시 조사단 연락원에게 말을 걸자.','야생 포켓몬을 포획하고 초록마을 연락원에게 보여주자.','회색 산길 안내판에서 생태를 조사하자.','초록마을 연락원에게 조사 기록을 전달하자.','연락원과 이야기해 물가의 다음 조사를 맡자.','블루 물가에서 조사단 트레이너와 배틀하자.','초록마을 연락원에게 물가의 단서를 전하자.','연락원과 함께 미르시티에 가서 호텔 Z를 방문하자.',`미르시티에서 ${rival}를 만나자.`,`배틀 광장에서 ${rival}와 배틀하자.`,'호텔 Z에 조사 결과를 보고하자.','도시 조사 완료! 서쪽 출구로 초록마을에 돌아갈 수 있다.'];
 const stage=Math.max(0,Math.min(11,Number(world.citySurvey)||0));
 if(stage===7&&world.cityVisit)goals[7]='호텔 Z 접수처에서 조사단을 만나자.';
 const arena=arenaProgress(world),arenaEntry=world.citySurvey>=11?[{id:'arena',title:'미르시티 광장 랭크전',text:`현재 ${CITY_RANKS[arena.rank]} 랭크 · 승리 ${arena.wins}회 · 도전 포인트 ${arena.points}/2`,goal:arena.complete?(world.pcCityWish?'A 랭크까지 승급 완료!':'광장 안내원에게 A 랭크 선물을 받자.'):arena.points>=2?'광장 안내원에게 승급전을 신청하자.':'광장 포인트전에서 이겨 도전 포인트를 모으자.'}]:[];
 const anomaly=world.citySurvey>=11&&arena.rank>=2?[{id:'incident',title:'야생 구역의 이상 현상',text:'불안해진 포켓몬과 도시의 에너지를 조사한다.',goal:incidentGoal(world)}]:[];
 const finale=finaleAvailable(world)?[{id:'finale',title:'도시의 균형',text:'조사단과 함께 도시의 마지막 신호를 조사한다.',goal:finaleGoal(world)}]:[];
 const habitat=habitatProgress(world),sideQuest=world.citySurvey>=11?[{id:'habitat',title:'도시 생태 조사',text:'꽃밭과 그늘, 산책길을 살펴 포켓몬과 사람이 함께 지낼 자리를 기록한다.',goal:habitat.claimed?'생태 조사 완료!':!habitat.started?'미르시티의 생태 조사원에게 의뢰를 받자.':habitat.complete?'조사원에게 기록을 전달하자.':`야생 구역의 세 지점을 기록하자. (${habitat.points.length}/3)`}]:[];
 const mz=world.citySurvey>=11?[{id:'mz-lida',title:'루디와 별가사리의 연습',text:'호텔 Z에서 MZ단 동료와 포켓몬 배틀을 연습한다.',goal:world.pcMZLida===2?'루디와의 연습 완료!':world.pcMZLida===1?'호텔 Z의 루디에게 연습 결과를 전하자.':'호텔 Z의 루디와 연습 배틀을 하자.'}]:[];
 const naveen=world.citySurvey>=11?[{id:'mz-naveen',title:'이노의 디자인 관찰',text:'이노가 곤율랭에게 어울리는 옷을 만드는 데 필요한 움직임을 살펴본다.',goal:world.pcMZNaveen===3?'이노의 의뢰 완료!':world.pcMZNaveen===2?'호텔 Z의 이노에게 관찰을 이야기하자.':world.pcMZNaveen===1?'도시 조사단 지구 풀숲에서 곤율랭을 만나자.':'호텔 Z의 이노에게 의뢰를 물어보자.'}]:[];
 const partner=world.citySurvey>=11?[{id:'za-partner',title:'새로운 파트너',text:'호텔 Z에서 새로운 포켓몬과 인연을 맺는다.',goal:world.pcZAPartner?'새 파트너를 보유함에서 확인하자.':'호텔 Z의 도시 연구원을 만나자.'}]:[];
 const pendingStone=pendingIncidentStone(world),stones=world.citySurvey>=11&&pendingStone?[{id:'mz-stones',title:'남은 메가스톤',text:'이미 마친 메가진화 조사에서 받을 수 있는 보상이 남아 있다.',goal:'호텔 Z의 이노에게 메가스톤을 받자.'}]:[];
 const team=world.citySurvey>=11?[{id:'mz-team',title:'MZ단과 함께',text:`${rival}와 실력을 확인한 뒤 호텔 Z를 거점으로 루디, 이노와 함께 도시의 평화를 돕기로 했다.`,goal:'도시에서 동료들과 이야기하고 새로운 의뢰를 살펴보자.'}]:[];
 return [{id:'mission',title:'진행 중인 조사 · 포켓몬과 함께 사는 도시',text:'초록마을의 연락원과 함께 야생 포켓몬의 보금자리를 조사합니다.',goal:goals[stage]},...finale,...anomaly,...arenaEntry,...sideQuest,...partner,...mz,...naveen,...stones,...team,...chapters.filter(c=>c.condition)];
}
export function cityObjective(world){
 const chapters=adventureStory(world,[]);
 return (world.citySurvey>=11?(chapters.find(chapter=>chapter.id==='finale'&&world.pcCityFinale!==3)||chapters.find(chapter=>chapter.id==='incident'&&cityIncident(world))||chapters.find(chapter=>chapter.id==='arena')):chapters[0])?.goal||chapters[0].goal;
}
