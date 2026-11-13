import {royaleNightIndex} from './adventure-royale-zones.mjs';

// One documented card; availability, placement and rank scaling are a draft.
// https://bulbapedia.bulbagarden.net/wiki/Bonus_card
const LIMITS={Y:3000,X:4000,W:5000,V:6000,F:32000,E:35000,D:38000,C:41000,B:45000};
export function royaleBonusPickable(s,now=Date.now()){
 return s?.district==='lumiose-royale'&&!s.interior&&Object.hasOwn(LIMITS,s.zaRoyaleRank||'')&&s.zaRoyaleBonusCard?.night!==royaleNightIndex(s,now);
}
export function takeRoyaleBonus(s,now=Date.now()){
 if(!royaleBonusPickable(s,now))return false;
 s.zaRoyaleBonusCard={night:royaleNightIndex(s,now),rank:s.zaRoyaleRank,progress:0,completed:false};return true;
}
export function recordRoyaleBonus(s,combat,period,now=Date.now()){
 const card=s?.zaRoyaleBonusCard,rank=s?.zaRoyaleRank;
 if(period!=='night'||s.district!=='lumiose-royale'||s.trainer?.title!=='Z-A 로열 배틀'||!card||card.night!==royaleNightIndex(s,now)||card.rank!==rank||!Object.hasOwn(LIMITS,rank||'')||card.completed===true||!Number.isInteger(card.progress)||card.progress<0||card.progress>=3||!Array.isArray(combat?.events))return false;
 let actor=null,superTarget=null,counted=false,count=0;
 for(const e of combat.events){
  if(e.kind==='move'){actor=e.side===0?e.actorBoxId:null;superTarget=null;counted=false;}
  else if(actor&&e.kind==='effect'&&e.targetSide===1&&e.text==='효과가 굉장했다!')superTarget=e.targetBoxId;
  else if(actor&&!counted&&e.kind==='damage'&&e.targetSide===1&&e.hit===true&&e.amount>0&&e.actorBoxId===actor&&e.targetBoxId===superTarget){count++;counted=true;}
 }
 if(!count)return false;
 const progress=Math.min(3,card.progress+count),completed=progress===3;s.zaRoyaleBonusCard={...card,progress,completed};
 if(completed){const key=`zaRoyale${rank}Points`,value=s[key];s[key]=Math.min(LIMITS[rank],(Number.isSafeInteger(value)&&value>=0?value:0)+1000);combat.log.push('보너스 카드 완료! 티켓포인트 1000점을 얻었다.');}
 else combat.log.push(`보너스 카드: 효과가 굉장한 공격 ${progress}/3.`);
 return true;
}
