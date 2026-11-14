// Z-A recovery percentages. V2 expands the original Recover-only version;
// a saved V1 battle never silently changes its other moves.
const recovery={recover:[3,4],synthesis:[3,4],morningsun:[3,4],moonlight:[3,4],shoreup:[4,6]};
function rates(id,enabled,extended){return enabled===true&&(id==='recover'||extended===true)?recovery[id]:undefined;}
export function adventurePlusEligible(move,enabled,extended,conversion,wishEnabled){return !!move&&(move.category==='Status'?!!rates(move.id,enabled,extended)||enabled===true&&(conversion===true&&move.id==='conversion'||wishEnabled===true&&move.id==='wish'):Number(move.power??move.basePower)>0);}
export function adventurePlusStatusDescription(id,enabled,extended,conversion,drainEffects,wishEnabled,criticalEnabled){if(enabled===true&&criticalEnabled===true&&['fakeout','firstimpression'].includes(id))return '플러스는 명중 시 급소에 맞습니다. 사용 제한과 급소 방지는 유지됩니다.';if(enabled===true&&wishEnabled===true&&id==='wish')return '다음 턴에 현재 자리에 있는 포켓몬이 사용자의 최대 HP의 30%를 회복합니다. 플러스는 40%입니다 (턴제 근사).';if(enabled===true&&drainEffects===true&&id==='dreameater')return '잠든 상대에게 준 피해의 50%를 회복합니다. 플러스는 65%를 회복합니다.';if(enabled===true&&conversion===true&&id==='conversion')return '첫 기술의 타입으로 변합니다. 플러스는 성공 시 방어가 1랭크 오릅니다 (턴제 근사).';const values=rates(id,enabled,extended);return values?`최대 HP의 ${values[0]*10}%를 회복합니다. 플러스는 ${values[1]*10}%를 회복합니다.`:null;}
export function installAdventurePlusStatus(battle,enabled,actorToken,plusId,extended,conversion,attackEffects,waterShuriken,drainEffects,wishEnabled,criticalEnabled){
 if(enabled!==true)return;
 battle.onEvent('ModifyMove',battle.format,{priority:0},function(move,pokemon){
  const plus=pokemon?.species?.isMega||(pokemon?.side===this.p1&&pokemon.set.trainerToken===actorToken&&plusId===move.id);
  // Guaranteed critical remains subject to the simulator's CriticalHit event.
  if(criticalEnabled===true&&plus&&['fakeout','firstimpression'].includes(move.id))move.willCrit=true;
  // Dream Eater Plus restores 65% of damage, versus the simulator's 50%.
  // Opt in per new combat so snapshots already in progress keep their rules.
  if(drainEffects===true&&plus&&move.id==='dreameater')move.drain=[13,20];
  if(waterShuriken===true&&move.id==='watershuriken'){
   move.basePower=plus?75:15;move.basePowerCallback=undefined;move.multihit=plus?undefined:5;
  }
  const chance=attackEffects===true&&plus?({chargebeam:100,scald:50,ancientpower:60,ominouswind:60,silverwind:60})[move.id]:undefined;
  if(chance!==undefined&&move.secondaries?.length===1){move.secondaries=move.secondaries.map(effect=>({...effect,chance}));move.secondary=move.secondaries[0];}
  if(conversion===true&&move.id==='conversion'&&plus){
   const hit=move.onHit;move.onHit=function(target,...args){const result=hit?.call(this,target,...args);if(result===false||result===null)return result;this.boost({def:1},target);return result;};return;
  }
  if(wishEnabled===true&&move.id==='wish'){
   const after=move.onAfterMove;move.onAfterMove=function(user,...args){
    after?.call(this,user,...args);const wish=user?.side?.slotConditions?.[user.position]?.wish;
    if(wish&&wish.source===user&&wish.startingTurn===this.getOverflowedTurnCount())wish.hp=Math.floor(user.maxhp*(plus?4:3)/10);
   };return;
  }
  const values=rates(move.id,enabled,extended);if(!values)return;
  // The simulator implements weather recovery through onHit. Z-A's published
  // percentages are used here independent of weather; see the design notes.
  if(move.id!=='recover')move.onHit=undefined;
  move.heal=[plus?values[1]:values[0],10];
 });
}
