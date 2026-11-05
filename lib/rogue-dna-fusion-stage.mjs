import {classicPreventRevive} from './rogue-challenge-rules.mjs';
// Isolated transaction preparation. This is intentionally not exposed by the
// reward API until evolution, challenge and unsplice flows support fusion.
import {previewClassicDnaFusion,validatedClassicDnaFusion} from './rogue-dna-fusion.mjs';
import {transferClassicModifier} from './rogue-classic-rewards.mjs';
import {queueClassicMoves} from './rogue-classic-growth.mjs';
import {classicChallengeBattleEligibility} from './rogue-challenge-eligibility.mjs';
import {configure,statKeys} from './pokemon-config.mjs';

export function stageClassicDnaFusion(run,{primaryBoxId,donorBoxId,random}={}){
 if(!run||run.screen!=='reward'||!Array.isArray(run.party)||!Array.isArray(run.modifiers)||run.pendingMoves?.length||run.pendingGrowth?.length||run.pendingEvolution||run.pendingCapture||run.challenges?.length&&run.challengeEligibilityRule!=='source-subset-v1')throw Error('융합을 준비할 수 없는 진행 상태입니다.');
 if(typeof primaryBoxId!=='string'||typeof donorBoxId!=='string'||primaryBoxId===donorBoxId||new Set(run.party.map(p=>p.boxId)).size!==run.party.length)throw Error('서로 다른 두 파티원을 선택하세요.');
 const originalPrimary=run.party.find(p=>p.boxId===primaryBoxId),originalDonor=run.party.find(p=>p.boxId===donorBoxId);
 if(!originalPrimary||!originalDonor)throw Error('파티원을 찾을 수 없습니다.');
 if(classicPreventRevive(run)&&(originalPrimary.hp<=0||originalDonor.hp<=0))throw Error('영구 기절 챌린지에서는 쓰러진 포켓몬을 융합할 수 없습니다.');
 if(run.formItems?.[donorBoxId]?.length)throw Error('두 번째 포켓몬의 폼 도구는 아직 이전할 수 없습니다.');
 const staged=structuredClone(run),primary=staged.party.find(p=>p.boxId===primaryBoxId),donor=staged.party.find(p=>p.boxId===donorBoxId);
 for(const member of [primary,donor]){const dew=staged.modifiers.filter(m=>m.boxId===member.boxId&&m.id==='souldew');if(dew.length>1||dew.some(m=>!Number.isSafeInteger(m.count)||m.count<1)||(member.rogueNatureDewCount||0)!==(dew[0]?.count||0))throw Error('성격 강화 도구 정보를 확인하세요.');}
 // Validate every transfer on the copy. Conflicting or unsupported effects
 // abort the whole transaction instead of discarding the donor's inventory.
 const vitamins=[];
 for(const item of [...staged.modifiers.filter(m=>m.boxId===donorBoxId)]){
  if(item.id==='basestatbooster'){
   if(Object.keys(item).some(key=>!['id','boxId','typeBoost','count','stat','transferable'].includes(key))||!statKeys.includes(item.stat)||item.typeBoost!=null||item.transferable!==false||!Number.isSafeInteger(item.count)||item.count<1)throw Error('능력 강화 도구를 확인하세요.');
   const from=staged.modifiers.filter(m=>m.boxId===donorBoxId&&m.id===item.id&&m.stat===item.stat),to=staged.modifiers.filter(m=>m.boxId===primaryBoxId&&m.id===item.id&&m.stat===item.stat),owned=to[0]?.count||0;
   if(from.length!==1||to.length>1||to.some(m=>Object.keys(m).some(key=>!['id','boxId','typeBoost','count','stat','transferable'].includes(key))||m.typeBoost!=null||m.transferable!==false)||!Number.isSafeInteger(owned)||owned<0||(donor.rogueBaseBoosts?.[item.stat]||0)!==item.count||(primary.rogueBaseBoosts?.[item.stat]||0)!==owned||!Number.isInteger(primary.ivs?.[item.stat])||owned+item.count>primary.ivs[item.stat])throw Error('능력 강화 도구를 모두 보존할 수 없습니다.');
   vitamins.push({item,owned});continue;
  }
  if(Object.keys(item).some(key=>!['id','boxId','typeBoost','count'].includes(key)))throw Error('특수 속성이 있는 도구는 아직 이전할 수 없습니다.');
  transferClassicModifier(staged,{fromBoxId:donorBoxId,toBoxId:primaryBoxId,id:item.id,typeBoost:item.typeBoost||null,quantity:item.count,kind:'modifier'});
 }
 if(donor.rogueMachoBraceCount||donor.rogueOldGateau||donor.rogueJuiceMods?.length||donor.rogueNatureDewCount||Object.entries(donor.rogueBaseBoosts||{}).some(([stat,count])=>!statKeys.includes(stat)||!Number.isSafeInteger(count)||count<0||count!==vitamins.filter(v=>v.item.stat===stat).reduce((n,v)=>n+v.item.count,0)))throw Error('두 번째 포켓몬의 특수 효과를 모두 보존할 수 없습니다.');
 if(donor.item)transferClassicModifier(staged,{fromBoxId:donorBoxId,toBoxId:primaryBoxId,id:donor.item,quantity:1,kind:'native'});
 if(staged.modifiers.some(m=>m.boxId===donorBoxId&&m.id!=='basestatbooster')||donor.item)throw Error('두 번째 포켓몬의 도구를 모두 보존할 수 없습니다.');
 const result=previewClassicDnaFusion(primary,donor,{allowDonorForm:donor.rogueSourceId===744&&donor.rogueFormKey==='own-tempo'||donor.rogueSourceId===854&&donor.rogueFormKey==='antique',...(random?{random}:{})});
 result.fused.rogueFusion.donor=structuredClone(originalDonor);
 if(!validatedClassicDnaFusion(result.fused))throw Error('이 포켓몬 조합은 아직 지원하지 않습니다.');
 if(vitamins.length){
  const before=result.fused,boosts={...(before.rogueBaseBoosts||{})};for(const {item,owned} of vitamins){boosts[item.stat]=owned+item.count;const target=staged.modifiers.find(m=>m.boxId===primaryBoxId&&m.id===item.id&&m.stat===item.stat);if(target)target.count+=item.count;else staged.modifiers.push({...item,boxId:primaryBoxId});}
  const next=configure({...before,rogueBaseBoosts:boosts},{hp:before.hp});next.hp=before.hp>0?Math.min(next.maxHp,before.hp+Math.max(0,next.maxHp-before.maxHp)):0;result.fused=next;staged.modifiers=staged.modifiers.filter(m=>m.boxId!==donorBoxId||m.id!=='basestatbooster');
 }
 result.fused.pauseEvolutions=!!(originalPrimary.pauseEvolutions||originalDonor.pauseEvolutions);
 staged.party=staged.party.filter(p=>p.boxId!==donorBoxId).map(p=>p.boxId===primaryBoxId?result.fused:p);
 if(!staged.party.some(p=>p.hp>0))throw Error('융합 후 싸울 수 있는 포켓몬이 없습니다.');
 if(staged.challengeEligibilityRule==='source-subset-v1'){const checks=staged.party.map(p=>classicChallengeBattleEligibility(p,staged.challenges));if(checks.includes(null)||!checks.includes(true))throw Error('융합 후 챌린지에 출전할 포켓몬이 없습니다.');}
 if(staged.formItems)delete staged.formItems[donorBoxId];
 queueClassicMoves(staged,result.fused,result.offeredMoves);staged.unspliceFreshBattle=true;
 return {run:staged,donorConsumed:true,pendingMoves:structuredClone(staged.pendingMoves||[])};
}
