import {ensureClassicState,validateSlot,classicSlotSummaries} from './rogue-classic-state.mjs';
import {registerStarterCaught,starterLegalMoves,starterProgress} from './rogue-starter-system.mjs';
import {sourceSpeciesFor,rogueForms,rogueSpecies,makeReferenceMon} from './rogue-reference.mjs';
import {configure,rules} from './pokemon-config.mjs';

export function rogueAdminView(document,{destination='starter',runSlot=0}={}){
 const state=ensureClassicState(document);let box=[];
 if(destination==='starter')box=[...new Map([...(document.collection||[]),...(state.adminCollection||[])].map(p=>[p.boxId,p])).values()];
 if(destination==='run')box=state.slots[validateSlot(runSlot)]?.party||[];
 const starterOptions=destination==='starter'?[...rogueSpecies.values()].filter(p=>p.isStarter).map(p=>{
  const moves=starterLegalMoves(state.system,p.sourceId),dex=state.system.dex?.[p.sourceId],progress=state.system.starterData?.[p.sourceId],preferred=Array.isArray(progress?.adminPreferredMoves)?progress.adminPreferredMoves.filter(move=>moves.includes(move)):[];
  return {id:p.pokemonId,moves,preferredMoves:preferred.length?preferred:moves.slice(0,4),registered:!!dex?.registered,shinyUnlocked:!!dex?.shiny,ivs:dex?.registered?{...dex.ivs}:null,defaultNature:dex?.natures?.includes(progress?.adminPreferredNature)?progress.adminPreferredNature:dex?.natures?.[0]||null};
 }):[];
 return {box,runSlots:classicSlotSummaries(document),starterOptions,voucherCounts:Object.fromEntries(['regular','plus','premium','golden'].map(type=>[type,Number.isSafeInteger(state.system.vouchers?.[type])&&state.system.vouchers[type]>=0?state.system.vouchers[type]:0]))};
}
function runMon(mon,boxId){const record=sourceSpeciesFor(mon);if(!record)throw Error('로그라이크에서 지원하는 종·폼이 아닙니다.');const form=rogueForms.get(mon.id);return configure({...mon,boxId,origin:'admin',rogueSourceId:record.sourceId,rogueFormIndex:form?.formIndex||0,rogueBaseStats:{...(form?.baseStats||record.baseStats)},rogueTypes:[...(form?.types||record.types)],rogueBattleSpecies:form?.nativeSpecies||null,rogueSpriteKey:form?.spriteKey||null,sourceImage:form?.sourceImage||null,sourceBackImage:form?.sourceBackImage||null,sourceShinyImage:form?.sourceShinyImage||null,sourceShinyBackImage:form?.sourceShinyBackImage||null,baseExperience:record.baseExp,captureRate:record.catchRate,rogueMetBiome:-1});}
export function mutateRogueAdmin(document,payload,mon,boxId){
 const state=ensureClassicState(document),destination=payload.destination;
 if(!['starter','run'].includes(destination))throw Error('영구 스타터 등록 또는 도전 파티 중 지급·수정할 위치를 선택하세요.');
 if(destination!=='starter'||payload.action!=='grantPokemon')throw Error('로그라이크 관리자는 스타터 종 등록만 할 수 있습니다. 진행 중인 파티와 개별 능력은 수정할 수 없습니다.');
 const record=sourceSpeciesFor(mon),form=rogueForms.get(Number(mon?.id));
 if(!record?.isStarter||form?.formIndex>0||Number(mon.id)!==record.pokemonId)throw Error('기본 형태의 스타터로 선택할 수 있는 포켓몬을 골라 주세요.');
 const statKeys=['hp','atk','def','spa','spd','spe'];
 if(!payload.ivs||typeof payload.ivs!=='object'||statKeys.some(key=>!Number.isInteger(payload.ivs[key])||payload.ivs[key]<0||payload.ivs[key]>31))throw Error('개체값은 각 능력치별 0–31의 정수여야 합니다.');
 if(typeof payload.nature!=='string'||!Object.hasOwn(rules.natures,payload.nature))throw Error('유효한 성격을 선택하세요.');
 if(payload.shiny!==undefined&&typeof payload.shiny!=='boolean')throw Error('색이 다른 모습 설정을 확인하세요.');
 const legalMoves=starterLegalMoves(state.system,record.sourceId);
 if(!Array.isArray(payload.moves)||payload.moves.length<1||payload.moves.length>4||new Set(payload.moves).size!==payload.moves.length||payload.moves.some(move=>typeof move!=='string'||!legalMoves.includes(move)))throw Error('이 스타터가 선택할 수 있는 시작 기술 또는 해금된 알 기술 중 1–4개를 선택하세요.');
 const ivs=Object.fromEntries(statKeys.map(key=>[key,payload.ivs[key]]));
 mon=makeReferenceMon(record.sourceId,5,{ivs,nature:payload.nature,moves:[...payload.moves],shiny:payload.shiny===true,item:'',experience:0});
 const next=runMon(mon,boxId);
 state.adminCollection||=[];state.adminCollection.push(next);
 registerStarterCaught(state.system,next,{kind:'admin',increment:false});
 const progress=starterProgress(state.system,record.sourceId);progress.adminPreferredMoves=[...payload.moves];progress.adminPreferredNature=payload.nature;
 return {destination,runSlot:null,battleRebuilt:false,pokemon:next};
}
