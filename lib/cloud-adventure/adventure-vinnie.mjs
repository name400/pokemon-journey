import {makeMon} from '../game.mjs';

// https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Legends:_Z-A/Part_10
export function vinnieTeam(){
 const data=[
  {id:229,level:30,moves:['불꽃엄니','회오리불꽃','물기','울부짖기']},
  {id:319,level:30,moves:['바다회오리','아쿠아제트','깜짝베기','베어가르기']},
  {id:427,level:30,moves:['애교부리기','전광석화','드레인키스','세차게휘두르기']},
  {id:780,level:32,moves:['신비의부적','얼어붙은바람','회오리','뱀눈초리'],item:'drampanite'},
 ];
 return data.map((p,i)=>({...makeMon(p.id,p.level),boxId:`mission10-vinnie-${i}`,gender:'M',moves:[...p.moves],item:p.item||'',pp:{}}));
}
