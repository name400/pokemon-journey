import {royaleNightIndex} from './adventure-royale-zones.mjs';

// Card positions and availability are provisional; objectives and rewards:
// https://bulbapedia.bulbagarden.net/wiki/Bonus_card
const LIMITS={Y:3000,X:4000,W:5000,V:6000,F:32000,E:35000,D:38000,C:41000,B:45000};
export const ROYALE_BONUS_CARDS=[
 {id:'super',x:10,y:14,label:'효과가 굉장한 공격',goal:3,points:1000,medals:50},
 {id:'fire',x:8,y:14,label:'불꽃 타입 공격',type:'fire',goal:2,points:200,medals:20},
 {id:'water',x:14,y:14,label:'물 타입 공격',type:'water',goal:2,points:200,medals:20},
];
const cardFor=(s,id)=>id==='super'?s.zaRoyaleBonusCard:s.zaRoyaleBonusExtraCards?.[id];
export function royaleBonusPickable(s,now=Date.now(),id='super'){
 return s?.district==='lumiose-royale'&&!s.interior&&Object.hasOwn(LIMITS,s.zaRoyaleRank||'')&&ROYALE_BONUS_CARDS.some(c=>c.id===id)&&cardFor(s,id)?.night!==royaleNightIndex(s,now);
}
export function takeRoyaleBonus(s,now=Date.now(),id='super'){
 if(!royaleBonusPickable(s,now,id))return false;
 const card={night:royaleNightIndex(s,now),rank:s.zaRoyaleRank,progress:0,completed:false};
 if(id==='super')s.zaRoyaleBonusCard=card;else s.zaRoyaleBonusExtraCards={...s.zaRoyaleBonusExtraCards,[id]:card};
 return true;
}
export function recordRoyaleBonus(s,combat,period,now=Date.now()){
 const rank=s?.zaRoyaleRank,night=royaleNightIndex(s,now);
 if(period!=='night'||s?.district!=='lumiose-royale'||s.trainer?.title!=='Z-A 로열 배틀'||!Object.hasOwn(LIMITS,rank||'')||!Array.isArray(combat?.events))return false;
 const counts={super:0,fire:0,water:0};let actor=null,type=null,superTarget=null,counted=false;
 for(const e of combat.events){
  if(e.kind==='move'){actor=e.side===0?e.actorBoxId:null;type=e.type;superTarget=null;counted=false;}
  else if(actor&&e.kind==='effect'&&e.targetSide===1&&e.text==='효과가 굉장했다!')superTarget=e.targetBoxId;
  else if(actor&&!counted&&e.kind==='damage'&&e.targetSide===1&&e.hit===true&&e.amount>0&&e.actorBoxId===actor){
   if(e.targetBoxId===superTarget)counts.super++;
   if(type==='fire'||type==='water')counts[type]++;
   counted=true;
  }
 }
 let changed=false;
 for(const def of ROYALE_BONUS_CARDS){
  const card=cardFor(s,def.id),count=counts[def.id];
  if(!count||!card||card.night!==night||card.rank!==rank||card.completed===true||!Number.isInteger(card.progress)||card.progress<0||card.progress>=def.goal)continue;
  const progress=Math.min(def.goal,card.progress+count),completed=progress===def.goal,next={...card,progress,completed};
  if(def.id==='super')s.zaRoyaleBonusCard=next;else s.zaRoyaleBonusExtraCards={...s.zaRoyaleBonusExtraCards,[def.id]:next};
  if(completed){const key=`zaRoyale${rank}Points`,value=s[key],medals=s.zaRoyalePrizeMedals;s[key]=Math.min(LIMITS[rank],(Number.isSafeInteger(value)&&value>=0?value:0)+def.points);s.zaRoyalePrizeMedals=Math.min(9999,(Number.isSafeInteger(medals)&&medals>=0?medals:0)+def.medals);combat.log.push(`보너스 카드 완료! 티켓포인트 ${def.points}점 · 상금 메달 ${def.medals}개를 얻었다.`);}
  else combat.log.push(`보너스 카드: ${def.label} ${progress}/${def.goal}.`);
  changed=true;
 }
 return changed;
}
