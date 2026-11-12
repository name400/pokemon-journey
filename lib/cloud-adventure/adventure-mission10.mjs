import {makeMon} from '../game.mjs';

// https://bulbapedia.bulbagarden.net/wiki/Urbain (Mission 10, second battle).
const MONS={
 grass:{id:153,level:25,moves:['기가드레인','씨뿌리기','누르기','차밍보이스']},
 fire:{id:499,level:25,moves:['그로우펀치','구르기','화염바퀴','몸통박치기']},
 water:{id:159,level:25,moves:['아쿠아제트','몸통박치기','베어가르기','물기']},
 electric:{id:310,level:26,moves:['번개엄니','스파크','물기','불꽃엄니'],item:'manectite'},
};
const ORDER={grass:['water','fire'],fire:['grass','water'],water:['fire','grass']};
// Original ZA opening starter, not the current lead or a later party change.
export function mission10OriginalStarter(s){return ({152:'grass',498:'fire',158:'water'})[s?.zaIntroStarterSpecies]||null;}
export function mission10RivalTeam(choice){
 if(!Object.hasOwn(ORDER,choice))throw Error('스타터 타입을 선택하세요.');
 return [...ORDER[choice],'electric'].map((key,index)=>{const p=MONS[key];return {...makeMon(p.id,p.level),boxId:`mission10-rival-${index}`,gender:'M',moves:[...p.moves],item:p.item||'',pp:{}};});
}
