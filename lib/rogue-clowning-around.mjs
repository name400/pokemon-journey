import {Dex} from '@pkmn/sim';
import {moves} from './game.mjs';
import {classicRandom} from './rogue-classic-state.mjs';
import {makeReferenceMon,sourceSpeciesFor} from './rogue-reference.mjs';
import {classicTrainerLevel} from './rogue-classic-rules.mjs';
import {classicBossSegments} from './rogue-boss.mjs';
// Source Clowning Around, pinned to 7c088125. Fusion and unreviewed held
// effects remain outside the supported encounter subset.
const english=['Normal','Fighting','Flying','Poison','Ground','Rock','Bug','Ghost','Steel','Fire','Water','Grass','Electric','Psychic','Ice','Dragon','Dark','Fairy','Stellar'];
const korean=['노말','격투','비행','독','땅','바위','벌레','고스트','강철','불꽃','물','풀','전기','에스퍼','얼음','드래곤','악','페어리','스텔라'];
const abilities=['sturdy','pickup','intimidate','guts','drought','drizzle','snowwarning','sandstream','electricsurge','psychicsurge','grassysurge','mistysurge','magician','sheerforce','prankster'];
const berryPool=[['berryapicot',3],['berryenigma',2],['berryganlon',3],['berrylansat',3],['berryleppa',2],['berryliechi',3],['berrylum',2],['berrypetaya',3],['berrysalac',2],['berrysitrus',2],['berrystarf',3]];
const berries=new Set(berryPool.map(([id])=>id));
// Female Indeedee is a stable native form with no item or transformation state.
function reviewedClownForm(mon){if(mon.rogueFormIndex==null||mon.rogueFormIndex===0)return true;return sourceSpeciesFor(mon)?.sourceId===876&&mon.rogueFormIndex===1&&mon.gender==='F'&&Dex.species.get(mon.rogueBattleSpecies||'').id==='indeedeef';}
function typeId(value){const n=english.indexOf(value);return n>=0?n:korean.indexOf(value);}
function roll(random,range){if(range<=1)return 0;const value=random();if(!Number.isFinite(value)||value<0||value>=1)throw Error('광대 이벤트 난수를 확인하세요.');return Math.floor(value*range);}
export function planClowningAroundTypes(party,random){
 if(!Array.isArray(party)||!party.length||typeof random!=='function'||party.some(mon=>mon.fusionSpecies))throw Error('광대 이벤트 파티를 확인하세요.');
 return party.map(mon=>{
  const original=(mon.rogueTypes||mon.types||[]).map(typeId);if(!original.length||original.some(id=>id<0)||!Array.isArray(mon.moves))throw Error('포켓몬 타입을 확인하세요.');
  const priority=[...new Set(mon.moves.map(name=>Dex.moves.get(moves[name]?.key||name)).filter(move=>move.exists&&move.category!=='Status').map(move=>typeId(move.type)).filter(id=>id>=0&&!original.includes(id)))].sort();
  for(let i=priority.length-1;i>0;i--){const j=roll(random,i+1);[priority[i],priority[j]]=[priority[j],priority[i]];}
  let chosen=priority.pop(),tries=0;while(chosen===undefined||original.includes(chosen)){if(++tries>1024)throw Error('새 타입을 결정하지 못했습니다.');chosen=priority.length?priority.pop():roll(random,18);}
  return {boxId:mon.boxId,primary:korean[original[0]],second:korean[chosen]};
 });
}

// Prepare the result on a separate run, including its RNG cursor. This remains
// disconnected until evolution and form changes preserve the custom type.
export function stageClowningAroundTypes(run){
 if(run?.screen!=='mystery'||run.mystery?.type!=='clowning-around'||run.mystery.stage!=='confirm'||run.mystery.selection?.job!=='types')throw Error('광대 이벤트 선택을 확인하세요.');
 const next=structuredClone(run),plan=planClowningAroundTypes(next.party,()=>classicRandom(next));
 const ids=plan.map(entry=>entry.boxId);if(ids.some(id=>!id)||new Set(ids).size!==ids.length)throw Error('광대 이벤트 파티 식별자를 확인하세요.');
 for(let i=0;i<plan.length;i++){const {primary,second}=plan[i];next.party[i].rogueCustomSecondType=second;next.party[i].rogueTypes=[primary,second];next.party[i].types=[primary,second];next.party[i].type=primary;}
 next.mystery.stage='types-staged';return next;
}

