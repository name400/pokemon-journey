import {arenaProgress} from './adventure-arena.mjs';
export function finaleAvailable(world){return world.citySurvey>=11&&arenaProgress(world).complete&&(Number(world.pcCityIncident)||0)>=9;}
export function finaleGoal(world){const stage=Number(world.pcCityFinale)||0;return stage===0?'조사단 동료와 도시의 마지막 신호를 조사하자.':stage===1?'광장의 균형 신호를 조사하자.':stage===2?'조사단 동료에게 도시의 소식을 전하자.':'도시 조사단의 마지막 조사 완료!';}
