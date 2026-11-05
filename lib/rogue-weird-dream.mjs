import {classicDreamNativeItem as dreamNativeItem} from './rogue-dream-native-items.mjs';
import {normalizeClassicTransientDynamax} from './rogue-transient-dynamax.mjs';
import {validatedClassicDnaFusion,reviewedClassicFusionTransform} from './rogue-dna-fusion.mjs';
// Species-selection foundation for Weird Dream, pinned to PokéRogue 7c088125.
// The event remains disabled until transformation and save semantics are complete.
import {configure,calculateStats} from './pokemon-config.mjs';
import {sourceSpeciesFor,sourceAbility,sourceMove,makeReferenceMon,rogueReferenceData,rogueSpecies} from './rogue-reference.mjs';
import {registerStarterCaught,starterProgress} from './rogue-starter-system.mjs';
import {classicBossSegments} from './rogue-boss.mjs';
import {createClassicCombat} from './rogue-battle-engine.mjs';
import {classicRandom} from './rogue-classic-state.mjs';
import {classicWildAbility} from './rogue-wild-abilities.mjs';
import {classicWildShiny} from './rogue-wild-variants.mjs';
import {Dex} from '@pkmn/sim';
import {moves} from './game.mjs';
import {classicNativeForm} from './rogue-transformations.mjs';
import {classicTypesWithCustomSecond} from './rogue-custom-types.mjs';
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
 if(!Array.isArray(party)||!party.length||party.some(mon=>!Number.isSafeInteger(mon.level)||mon.level<1||unsupportedDreamDynamax(mon)))throw Error('꿈의 파티 레벨을 확인하세요.');
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

// Rebuild the derived stat fields from the held records, rather than copying
// the old species' calculated stats onto a different species.
export function applyWeirdDreamHeldStats(mon,held){
 const boosts={},juice=[];let dew=0,brace=0;const validStats=['hp','atk','def','spa','spd','spe'];
 for(const item of held){
  if(!Number.isSafeInteger(item.count)||item.count<1)throw Error('꿈의 도구 중첩을 확인하세요.');
  if(item.id==='basestatbooster'){if(!validStats.includes(item.stat))throw Error('꿈의 능력치 도구를 확인하세요.');boosts[item.stat]=(boosts[item.stat]||0)+item.count;}
  if(item.id==='shucklejuice'){if(!Number.isFinite(item.statDelta)||item.count>99)throw Error('꿈의 주스 효과를 확인하세요.');for(let i=0;i<item.count;i++)juice.push(item.statDelta);}
  if(item.id==='souldew')dew+=item.count;if(item.id==='machobrace')brace+=item.count;
 }
 return {...mon,rogueBaseBoosts:boosts,rogueJuiceMods:juice,rogueNatureDewCount:dew,rogueMachoBraceCount:brace,rogueOldGateau:held.some(item=>item.id==='oldgateau')};
}

