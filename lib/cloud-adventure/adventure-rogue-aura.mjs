// Only explicitly identified Rogue Mega targets in new adventure snapshots.
// Original reports indicate non-Plus damage is reduced to about 30%.
export function installAdventureRogueAura(battle,aura,actorToken,plusId){
 const targets=Array.isArray(aura?.targets)?new Set(aura.targets):null;if(!targets?.size)return;
 battle.onEvent('ModifyDamage',battle.format,{priority:0},function(damage,source,target,move){
  if(!source||!target||!move||move.category==='Status'||!targets.has(target.set.trainerToken))return;
  const selected=source.side===this.p1&&source.set.trainerToken===actorToken&&plusId===move.id;
  if(selected||source.species?.isMega)return;
  this.chainModify([1229,4096]);
 });
}
