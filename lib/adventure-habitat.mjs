// A small optional city side quest; state is isolated from the main story and existing saves.
export const HABITAT_POINTS={
 '1':{name:'꽃밭 조사 지점',text:'꽃과 열매가 자라는 곳이다. 포켓몬이 먹이를 찾을 수 있는 자리다.'},
 '2':{name:'그늘 조사 지점',text:'나무 그늘 아래에는 포켓몬이 쉬어 갈 수 있는 자리가 있다.'},
 '3':{name:'산책길 조사 지점',text:'사람과 포켓몬이 함께 지나갈 수 있는 길이다.'},
};
export function habitatProgress(world){
 const raw=world.pcCityHabitat||{};
 const points=Array.isArray(raw.points)?[...new Set(raw.points.filter(point=>Object.hasOwn(HABITAT_POINTS,point)))]:[];
 return {started:raw.started===true,points,complete:points.length===3,claimed:raw.claimed===true};
}
