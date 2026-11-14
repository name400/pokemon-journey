import {configure,statKeys} from '../pokemon-config.mjs';
import {adventureFriendshipGain as friendshipGain} from './adventure-friendship.mjs';

import {ADVENTURE_VITAMINS} from './adventure-vitamin-list.mjs';
export function useAdventureVitamin(mon,id){
 const vitamin=ADVENTURE_VITAMINS.find(v=>v.id===id);if(!vitamin)throw Error('영양제를 확인하세요.');
 if(vitamin.stat==='hp'&&mon.speciesId===292)throw Error('껍질몬에게 맥스업을 사용할 수 없습니다.');
 const evs={...(mon.evs||{})};for(const stat of statKeys){const value=evs[stat]??0;if(!Number.isInteger(value)||value<0||value>255)throw Error('포켓몬의 노력치 정보를 확인하세요.');evs[stat]=value;}
 const total=statKeys.reduce((n,stat)=>n+evs[stat],0),gain=Math.min(10,252-evs[vitamin.stat],510-total);if(gain<=0)throw Error('해당 노력치를 더 올릴 수 없습니다.');
 evs[vitamin.stat]+=gain;const friendship=mon.friendship??70,added=friendship<100?4:friendship<160?2:0;
 const next=configure({...mon,evs,friendship:added?Math.min(160,friendshipGain(mon,added)):friendship},{hp:mon.hp});
 next.hp=mon.hp<=0?0:Math.min(next.maxHp,mon.hp+Math.max(0,next.maxHp-mon.maxHp));
 return {mon:next,gain,vitamin};
}
