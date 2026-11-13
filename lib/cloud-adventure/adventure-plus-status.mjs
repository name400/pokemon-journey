// Recover: Legends Z-A restores 30% normally and 40% as a Plus move.
// The extra flag is only set on newly started adventure battles.
export function adventurePlusEligible(move,enabled){return !!move&&(move.category==='Status'?enabled===true&&move.id==='recover':Number(move.power??move.basePower)>0);}
export function installAdventurePlusStatus(battle,enabled,actorToken,plusId){
 if(enabled!==true)return;
 battle.onEvent('ModifyMove',battle.format,{priority:0},function(move,pokemon){
  if(move.id!=='recover')return;
  const plus=pokemon?.species?.isMega||(pokemon?.side===this.p1&&pokemon.set.trainerToken===actorToken&&plusId==='recover');
  move.heal=plus?[2,5]:[3,10];
 });
}