// Compose a prepared new species with the old party member without touching
// either input. Item ownership and account registration are separate steps.
export function buildWeirdDreamMember(oldMon,newMon,{eggMoves,generatedMoves,primaryType,newSecondType,random,lookup,forBattle=false,abilityCharms=0,allowFusion=false}){
 if(!oldMon?.boxId||!newMon?.boxId||oldMon.boxId===newMon.boxId||!Number.isFinite(oldMon.maxHp)||oldMon.maxHp<=0||!Number.isFinite(oldMon.hp)||oldMon.hp<0||oldMon.hp>oldMon.maxHp||!newSecondType)throw Error('꿈의 변환 대상을 확인하세요.');
 if(oldMon.fusionSpecies&&(!allowFusion||!validatedClassicDnaFusion(oldMon))||unsupportedDreamDynamax(oldMon))throw Error('이 폼의 꿈 변환은 아직 지원하지 않습니다.');
 const source=sourceSpeciesFor(newMon);if(!source)throw Error('꿈의 새 종족을 확인하세요.');
 const slot=newMon.rogueAbilitySlot||source.abilities.find(a=>a.key===newMon.ability)?.slot,ability=weirdDreamHiddenAbility(source.abilities,slot,abilityCharms,random);
 const {dexIvs,partyIvs}=weirdDreamIvs(newMon.ivs,oldMon.ivs,random),natures=['hardy','docile','bashful','quirky','serious'],nature=natures[Math.floor(random()*natures.length)];
 const learned=weirdDreamMoves(oldMon,eggMoves,generatedMoves,primaryType,random,lookup),secondType=typeof newSecondType==='function'?newSecondType():newSecondType,types=[newMon.types[0],secondType];if(!secondType)throw Error('꿈의 타입을 확인하세요.');
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
 if(run.pendingMoves?.length||run.pendingGrowth?.length||run.pendingCapture||run.pendingEvolution)throw Error('진행 중인 성장 또는 포획을 먼저 마쳐야 합니다.');
 const previousIds=run.party.map(mon=>mon.boxId),newIds=drafts.map(d=>d.mon?.boxId),oldIds=drafts.map(d=>d.oldBoxId);
 if(new Set(previousIds).size!==previousIds.length||new Set(oldIds).size!==oldIds.length||new Set(newIds).size!==newIds.length||oldIds.some(id=>!previousIds.includes(id))||newIds.some(id=>!id||previousIds.includes(id)))throw Error('꿈의 포켓몬 식별자를 확인하세요.');
 if(newIds.some(id=>run.modifiers.some(item=>item.boxId===id)||Object.hasOwn(run.formItems||{},id)||Object.hasOwn(run.formItemStates||{},id)))throw Error('꿈의 새 식별자가 기존 도구 기록과 충돌합니다.');
 // Form-change items are excluded; only reviewed native items are copied.
 if(run.party.some(mon=>dreamNativeItem(mon,run)===null||!dreamFusionAllowed(mon,run)||unsupportedDreamDynamax(mon)))throw Error('이 소지 도구 또는 폼의 꿈 변환은 아직 지원하지 않습니다.');
 const ivKeys=['hp','atk','def','spa','spd','spe'];if(drafts.some(d=>!sourceSpeciesFor(d.mon)||ivKeys.some(k=>!Number.isInteger(d.dexIvs?.[k])||d.dexIvs[k]<0||d.dexIvs[k]>31)))throw Error('꿈의 포켓몬 자료를 확인하세요.');
 if(drafts.some(d=>d.mon.level!==run.party.find(mon=>mon.boxId===d.oldBoxId)?.level))throw Error('꿈의 포켓몬 레벨이 변경됐습니다.');
 if(drafts.some(d=>d.mon.fusionSpecies||d.mon.mega||d.mon.primal||d.mon.ultra||d.mon.dynamaxed||d.mon.gigantamax||Number(d.mon.rogueFormIndex)>0))throw Error('이 폼의 꿈 변환은 아직 지원하지 않습니다.');
 const staged=structuredClone(run),byOld=new Map(drafts.map(d=>[d.oldBoxId,d])),copies=[];let account=structuredClone(system);
 for(const old of run.party){const d=byOld.get(old.boxId);copies.push(...copyWeirdDreamHeldModifiers(run.modifiers,old.boxId,d.mon.boxId));account=recordWeirdDreamDex(account,d.mon,d.dexIvs,d.eggMoveIndex);}
 staged.party=previousIds.map(id=>{
  const d=byOld.get(id),old=run.party.find(mon=>mon.boxId===id),source=sourceSpeciesFor(d.mon),held=copies.find(item=>item.id==='oldgateau'&&item.boxId===d.mon.boxId);
  if(source.baseTotal<570&&!held)copies.push({id:'oldgateau',boxId:d.mon.boxId,count:1,transferable:false});
  const next=configure(applyWeirdDreamHeldStats({...structuredClone(d.mon),...(old.rogueFusionSpecialHeldRule==='source-v1'?{rogueFusionSpecialHeldRule:'source-v1'}:{}),item:dreamNativeItem(old,run)},copies.filter(item=>item.boxId===d.mon.boxId)));next.hp=old.hp>0?Math.min(next.maxHp,Math.ceil(old.hp/old.maxHp*next.maxHp)):0;return next;
 });
 staged.modifiers=[...staged.modifiers.filter(item=>!previousIds.includes(item.boxId)),...copies];
 if(staged.formItems)for(const id of previousIds)delete staged.formItems[id];
 if(staged.formItemStates)for(const id of previousIds)delete staged.formItemStates[id];
 return {run:staged,system:account};
}

