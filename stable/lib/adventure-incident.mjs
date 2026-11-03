import {arenaProgress} from './adventure-arena.mjs';
export const CITY_INCIDENTS=[
 {start:0,active:1,report:2,done:3,rank:2,species:10033,level:36,name:'메가이상해꽃',reward:1000,stone:'venusaurite',intro:'야생 구역에서 메가진화한 이상해꽃이 불안해하고 있어요. 포획하려 하지 말고 배틀로 진정시켜 주세요.'},
 {start:3,active:4,report:5,done:6,rank:3,species:10035,level:45,name:'메가리자몽 Y',reward:1400,stone:'charizarditey',intro:'야생 구역의 온도가 갑자기 오르고 있어요. 메가리자몽이 다치지 않게 조심해서 진정시켜 주세요.'},
 {start:6,active:7,report:8,done:9,rank:4,species:10036,level:52,name:'메가거북왕',reward:1800,stone:'blastoisinite',intro:'도시의 물길이 거칠어졌어요. 야생 구역의 메가거북왕을 찾아 안전하게 진정시켜 주세요.'},
];
export function pendingIncidentStone(world){
 const awarded=Array.isArray(world.pcCityIncidentStones)?world.pcCityIncidentStones:[];
 return CITY_INCIDENTS.find(item=>(Number(world.pcCityIncident)||0)>=item.done&&!awarded.includes(item.stone))||null;
}
export function cityIncident(world){
 const stage=Number(world.pcCityIncident)||0,rank=arenaProgress(world).rank;
 return CITY_INCIDENTS.find(item=>rank>=item.rank&&[item.start,item.active,item.report].includes(stage))||null;
}
export function incidentGoal(world){
 const stage=Number(world.pcCityIncident)||0,incident=cityIncident(world);
 if(incident){if(stage===incident.start)return '조사단 동료에게 야생 구역의 이상 현상을 물어보자.';if(stage===incident.active)return `야생 구역의 빛나는 지점에서 ${incident.name}을 진정시키자.`;return '조사단 동료에게 진정된 포켓몬의 소식을 전하자.';}
 if(stage>=9)return '야생 구역의 세 가지 이상 현상 조사 완료!';
 return '광장 랭크를 올리고 조사단의 다음 소식을 기다리자.';
}
