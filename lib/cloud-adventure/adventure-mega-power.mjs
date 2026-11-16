// ZA's real-time Mega Power is adapted to three completed active turns.
// This opt-in state never retrofits an in-progress battle or persistent box row.
export const ADVENTURE_MEGA_TURNS=3;
export function installAdventureMegaPower(battle,combat){
 if(combat?.adventureMegaPowerV1?.version!==1)return null;
 const state=structuredClone(combat.adventureMegaPowerV1);
 if(!state.trainers||typeof state.trainers!=='object'||Array.isArray(state.trainers))throw Error('메가파워 저장을 확인하세요.');
 const triple=combat.format==='mission37-triples-prototype-v1',ownership=triple?[combat.owners?.player,combat.owners?.first,combat.owners?.second]:null;
 if(triple&&ownership.some(ids=>!Array.isArray(ids)||!ids.length))throw Error('메가파워 소유권을 확인하세요.');
 const owner=p=>triple&&p.side===battle.p1?`p1:${ownership.findIndex(ids=>ids.includes(p.set.trainerToken))}`:p.side.id;
 const playerOwner=triple?'p1:0':'p1',groups=new Map();
 for(const side of battle.sides)for(const p of side.pokemon){const key=owner(p);if(key==='p1:-1')throw Error('메가파워 소유권을 확인하세요.');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(p);}
 const transformed=new Set(),identity=p=>`${owner(p)}:${p.set.trainerToken}`;
 for(const [key,team] of groups){
  const saved=state.trainers[key]??={charge:3,active:null};
  if(!Number.isInteger(saved.charge)||saved.charge<0||saved.charge>3)throw Error('메가파워 충전 상태를 확인하세요.');
  if(saved.active){const a=saved.active;if(!team.some(p=>p.set.trainerToken===a.token)||!Number.isInteger(a.remaining)||a.remaining<1||a.remaining>ADVENTURE_MEGA_TURNS||!battle.dex.species.get(a.base?.species).exists)throw Error('메가파워 변신 상태를 확인하세요.');transformed.add(`${key}:${a.token}`);}
 }
 const charge=key=>key===playerOwner&&combat.adventurePlusGaugeV1?combat.adventurePlusGaugeV1.charge:state.trainers[key].charge;
 function refresh(){
  for(const [key,team] of groups)for(const p of team){
   // Fixed rogue Mega bosses have no activation record and are never reverted.
   p.canMegaEvo=!(key===playerOwner&&state.playerLocked===true)&&!p.species.isMega&&!p.transformed&&!state.trainers[key].active&&charge(key)>=3?battle.actions.canMegaEvo(p):false;
  }
 }
 const originalMega=battle.actions.runMegaEvo.bind(battle.actions);
 battle.actions.runMegaEvo=p=>{
  if(!p.canMegaEvo)return false;
  const key=owner(p),trainer=state.trainers[key];if(trainer.active||charge(key)<3)return false;
  const base={species:p.species.id,baseSpecies:p.baseSpecies.id,ability:p.ability,baseAbility:p.baseAbility,maxHp:p.maxhp,baseMaxHp:p.baseMaxhp};
  const result=originalMega(p);
  if(result&&p.species.isMega){trainer.active={token:p.set.trainerToken,remaining:ADVENTURE_MEGA_TURNS,base};trainer.charge=0;transformed.add(identity(p));if(key===playerOwner&&combat.adventurePlusGaugeV1)combat.adventurePlusGaugeV1.charge=0;refresh();}
  return result;
 };
 function revert(p,record){
  const hp=p.hp,base=record.base;
  // Avoid Item sources: they emit a second Mega activation rather than a return.
  p.setSpecies(battle.dex.species.get(base.species));
  p.baseSpecies=battle.dex.species.get(base.baseSpecies);
  if(p.hp>0)p.setAbility(base.ability,null,null,true);
  else{p.ability=base.ability;p.abilityState=battle.initEffectState({id:base.ability,target:p});}
  p.baseAbility=base.baseAbility;
  p.baseMaxhp=base.baseMaxHp;p.maxhp=base.maxHp;p.hp=Math.max(0,Math.min(hp,p.maxhp));
  p.details=p.getUpdatedDetails();p.formeRegression=false;
  battle.add('detailschange',p,p.details);
  battle.add('-formechange',p,p.species.name);
  battle.add('message',`${p.name}의 메가파워가 소진되어 원래 모습으로 돌아왔다.`);
 }
 const originalEndTurn=battle.endTurn.bind(battle);
 battle.endTurn=()=>{
  if(!battle.ended)for(const [key,team] of groups){
   const trainer=state.trainers[key],a=trainer.active;
   if(a){
    const p=team.find(p=>p.set.trainerToken===a.token);
    if(p.hp<=0||p.fainted||(p.isActive&&--a.remaining<=0)){
     revert(p,a);trainer.active=null;
    }else if(!p.isActive&&(key!==playerOwner||!combat.adventurePlusGaugeV1)&&team.some(q=>q.isActive&&q.hp>0&&!q.species.isMega)){
     trainer.charge=Math.min(3,trainer.charge+1);
    }
   }else if(key!==playerOwner||!combat.adventurePlusGaugeV1){
    // NPC owners recharge in three active rounds; no wall-clock or reconnect ticks.
    if(team.some(p=>p.isActive&&p.hp>0))trainer.charge=Math.min(3,trainer.charge+1);
   }
  }
  refresh();return originalEndTurn();
 };
 refresh();if(!battle.ended)battle.makeRequest();
 return {state,wasMega:p=>!!p&&transformed.has(identity(p)),finish(){refresh();if(!battle.ended)battle.makeRequest();}};
}
