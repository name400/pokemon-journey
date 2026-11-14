import {friendshipGain as baseGain} from '../capture.mjs';
// Apply the held bell only in adventure. Rounding fractional gains down is provisional.
// https://trainerlab.top/lza/items/soothe-bell/
export function adventureFriendshipGain(mon,amount){const old=mon.friendship??70,base=baseGain(mon,amount);if(mon.item!=='soothebell'||amount<=0||base<=old)return base;return Math.min(255,old+Math.floor((base-old)*1.5));}
