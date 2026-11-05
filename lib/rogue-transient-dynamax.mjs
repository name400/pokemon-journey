import {calculateStats,rules} from './pokemon-config.mjs';

// Temporary native Dynamax doubles HP for three turns. Persistent source Gmax
// is a separate species form. Normalize on a copy only when a party transaction
// ends the temporary battle state; validation may also inspect this copy.
export function normalizeClassicTransientDynamax(mon){
 if(mon?.dynamaxed!==true||mon.gigantamax===true)return mon;
 if(mon.mega||mon.primal||mon.ultra||mon.eternamax||mon.terastallized||String(mon.rogueFormKey||'').startsWith('gigantamax')||!Number.isSafeInteger(mon.hp)||!Number.isSafeInteger(mon.maxHp)||mon.hp<0||mon.hp>mon.maxHp)throw Error('임시 다이맥스 정보를 확인하세요.');
 const hp=calculateStats(mon).hp,species=mon.rogueBattleSpecies||rules.species[mon.id]?.key,expected=hp*(species==='shedinja'?1:2);
 if(!species||!Number.isSafeInteger(hp)||hp<1||mon.maxHp!==expected)throw Error('임시 다이맥스 체력을 확인하세요.');
 return {...mon,hp:Math.ceil(mon.hp*hp/mon.maxHp),maxHp:hp,dynamaxed:false};
}
