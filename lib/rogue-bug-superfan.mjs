// Source: PokeRogue beta 7c088125, bug-type-superfan-encounter.ts.
// These helpers do not enable the encounter until its complete flow exists.
import {Dex} from '@pkmn/sim';
import {moveNameByKey} from './pokemon-config.mjs';
import {classicRandom} from './rogue-classic-state.mjs';

const TUTOR_POOLS=[
 ['megahorn','attackorder','bugbite','firstimpression','lunge'],
 ['silverwind','signalbeam','bugbuzz','pollenpuff','strugglebug'],
 ['stringshot','defendorder','ragepowder','stickyweb','silktrap'],
 ['leechlife','uturn','healorder','quiverdance','infestation'],
];
const eligibleItem=m=>m?.count>0&&(m.id==='quickclaw'||m.id==='gripclaw'||m.id==='typebooster'&&m.typeBoost==='Bug');
export function classicBugSuperfanOptions(run){
 const party=Array.isArray(run.party)?run.party:[],owners=new Set(party.map(p=>String(p.boxId)));
 const bugs=party.filter(p=>(p.rogueTypes||p.types||[]).some(t=>['bug','벌레'].includes(String(t).toLowerCase())));
 const held=(run.modifiers||[]).filter(m=>m.boxId!=null&&owners.has(String(m.boxId))&&eligibleItem(m)&&m.transferable!==false);
 return {eligible:run.wave>=30&&run.wave<=180&&party.filter(p=>p.hp>0).length>=3&&(bugs.length>0||held.length>0),bugCount:bugs.length,canShow:bugs.length>0,tradeItems:held.map(m=>({id:m.id,boxId:m.boxId,typeBoost:m.typeBoost||null,count:m.count}))};
}
export function classicBugSuperfanTutorMoves(run){
 return TUTOR_POOLS.map(pool=>{const id=pool[Math.floor(classicRandom(run)*pool.length)],move=Dex.moves.get(id);if(!move.exists)throw Error('벌레 마니아 기술 자료를 확인하세요: '+id);return {id,name:moveNameByKey[id]||move.name};});
}
