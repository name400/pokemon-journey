import {configure,statKeys} from '../pokemon-config.mjs';

// Lady Clear's service, available after Mission 20 for five Mega Shards.
// https://psypokes.com/plza/servicenpcs.php
// https://bulbapedia.bulbagarden.net/wiki/Effort_values
export function adventureEvResetUnlocked(s){return s?.zaMission20Complete===true||Number(s?.zaMission20Stage)>=15;}
export function resetAdventureEvs(mon){
 if(!mon||!Number.isFinite(mon.hp)||!Number.isFinite(mon.maxHp)||mon.maxHp<=0)throw Error('포켓몬 정보를 확인하세요.');
 if(mon.evs!=null&&(typeof mon.evs!=='object'||Array.isArray(mon.evs)))throw Error('포켓몬의 노력치 정보를 확인하세요.');
 const evs={...(mon.evs||{})};let total=0;
 for(const stat of statKeys){const value=evs[stat]??0;if(!Number.isInteger(value)||value<0||value>255)throw Error('포켓몬의 노력치 정보를 확인하세요.');total+=value;evs[stat]=0;}
 if(total===0)throw Error('초기화할 노력치가 없습니다.');
 const next=configure({...mon,evs},{hp:mon.hp});next.hp=mon.hp<=0?0:Math.max(1,Math.min(next.maxHp,mon.hp+next.maxHp-mon.maxHp));
 return {mon:next,removed:total};
}
