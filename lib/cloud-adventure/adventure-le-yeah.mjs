import {makeMon,moves} from '../game.mjs';

// https://www.serebii.net/legendsz-a/sidemissions/fullcourseofbattles:twostars.shtml
// Original simultaneous encounters use the existing turn-based multi-foe engine.
const COURSES=[
 {name:'Talia',item:'sharpbeak',team:[[18,['heatwave','featherdance','airslash','agility']],[663,['hurricane','flamewheel','uturn','steelwing']],[334,['hurricane','dragonpulse','moonblast','icebeam']]]},
 {name:'Georges',item:'hardstone',team:[[95,['dig','rockslide','rockblast','ironhead']],[689,['liquidation','nightslash','rockblast','rocktomb']],[306,['rockslide','irontail','rocktomb','stoneedge']]]},
 {name:'Michelle',item:'miracleseed',team:[[315,['toxicspikes','gigadrain','magicalleaf','shadowball']],[71,['powerwhip','sludgebomb','magicalleaf','toxicspikes']],[460,['blizzard','gigadrain','waterpulse','razorleaf']]]},
 {name:'Adeline',item:'nevermeltice',team:[[225,['freezedry','airslash','waterpulse','protect']],[362,['iciclecrash','icefang','spikes','bodyslam']],[713,['iciclecrash','crunch','earthquake','stoneedge']]]},
 {name:'Yannick',item:'twistedspoon',team:[[65,['reflect','psychic','psyshock','shadowball']],[80,['icebeam','psychic','psyshock','surf']],[475,['swordsdance','psychocut','stoneedge','firepunch']]]},
];
const names=new Map(Object.values(moves).map(m=>[m.key,m.name]));
export const LE_YEAH_COURSE_COUNT=COURSES.length;
export function leYeahAvailable(s){return Number(s?.zaMission20Stage)>=1||s?.zaMission20Started===true||s?.zaMission20Complete===true||s?.zaMission24Started===true||s?.zaMission30Complete===true||s?.zaMission37Complete===true||s?.zaMission38Complete===true||['C','B','A','S'].includes(s?.zaRoyaleRank);}
export function leYeahCourse(index){
 if(!Number.isInteger(index)||index<0||index>=COURSES.length)throw Error('식사 코스를 확인하세요.');
 const course=COURSES[index];return {name:course.name,team:course.team.map(([species,keys],slot)=>({...makeMon(species,45),boxId:`le-yeah-${index}-${slot}`,item:course.item,moves:keys.map(key=>{const name=names.get(key);if(!name)throw Error(`식당 배틀 기술을 찾을 수 없습니다: ${key}`);return name;}),pp:{}}))};
}
