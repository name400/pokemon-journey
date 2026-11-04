// Species-selection foundation for Weird Dream, pinned to PokéRogue 7c088125.
// The event remains disabled until transformation and save semantics are complete.
import {configure} from './pokemon-config.mjs';
import {sourceSpeciesFor,sourceAbility,rogueSpecies} from './rogue-reference.mjs';
import {registerStarterCaught,starterProgress} from './rogue-starter-system.mjs';
export const WEIRD_DREAM_EXCLUDED_SPECIES = Object.freeze([
 'ARCEUS','ETERNATUS','NIHILEGO','BUZZWOLE','PHEROMOSA','XURKITREE','CELESTEELA','KARTANA','GUZZLORD','POIPOLE','NAGANADEL','STAKATAKA','BLACEPHALON',
 'GREAT_TUSK','SCREAM_TAIL','BRUTE_BONNET','FLUTTER_MANE','SLITHER_WING','SANDY_SHOCKS','ROARING_MOON','WALKING_WAKE','GOUGING_FIRE','RAGING_BOLT','IRON_TREADS','IRON_BUNDLE','IRON_HANDS','IRON_JUGULIS','IRON_MOTH','IRON_THORNS','IRON_VALIANT','IRON_LEAVES','IRON_BOULDER','IRON_CROWN',
 'PHIONE','TYPE_NULL','COSMOG','COSMOEM','MELTAN','KUBFU','URSHIFU','CALYREX','OGERPON','OKIDOGI','MUNKIDORI','FEZANDIPITI','TERAPAGOS',
]);
function shuffle(items,random){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
/**
 * Each party entry is {key, speciesId, baseTotal}; pool entries are
 * {speciesId, baseTotal}. Results retain the original party order.
 */
export function planWeirdDreamSpecies(party,pool,excludedIds,random){
 if(!Array.isArray(party)||party.length<1||!Array.isArray(pool)||typeof random!=='function')throw Error('꿈의 파티를 확인하세요.');
 const excluded=new Set(excludedIds),used=new Set(party.map(p=>p.speciesId)),chosen=new Map();let highUsed=false,legendUsed=false;
 for(const [index,mon] of shuffle(party,random).entries()){
  if(!Number.isFinite(mon.baseTotal)||!Number.isInteger(mon.speciesId)||mon.key==null||chosen.has(mon.key))throw Error('꿈의 포켓몬 자료를 확인하세요.');
  let low=index<2?90:40,high=index<2?110:50,candidates=[];
  // The source requires more than 20 eligible species before shuffling; fail
  // explicitly on incomplete catalogs instead of looping forever.
  for(let step=0;step<=100;step++,low-=10,high+=10){
   candidates=pool.filter(s=>Number.isInteger(s.speciesId)&&Number.isFinite(s.baseTotal)&&s.baseTotal>=Math.max(mon.baseTotal+low,0)&&s.baseTotal<=mon.baseTotal+high&&!excluded.has(s.speciesId)&&(!legendUsed||s.baseTotal<570||s.baseTotal>600)&&(!highUsed||s.baseTotal<=600));
   if(candidates.length>20&&candidates.some(s=>!used.has(s.speciesId)))break;
  }
  if(candidates.length<=20||!candidates.some(s=>!used.has(s.speciesId)))throw Error('꿈의 변환 후보가 충분하지 않습니다.');
  const choices=shuffle(candidates,random);let choice;while(choices.length&&!choice){const next=choices.pop();if(!used.has(next.speciesId))choice=next;}
  if(!choice)throw Error('꿈의 변환 후보가 없습니다.');
  used.add(choice.speciesId);chosen.set(mon.key,choice.speciesId);if(choice.baseTotal>600)highUsed=true;else if(choice.baseTotal>=570)legendUsed=true;
 }
 return party.map(mon=>({key:mon.key,speciesId:chosen.get(mon.key)}));
}

// Classic stores EXP relative to the current level, so the start of the new
// level is represented as zero rather than the source's absolute total EXP.
export function lowerWeirdDreamPartyLevels(party){
 if(!Array.isArray(party)||!party.length||party.some(mon=>!Number.isSafeInteger(mon.level)||mon.level<1||mon.dynamaxed))throw Error('꿈의 파티 레벨을 확인하세요.');
 return party.map(mon=>configure(mon,{level:Math.max(Math.ceil(mon.level*.9),1),experience:0,hp:mon.hp}));
}

// Keep the old moves and their PP, then insert one eligible egg move and one
// generated STAB (or fallback) move as in the source. Does not mutate the mon.
export function weirdDreamMoves(mon,eggMoves,generatedMoves,primaryType,random,lookup){
 if(!Array.isArray(mon?.moves)||!Array.isArray(eggMoves)||!Array.isArray(generatedMoves)||typeof random!=='function'||typeof lookup!=='function')throw Error('꿈의 기술 자료를 확인하세요.');
 const result=[...mon.moves],indices=shuffle([0,1,2,3],random);let eggIndex=indices.pop(),egg=eggMoves[eggIndex],tries=0,eggSlot=null;
 while(tries<3&&(!egg||result.includes(egg))){eggIndex=indices.pop();egg=eggMoves[eggIndex];tries++;}
 if(egg&&!result.includes(egg)){if(result.length<4)result.push(egg);else{eggSlot=Math.floor(random()*4);result[eggSlot]=egg;}}
 const candidate=generatedMoves.find(name=>!result.includes(name)&&lookup(name)?.type===primaryType)||generatedMoves.find(name=>!result.includes(name));
 if(candidate){if(result.length<4)result.push(candidate);else{let index=Math.floor(random()*4);while(index===eggSlot)index=Math.floor(random()*4);result[index]=candidate;}}
 const oldKeys=new Set(mon.moves.map(name=>lookup(name)?.id).filter(Boolean)),newKeys=new Set(result.map(name=>lookup(name)?.id).filter(Boolean));
 const pp={...(mon.pp||{})},ppUps={...(mon.roguePPUps||{})};for(const key of oldKeys)if(!newKeys.has(key)){delete pp[key];delete ppUps[key];}
 for(const name of result){const move=lookup(name);if(move?.id&&!oldKeys.has(move.id))pp[move.id]=move.pp;}
 return {moves:result,pp,roguePPUps:ppUps,eggMoveIndex:egg?eggIndex:null,eggMove:egg||null};
}

// The Pokédex sees the newly rolled IVs before the old party member's higher
// IVs are inherited. Keep both snapshots to avoid granting inherited IVs.
export function weirdDreamIvs(rolled,previous,random){
 const keys=['hp','atk','def','spa','spd','spe'];if(typeof random!=='function'||keys.some(k=>!Number.isInteger(rolled?.[k])||!Number.isInteger(previous?.[k])||rolled[k]<0||rolled[k]>31||previous[k]<0||previous[k]>31))throw Error('꿈의 개체치를 확인하세요.');
 const dexIvs=Object.fromEntries(keys.map(k=>[k,Math.max(rolled[k],Math.floor(random()*31))]));
 return {dexIvs,partyIvs:Object.fromEntries(keys.map(k=>[k,Math.max(dexIvs[k],previous[k])]))};
}

// Returns a new system object: battle-only previews must never update the dex.
export function recordWeirdDreamDex(system,mon,dexIvs,eggMoveIndex,{forBattle=false}={}){
 const next=structuredClone(system),source=sourceSpeciesFor(mon);if(!source)throw Error('꿈의 종족을 확인하세요.');
 if(forBattle)return next;
 const root=rogueSpecies.get(source.starterId)||source,baseTotal=Number(source.baseTotal);
 if(!Number.isFinite(baseTotal))throw Error('꿈의 종족값을 확인하세요.');
 if(baseTotal<=570||mon.shiny)registerStarterCaught(next,{...mon,ivs:{...dexIvs}},{kind:'capture',increment:false});
 if(next.dex?.[root.sourceId]?.caught){
  const progress=starterProgress(next,root.sourceId);progress.candies=Math.min(9999,(progress.candies||0)+1);
  if(Number.isInteger(eggMoveIndex)&&eggMoveIndex>=0&&eggMoveIndex<4)progress.eggMask=(progress.eggMask||0)|(1<<eggMoveIndex);
 }
 return next;
}

// Source Old Gateau adds +20 to the lower stat of each pair; ties select the
// second stat. The caller must persist the resulting non-transferable modifier.
export function weirdDreamOldGateauStats(baseStats){
 const keys=['hp','spe','atk','spa','def','spd'];if(keys.some(key=>!Number.isFinite(baseStats?.[key])||baseStats[key]<1))throw Error('꿈의 기초 능력치를 확인하세요.');
 return [baseStats.hp<baseStats.spe?'hp':'spe',baseStats.atk<baseStats.spa?'atk':'spa',baseStats.def<baseStats.spd?'def':'spd'];
}
// Form-change items live in run.formItems in this project and are not copied.
// Every other held modifier, even a non-transferable one, is carried by source.
export function copyWeirdDreamHeldModifiers(modifiers,oldBoxId,newBoxId){
 if(!Array.isArray(modifiers)||!oldBoxId||!newBoxId||oldBoxId===newBoxId)throw Error('꿈의 소지 도구를 확인하세요.');
 return modifiers.filter(item=>item.boxId===oldBoxId).map(item=>{if(!Number.isSafeInteger(item.count)||item.count<1||['formitem','rareformitem'].includes(item.id))throw Error('꿈의 소지 도구 기록을 확인하세요.');return {...structuredClone(item),boxId:newBoxId};});
}

// Compose a prepared new species with the old party member without touching
// either input. Item ownership and account registration are separate steps.
export function buildWeirdDreamMember(oldMon,newMon,{eggMoves,generatedMoves,primaryType,newSecondType,random,lookup,forBattle=false,abilityCharms=0}){
 if(!oldMon?.boxId||!newMon?.boxId||oldMon.boxId===newMon.boxId||!Number.isFinite(oldMon.maxHp)||oldMon.maxHp<=0||!Number.isFinite(oldMon.hp)||oldMon.hp<0||oldMon.hp>oldMon.maxHp||!newSecondType)throw Error('꿈의 변환 대상을 확인하세요.');
 if(oldMon.fusionSpecies||oldMon.dynamaxed||oldMon.mega||oldMon.primal||oldMon.ultra||oldMon.gigantamax)throw Error('이 폼의 꿈 변환은 아직 지원하지 않습니다.');
 const source=sourceSpeciesFor(newMon);if(!source)throw Error('꿈의 새 종족을 확인하세요.');
 const slot=newMon.rogueAbilitySlot||source.abilities.find(a=>a.key===newMon.ability)?.slot,ability=weirdDreamHiddenAbility(source.abilities,slot,abilityCharms,random);
 const {dexIvs,partyIvs}=weirdDreamIvs(newMon.ivs,oldMon.ivs,random),natures=['hardy','docile','bashful','quirky','serious'],nature=natures[Math.floor(random()*natures.length)];
 const learned=weirdDreamMoves(oldMon,eggMoves,generatedMoves,primaryType,random,lookup),types=[newMon.types[0],newSecondType];
 const passive=oldMon.roguePassiveAbility?sourceAbility(source.passiveAbilityId):null;
 if(oldMon.roguePassiveAbility&&!passive)throw Error('새 포켓몬의 패시브 특성을 확인하세요.');
 let mon=configure({...structuredClone(newMon),...learned,ability:ability.key,rogueAbilitySlot:ability.slot,ivs:partyIvs,nature,pokerus:!!oldMon.pokerus,luck:oldMon.luck||0,roguePassiveAbility:passive,types,rogueTypes:types,experience:0},{level:oldMon.level,nature});
 delete mon.eggMoveIndex;delete mon.eggMove;
 if(!forBattle){mon.hp=oldMon.hp>0?Math.min(mon.maxHp,Math.ceil(oldMon.hp/oldMon.maxHp*mon.maxHp)):0;mon.status=oldMon.hp>0&&mon.ability!=='comatose'?oldMon.status||null:null;mon.rogueStatusState=mon.status?structuredClone(oldMon.rogueStatusState||null):null;}
 return {mon,dexIvs,eggMoveIndex:learned.eggMoveIndex,eggMove:learned.eggMove};
}

// Weird Dream performs a second hidden-ability roll after the initial ability
// selection, using the same charm denominators as wild ability generation.
export function weirdDreamHiddenAbility(abilities,currentSlot,charms,random){
 if(!Array.isArray(abilities)||typeof random!=='function'||!Number.isFinite(charms))throw Error('꿈의 특성을 확인하세요.');
 const current=abilities.find(a=>a.slot===currentSlot),hidden=abilities.find(a=>a.slot==='hidden');if(!current)throw Error('선택된 특성을 확인하세요.');
 if(!hidden||current.slot==='hidden')return current;
 const count=Math.min(4,Math.max(0,Math.floor(charms))),denominator=count?256*2**(-1-count):256;
 return Math.floor(random()*denominator)===0?hidden:current;
}

// Stage a whole-party replacement transaction. The returned copies can be
// reviewed and persisted atomically by a future encounter handler; nothing in
// this function changes the active run or the original account object.
export function stageWeirdDreamParty(run,system,drafts){
 if(!Array.isArray(run?.party)||!Array.isArray(run?.modifiers)||!Array.isArray(drafts)||drafts.length!==run.party.length)throw Error('꿈의 파티 기록을 확인하세요.');
 const previousIds=run.party.map(mon=>mon.boxId),newIds=drafts.map(d=>d.mon?.boxId),oldIds=drafts.map(d=>d.oldBoxId);
 if(new Set(previousIds).size!==previousIds.length||new Set(oldIds).size!==oldIds.length||new Set(newIds).size!==newIds.length||oldIds.some(id=>!previousIds.includes(id))||newIds.some(id=>!id||previousIds.includes(id)))throw Error('꿈의 포켓몬 식별자를 확인하세요.');
 if(newIds.some(id=>run.modifiers.some(item=>item.boxId===id)||Object.hasOwn(run.formItems||{},id)))throw Error('꿈의 새 식별자가 기존 도구 기록과 충돌합니다.');
 // Native items and form-change items need source-specific transfer handling.
 if(run.party.some(mon=>mon.item||(run.formItems?.[mon.boxId]||[]).length))throw Error('이 소지 도구의 꿈 변환은 아직 지원하지 않습니다.');
 const ivKeys=['hp','atk','def','spa','spd','spe'];if(drafts.some(d=>!sourceSpeciesFor(d.mon)||ivKeys.some(k=>!Number.isInteger(d.dexIvs?.[k])||d.dexIvs[k]<0||d.dexIvs[k]>31)))throw Error('꿈의 포켓몬 자료를 확인하세요.');
 const staged=structuredClone(run),byOld=new Map(drafts.map(d=>[d.oldBoxId,d])),copies=[];let account=structuredClone(system);
 for(const old of run.party){const d=byOld.get(old.boxId);copies.push(...copyWeirdDreamHeldModifiers(run.modifiers,old.boxId,d.mon.boxId));account=recordWeirdDreamDex(account,d.mon,d.dexIvs,d.eggMoveIndex);}
 staged.party=previousIds.map(id=>structuredClone(byOld.get(id).mon));staged.modifiers=[...staged.modifiers.filter(item=>!previousIds.includes(item.boxId)),...copies];
 return {run:staged,system:account};
}
