// Isolated transaction preparation. This is intentionally not exposed by the
// reward API until evolution, challenge and unsplice flows support fusion.
import {previewClassicDnaFusion} from './rogue-dna-fusion.mjs';
import {transferClassicModifier} from './rogue-classic-rewards.mjs';
import {queueClassicMoves} from './rogue-classic-growth.mjs';

export function stageClassicDnaFusion(run,{primaryBoxId,donorBoxId,random}={}){
 if(!run||run.screen!=='reward'||!Array.isArray(run.party)||!Array.isArray(run.modifiers)||run.pendingMoves?.length||run.pendingGrowth?.length||run.pendingEvolution||run.pendingCapture||run.challenges?.length)throw Error('융합을 준비할 수 없는 진행 상태입니다.');
 if(typeof primaryBoxId!=='string'||typeof donorBoxId!=='string'||primaryBoxId===donorBoxId||new Set(run.party.map(p=>p.boxId)).size!==run.party.length)throw Error('서로 다른 두 파티원을 선택하세요.');
 const originalPrimary=run.party.find(p=>p.boxId===primaryBoxId),originalDonor=run.party.find(p=>p.boxId===donorBoxId);
 if(!originalPrimary||!originalDonor)throw Error('파티원을 찾을 수 없습니다.');
 if(run.formItems?.[donorBoxId]?.length)throw Error('두 번째 포켓몬의 폼 도구는 아직 이전할 수 없습니다.');
 const staged=structuredClone(run),primary=staged.party.find(p=>p.boxId===primaryBoxId),donor=staged.party.find(p=>p.boxId===donorBoxId);
 // Validate every transfer on the copy. Conflicting or unsupported effects
 // abort the whole transaction instead of discarding the donor's inventory.
 for(const item of [...staged.modifiers.filter(m=>m.boxId===donorBoxId)]){
  if(Object.keys(item).some(key=>!['id','boxId','typeBoost','count'].includes(key)))throw Error('특수 속성이 있는 도구는 아직 이전할 수 없습니다.');
  transferClassicModifier(staged,{fromBoxId:donorBoxId,toBoxId:primaryBoxId,id:item.id,typeBoost:item.typeBoost||null,quantity:item.count,kind:'modifier'});
 }
 if(donor.item)transferClassicModifier(staged,{fromBoxId:donorBoxId,toBoxId:primaryBoxId,id:donor.item,quantity:1,kind:'native'});
 if(staged.modifiers.some(m=>m.boxId===donorBoxId)||donor.item)throw Error('두 번째 포켓몬의 도구를 모두 보존할 수 없습니다.');
 const result=previewClassicDnaFusion(primary,donor,{...(random?{random}:{})});
 result.fused.rogueFusion.donor=structuredClone(originalDonor);
 result.fused.pauseEvolutions=!!(originalPrimary.pauseEvolutions||originalDonor.pauseEvolutions);
 staged.party=staged.party.filter(p=>p.boxId!==donorBoxId).map(p=>p.boxId===primaryBoxId?result.fused:p);
 if(staged.formItems)delete staged.formItems[donorBoxId];
 queueClassicMoves(staged,result.fused,result.offeredMoves);
 return {run:staged,donorConsumed:true,pendingMoves:structuredClone(staged.pendingMoves||[])};
}
