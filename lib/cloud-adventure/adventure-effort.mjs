import yields from '../../data/adventure-ev-yields.json' with {type:'json'};
import {configure,statKeys} from '../pokemon-config.mjs';

export const POWER_ITEM_STATS=Object.freeze({powerweight:'hp',powerbracer:'atk',powerbelt:'def',powerlens:'spa',powerband:'spd',poweranklet:'spe'});

// PokeAPI pokemon_stats.csv at the revision in data/pokedex-source.json.
// Cosmetic IDs share the original PokeAPI Pokémon ID stored as artId.
export function adventureEffortYield(foe){
 const id=Number(foe?.id),row=yields[id]??yields[Number(foe?.artId)];return Array.isArray(row)&&row.length===6&&row.every(n=>Number.isInteger(n)&&n>=0&&n<=3)&&row.some(n=>n>0)?row:null;
}
export function grantAdventureEffort(mon,foe,{eligible=mon?.hp>0,deferStats=false,powerItem=mon?.item}={}){
 const gain=adventureEffortYield(foe);if(!gain||!mon||!eligible)return mon;
 if(mon.evs!=null&&(typeof mon.evs!=='object'||Array.isArray(mon.evs)))return mon;
 const evs={...(mon.evs||{})};for(const key of statKeys){const n=evs[key]??0;if(!Number.isInteger(n)||n<0||n>255)return mon;evs[key]=n;}
 let available=Math.max(0,510-statKeys.reduce((n,key)=>n+evs[key],0)),changed=false;
 for(let i=0;i<statKeys.length;i++){const key=statKeys[i],extra=Object.hasOwn(POWER_ITEM_STATS,powerItem)&&POWER_ITEM_STATS[powerItem]===key?8:0,amount=Math.max(0,Math.min(gain[i]+extra,252-evs[key],available));if(amount){evs[key]+=amount;available-=amount;changed=true;}}
 if(!changed)return mon;if(deferStats)return {...mon,evs};
 const next=configure({...mon,evs},{hp:mon.hp});next.hp=mon.hp<=0?0:Math.max(1,Math.min(next.maxHp,mon.hp+Math.max(0,next.maxHp-mon.maxHp)));return next;
}

// Visual events are ordered like the underlying battle log. Record each foe
// once and snapshot the living recipients at the instant it faints.
export function applyAdventureBattleEffort(before,after){
 const multi=before?.format==='mission10-multi-v1',triple=before?.format==='mission37-triples-prototype-v1',events=multi?after?.adventureEffortEvents:after?.events;if(![1,2].includes(before?.adventureEffortVersion)||!Array.isArray(events)||!Array.isArray(before?.teams?.[0])||!Array.isArray(before?.teams?.[1]))return after;
 const owned=(triple||multi&&before.adventureEffortVersion===2)&&Array.isArray(before?.owners?.player)?new Set(before.owners.player):null;if((triple||multi&&before.adventureEffortVersion===2)&&(!owned||owned.size===0||owned.size!==before.owners.player.length))return after;
 const opponents=multi?before.teams[1].concat(before.teams[3]||[]):before.teams[1],awarded=new Set(Array.isArray(before.adventureEffortFoes)?before.adventureEffortFoes:[]),alive=new Map(before.teams[0].map(m=>[m.boxId,m.hp>0])),previous=new Map(before.teams[0].map(m=>[m.boxId,m])),foes=new Map(opponents.map(m=>[m.boxId,m]));
 if(before.adventureEffortVersion===2&&(!Array.isArray(before.adventureEffortFoes)||before.adventureEffortFoes.some(id=>typeof id!=='string')||owned&&[...owned].some(id=>typeof id!=='string'||!alive.has(id))))return after;
 let team=after.teams[0];
 // V2 tracks active slots at the instant each opponent faints. In multi
 // battles before[0] also contains companion Pokémon; ownership is separate.
 const slots=new Map();
 if(before.adventureEffortVersion===2){
  if(multi||triple){
   const initial=after.before?.[0],indices=after.beforeActiveBySide?.[0],count=triple?3:1;
   if(!Array.isArray(initial)||!Array.isArray(indices)||indices.length<count)return after;
   for(let slot=0;slot<count;slot++){const index=indices[slot];if(!Number.isInteger(index)||index < -1||index>=initial.length)return after;if(index>=0){const id=initial[index]?.boxId;if(typeof id!=='string')return after;slots.set(slot,id);}}
   if(triple&&events.some(e=>(e.targetSide??e.side)===0&&e.kind==='switch'&&(!Number.isInteger(e.activeSlot)||e.activeSlot<0||e.activeSlot>2)))return after;
  }else{const id=before.teams[0][before.requests?.[0]?.active]?.boxId;if(!alive.has(id))return after;slots.set(0,id);}
 }
 for(const event of events){const side=event.targetSide??event.side,id=event.targetBoxId??event.boxId;if(side===0&&event.kind==='switch'&&before.adventureEffortVersion===2)slots.set(triple?event.activeSlot:0,id);if(side===0&&alive.has(id)&&Number.isFinite(event.hp))alive.set(id,event.hp>0);
  if(event.kind!=='faint'||side!==1||!foes.has(id)||awarded.has(id))continue;
  const foe=foes.get(id);if(foe.adventureEmptySlot===true)continue;awarded.add(id);team=team.map(mon=>{if((owned&&!owned.has(mon.boxId))||!alive.get(mon.boxId)||(before.adventureEffortVersion===2&&![...slots.values()].includes(mon.boxId)))return mon;const prev=previous.get(mon.boxId),powerItem=prev?.item===mon.item?mon.item:'';return grantAdventureEffort(mon,foe,{eligible:true,deferStats:true,powerItem});});
 }
 return {...after,teams:[team,...after.teams.slice(1)],adventureEffortFoes:[...awarded]};
}
