// Z-A recovery percentages. V2 expands the original Recover-only version;
// a saved V1 battle never silently changes its other moves.
const recovery={recover:[3,4],synthesis:[3,4],morningsun:[3,4],moonlight:[3,4],shoreup:[4,6]};
function rates(id,enabled,extended){return enabled===true&&(id==='recover'||extended===true)?recovery[id]:undefined;}
export function adventurePlusEligible(move,enabled,extended,conversion){return !!move&&(move.category==='Status'?!!rates(move.id,enabled,extended)||enabled===true&&conversion===true&&move.id==='conversion':Number(move.power??move.basePower)>0);}
export function adventurePlusStatusDescription(id,enabled,extended,conversion){if(enabled===true&&conversion===true&&id==='conversion')return '첫 기술의 타입으로 변합니다. 플러스는 성공 시 방어가 1랭크 오릅니다 (턴제 근사).';const values=rates(id,enabled,extended);return values?`최대 HP의 ${values[0]*10}%를 회복합니다. 플러스는 ${values[1]*10}%를 회복합니다.`:null;}
export function installAdventurePlusStatus(battle,enabled,actorToken,plusId,extended,conversion){
 if(enabled!==true)return;
 battle.onEvent('ModifyMove',battle.format,{priority:0},function(move,pokemon){
  const plus=pokemon?.species?.isMega||(pokemon?.side===this.p1&&pokemon.set.trainerToken===actorToken&&plusId===move.id);
  if(conversion===true&&move.id==='conversion'&&plus){
   const hit=move.onHit;move.onHit=function(target,...args){const result=hit?.call(this,target,...args);if(result===false||result===null)return result;this.boost({def:1},target);return result;};return;
  }
  const values=rates(move.id,enabled,extended);if(!values)return;
  // The simulator implements weather recovery through onHit. Z-A's published
  // percentages are used here independent of weather; see the design notes.
  if(move.id!=='recover')move.onHit=undefined;
  move.heal=[plus?values[1]:values[0],10];
 });
}
