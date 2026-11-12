import {makeMon,moves} from '../game.mjs';

// https://www.serebii.net/legendsz-a/sidemissions/fullcourseofbattles:threestars.shtml
// Species, level and moves follow the ten original trainers. Their simultaneous
// combat, Plus moves, held items and mega transformation are not represented.
const COURSES=[
 [[71,['toxic','powerwhip','leafstorm','sludgebomb']],[545,['toxic','xscissor','irontail','poisonjab']],[569,['toxic','gunkshot','brutalswing','protect']]],
 [[323,['doubleedge','takedown','flareblitz','focusenergy']],[663,['doubleedge','flareblitz','bravebird','agility']],[668,['doubleedge','wildcharge','flareblitz','takedown']]],
 [[703,['lightscreen','reflect','moonblast','stoneedge']],[282,['lightscreen','reflect','moonblast','psychic']],[36,['lightscreen','reflect','moonblast','mysticalfire']]],
 [[713,['recover','irondefense','curse','iciclecrash']],[302,['recover','darkpulse','calmmind','shadowball']],[715,['moonlight','leechlife','absorb','boomburst']]],
 [[115,['firepunch','icepunch','thunderpunch','poweruppunch']],[94,['gunkshot','energyball','dazzlinggleam','shadowball']],[208,['stoneedge','earthquake','ironhead','crunch']]],
 [[212,['doubleteam','protect','bulletpunch','lunge']],[448,['detect','protect','aurasphere','flashcannon']],[681,['kingsshield','protect','ironhead','shadowclaw']]],
 [[142,['heatwave','hurricane','earthpower','rockslide']],[121,['psychic','thunderbolt','psyshock','blizzard']],[478,['thunder','psychic','blizzard','icywind']]],
 [[24,['leechlife','gigadrain','poisonjab','brutalswing']],[407,['leechseed','absorb','gigadrain','sludgebomb']],[673,['leechseed','hornleech','gigadrain','playrough']]],
 [[130,['gigaimpact','irontail','stoneedge','earthquake']],[691,['hyperbeam','hydropump','gunkshot','dracometeor']],[149,['fireblast','thunder','hurricane','blizzard']]],
 [[780,['hypervoice','hurricane','blizzard','lightscreen']],[227,['drillrun','ironhead','fly','stealthrock']],[248,['stoneedge','earthquake','crunch','firefang']]],
];
const names=new Map(Object.values(moves).map(m=>[m.key,m.name]));
export const LE_WOW_COURSE_COUNT=COURSES.length;
export function leWowCourseTeam(index){
 if(!Number.isInteger(index)||index<0||index>=COURSES.length)throw Error('식사 코스를 확인하세요.');
 return COURSES[index].map(([species,keys],slot)=>({...makeMon(species,55),boxId:`le-wow-${index}-${slot}`,moves:keys.map(key=>{const name=names.get(key);if(!name)throw Error(`식당 배틀 기술을 찾을 수 없습니다: ${key}`);return name;}),pp:{}}));
}
export function leWowAvailable(s){return s.zaMission31Started===true||s.zaMission30Complete===true||s.zaRoyaleRank==='A';}
