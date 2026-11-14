import {friendshipGain as baseGain} from '../capture.mjs';
// Apply the held bell only in adventure. Rounding fractional gains down is provisional.
// https://trainerlab.top/lza/items/soothe-bell/
export function adventureFriendshipGain(mon,amount){const old=mon.friendship??70,base=baseGain(mon,amount);if(mon.item!=='soothebell'||amount<=0||base<=old)return base;return Math.min(255,old+Math.floor((base-old)*1.5));}
// Legends: Z-A candy bonus is separate from any level-up bonus and stops at 160.
// https://bulbapedia.bulbagarden.net/wiki/Friendship#Pok%C3%A9mon_Legends:_Z-A
export function adventureCandyFriendship(mon,size){const current=mon.friendship??70;if(!Number.isSafeInteger(current)||current<0||current>255)throw Error('포켓몬의 친밀도를 확인하세요.');const amounts={XS:[1,1],S:[1,1],M:[2,1],L:[3,2],XL:[4,2]},pair=amounts[size];if(!pair)throw Error('경험사탕의 크기를 확인하세요.');if(current>=160)return current;return Math.min(160,adventureFriendshipGain(mon,pair[current<100?0:1]));}
// Level-ups in Lumiose stop raising friendship at 160; never lower an old save.
export function lumioseLevelFriendshipGain(mon,amount){const current=mon.friendship??70;if(!Number.isSafeInteger(current)||current<0||current>255)return current;if(current>=160)return current;return Math.min(160,adventureFriendshipGain(mon,amount));}
export function isLumioseFriendshipWorld(s){return typeof s?.district==='string'&&(s.district==='lumiose'||s.district.startsWith('lumiose-'));}

// Only new adventure battles opt in. Existing battle snapshots retain their
// previous rules; multi battles distinguish player ownership and attackers.
export function applyAdventureFaintFriendship(before,after){
 const multi=before?.format==='mission10-multi-v1',triple=before?.format==='mission37-triples-prototype-v1';
 if(before?.adventureFaintFriendshipV1!==true||(before.format&&!multi&&!triple)||!Array.isArray(after?.events)||!Array.isArray(before?.teams?.[0])||!Array.isArray(before?.teams?.[1])||!Array.isArray(after?.teams?.[0]))return after;
 const owners=multi||triple?before.owners?.player:null;
 if((multi||triple)&&(!Array.isArray(owners)||!owners.length||new Set(owners).size!==owners.length))return after;
 const owned=owners?new Set(owners):null;
 const opponents=multi?before.teams[1].concat(before.teams[3]||[]):before.teams[1];
 const foes=new Map(opponents.filter(mon=>!mon.adventureEmptySlot).map(mon=>[mon.boxId,mon]));
 const active=new Map(),preFoes=after.before?.[1];
 if((multi||triple)&&Array.isArray(preFoes)&&Array.isArray(after.beforeActiveBySide?.[1]))for(const [slot,index] of after.beforeActiveBySide[1].entries()){const id=preFoes[index]?.boxId;if(foes.has(id))active.set(slot,id);}
 let foe=before.teams[1][before.requests?.[1]?.active];
 const alive=new Map(before.teams[0].map(mon=>[mon.boxId,mon.hp>0]));
 const lethal=new Map();
 let team=after.teams[0];
 for(const event of after.events){
  const side=event.targetSide??event.side,id=event.targetBoxId??event.boxId;
  if(side===1&&event.kind==='switch'){foe=foes.get(id);if(Number.isInteger(event.activeSlot)&&foes.has(id))active.set(event.activeSlot,id);}
  if(side===1&&event.kind==='faint')for(const [slot,foeId] of active)if(foeId===id)active.delete(slot);
  if(side!==0||!alive.has(id)||(owned&&!owned.has(id)))continue;
  if(event.kind==='heal'&&event.hp>0)alive.set(id,true);
  if(event.kind==='damage'&&event.hp===0){const attacker=event.hit===true?foes.get(event.actorBoxId):null;if(attacker)lethal.set(id,attacker);else lethal.delete(id);}
  if(event.kind!=='faint'||!alive.get(id))continue;
  alive.set(id,false);
  const activeFoes=[...active.values()].map(x=>foes.get(x)).filter(x=>Number.isFinite(x?.level)).sort((a,b)=>a.level-b.level);
  const opponent=multi||triple?(lethal.get(id)||activeFoes[0]):foe;lethal.delete(id);
  team=team.map(mon=>{if(mon.boxId!==id)return mon;const value=mon.friendship??70;if(!Number.isSafeInteger(value)||value<0||value>255||!Number.isFinite(mon.level)||!Number.isFinite(opponent?.level))return mon;const loss=opponent.level-mon.level>=30?(value<100?5:10):1;return {...mon,friendship:Math.max(0,value-loss)};});
 }
 return {...after,teams:[team,...after.teams.slice(1)]};
}
