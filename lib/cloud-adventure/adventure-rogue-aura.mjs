// Only explicitly identified targets in newly created adventure snapshots.
// Z-A mechanic research: https://www.smogon.com/forums/threads/legends-z-a-mechanics-research.3772579/page-4
export function installAdventureRogueAura(battle,aura,actorToken,plusId,weakness){
 const targets=Array.isArray(aura?.targets)?new Set(aura.targets):null;
 const weaknessTargets=Array.isArray(weakness?.targets)?new Set(weakness.targets):null;
 if(!targets?.size&&!weaknessTargets?.size)return;
 battle.onEvent('ModifyDamage',battle.format,{priority:0},function(damage,source,target,move){
  if(!source||!target||!move||move.category==='Status')return;
  const token=target.set.trainerToken;
  // The simulator has already calculated per-hit effectiveness, including
  // type changes and move-specific rules. Never recompute with side effects.
  if(weaknessTargets?.has(token)&&target.getMoveHitData(move)?.typeMod>=2)this.chainModify([2580,4096]);
  if(!targets?.has(token))return;
  const selected=source.side===this.p1&&source.set.trainerToken===actorToken&&plusId===move.id;
  if(!selected&&!source.species?.isMega)this.chainModify([1229,4096]);
 });
}
