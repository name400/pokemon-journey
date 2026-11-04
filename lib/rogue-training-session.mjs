import {sourceSpeciesFor} from './rogue-reference.mjs';
import {rules} from './pokemon-config.mjs';
// Training Session source facts pinned to PokeRogue 7c088125. These helpers
// do not activate the encounter or mutate an existing player/account record.
const STATS=['hp','atk','def','spa','spd','spe'];
export function classicTrainingEligible(run,mon){
 const actual=Array.isArray(run?.party)?run.party.find(p=>p.boxId===mon?.boxId):null;
 if(!actual||!Number.isFinite(actual.hp)||actual.hp<=0||actual.fusionSpecies||run.challenges?.length||run.party.filter(p=>p.hp>0).length<2)return false;
 // New runs use only the reviewed, ordinary-form and tested held-item subset.
 // Legacy/in-progress training saves keep their existing selection behavior.
 if(run.trainingRule==='source-subset-v1'){
  if(actual.mega||actual.primal||actual.ultra||actual.dynamaxed||actual.gigantamax||Number(actual.rogueFormIndex)>0||actual.rogueAbilityOverride||(run.formItems?.[actual.boxId]||[]).length)return false;
  if(actual.item&&!['leftovers','flameorb','toxicorb'].includes(actual.item))return false;
  if((run.modifiers||[]).some(m=>m.boxId===actual.boxId&&!['focusband','berrysitrus'].includes(m.id)))return false;
 }
 return true;
}
export function classicTrainingOptions(mon){
 const source=sourceSpeciesFor(mon),form=source?.formList?.find(f=>f.formIndex===(mon.rogueFormIndex||0)),raw=form?.abilities?.length?form.abilities:source?.abilities||[],seen=new Set();
 const abilities=mon.rogueAbilityOverride?[]:raw.filter(a=>a?.key&&['primary','secondary','hidden'].includes(a.slot)&&!seen.has(a.key)&&seen.add(a.key)).map(a=>({key:a.key,slot:a.slot,name:rules.abilities[a.key]?.name||a.key}));
 return {natures:Object.entries(rules.natures).map(([key,n])=>({key,name:n.name||key})),abilities};
}
export function classicTrainingSegments(wave,mode){
 if(!Number.isInteger(wave)||wave<10||wave>180||!['iv','nature','ability'].includes(mode))throw Error('훈련 조건을 확인하세요.');
 return Math.min(2+Math.floor(wave/({iv:50,nature:40,ability:30})[mode]),mode==='iv'?5:6);
}
export function classicTrainingIvResult(ivs,random){
 if(typeof random!=='function'||!ivs||STATS.some(k=>!Number.isInteger(ivs[k])||ivs[k]<0||ivs[k]>31))throw Error('훈련 개체값을 확인하세요.');
 const result={...ivs},candidates=STATS.filter(k=>ivs[k]<31),changes=[];
 while(candidates.length&&changes.length<2){
  for(let i=candidates.length-1;i>0;i--){const value=random();if(!Number.isFinite(value)||value<0||value>=1)throw Error('훈련 난수를 확인하세요.');const j=Math.floor(value*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
  const stat=candidates.pop(),before=ivs[stat],increase=(before===1?1:0)+(before<=10?10:before<=20?5:3),after=Math.min(31,before+increase);
  result[stat]=after;changes.push({stat,before,after});
 }
 return {ivs:result,changes};
}

// The original member and its exact modifiers are held in the run save.
export function beginClassicTraining(run,boxId){
 if(run.screen!=='mystery'||run.mystery?.type!=='training-session'||run.mystery.stage!=='confirm'||!['iv','nature','ability'].includes(run.mystery.selection?.job)||run.mystery.selection.boxId!==boxId)throw Error('훈련 선택을 확인하세요.');
 const original=run.party.find(p=>p.boxId===boxId);if(!classicTrainingEligible(run,original))throw Error('훈련할 포켓몬을 확인하세요.');
 const {job,itemId}=run.mystery.selection,options=classicTrainingOptions(original);if(job==='iv'&&itemId||job==='nature'&&!options.natures.some(x=>x.key===itemId)||job==='ability'&&!options.abilities.some(x=>x.key===itemId))throw Error('훈련할 성격이나 특성을 확인하세요.');
 if(!Array.isArray(run.modifiers)||run.party.filter(p=>p.boxId===boxId).length!==1)throw Error('파티와 도구 기록을 확인하세요.');
 const originalCopy=structuredClone(original),held=structuredClone(run.modifiers.filter(m=>m.boxId===boxId));
 if(held.some(m=>!Number.isSafeInteger(m.count)||m.count<1))throw Error('훈련 포켓몬의 도구 기록을 확인하세요.');
 const enemy=structuredClone(originalCopy);enemy.boxId=crypto.randomUUID();enemy.origin='encounter';enemy.hp=enemy.maxHp;enemy.status=null;enemy.rogueStatusState=null;enemy.rogueBoss=true;enemy.rogueBossSegments=classicTrainingSegments(run.wave,job);enemy.rogueNativeItemNontransferable=!!enemy.item;enemy.rogueFixedModifiers=held.map(m=>({...m,boxId:undefined,transferable:false}));
 run.party=run.party.filter(p=>p.boxId!==boxId);run.modifiers=run.modifiers.filter(m=>m.boxId!==boxId);
 run.mystery={type:'training-session',stage:'battle',job,choice:itemId||null,savedMon:originalCopy,savedModifiers:held,enemyBoxId:enemy.boxId};
 return enemy;
}
export function finishClassicTraining(run,random,{won=true}={}){
 const m=run.mystery,mon=m?.savedMon,held=m?.savedModifiers;
 if(m?.type!=='training-session'||m.stage!=='battle'||!['iv','nature','ability'].includes(m.job)||!mon?.boxId||!Array.isArray(held)||run.party.some(p=>p.boxId===mon.boxId)||run.modifiers.some(x=>x.boxId===mon.boxId)||held.some(x=>x.boxId!==mon.boxId||!Number.isSafeInteger(x.count)||x.count<1))throw Error('훈련 복원 기록을 확인하세요.');
 const options=classicTrainingOptions(mon);if(m.job==='nature'&&!options.natures.some(x=>x.key===m.choice)||m.job==='ability'&&!options.abilities.some(x=>x.key===m.choice))throw Error('보관한 훈련 선택을 확인하세요.');
 const result=won&&m.job==='iv'?classicTrainingIvResult(mon.ivs,random):{ivs:{...mon.ivs},changes:[]};
 const choice=m.job==='ability'?options.abilities.find(x=>x.key===m.choice):m.choice;
 return {mon:structuredClone(mon),held:structuredClone(held),job:m.job,choice, ...result};
}
