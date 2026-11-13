import {royaleNightIndex} from './adventure-royale-zones.mjs';

// Card positions and availability are provisional; objectives and rewards:
// https://bulbapedia.bulbagarden.net/wiki/Bonus_card
const LIMITS={Y:3000,X:4000,W:5000,V:6000,F:32000,E:35000,D:38000,C:41000,B:45000,A:50000};
const TYPE_LABELS=[['fire','불꽃'],['water','물'],['grass','풀'],['electric','전기'],['normal','노말'],['fighting','격투'],['flying','비행'],['poison','독'],['ground','땅'],['rock','바위'],['bug','벌레'],['ghost','고스트'],['steel','강철'],['psychic','에스퍼'],['ice','얼음'],['dragon','드래곤'],['dark','악'],['fairy','페어리']];
export const ROYALE_BONUS_CARDS=[
 {id:'super',x:10,y:14,label:'효과가 굉장한 공격',goal:3,points:1000,medals:50},
 ...TYPE_LABELS.map(([id,name],i)=>({id,x:i%2?14:8,y:14,label:`${name} 타입 공격`,type:id,goal:2,points:200,medals:20})),
];
// Card types rotate deterministically once per night; original draws are unknown.
export function royaleBonusCards(s,now=Date.now()){
 const n=royaleNightIndex(s,now),pair=((n%9)+9)%9;
 return [ROYALE_BONUS_CARDS[0],ROYALE_BONUS_CARDS[1+pair*2],ROYALE_BONUS_CARDS[2+pair*2],{...ROYALE_BONUS_CARDS[1+((pair*2+2)%18)],x:11,y:12}];
}
// Original field amounts vary by rank; these fixed low-end amounts and positions
// are a reproducible 2D draft: https://www.serebii.net/legendsz-a/z-aroyale.shtml
export const ROYALE_FIELD_MEDALS=[{id:'northwest',x:2,y:4},{id:'northeast',x:20,y:4},{id:'southeast',x:20,y:14}];
export function royaleFieldMedalAmount(s){const rank=s?.zaRoyaleRank;if(['Z','Y','X','W','V'].includes(rank))return 10;if(['F','E','D','C','B'].includes(rank))return 15;if(rank==='A'&&s?.zaMission39Started)return 20;return 0;}
const fieldMedalKey=(s,id)=>`${typeof s.zaRoyaleReturn==='string'?s.zaRoyaleReturn:'plaza'}:${id}`;
export function royaleFieldMedalPickable(s,id,now=Date.now()){
 const state=s?.zaRoyaleFieldMedals,night=royaleNightIndex(s,now);
 return s?.district==='lumiose-royale'&&!s.interior&&royaleFieldMedalAmount(s)>0&&ROYALE_FIELD_MEDALS.some(m=>m.id===id)&&!(state?.night===night&&Array.isArray(state.keys)&&state.keys.includes(fieldMedalKey(s,id)));
}
function addRoyaleMedals(s,amount,night){
 const old=Number.isSafeInteger(s.zaRoyalePrizeMedals)&&s.zaRoyalePrizeMedals>=0?s.zaRoyalePrizeMedals:0;
 if(old>=9999)return 0;
 if(!Number.isSafeInteger(s.zaRoyaleMedalNight)||(s.zaRoyaleMedalNight!==night&&!old)){s.zaRoyaleMedalNight=night;s.zaRoyaleMedalWins=0;}
 if(s.zaRoyaleMedalNight!==night)return 0;
 const added=Math.min(amount,9999-old);s.zaRoyalePrizeMedals=old+added;return added;
}
export function takeRoyaleFieldMedal(s,id,now=Date.now()){
 if(!royaleFieldMedalPickable(s,id,now))return 0;
 const night=royaleNightIndex(s,now),added=addRoyaleMedals(s,royaleFieldMedalAmount(s),night);if(!added)return 0;
 const prev=s.zaRoyaleFieldMedals,keys=prev?.night===night&&Array.isArray(prev.keys)?prev.keys:[];
 s.zaRoyaleFieldMedals={night,keys:[...keys,fieldMedalKey(s,id)]};return added;
}
const RANK_ORDER='YXWVFEDCBA';
export function royaleBonusRankApplies(cardRank,currentRank){if(typeof cardRank!=='string'||cardRank.length!==1||typeof currentRank!=='string'||currentRank.length!==1)return false;const from=RANK_ORDER.indexOf(cardRank),to=RANK_ORDER.indexOf(currentRank);return from>=0&&to>=from;}
const cardFor=(s,id)=>id==='super'?s?.zaRoyaleBonusCard:s?.zaRoyaleBonusExtraCards?.[id];
export function activeRoyaleBonusCards(s,now=Date.now()){
 const night=royaleNightIndex(s,now);
 return ROYALE_BONUS_CARDS.filter(def=>{const c=cardFor(s,def.id);return c?.night===night&&c.completed!==true&&Number.isInteger(c.progress)&&c.progress>=0&&c.progress<def.goal&&royaleBonusRankApplies(c.rank,s?.zaRoyaleRank);});
}
export function royaleBonusOfferable(s,now=Date.now(),id='super'){
 const night=royaleNightIndex(s,now);
 return s?.district==='lumiose-royale'&&!s.interior&&Object.hasOwn(LIMITS,s.zaRoyaleRank||'')&&(s.zaRoyaleRank!=='A'||s.zaMission39Started===true)&&royaleBonusCards(s,now).some(c=>c.id===id)&&cardFor(s,id)?.night!==night;
}
export function royaleBonusPickable(s,now=Date.now(),id='super'){
 return royaleBonusOfferable(s,now,id)&&activeRoyaleBonusCards(s,now).length<3;
}
export function takeRoyaleBonus(s,now=Date.now(),id='super',replaceId=null){
 if(!royaleBonusOfferable(s,now,id))return false;
 const active=activeRoyaleBonusCards(s,now);
 if(active.length>=3){if(active.length!==3||!active.some(c=>c.id===replaceId))return false;const old=cardFor(s,replaceId),discarded={...old,completed:true,discarded:true};if(replaceId==='super')s.zaRoyaleBonusCard=discarded;else s.zaRoyaleBonusExtraCards={...s.zaRoyaleBonusExtraCards,[replaceId]:discarded};}
 else if(replaceId!==null)return false;
 const card={night:royaleNightIndex(s,now),rank:s.zaRoyaleRank,progress:0,completed:false};
 if(id==='super')s.zaRoyaleBonusCard=card;else s.zaRoyaleBonusExtraCards={...s.zaRoyaleBonusExtraCards,[id]:card};
 return true;
}
export function recordRoyaleBonus(s,combat,period,now=Date.now()){
 const rank=s?.zaRoyaleRank,night=royaleNightIndex(s,now);
 if(period!=='night'||s?.district!=='lumiose-royale'||(rank==='A'?s.trainer?.title!=='무한 로열 배틀존'||s.zaMission39Started!==true:s.trainer?.title!=='Z-A 로열 배틀')||!Object.hasOwn(LIMITS,rank||'')||!Array.isArray(combat?.events))return false;
 const counts=Object.fromEntries(ROYALE_BONUS_CARDS.map(c=>[c.id,0]));let actor=null,type=null,superTarget=null,counted=false;
 for(const e of combat.events){
  if(e.kind==='move'){actor=e.side===0?e.actorBoxId:null;type=e.type;superTarget=null;counted=false;}
  else if(actor&&e.kind==='effect'&&e.targetSide===1&&e.text==='효과가 굉장했다!')superTarget=e.targetBoxId;
  else if(actor&&!counted&&e.kind==='damage'&&e.targetSide===1&&e.hit===true&&e.amount>0&&e.actorBoxId===actor){
   if(e.targetBoxId===superTarget)counts.super++;
   if(type!=='super'&&Object.hasOwn(counts,type))counts[type]++;
   counted=true;
  }
 }
 let changed=false;
 for(const def of ROYALE_BONUS_CARDS){
  const card=cardFor(s,def.id),count=counts[def.id];
  if(!count||!card||card.night!==night||!royaleBonusRankApplies(card.rank,rank)||card.completed===true||!Number.isInteger(card.progress)||card.progress<0||card.progress>=def.goal)continue;
  const progress=Math.min(def.goal,card.progress+count),completed=progress===def.goal,next={...card,progress,completed};
  if(def.id==='super')s.zaRoyaleBonusCard=next;else s.zaRoyaleBonusExtraCards={...s.zaRoyaleBonusExtraCards,[def.id]:next};
  if(completed){if(!Number.isSafeInteger(s.zaRoyaleMedalNight)||(s.zaRoyaleMedalNight!==night&&!(s.zaRoyalePrizeMedals>0))){s.zaRoyaleMedalNight=night;s.zaRoyaleMedalWins=0;}const key=rank==='A'?'zaInfinitePoints':`zaRoyale${rank}Points`,value=s[key],medals=s.zaRoyalePrizeMedals;s[key]=Math.min(LIMITS[rank],(Number.isSafeInteger(value)&&value>=0?value:0)+def.points);s.zaRoyalePrizeMedals=Math.min(9999,(Number.isSafeInteger(medals)&&medals>=0?medals:0)+def.medals);combat.log.push(`보너스 카드 완료! 티켓포인트 ${def.points}점 · 상금 메달 ${def.medals}개를 얻었다.`);}
  else combat.log.push(`보너스 카드: ${def.label} ${progress}/${def.goal}.`);
  changed=true;
 }
 return changed;
}