// Commit only a previously saved, confirmed server-side draft. Staging must
// succeed completely before the document is changed; the API's revision check
// remains responsible for concurrent requests.
export function commitWeirdDreamParty(document){
 const state=document?.classic,slot=state?.activeSlot,run=Number.isInteger(slot)?state.slots?.[slot]:null,mystery=run?.mystery;
 if(run?.screen!=='mystery'||mystery?.type!=='weird-dream'||mystery.stage!=='confirm'||mystery.selection?.job!=='transform'||!Array.isArray(mystery.drafts))throw Error('확인된 꿈의 변환을 찾지 못했습니다.');
 const staged=stageWeirdDreamParty(run,state.system,mystery.drafts),passive=grantWeirdDreamRunPassive(staged.run.party,()=>classicRandom(staged.run));staged.run.party=passive.party;staged.run.mystery.stage='resolved';staged.run.mystery.job='transform';staged.run.mystery.passiveUnlockedBoxId=passive.boxId;delete staged.run.mystery.drafts;
 staged.run.mysteryState||={spawnWeight:3,history:[]};staged.run.mysteryState.completedWaves||=[];if(!staged.run.mysteryState.completedWaves.includes(run.wave))staged.run.mysteryState.completedWaves.push(run.wave);
 state.slots[slot]=staged.run;state.system=staged.system;return staged.run;
}

// Prepare the alternate party without touching player/account state. Source
// clones held modifiers as non-transferable for this fight.
export function stageWeirdDreamBattle(run,drafts){
 if(!Array.isArray(run?.party)||!Array.isArray(run?.modifiers)||!Array.isArray(drafts)||drafts.length!==run.party.length)throw Error('꿈의 배틀 파티를 확인하세요.');
 const oldIds=run.party.map(mon=>mon.boxId),newIds=drafts.map(d=>d.mon?.boxId),draftOldIds=drafts.map(d=>d.oldBoxId);
 if(new Set(oldIds).size!==oldIds.length||new Set(draftOldIds).size!==draftOldIds.length||new Set(newIds).size!==newIds.length||draftOldIds.some(id=>!oldIds.includes(id))||newIds.some(id=>!id||oldIds.includes(id)||run.modifiers.some(m=>m.boxId===id)||Object.hasOwn(run.formItems||{},id)||Object.hasOwn(run.formItemStates||{},id)))throw Error('꿈의 배틀 식별자를 확인하세요.');
 if(run.party.some(mon=>dreamNativeItem(mon,run)===null||!dreamFusionAllowed(mon,run)||unsupportedDreamDynamax(mon)))throw Error('이 포켓몬의 꿈 배틀은 아직 지원하지 않습니다.');
 if(drafts.some(d=>d.mon?.level!==run.party.find(mon=>mon.boxId===d.oldBoxId)?.level))throw Error('꿈의 배틀 레벨이 변경됐습니다.');
 const byOld=new Map(drafts.map(d=>[d.oldBoxId,d]));
 return run.party.map(old=>{
  const draft=byOld.get(old.boxId),source=sourceSpeciesFor(draft.mon);if(!source||draft.mon.fusionSpecies||draft.mon.mega||draft.mon.primal||draft.mon.ultra||draft.mon.dynamaxed||draft.mon.gigantamax||Number(draft.mon.rogueFormIndex)>0)throw Error('꿈의 배틀 종족을 확인하세요.');
  const fixed=copyWeirdDreamHeldModifiers(run.modifiers,old.boxId,draft.mon.boxId).map(item=>({...item,transferable:false}));
  let gateau=fixed.some(item=>item.id==='oldgateau');if(source.baseTotal<570&&!gateau){fixed.push({id:'oldgateau',boxId:draft.mon.boxId,count:1,transferable:false});gateau=true;}
  const nativeItem=dreamNativeItem(old,run);let enemy=configure(applyWeirdDreamHeldStats({...structuredClone(draft.mon),...(old.rogueFusionSpecialHeldRule==='source-v1'?{rogueFusionSpecialHeldRule:'source-v1'}:{}),item:nativeItem,rogueNativeItemNontransferable:!!nativeItem,origin:'encounter',status:null,rogueStatusState:null,rogueFixedModifiers:fixed},fixed));enemy.hp=enemy.maxHp;
  enemy.rogueBoss=source.baseTotal>570;enemy.rogueBossSegments=enemy.rogueBoss?classicBossSegments(run.wave,enemy.level,source.baseTotal,{boss:true}):0;return enemy;
 });
}

