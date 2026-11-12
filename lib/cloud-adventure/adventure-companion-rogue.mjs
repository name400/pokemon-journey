import {makeMon} from '../game.mjs';

// Mission 12 and 13 multi-battle rosters:
// https://bulbapedia.bulbagarden.net/wiki/Lida
// https://bulbapedia.bulbagarden.net/wiki/Naveen
const TEAMS={
 camerupt:[
  [692,29,'F',['물의파동','물대포','아쿠아제트']],
  [582,29,'F',['고드름떨구기','단단해지기','몸통박치기']],
  [120,30,'',['환상빔','물대포','아쿠아제트','신비의부적']],
 ],
 victreebel:[
  [168,29,'M',['야습','흡수','바늘미사일','시저크로스']],
  [302,29,'M',['리플렉터','탁쳐서떨구기','섀도클로','환상빔']],
  [559,30,'M',['몸통박치기','박치기','그로우펀치']],
 ],
};
export function rogueCompanionTeam(key){
 if(!Object.hasOwn(TEAMS,key))throw Error('동료를 확인하세요.');
 return TEAMS[key].map(([species,level,gender,moves],index)=>({...makeMon(species,level),boxId:`mission-${key}-ally-${index}`,...(gender?{gender}:{}),item:'',moves:[...moves],pp:{}}));
}
