// Protect and Detect share the simulator's `protect` volatile. Opt-in only:
// the simulator applies 25% after normal Plus damage and retains protection.
export function installAdventurePlusProtect(battle,enabled,actorToken,plusId){
 if(enabled!==true)return;
 battle.onEvent('HitProtect',battle.format,{priority:0},function(source,target,move){
  if(!source||!target?.volatiles?.protect||!move||move.category==='Status'||!move.flags?.protect||move.breaksProtect)return;
  const selected=source.side===this.p1&&source.set.trainerToken===actorToken&&plusId===move.id;
  if(!selected&&!source.species?.isMega)return;
  target.getMoveHitData(move).bypassProtect=true;
  return false;
 });
}