// Settlement is applied only by a revision-guarded world + wallet transaction.
export function royaleMedalSettlement(s,period,now=Date.now(),goldLevel=0){
 const medals=s?.zaRoyalePrizeMedals,night=royaleNightIndex(s,now),stored=s?.zaRoyaleMedalNight;
 if(s?.combat||s?.adventureCatchWindow||!Number.isSafeInteger(medals)||medals<=0||medals>9999||!['day','night'].includes(period))return 0;
 if(period==='night'&&(!Number.isSafeInteger(stored)||stored>=night))return 0;
 const wins=Number.isSafeInteger(s.zaRoyaleMedalWins)&&s.zaRoyaleMedalWins>=0?s.zaRoyaleMedalWins:0;
 const multiplier=wins>=30?30:wins>=20?25:wins>=10?20:wins>=5?15:10;
 const gold=[1000,1150,1299,1500][Number.isInteger(goldLevel)&&goldLevel>=1&&goldLevel<=3?goldLevel:0];
 const reward=Math.floor(medals*multiplier*gold/1000);
 s.zaRoyalePrizeMedals=0;delete s.zaRoyaleMedalNight;s.zaRoyaleMedalWins=0;s.zaRoyaleMedalTrainerIds=[];
 s.log=[...(Array.isArray(s.log)?s.log:[]),`상금 메달 ${medals}개를 ${reward}코인으로 정산했다.`];
 return reward;
}
export function recordRoyaleMedalBattle(s,combat,trainer,now=Date.now()){
 if(s?.district!=='lumiose-royale'||!['Z-A 로열 배틀','무한 로열 배틀존'].includes(trainer?.title)||combat?.ended!==true||![0,1].includes(combat.winner))return;
 const night=royaleNightIndex(s,now);
 if(!Number.isSafeInteger(s.zaRoyaleMedalNight)||(s.zaRoyaleMedalNight!==night&&!(s.zaRoyalePrizeMedals>0))){s.zaRoyaleMedalNight=night;s.zaRoyaleMedalWins=0;s.zaRoyaleMedalTrainerIds=[];}
 if(s.zaRoyaleMedalNight!==night)return;
 if(combat.winner===0){
  // The original's full per-rank table is not confirmed. The Z-rank examples
  // are 40 for one opponent and 50 for two; higher counts/ranks are draft.
  const ids=Array.isArray(s.zaRoyaleMedalTrainerIds)?s.zaRoyaleMedalTrainerIds:[],key=`${typeof s.zaRoyaleReturn==='string'?s.zaRoyaleReturn:'plaza'}:${trainer.id||''}`;
  if(!trainer.id||ids.includes(key))return;
  s.zaRoyaleMedalTrainerIds=[...ids,key];s.zaRoyaleMedalWins=Math.min(30,(Number.isSafeInteger(s.zaRoyaleMedalWins)&&s.zaRoyaleMedalWins>=0?s.zaRoyaleMedalWins:0)+1);
  const size=Array.isArray(combat.teams?.[1])?combat.teams[1].length:0;
  if(size>0){const added=addRoyaleMedals(s,40+10*(Math.min(6,size)-1),night);if(added&&Array.isArray(combat.log))combat.log.push(`상금 메달 ${added}개를 얻었다. (수량 초안)`);}
 }
 else if(Number.isSafeInteger(s.zaRoyalePrizeMedals)&&s.zaRoyalePrizeMedals>0)s.zaRoyalePrizeMedals=Math.floor(s.zaRoyalePrizeMedals/2);
}
