// Optional field survey. Stored separately from badge and league progress.
const SURVEY = [
 {area:0,badges:0,title:'조사단의 부탁',text:'도시 조사단이 사람과 포켓몬이 함께 살 공간을 찾고 있어요. 각 지역 안내원과 이야기하며 현장의 목소리를 전해 주세요.',done:'조사단의 부탁을 받았다. 회색 산길의 안내원을 찾아가자.'},
 {area:1,badges:1,title:'첫 번째 현장 기록',text:'이곳의 포켓몬들은 사람들의 통행이 잦은 길 가까이에서도 살아가요. 조용히 지켜볼 수 있는 공간이 필요하겠네요.',done:'첫 현장 기록을 남겼다. 다음 배지를 얻고 블루 물가의 안내원을 만나자.'},
 {area:2,badges:2,title:'함께 사는 길',text:'물가와 풀숲은 포켓몬의 소중한 보금자리예요. 도시를 바꾸더라도 이런 공간을 남겨야겠어요.',done:'두 현장 기록을 조사단에 전했다. 조사 지원금 300코인을 받았다.'},
];
export function surveyStage(world){
 const n=world.citySurvey?.stage;
 return Number.isInteger(n)&&n>=0&&n<=SURVEY.length?n:0;
}
export function surveyDialogue(world){
 const stage=surveyStage(world),entry=SURVEY[stage];
 if(!entry||world.expedition||world.area!==entry.area)return null;
 if((world.badges?.length||0)<entry.badges)return {name:'도시 조사단 안내원',text:`다음 현장 조사를 위해 배지 ${entry.badges}개를 모아 주세요.`};
 return {name:'도시 조사단 안내원',text:entry.text,action:'survey',label:stage===0?'조사 부탁 받기':'현장 기록하기'};
}
export function advanceSurvey(world){
 const stage=surveyStage(world),entry=SURVEY[stage];
 if(!entry||world.expedition||world.area!==entry.area||(world.badges?.length||0)<entry.badges)throw Error('지금은 조사 기록을 남길 수 없습니다.');
 world.citySurvey={...(world.citySurvey||{}),stage:stage+1};
 return {text:entry.done,reward:stage===SURVEY.length-1?300:0};
}
export function surveySummary(world){
 const stage=surveyStage(world),entry=SURVEY[stage];
 if(!entry)return {title:'첫 현장 조사 완료',goal:'조사단에 두 지역의 현장 기록을 전했습니다.'};
 return {title:entry.title,goal:`${['태초의 초록마을','회색 산길','블루 물가'][stage]} 안내원을 만나세요.${entry.badges?` 배지 ${entry.badges}개 필요.`:''}`};
}

// A self-contained optional incident following the first survey, not the full city story.
export function habitatStage(world){
 const n=world.habitatIncident?.stage;
 return Number.isInteger(n)&&n>=0&&n<=4?n:0;
}
export function habitatLabAction(world){
 const n=habitatStage(world);
 if(n===0&&surveyStage(world)===3&&(world.badges?.length||0)>=3)return {action:'habitatStart',label:'서식지 의뢰 받기'};
 if(n===3)return {action:'habitatReport',label:'현장 조사 보고하기'};
 return null;
}
export function habitatGuideDialogue(world){
 if(world.interior||world.expedition||world.area!==3||habitatStage(world)!==1)return null;
 return {name:'항구 조사단 안내원',text:'무지개 숲에서 공사 준비 소음 때문에 야생 포켓몬들이 놀라고 있어요. 현장의 트레이너와 만나 상황을 확인해 주세요.',action:'habitatClue',label:'현장 소식 듣기'};
}
export function habitatSummary(world){
 const n=habitatStage(world);
 if(n===0)return surveyStage(world)===3?'배지 3개를 얻고 시작 지역 연구소에서 다음 의뢰를 받으세요.':null;
 return [null,'오렌지 항구의 안내원에게 현장 소식을 들으세요.','무지개 숲의 길목 트레이너와 대결해 현장 상황을 확인하세요.','시작 지역 연구소의 연구원에게 현장 결과를 전하세요.','서식지 조사 결과를 연구소에 전달했습니다.'][n];
}

// The broader chapters remain an outline derived from existing progress.
export function adventureStory(world,box=[]){
 const badges=world.badges?.length||0,league=world.league||0,caught=box.filter(p=>p.origin==='capture').length;
 const chapters=[
  {id:'arrival',title:'도시에서 온 편지',condition:true,text:'사람과 포켓몬이 함께 살 도시를 만들기 위해 미르시티 조사단이 도움을 요청했다. 먼저 파트너와 여행을 시작하자.',goal:'첫 배지를 획득하자.'},
  {id:'survey',title:'함께 살아갈 자리',condition:badges>=1,text:'조사단은 야생 포켓몬의 보금자리가 줄어들지 않도록 각 지역의 생태를 기록하고 있다. 풀숲에서 포켓몬을 만나 조사에 참여하자.',goal:caught?'다른 지역을 탐험하고 배지를 모으자.':'야생 포켓몬을 포획해 조사 기록을 남기자.'},
  {id:'mega',title:'메가진화의 흔적',condition:badges>=3,text:'도시 주변에서 강한 에너지 반응이 보고됐다. 조사단은 포켓몬이 위험해지지 않도록 메가진화의 단서를 조사한다.',goal:'여행을 계속하며 여덟 배지를 모으자.'},
  {id:'league',title:'트레이너의 결의',condition:badges>=8,text:'조사단의 동료들은 사람과 포켓몬이 서로 믿는 힘이 사태를 해결할 열쇠라고 말한다. 리그에서 함께 쌓아 온 실력을 시험하자.',goal:`사천왕과 챔피언에게 도전하자. (${Math.min(league,5)}/5)`},
  {id:'future',title:'이어지는 도시의 꿈',condition:!!world.completed,text:'챔피언이 된 뒤에도 조사단의 모험은 계속된다. 세계 곳곳을 여행하며 포켓몬과 공존할 미래를 찾아보자.',goal:'세계 탐험을 떠나 새로운 장소를 발견하자.'},
 ];
 return chapters.filter(c=>c.condition);
}
