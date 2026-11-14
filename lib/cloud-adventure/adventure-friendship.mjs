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

// Only new single battles opt in. Existing battle snapshots and other modes
// retain their previous rules. Switch events identify the opposing active mon.
export function applyAdventureFaintFriendship(before,after){
 if(before?.adventureFaintFriendshipV1!==true||before.format||!Array.isArray(after?.events)||!Array.isArray(before?.teams?.[0])||!Array.isArray(before?.teams?.[1])||!Array.isArray(after?.teams?.[0]))return after;
 const foes=new Map(before.teams[1].map(mon=>[mon.boxId,mon]));
 let foe=before.teams[1][before.requests?.[1]?.active];
 const alive=new Map(before.teams[0].map(mon=>[mon.boxId,mon.hp>0]));
 let team=after.teams[0];
 for(const event of after.events){
  const side=event.targetSide??event.side,id=event.targetBoxId??event.boxId;
  if(side===1&&event.kind==='switch')foe=foes.get(id);
  if(side!==0||!alive.has(id))continue;
  if(event.kind==='heal'&&event.hp>0)alive.set(id,true);
  if(event.kind!=='faint'||!alive.get(id))continue;
  alive.set(id,false);
  team=team.map(mon=>{if(mon.boxId!==id)return mon;const value=mon.friendship??70;if(!Number.isSafeInteger(value)||value<0||value>255||!Number.isFinite(mon.level)||!Number.isFinite(foe?.level))return mon;const loss=foe.level-mon.level>=30?(value<100?5:10):1;return {...mon,friendship:Math.max(0,value-loss)};});
 }
 return {...after,teams:[team,...after.teams.slice(1)]};
}
