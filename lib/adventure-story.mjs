// Derived from existing progress, so installing the story never resets a save.
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
