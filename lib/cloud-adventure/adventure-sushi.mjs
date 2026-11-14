import {makeMon,moves} from '../game.mjs';

// Source: https://bulbapedia.bulbagarden.net/wiki/Sushi_High_Roller_(Lumiose_City)
// Opponents are supplied in source order. Z-A's simultaneous encounter is not
// yet connected to the adventure's single-active turn-based battle engine.
const COURSES=[
 [[666,['hurricane','energyball','psychic','bugbuzz']],[15,['toxicspikes','poisonjab','drillrun','xscissor']],[168,['leechlife','swordsdance','poisonjab','lunge']]],
 [[702,['discharge','dazzlinggleam','paraboliccharge','superfang']],[26,['thunderbolt','surf','thunder','irontail']],[587,['airslash','energyball','spark','electroweb']]],
 [[212,['xscissor','slash','bulletpunch','steelwing']],[707,['psychic','flashcannon','drainingkiss','metalsound']],[448,['waterpulse','aurasphere','bulletpunch','dragonpulse']]],
 [[709,['forestscurse','hornleech','earthquake','shadowclaw']],[711,['mysticalfire','brutalswing','shadowball','trickortreat']],[609,['firespin','energyball','shadowball','flamethrower']]],
 [[135,['thunderbolt','shadowball','discharge','hypervoice']],[134,['icebeam','hydropump','surf','blizzard']],[136,['irontail','flamewheel','firespin','dig']]],
];
const namesByKey=new Map(Object.values(moves).map(m=>[m.key,m.name]));
// Mission 20 completion starts Mission 24 in this game's story flow. Older
// saves can instead record later milestones or the already-achieved rank.
export function sushiAvailable(s){return s?.zaMission24Started===true||s?.zaMission20Complete===true||s?.zaMission24Complete===true||s?.zaMission25Started===true||s?.zaMission30Complete===true||s?.zaMission37Complete===true||s?.zaMission38Complete===true||['C','B','A','S'].includes(s?.zaRoyaleRank);}
export const SUSHI_COURSE_COUNT=COURSES.length;
export function sushiCourseTeam(index){
 if(!Number.isInteger(index)||index<0||index>=COURSES.length)throw Error('식사 코스를 확인하세요.');
 return COURSES[index].map(([speciesId,keys],slot)=>{
  const localized=keys.map(key=>{const name=namesByKey.get(key);if(!name)throw Error(`식당 배틀 기술을 찾을 수 없습니다: ${key}`);return name;});
  return {...makeMon(speciesId,50),boxId:`sushi-${index}-${slot}`,moves:localized,pp:{}};
 });
}
