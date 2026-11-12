import {makeMon} from '../game.mjs';

// https://bulbapedia.bulbagarden.net/wiki/Emma
// https://bulbapedia.bulbagarden.net/wiki/Griselle
const TRAINERS={
 emma:[
  [181,57,'F',['번개','파워젬','용의파동','빛의장막']],
  [303,57,'F',['치근거리기','폭발펀치','깨물어부수기','아이언헤드']],
  [428,57,'F',['불꽃펀치','냉동펀치','번개펀치','그로우펀치']],
  [448,57,'F',['파동탄','러스터캐논','사이코키네시스','명상']],
  [687,58,'M',['독찌르기','깜짝베기','사이코커터','베어가르기'],'malamarite'],
 ],
 griselle:[
  [663,59,'F',['플레어드라이브','강철날개','전광석화','유턴']],
  [323,59,'F',['지진','분연','스톤샤워','방어']],
  [142,60,'F',['스톤에지','아이언헤드','깨물어부수기','번개엄니']],
  [376,60,'',['불릿펀치','사이코커터','세차게휘두르기','냉동펀치']],
  [668,61,'M',['화염방사','대지의힘','하이퍼보이스','바크아웃'],'pyroarite'],
 ],
};
export function mission35TrainerTeam(key){
 if(!Object.hasOwn(TRAINERS,key))throw Error('상대를 확인하세요.');
 return TRAINERS[key].map(([species,level,gender,moves,item],index)=>({...makeMon(species,level),boxId:`npc-mission35-${key}-${index}`,...(gender?{gender}:{}),moves:[...moves],item:item||'',pp:{}}));
}
