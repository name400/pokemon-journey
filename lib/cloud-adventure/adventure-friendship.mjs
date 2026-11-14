import {friendshipGain as baseGain} from '../capture.mjs';
// Apply the held bell only in adventure. Rounding fractional gains down is provisional.
// https://trainerlab.top/lza/items/soothe-bell/
export function adventureFriendshipGain(mon,amount){const old=mon.friendship??70,base=baseGain(mon,amount);if(mon.item!=='soothebell'||amount<=0||base<=old)return base;return Math.min(255,old+Math.floor((base-old)*1.5));}
// Legends: Z-A candy bonus is separate from any level-up bonus and stops at 160.
// https://bulbapedia.bulbagarden.net/wiki/Friendship#Pok%C3%A9mon_Legends:_Z-A
export function adventureCandyFriendship(mon,size){const current=mon.friendship??70;if(!Number.isSafeInteger(current)||current<0||current>255)throw Error('포켓몬의 친밀도를 확인하세요.');const amounts={XS:[1,1],S:[1,1],M:[2,1],L:[3,2],XL:[4,2]},pair=amounts[size];if(!pair)throw Error('경험사탕의 크기를 확인하세요.');if(current>=160)return current;return Math.min(160,adventureFriendshipGain(mon,pair[current<100?0:1]));}
