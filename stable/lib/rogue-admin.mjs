import {ensureClassicState,validateSlot,classicSlotSummaries} from './rogue-classic-state.mjs';
import {registerStarterCaught,starterDexEntry,starterProgress} from './rogue-starter-system.mjs';
import {sourceSpeciesFor,rogueForms} from './rogue-reference.mjs';
import {configure} from './pokemon-config.mjs';
import {createClassicCombat} from './rogue-battle-engine.mjs';

export function rogueAdminView(document,{destination='starter',runSlot=0}={}){
 const state=ensureClassicState(document);let box=[];
 if(destination==='starter')box=[...new Map([...(document.collection||[]),...(state.adminCollection||[])].map(p=>[p.boxId,p])).values()];
 if(destination==='run')box=state.slots[validateSlot(runSlot)]?.party||[];
 return {box,runSlots:classicSlotSummaries(document)};
}
function runMon(mon,boxId){const record=sourceSpeciesFor(mon);if(!record)throw Error('로그라이크에서 지원하는 종·폼이 아닙니다.');const form=rogueForms.get(mon.id);return configure({...mon,boxId,origin:'admin',rogueSourceId:record.sourceId,rogueFormIndex:form?.formIndex||0,rogueBaseStats:{...(form?.baseStats||record.baseStats)},rogueTypes:[...(form?.types||record.types)],rogueBattleSpecies:form?.nativeSpecies||null,rogueSpriteKey:form?.spriteKey||null,sourceImage:form?.sourceImage||null,sourceBackImage:form?.sourceBackImage||null,baseExperience:record.baseExp,captureRate:record.catchRate,rogueMetBiome:-1});}
export function mutateRogueAdmin(document,payload,mon,boxId){
 const state=ensureClassicState(document),destination=payload.destination;
 if(!['starter','run'].includes(destination))throw Error('영구 스타터 등록 또는 도전 파티 중 지급·수정할 위치를 선택하세요.');
 const next=runMon(mon,boxId);let battleRebuilt=false;
 if(destination==='starter'){
  state.adminCollection||=[];if(payload.action==='grantPokemon')state.adminCollection.push(next);else{const current=state.adminCollection.findIndex(p=>p.boxId===boxId),legacy=(document.collection||[]).findIndex(p=>p.boxId===boxId);if(current>=0)state.adminCollection[current]=next;else if(legacy>=0)document.collection[legacy]=next;else throw Error('이 플레이어의 영구 등록 포켓몬이 아닙니다.');}
  registerStarterCaught(state.system,next,{kind:'admin',increment:false});const record=sourceSpeciesFor(next),id=record.isStarter?record.sourceId:record.starterId,dex=starterDexEntry(state.system,id),progress=starterProgress(state.system,id);
  dex.ivs={...next.ivs};dex.adminGranted=true;dex.registered=true;progress.adminMoves=[...next.moves];
 }else{
  const slot=validateSlot(payload.runSlot),run=state.slots[slot];if(!run||['defeat','victory','abandoned'].includes(run.screen))throw Error('진행 중인 도전 슬롯을 선택하세요.');
  if(payload.action==='grantPokemon'){if(run.party.length>=6)throw Error('파티가 6마리입니다. 기존 포켓몬을 선택해 수정하세요.');run.party.push(next);}else{const index=run.party.findIndex(p=>p.boxId===boxId);if(index<0)throw Error('이 도전 파티의 포켓몬이 아닙니다.');run.party[index]=next;}
  if(run.combat&&!run.combat.ended){
   const lead=run.combat.teams[0][run.combat.requests[0].active]?.boxId;run.party.sort((a,b)=>Number(b.boxId===lead)-Number(a.boxId===lead));
   run.combat=createClassicCombat(run,run.combat.teams[1],{trainer:!!run.encounter?.trainer,doubles:!!run.combat.doubles,weather:run.weather,system:state.system});run.party=run.combat.teams[0];run.log=['관리자가 파티를 수정하여 전투가 갱신되었습니다.'];battleRebuilt=true;
  }
  run.updatedAt=Date.now();
 }
 return {destination,runSlot:destination==='run'?payload.runSlot:null,battleRebuilt};
}
