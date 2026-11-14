import {makeMon,moves} from '../game.mjs';

// https://www.serebii.net/legendsz-a/sidemissions/fullcourseofbattles:onestar.shtml
// The original's simultaneous battles are adapted to the existing turn-based engine.
const COURSES=[
 {name:'Audrey',item:'occaberry',team:[[511,['tackle','magicalleaf','bite','bulletseed']],[672,['bulldoze','takedown','mudshot','razorleaf']]]},
 {name:'Thomas',item:'rindoberry',team:[[515,['tackle','bite','bubblebeam','watergun']],[318,['icefang','bite','aquajet','screech']]]},
 {name:'Thierry',item:'passhoberry',team:[[513,['tackle','bite','flamewheel','ember']],[667,['headbutt','firefang','takedown','snarl']]]},
];
const names=new Map(Object.values(moves).map(m=>[m.key,m.name]));
export const LE_NAH_COURSE_COUNT=COURSES.length;
export function leNahAvailable(s){return Number(s?.zaMission10Stage)>=10||s?.zaMission10Complete===true||s?.zaMission11Complete===true||s?.zaMission37Complete===true||s?.zaMission38Complete===true||['E','D','C','B','A','S'].includes(s?.zaRoyaleRank);}
export function leNahCourse(index){
 if(!Number.isInteger(index)||index<0||index>=COURSES.length)throw Error('식사 코스를 확인하세요.');
 const course=COURSES[index];
 return {name:course.name,team:course.team.map(([species,keys],slot)=>({...makeMon(species,30),boxId:`le-nah-${index}-${slot}`,item:course.item,moves:keys.map(key=>{const name=names.get(key);if(!name)throw Error(`식당 배틀 기술을 찾을 수 없습니다: ${key}`);return name;}),pp:{}}))};
}
// Restaurant Le Nah is in Vert Sector 6; Rintaro's promotion match is inside.
// Room dimensions, door and furnishings are provisional 2D placements.
// https://bulbapedia.bulbagarden.net/wiki/Restaurant_Le_Nah
// https://www.thonky.com/pokemon-legends-z-a/main-mission-08-reaching-rank-v
export function leNahMap(){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=3;y<=15;y++)for(let x=3;x<=19;x++)g[y][x]='.';
 for(let y=7;y<=12;y++)for(let x=5;x<=17;x++)g[y][x]=';';
 for(const [x,y] of [[6,7],[16,7],[6,11],[16,11]])g[y][x]='^';
 for(let x=8;x<=14;x++)g[4][x]='%';g[5][11]='R';g[16][11]='X';
 return g.map(row=>row.join(''));
}