// Non-berry transferable effects are still excluded until all generated item
// types and their side effects can be represented safely.
export function classicClownEligible(run){
 if(!Array.isArray(run?.party)||run.party.filter(p=>p.hp>0).length<2||run.challenges?.length||!Array.isArray(run.modifiers)||run.pendingMoves?.length||run.pendingGrowth?.length||run.pendingCapture||run.pendingEvolution)return false;
 const ids=run.party.map(p=>p.boxId);if(ids.some(id=>!id)||new Set(ids).size!==ids.length||run.party.some(p=>p.fusionSpecies||p.item||p.mega||p.primal||p.ultra||p.dynamaxed||p.gigantamax||!reviewedClownForm(p)||!sourceSpeciesFor(p)||!Array.isArray(p.moves)||!(p.rogueTypes||p.types||[]).length||(p.rogueTypes||p.types).some(type=>typeId(type)<0))||run.modifiers.some(m=>ids.includes(m.boxId)&&(!Number.isSafeInteger(m.count)||m.count<1)))return false;
 const held=run.modifiers.filter(m=>ids.includes(m.boxId));
 if(held.some(m=>String(m.id).startsWith('berry')&&(!berries.has(m.id)||m.typeBoost!=null||Object.keys(m).some(key=>!['id','boxId','count','typeBoost','transferable'].includes(key)))))return false;
 if(held.some(m=>!berries.has(m.id)&&m.transferable!==false))return false;
 return held.filter(m=>m.boxId===ids[0]&&berries.has(m.id)).reduce((sum,m)=>sum+m.count,0)<=berryPool.reduce((sum,[,max])=>sum+max,0);
}
export function stageClowningAroundItems(run){
 if(run?.screen!=='mystery'||run.mystery?.type!=='clowning-around'||run.mystery.stage!=='confirm'||run.mystery.selection?.job!=='items'||!classicClownEligible(run))throw Error('광대의 소지 도구 조건을 확인하세요.');
 const next=structuredClone(run),boxId=next.party[0].boxId,old=next.modifiers.filter(m=>m.boxId===boxId&&berries.has(m.id)),count=old.reduce((sum,m)=>sum+m.count,0),pool=berryPool.map(([id,max])=>({id,max}));
 next.modifiers=next.modifiers.filter(m=>!(m.boxId===boxId&&berries.has(m.id)));
 for(let i=0;i<count;i++){const index=roll(()=>classicRandom(next),pool.length),entry=pool[index],existing=next.modifiers.find(m=>m.boxId===boxId&&m.id===entry.id&&m.typeBoost==null);if(existing)existing.count++;else next.modifiers.push({id:entry.id,boxId,typeBoost:null,count:1});if(--entry.max===0)pool.splice(index,1);}
 next.mystery.stage='items-staged';return next;
}
export function prepareClowningAroundEncounter(run){
 if(!classicClownEligible(run))return null;
 const next=structuredClone(run),random=()=>classicRandom(next),ability=abilities[roll(random,abilities.length)],first=roll(random,18);let second=roll(random,17);if(second>=first)second++;
 const specs=[{id:122,strength:4,moves:['Teeter Dance','Ally Switch','Dazzling Gleam','Psychic']},{id:806,strength:5,moves:['Trick','Hypnosis','Shadow Ball','Mind Blown'],ability,shiny:true,variant:2,types:[korean[first],korean[second]]}];
 const enemies=specs.map((spec,index)=>{const mon=makeReferenceMon(spec.id,classicTrainerLevel(run.wave,spec.strength),{boxId:'clown-'+run.id+'-'+run.wave+'-'+index,moves:spec.moves,...(spec.ability?{ability:spec.ability}:{}),...(spec.types?{types:spec.types,rogueTypes:spec.types,type:spec.types[0]}:{}),...(spec.shiny?{shiny:true,variant:spec.variant}: {})});mon.rogueBoss=true;mon.rogueBossSegments=classicBossSegments(run.wave,mon.level,sourceSpeciesFor(mon).baseTotal,{boss:true});return mon;});
 return {rng:next.rng,ability,enemies};
}
