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

// The partner's team is temporary battle data, never a player-owned box entry.
// https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/quasartico-inc.html
// https://bulbapedia.bulbagarden.net/wiki/Quasartico_Inc._%28Magenta_District%29
export function mission10GuardTeams(choice){
 if(!Object.hasOwn(ORDER,choice))throw Error('스타터 타입을 선택하세요.');
 const ally=[...ORDER[choice],'electric'].map((key,index)=>{const p=MONS[key];return {...makeMon(p.id,index===2?30:29),boxId:`mission10-ally-${index}`,gender:'M',moves:[...p.moves],item:'',pp:{}};});
 const movesets=[['충전','전기쇼크','파라볼라차지','치근거리기'],['볼부비부비','애교부리기','괴전파','전기자석파']];
 const foes=movesets.map((moves,index)=>({...makeMon(702,30),boxId:`mission10-guard-${index}`,moves:[...moves],pp:{}}));
 return {ally,foes};
}
