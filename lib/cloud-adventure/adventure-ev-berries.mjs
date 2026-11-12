import {configure,statKeys} from '../pokemon-config.mjs';
import {friendshipGain} from '../capture.mjs';
import {ADVENTURE_EV_BERRIES} from './adventure-ev-berry-list.mjs';
export {ADVENTURE_EV_BERRIES} from './adventure-ev-berry-list.mjs';
export function useAdventureEvBerry(mon,id){
 const berry=ADVENTURE_EV_BERRIES.find(x=>x.id===id);if(!berry||!mon)throw Error('열매와 포켓몬을 확인하세요.');
 const evs={...(mon.evs||{})};for(const stat of statKeys){const value=evs[stat]??0;if(!Number.isInteger(value)||value<0||value>255)throw Error('포켓몬의 노력치 정보를 확인하세요.');evs[stat]=value;}
 const friendship=mon.friendship??70;if(!Number.isInteger(friendship)||friendship<0||friendship>255)throw Error('포켓몬의 친밀도를 확인하세요.');
 const removed=Math.min(10,evs[berry.stat]),amount=friendship<100?10:friendship<160?5:1,nextFriendship=friendshipGain(mon,amount);
 if(!removed&&nextFriendship===friendship)throw Error('이 열매는 더 이상 효과가 없습니다.');
 evs[berry.stat]-=removed;const next=configure({...mon,evs,friendship:nextFriendship},{hp:mon.hp});next.hp=mon.hp<=0?0:Math.max(1,Math.min(next.maxHp,mon.hp+next.maxHp-mon.maxHp));return {mon:next,berry,removed};
}
