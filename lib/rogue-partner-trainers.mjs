// Source Trainer.genPartyMember alternates each partner's signature pool.
export function classicPartnerSpeciesPool(mainId,partnerId,index,main,partner,used){
 const trainerId=index%2?partnerId:mainId;
 if(index<2&&trainerId===222)return [338];
 if(index<2&&trainerId===223)return [337];
 const entries=(index%2?partner:main).filter(entry=>!(Array.isArray(entry)?entry:[entry]).some(id=>used.includes(id)));
 return entries.flat();
}

// Each trainer owns alternating party members, even when both trainers share
// a class. A defeated partner cannot borrow the other's reserve Pokemon.
export function installClassicPartnerOwnership(battle,combat){
 if(!combat.trainer||!combat.doubles||!combat.teams[1].some(mon=>Number.isInteger(mon.rogueTrainerSlot)))return;
 const owners=new Map(combat.teams[1].map(mon=>[String(mon.boxId),mon.rogueTrainerSlot]));
 const owner=p=>owners.get(String(p?.set?.trainerToken));
 const allowed=(from,to)=>from?.side?.n!==1||!Number.isInteger(owner(from))||owner(from)===owner(to);
 Object.defineProperty(battle,'roguePartnerSwitchAllowed',{configurable:true,enumerable:false,value:allowed});
 const hasReserve=p=>battle.p2.pokemon.some(q=>q.hp>0&&!q.fainted&&!q.isActive&&!q.m?.released&&!q.m?.captured&&allowed(p,q));
 const prune=()=>{for(const p of battle.p2.active){if(!p?.switchFlag||p.switchFlag==='revivalblessing')continue;if(!hasReserve(p))p.switchFlag=false;}};
 const canSwitch=battle.canSwitch;
 Object.defineProperty(battle,'canSwitch',{configurable:true,enumerable:false,value(side){
  if(side.n===1){const hadFlag=side.active.some(p=>p?.switchFlag);prune();
   // Mid-turn pivots check canSwitch before getRequests. Report no possible
   // replacement here so native runAction never opens an empty switch request.
   if(hadFlag&&!side.active.some(p=>p?.switchFlag)&&!side.active.some(p=>p?.fainted&&hasReserve(p)))return 0;
  }
  return canSwitch.call(this,side);
 }});
 const checkFainted=battle.checkFainted;
 Object.defineProperty(battle,'checkFainted',{configurable:true,enumerable:false,value(...args){const result=checkFainted.apply(this,args);prune();return result;}});
 const getRequests=battle.getRequests;
 Object.defineProperty(battle,'getRequests',{configurable:true,enumerable:false,value(...args){prune();return getRequests.apply(this,args);}});
 // Roar/Whirlwind must draw a replacement from the target trainer's reserves.
 let dragging=null;
 const randomSwitch=battle.getRandomSwitchable,dragIn=battle.actions.dragIn;
 Object.defineProperty(battle,'getRandomSwitchable',{configurable:true,enumerable:false,value(side){if(side.n!==1||!dragging)return randomSwitch.call(this,side);const candidates=this.possibleSwitches(side).filter(q=>allowed(dragging,q));return candidates.length?this.sample(candidates):null;}});
 Object.defineProperty(battle.actions,'dragIn',{configurable:true,enumerable:false,value(side,pos){const before=dragging;dragging=side.n===1?side.active[pos]:null;try{return dragIn.call(this,side,pos);}finally{dragging=before;}}});
}