// Prepare and save the fight as a single document update. Presentation metadata
// is supplied by the encounter initializer and validated before use.
export function commitWeirdDreamBattle(document,arenaOptions={}){
 const state=document?.classic,slot=state?.activeSlot,run=Number.isInteger(slot)?state.slots?.[slot]:null,mystery=run?.mystery,trainer=mystery?.alternateTrainer;
 if(run?.screen!=='mystery'||mystery?.type!=='weird-dream'||mystery.stage!=='confirm'||mystery.selection?.job!=='battle'||!Array.isArray(mystery.drafts)||typeof trainer?.name!=='string'||!trainer.name)throw Error('확인된 꿈의 배틀을 찾지 못했습니다.');
 const staged=structuredClone(run),system=structuredClone(state.system),team=stageWeirdDreamBattle(staged,staged.mystery.drafts);
 staged.encounter={kind:'mystery',key:'weird-dream',trainer:{...structuredClone(trainer),hasVoucher:false},noFlee:true,noCapture:true,team,doubles:false};
 staged.participants=[];staged.awardedFoes=[];staged.expNotices=[];staged.combat=createClassicCombat(staged,team,{system,trainer:true,doubles:false,...arenaOptions});
 staged.party=staged.combat.teams[0];staged.initialSwitchSlots=[];staged.screen='battle';staged.waveLog=[...(staged.combat.log||[])];staged.waveLogTurnStart=0;staged.mystery.stage='battle';staged.mystery.job='battle';delete staged.mystery.drafts;
 state.slots[slot]=staged;state.system=system;return staged;
}

// Source unlocks one passive for this run only; it does not alter starter data.
export function grantWeirdDreamRunPassive(party,random){
 if(!Array.isArray(party)||typeof random!=='function')throw Error('꿈의 패시브 대상을 확인하세요.');
 const eligible=party.map((mon,index)=>({mon,index})).filter(({mon})=>!mon.roguePassiveAbility);if(!eligible.length)return {party:structuredClone(party),boxId:null};
 const selected=eligible.length===1?eligible[0]:eligible[Math.floor(random()*eligible.length)],source=sourceSpeciesFor(selected.mon),form=source?.formList?.find(f=>f.formIndex===(selected.mon.rogueFormIndex||0)),ability=sourceAbility(form?.passiveAbilityId??source?.passiveAbilityId);
 if(!ability)throw Error('꿈의 패시브 특성을 확인하세요.');const next=structuredClone(party);next[selected.index].roguePassiveAbility=ability;return {party:next,boxId:selected.mon.boxId};
}

