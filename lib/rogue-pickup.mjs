import {Dex} from '@pkmn/sim';
import {rules} from './pokemon-config.mjs';
import {classicRandom} from './rogue-classic-state.mjs';
import {CLASSIC_REWARD_REGISTRY,addClassicModifier,classicMovableNativeItem} from './rogue-classic-rewards.mjs';
import {classicPostBattleVictory,classicPostBattleOwners} from './rogue-field-abilities.mjs';
const definition=id=>CLASSIC_REWARD_REGISTRY.find(d=>d.id===id);

// Source reference: Battle.addPostBattleLoot / PostBattleLootAbAttr.
// One random transferable stack is attempted for each living Pickup owner.
// A blocked choice is not rerolled. A successfully selected stack leaves the
// pool even when more than one item remains in that stack.
export function collectClassicPickup(run,rng=()=>classicRandom(run)){
 if(!classicPostBattleVictory(run))return [];
 const combat=run.combat,foes=combat.teams[1],stamp=JSON.stringify([run.wave,...foes.map(mon=>String(mon.boxId))]);
 if(combat.pickupSettledFor===stamp)return [];combat.pickupSettledFor=stamp;
 const nativeFoes=combat.snapshot?.sides?.[1]?.pokemon||[],pool=[];
 for(const mon of foes){
  const native=nativeFoes.find(p=>String(p.set?.trainerToken)===String(mon.boxId));
  if(mon.hp>0||mon.captured||native?.m?.captured||native?.m?.released)continue;
  for(const item of combat.modifiers||[]){const def=definition(item.id);if(String(item.boxId)===String(mon.boxId)&&Number.isSafeInteger(item.count)&&item.count>0&&item.transferable!==false&&def?.target&&def.effect==='modifier')pool.push({kind:'modifier',item,def,mon,native});}
  const itemId=native?.item??mon.item,item=itemId&&Dex.items.get(itemId);
  if(item&&classicMovableNativeItem(item)&&!mon.rogueNativeItemNontransferable)pool.push({kind:'native',item,mon,native});
 }
 const taken=[];
 for(const owner of classicPostBattleOwners(run,'pickup')){
  if(!pool.length)break;
  const chosen=pool[Math.min(pool.length-1,Math.max(0,Math.floor(rng()*pool.length)))];
  if(chosen.kind==='native'){
   const item=chosen.item,species=Dex.species.get(owner.rogueBattleSpecies||rules.species[owner.id]?.key);
   if(owner.item||item.zMove&&item.zMove!==true&&!item.itemUser?.includes(species.name))continue;
   owner.item=item.id;chosen.mon.item='';if(chosen.native){chosen.native.item='';if(chosen.native.itemState)chosen.native.itemState.id='';}
   taken.push({boxId:owner.boxId,name:owner.name,itemId:item.id,itemName:rules.items[item.id]?.name||item.name,kind:'native'});
  }else{
   const item=chosen.item,typeBoost=item.typeBoost||null,total=(run.modifiers||[]).filter(m=>m.id===item.id&&m.boxId===owner.boxId&&(m.typeBoost||null)===typeBoost).reduce((n,m)=>n+m.count,0);
   if(total+1>(chosen.def.max??99))continue;
   addClassicModifier(run,item.id,{boxId:owner.boxId,typeBoost,count:1});item.count--;
   taken.push({boxId:owner.boxId,name:owner.name,itemId:item.id,itemName:chosen.def.name,kind:'modifier',typeBoost});
  }
  pool.splice(pool.indexOf(chosen),1);
 }
 combat.modifiers=(combat.modifiers||[]).filter(m=>m.count>0);
 return taken;
}
