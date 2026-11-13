// Z-A recovery percentages. V2 expands the original Recover-only version;
// a saved V1 battle never silently changes its other moves.
const recovery={recover:[3,4],synthesis:[3,4],morningsun:[3,4],moonlight:[3,4],shoreup:[4,6]};
function rates(id,enabled,extended){return enabled===true&&(id==='recover'||extended===true)?recovery[id]:undefined;}
export function adventurePlusEligible(move,enabled,extended){return !!move&&(move.category==='Status'?!!rates(move.id,enabled,extended):Number(move.power??move.basePower)>0);}
export function adventurePlusStatusDescription(id,enabled,extended){const values=rates(id,enabled,extended);return values?`최대 HP의 ${values[0]*10}%를 회복합니다. 플러스는 ${values[1]*10}%를 회복합니다.`:null;}
export function installAdventurePlusStatus(battle,enabled,actorToken,plusId,extended){
 if(enabled!==true)return;
 battle.onEvent('ModifyMove',battle.format,{priority:0},function(move,pokemon){
  const values=rates(move.id,enabled,extended);if(!values)return;
  const plus=pokemon?.species?.isMega||(pokemon?.side===this.p1&&pokemon.set.trainerToken===actorToken&&plusId===move.id);
  // The simulator implements weather recovery through onHit. Z-A's published
  // percentages are used here independent of weather; see the design notes.
  if(move.id!=='recover')move.onHit=undefined;
  move.heal=[plus?values[1]:values[0],10];
 });
}
