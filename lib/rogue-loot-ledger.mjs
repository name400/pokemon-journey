const token=p=>String(p.set?.trainerToken||'');
function nextRef(battle,combat){
 const used=new Set([...(combat.modifiers||[]).map(m=>m.rogueLootRef),...battle.p2.pokemon.map(p=>p.itemState?.rogueLootRef)].filter(Boolean));
 let serial=Number.isSafeInteger(combat.lootSequence)&&combat.lootSequence>=0?combat.lootSequence:0,ref;
 do{serial++;if(!Number.isSafeInteger(serial))throw Error('전리품 기록 한도를 확인하세요.');ref='classic-loot:'+serial;}while(used.has(ref));
 combat.lootSequence=serial;return ref;
}
// Original Battle.addPostBattleLoot records references when each enemy faints.
// Serializable per-instance references retain that identity across save/load,
// including a revival followed by a second faint of the same item holder.
export function installClassicLootLedger(battle,combat,run){
 if(!run)return;
 battle.onEvent('Faint',battle.format,{priority:-10000},function(pokemon){
  if(!pokemon||pokemon.side.n!==1||pokemon.hp>0||pokemon.m?.captured||pokemon.m?.released)return;
  const source=combat.teams?.[1]?.find(mon=>String(mon.boxId)===token(pokemon));if(!source)return;
  if(!Array.isArray(combat.lootLedger)){combat.lootLedger=[];combat.lootLedgerVersion=1;}
  for(const item of combat.modifiers||[]){
   if(String(item.boxId)!==String(source.boxId)||!Number.isSafeInteger(item.count)||item.count<=0||item.transferable===false)continue;
   if(!item.rogueLootRef)item.rogueLootRef=nextRef(this,combat);
   combat.lootLedger.push({kind:'modifier',sourceBoxId:String(source.boxId),itemId:item.id,typeBoost:item.typeBoost||null,ref:item.rogueLootRef});
  }
  if(pokemon.item&&!source.rogueNativeItemNontransferable){
   if(!pokemon.itemState||typeof pokemon.itemState!=='object')pokemon.itemState=this.initEffectState({id:pokemon.item,target:pokemon});
   if(!pokemon.itemState.rogueLootRef)pokemon.itemState.rogueLootRef=nextRef(this,combat);
   combat.lootLedger.push({kind:'native',sourceBoxId:String(source.boxId),itemId:pokemon.item,ref:pokemon.itemState.rogueLootRef});
  }
 });
}