const dreamTypes=['노말','격투','비행','독','땅','바위','벌레','고스트','강철','불꽃','물','풀','전기','에스퍼','얼음','드래곤','악','페어리'];
const dreamEnglishTypes=['Normal','Fighting','Flying','Poison','Ground','Rock','Bug','Ghost','Steel','Fire','Water','Grass','Electric','Psychic','Ice','Dragon','Dark','Fairy'];
// Reviewed native items have no form-change role and can be copied safely.
function dreamFusionAllowed(mon,run){return !mon.fusionSpecies||run.weirdDreamFusionRule==='validated-v1'&&!!validatedClassicDnaFusion(mon);}
// Accept only a self-consistent G-Max form produced by our transformation
// engine. Other variants remain blocked until their native mappings are checked.
function reviewedDreamGigantamax(mon){
 if(mon?.fusionSpecies){try{return reviewedClassicFusionTransform(mon)?.kind==='gigantamax'&&!!validatedClassicDnaFusion(mon)&&Number.isSafeInteger(mon.hp)&&Number.isSafeInteger(mon.maxHp)&&mon.hp>=0&&mon.hp<=mon.maxHp&&mon.maxHp===calculateStats(mon).hp;}catch{return false;}}
 if(mon?.dynamaxed!==true||mon.gigantamax!==true||mon.fusionSpecies||mon.mega||mon.primal||mon.ultra||mon.eternamax||!Number.isSafeInteger(mon.rogueFormIndex)||mon.rogueFormIndex<1||!['gigantamax','gigantamax-single','gigantamax-rapid'].includes(mon.rogueFormKey))return false;
 const source=sourceSpeciesFor(mon),form=source?.formList.find(f=>f.formIndex===mon.rogueFormIndex),native=Dex.species.get(mon.rogueBattleSpecies||''),expected=source&&form?classicNativeForm(source,form):null,parentKey=mon.rogueFormKey==='gigantamax-rapid'?'rapid-strike':mon.rogueFormKey==='gigantamax-single'?'single-strike':null,parent=parentKey?source?.formList.find(f=>f.formKey===parentKey):null;
 if(!form||Number(mon.id)!==(parent?.pokemonId??source.pokemonId)||!Number.isSafeInteger(mon.level)||mon.level<1||form.formKey!==mon.rogueFormKey||!native.exists||!native.forme.endsWith('Gmax')||!expected?.exists||native.id!==expected.id||!form.baseStats||['hp','atk','def','spa','spd','spe'].some(stat=>mon.rogueBaseStats?.[stat]!==form.baseStats[stat]))return false;
 try{const types=classicTypesWithCustomSecond(mon,form.types);return Number.isSafeInteger(mon.hp)&&Number.isSafeInteger(mon.maxHp)&&mon.hp>=0&&mon.hp<=mon.maxHp&&mon.maxHp===calculateStats(mon).hp&&Array.isArray(mon.rogueTypes)&&mon.rogueTypes.length===types.length&&mon.rogueTypes.every((type,index)=>type===types[index]);}catch{return false;}
}
function unsupportedDreamDynamax(mon){return !!(mon?.dynamaxed||mon?.gigantamax||String(mon?.rogueFormKey||'').startsWith('gigantamax'))&&!reviewedDreamGigantamax(mon);}
// The battle engine clears ordinary, temporary Dynamax before the next battle.
// A mystery encounter replaces that battle, so perform the same HP conversion on
// a copy before preparing it. Gmax uses separate proof; ambiguous states stay blocked.
function normalizeDreamTransientDynamax(party){
 const result=structuredClone(party);let changed=false;
 for(const [index,mon] of result.entries()){if(mon.gigantamax||String(mon.rogueFormKey||'').startsWith('gigantamax')){if(!reviewedDreamGigantamax(mon))return null;continue;}if(!mon.dynamaxed)continue;if(mon.dynamaxed!==true||(mon.fusionSpecies?!validatedClassicDnaFusion(mon):Number(mon.rogueFormIndex||0)!==0))return null;
  try{result[index]=normalizeClassicTransientDynamax(mon);}catch{return null;}changed=true;
 }
 return {party:result,changed};
}
// Prepare an encounter on a copy: unsupported party states remain in their
// original flow. Current generator is explicitly a supported subset; its RNG
// sequence and native sprite assets are not yet identical to upstream.
export function prepareWeirdDreamEncounter(run){
 if(!Array.isArray(run?.party)||run.party.length<3||run.pendingMoves?.length||run.pendingGrowth?.length||run.pendingCapture||run.pendingEvolution||run.party.some(p=>!p.boxId||!dreamFusionAllowed(p,run)||dreamNativeItem(p,run)===null||p.rogueSketchRule||!sourceSpeciesFor(p)))return null;
 const normalized=normalizeDreamTransientDynamax(run.party);if(!normalized)return null;
 const copy=structuredClone(run);copy.party=normalized.party;const random=()=>classicRandom(copy),excluded=WEIRD_DREAM_EXCLUDED_SPECIES.map(name=>rogueReferenceData.enums.SpeciesId[name]);
 if(excluded.some(id=>!Number.isInteger(id)))throw Error('꿈의 제외 종족 자료를 확인하세요.');
 const records=[...rogueSpecies.values()].filter(s=>s.abilities?.length&&sourceAbility(s.passiveAbilityId));
 const pool=records.map(s=>({speciesId:s.sourceId,baseTotal:s.baseTotal})),party=copy.party.map(p=>({key:p.boxId,speciesId:sourceSpeciesFor(p).sourceId,baseTotal:Object.values(p.rogueBaseStats||sourceSpeciesFor(p).baseStats).reduce((sum,n)=>sum+n,0)}));
 const plan=planWeirdDreamSpecies(party,pool,excluded,random),charms=(copy.modifiers||[]).filter(m=>m.id==='abilitycharm').reduce((sum,m)=>sum+(m.count||0),0),shinyCharms=(copy.modifiers||[]).filter(m=>m.id==='shinycharm').reduce((sum,m)=>sum+(m.count||0),0),drafts=[];
 const lookup=name=>{const m=Dex.moves.get(moves[name]?.key||name);return m.exists?m:null;},prepared=[];
 for(const choice of plan){
  const old=copy.party.find(p=>p.boxId===choice.key),source=rogueSpecies.get(choice.speciesId),ability=classicWildAbility(source.abilities,charms,random),ivs=Object.fromEntries(['hp','atk','def','spa','spd','spe'].map(k=>[k,Math.floor(random()*32)])),shiny=classicWildShiny(source.sourceId,shinyCharms,random),gender=source.malePercent==null?'N':random()*100<source.malePercent?'M':'F';
  const fresh=makeReferenceMon(source.sourceId,old.level,{boxId:crypto.randomUUID(),ability:ability.key,rogueAbilitySlot:ability.slot,ivs,gender,...shiny,origin:'capture',rogueMetBiome:Number(copy.biome)||0}),root=rogueSpecies.get(source.starterId)||source;
  prepared.push({old,fresh,root});
 }
 for(const {old,fresh,root} of prepared){
  const primary=dreamEnglishTypes[dreamTypes.indexOf(fresh.types[0])];if(!primary)throw Error('꿈의 주 타입을 확인하세요.');
  const result=buildWeirdDreamMember(old,fresh,{eggMoves:(root.eggMoves||[]).map(sourceMove),generatedMoves:[...fresh.moves],primaryType:primary,newSecondType:()=>dreamTypes[Math.floor(random()*dreamTypes.length)],random,lookup,abilityCharms:charms,allowFusion:copy.weirdDreamFusionRule==='validated-v1'});
  drafts.push({oldBoxId:old.boxId,...result});
 }
 return {drafts,rng:copy.rng,...(normalized.changed?{normalizedParty:copy.party}:{}),alternateTrainer:{name:'또 다른 나',title:'트레이너',sprite:'/game/trainers/fallback.svg',moneyMultiplier:0}};
}
