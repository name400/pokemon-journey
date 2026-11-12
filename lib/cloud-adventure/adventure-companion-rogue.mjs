import {makeMon} from '../game.mjs';

// Mission 12, 13, 16–18 and 21–23 multi-battle rosters:
// https://bulbapedia.bulbagarden.net/wiki/Urbain
// https://bulbapedia.bulbagarden.net/wiki/Lida
// https://bulbapedia.bulbagarden.net/wiki/Naveen
const TEAMS={
 camerupt:[
  [692,29,'F',['물의파동','물대포','아쿠아제트']],
  [582,29,'F',['고드름떨구기','단단해지기','몸통박치기']],
  [120,30,'',['환상빔','물대포','아쿠아제트','신비의부적']],
 ],
 barbaracle:[
  [693,43,'F',['악의파동','파동탄','물의파동','냉동빔']],
  [583,43,'F',['냉동빔','고드름떨구기','몸통박치기','러스터캐논']],
  [120,44,'',['리플렉터','사이코키네시스','아쿠아제트','파워젬']],
 ],
 ampharos:[
  [168,43,'M',['덤벼들기','구멍파기','독찌르기','야습']],
  [302,43,'M',['파워젬','섀도클로','신비의부적','깜짝베기']],
  [560,44,'M',['깨뜨리다','박치기','그로우펀치','깨물어부수기']],
 ],
 hawlucha:[
  [692,36,'F',['파동탄','물의파동','물대포','아쿠아제트']],
  [583,36,'F',['냉동빔','고드름떨구기','몸통박치기','러스터캐논']],
  [120,37,'',['환상빔','리플렉터','아쿠아제트','파워젬']],
 ],
 banette:[
  [168,36,'M',['야습','독찌르기','시저크로스','사이코키네시스']],
  [302,36,'M',['야습','신비의부적','섀도클로','깜짝베기']],
  [559,37,'M',['깨뜨리다','분발','그로우펀치','악의파동']],
 ],
 victreebel:[
  [168,29,'M',['야습','흡수','바늘미사일','시저크로스']],
  [302,29,'M',['리플렉터','탁쳐서떨구기','섀도클로','환상빔']],
  [559,30,'M',['몸통박치기','박치기','그로우펀치']],
 ],
};
export function rogueCompanionTeam(key,starter){
 const order={grass:['water','fire'],fire:['grass','water'],water:['fire','grass']};
 const choices={water:[160,36,'M',['아쿠아제트','베어가르기','와이드브레이커','깨물어부수기']],fire:[500,36,'M',['그로우펀치','헤비봄버','구르기','몸통박치기']],grass:[154,36,'M',['몸통박치기','차밍보이스','잎날가르기','기가드레인']]};
 let team=Object.hasOwn(TEAMS,key)?TEAMS[key]:null;if(['beedrill','mawile'].includes(key)&&Object.hasOwn(order,starter||'')){const level=key==='mawile'?43:36;team=[...order[starter].map(type=>{const mon=choices[type];return [mon[0],level,mon[2],mon[3]];}),[310,level+1,'M',['번개엄니','바크아웃','방전','불꽃엄니']]];}
 if(!team)throw Error('동료를 확인하세요.');
 return team.map(([species,level,gender,moves],index)=>({...makeMon(species,level),boxId:`mission-${key}-ally-${index}`,...(gender?{gender}:{}),item:'',moves:[...moves],pp:{}}));
}
