export type BattleMoveTarget={side:number;index:number;slot:number;name:string;target?:number};
export type BattleMove={id:string;name:string;pp:number;maxPp:number;target?:string;targets?:BattleMoveTarget[];disabled?:boolean;type?:string;typeKey?:string;power?:number;accuracy?:number|boolean;category?:string;effectiveness?:number|null};
export type BattleActor={slot:number;kind:string;active:number;moves?:BattleMove[];switches?:Array<{slot:number;index:number;name?:string}>;specials?:Array<{key:string;label:string}>;teraType?:string};
export type BattleTurnAction={actor:number;type:'move';move:string;target?:number;special?:string}|{actor:number;type:'switch';slot:number};
export function hasMultiBattleDTO(battle:any):boolean{return Array.isArray(battle.requests?.[0]?.actors)&&battle.requests[0].actors.length>0&&Array.isArray(battle.activeBySide)&&battle.activeBySide.length===2&&battle.activeBySide.every((indices:unknown)=>Array.isArray(indices))&&battle.activeBySide.some((indices:number[])=>indices.length>1);}
export function signedBattleTarget(target:BattleMoveTarget,side:number):number{return Number.isInteger(target.target)&&target.target!==0?target.target!:(target.side===side?-1:1)*(target.slot+1);}
export function selectableBattleTargets(move:BattleMove):BattleMoveTarget[]{return !move.target||['normal','adjacentFoe','adjacentAlly','adjacentAllyOrSelf','any'].includes(move.target)?move.targets||[]:[];}
export function buildBattleTurnCommand(actors:readonly BattleActor[],drafts:Record<number,BattleTurnAction>,side=0):{command:{type:'turn';actions:BattleTurnAction[]}|null;error:string|null}{
  const required=actors.filter(actor=>actor.kind==='move'||actor.kind==='switch'),actions:BattleTurnAction[]=[],switched=new Set<number>();
  if(required.filter(actor=>{const action=drafts[actor.slot];return action?.type==='move'&&action.special==='terastallize';}).length>1)return {command:null,error:'한 턴에는 한 마리만 테라스탈할 수 있습니다.'};
  if(!required.length)return {command:null,error:'지금 선택할 행동이 없습니다.'};
  for(const actor of required){const action=drafts[actor.slot];if(!action)return {command:null,error:`${actor.slot+1}번 포켓몬의 행동을 선택하세요.`};
    if(action.type==='switch'){if(!actor.switches?.some(option=>option.slot===action.slot))return {command:null,error:'교체할 수 있는 포켓몬을 선택하세요.'};if(switched.has(action.slot))return {command:null,error:'두 포켓몬이 같은 파티 자리로 교체할 수 없습니다.'};switched.add(action.slot);actions.push({...action,actor:actor.slot});continue;}
    const move=actor.moves?.find(move=>move.id===action.move);if(actor.kind!=='move'||!move||move.disabled||move.pp<=0)return {command:null,error:'사용 가능한 기술을 선택하세요.'};
    if(action.special&&!actor.specials?.some(special=>special.key===action.special))return {command:null,error:'사용 가능한 특수 변화를 선택하세요.'};
    const targets=selectableBattleTargets(move);if(targets.length&&!targets.some(target=>signedBattleTarget(target,side)===action.target))return {command:null,error:'기술을 사용할 대상을 선택하세요.'};
    actions.push({...action,actor:actor.slot});
  }return {command:{type:'turn',actions},error:null};
}
export function battleScenePosition(own:boolean,slot:number,multiple:boolean){return multiple?own?{x:slot===1?39:17,y:slot===1?85:94,impactY:slot===1?69:78}:{x:slot===1?84:63,y:slot===1?51:61,impactY:slot===1?37:47}:own?{x:24.6,y:89.6,impactY:72}:{x:73.1,y:60.4,impactY:42};}

function effectivenessText(value:unknown){const n=Number(value);return !Number.isFinite(n)?'상성 정보 없음':n===0?'효과 없음 ×0':n>1?`굉장함 ×${n}`:n<1?`반감 ×${n}`:'보통 ×1';}
export function impactLabel(m:any){if(String(m.category||'').toLowerCase()==='status'){if(Array.isArray(m.effectivenessByTarget)&&m.effectivenessByTarget.length>1&&m.effectivenessByTarget.some((target:any)=>target.multiplier===0))return m.effectivenessByTarget.map((target:any)=>`상대${target.slot+1} ${target.multiplier===0?'효과 없음':'변화 기술'}`).join(' · ');return m.effectiveness===0?'효과 없음 ×0':'변화 기술';}if(Array.isArray(m.effectivenessByTarget)&&m.effectivenessByTarget.length>1)return m.effectivenessByTarget.map((target:any)=>`상대${target.slot+1} ${target.multiplier==null?'상성 정보 없음':effectivenessText(target.multiplier)}`).join(' · ');return m.effectiveness==null?'상성 정보 없음':effectivenessText(m.effectiveness);}

export function battleTransformation(mon:any){return {tera:typeof mon?.terastallized==='string'?mon.terastallized.toLowerCase():null,giant:mon?.dynamaxed===true||mon?.gigantamax===true,gmax:mon?.gigantamax===true,mega:mon?.mega===true,primal:mon?.primal===true,ultra:mon?.ultra===true};}

export function hasDifferentBattleForm(mon:any){if(mon?.rogueSourceId==null||!mon.battleAppearance)return false;if(mon.rogueBaseBattleAppearance)return mon.battleAppearance!==mon.rogueBaseBattleAppearance;return !!(mon.mega||mon.primal||mon.ultra||mon.gigantamax)&&mon.battleAppearance!==mon.rogueBattleSpecies;}
