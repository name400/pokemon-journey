// Source: PokeRogue beta 7c088125, bug-type-superfan-encounter.ts.
// These helpers do not enable the encounter until its complete flow exists.
import {Dex} from '@pkmn/sim';
import {moveNameByKey} from './pokemon-config.mjs';
import {classicRandom} from './rogue-classic-state.mjs';
import {CLASSIC_REWARD_REGISTRY} from './rogue-classic-rewards.mjs';
import {queueClassicMoves} from './rogue-classic-growth.mjs';

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

// Resolve only after the caller has obtained an explicit, persisted confirmation.
export function classicBugSuperfanTrade(run){
 const state=run.mystery,choice=state?.selection;
 if(run.screen!=='mystery'||state?.type!=='bug-superfan'||state.stage!=='confirm'||choice?.job!=='trade')throw Error('벌레 도구 교환 단계를 확인하세요.');
 const offer=classicBugSuperfanOptions(run).tradeItems.find(item=>item.boxId===choice.boxId&&item.id===choice.itemId&&item.typeBoost===(choice.typeBoost||null));
 const item=run.modifiers.find(m=>m.boxId===offer?.boxId&&m.id===offer?.id&&(m.typeBoost||null)===offer?.typeBoost&&m.count>0&&m.transferable!==false);
 if(!offer||!item)throw Error('교환할 도구가 더 이상 없습니다.');
 const rewards=['goldenbugnet','reviverseed'].map(id=>{const def=CLASSIC_REWARD_REGISTRY.find(d=>d.id===id);if(!def)throw Error('교환 보상을 불러올 수 없습니다.');return {...def,rewardId:crypto.randomUUID()};});
 item.count--;if(item.count===0)run.modifiers.splice(run.modifiers.indexOf(item),1);
 state.stage='resolved';state.selection=null;run.rewards=rewards;return rewards;
}

export function classicBugSuperfanTeach(run,{boxId=null,moveId=null,skip=false}={}){
 const state=run.mystery;if(state?.type!=='bug-superfan'||state.stage!=='tutor')throw Error('기술 교육 단계를 확인하세요.');
 if(!skip){const mon=run.party.find(p=>p.boxId===boxId),move=(state.tutorMoves||[]).find(m=>m.id===moveId);if(!mon||!move)throw Error('포켓몬과 배울 기술을 확인하세요.');queueClassicMoves(run,mon,[move.name]);}
 state.stage='resolved';return true;
}
