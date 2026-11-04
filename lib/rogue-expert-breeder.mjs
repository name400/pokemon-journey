import {rogueReferenceData,rogueSpecies,sourceSpeciesFor} from './rogue-reference.mjs';
import {addClassicFriendship} from './rogue-classic-growth.mjs';
import {classicRandom} from './rogue-classic-state.mjs';
import {grantClassicEventEgg} from './rogue-egg-shop.mjs';
// Source facts from the-expert-pokemon-breeder-encounter.ts, pinned to 7c088125.
// These helpers do not spawn the encounter or modify a user's save.
const pool1=[
 [['PICHU',0],['PIKACHU',45],['RAICHU',75]],[['PICHU',0],['PIKACHU',45],['ALOLA_RAICHU',75]],
 [['IGGLYBUFF',0],['JIGGLYPUFF',45],['WIGGLYTUFF',75]],[['TOGEPI',0],['TOGETIC',45],['TOGEKISS',75]],
 [['TYROGUE',0],['HITMONLEE',60]],[['TYROGUE',0],['HITMONCHAN',60]],[['TYROGUE',0],['HITMONTOP',60]],
 [['SMOOCHUM',0],['JYNX',45]],[['AZURILL',0],['MARILL',45],['AZUMARILL',75]],[['BUDEW',0],['ROSELIA',45],['ROSERADE',75]],
 [['CHINGLING',0],['CHIMECHO',60]],[['BONSLY',0],['SUDOWOODO',60]],[['MIME_JR',0],['MR_MIME',60]],
 [['MIME_JR',0],['GALAR_MR_MIME',60],['MR_RIME',75]],[['HAPPINY',0],['CHANSEY',45],['BLISSEY',75]],
 [['MANTYKE',0],['MANTINE',60]],[['TOXEL',0],['TOXTRICITY',60]],
];
const pool2=[
 [['DITTO',0]],[['ELEKID',0],['ELECTABUZZ',45],['ELECTIVIRE',75]],[['MAGBY',0],['MAGMAR',45],['MAGMORTAR',75]],
 [['WYNAUT',0],['WOBBUFFET',60]],[['MUNCHLAX',0],['SNORLAX',60]],[['RIOLU',0],['LUCARIO',60]],[['AUDINO',0]],
];
function resolve(name){const id=rogueReferenceData.enums.SpeciesId[name];if(!Number.isInteger(id)||!rogueSpecies.has(id))throw Error('브리더 종족 자료를 확인하세요: '+name);return id;}
function pickPool(pool,wave,random){const copy=pool.slice();for(let i=copy.length-1;i>0;i--){const roll=random();if(!Number.isFinite(roll)||roll<0||roll>=1)throw Error('브리더 난수를 확인하세요.');const j=Math.floor(roll*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}const group=copy.at(-1),chosen=[...group].reverse().find(([,at])=>wave>=at);return resolve(chosen[0]);}
export function classicExpertBreederTeamSpecies(wave,biome,random){
 if(!Number.isInteger(wave)||wave<1||wave>200||typeof random!=='function')throw Error('브리더 웨이브를 확인하세요.');
 const lead=resolve(wave<45?'CLEFFA':wave<75?'CLEFAIRY':'CLEFABLE');
 return Number(biome)===rogueReferenceData.enums.BiomeId.SPACE?[lead,lead,lead]:[lead,pickPool(pool1,wave,random),pickPool(pool2,wave,random)];
}
export function classicExpertBreederEggCounts(baseTotal,starterCost){
 if(!Number.isFinite(baseTotal)||baseTotal<0||starterCost!=null&&(!Number.isFinite(starterCost)||starterCost<0))throw Error('브리더 알 조건을 확인하세요.');
 const bstPoints=Math.min(Math.max(Math.floor((680-baseTotal)/20),1),18),starterPoints=starterCost==null?0:Math.min(Math.max(Math.floor(7-starterCost)*2,0),12),points=Math.min(bstPoints+starterPoints,30),remaining=points-Math.min(points,5);
 return {common:Math.min(points,5)+remaining%4,rare:Math.floor(remaining/4)};
}
export function classicExpertBreederCandidates(run){
 if(!Array.isArray(run?.party)||run.party.length<4||run.challenges?.length)return [];
 const candidates=run.party.filter(mon=>mon.hp>0);if(candidates.length<3)return [];
 if(candidates.some(mon=>mon.fusionSpecies||!Number.isFinite(mon.friendship)||!sourceSpeciesFor(mon)))return [];
 return [...candidates].sort((a,b)=>a.friendship-b.friendship).slice(0,3).map(mon=>{
  const source=sourceSpeciesFor(mon),form=source.formList.find(f=>f.formIndex===(mon.rogueFormIndex||0));
  if(mon.rogueFormIndex&&!form?.baseStats)throw Error('브리더 폼 자료를 확인하세요.');
  const stats=form?.baseStats||source.baseStats,baseTotal=Object.values(stats).reduce((sum,value)=>sum+value,0),root=rogueSpecies.get(source.starterId)||source;
  return {boxId:mon.boxId,friendship:mon.friendship,...classicExpertBreederEggCounts(baseTotal,root.starterCost)};
 });
}

// Stage the selected solo fighter and preserve every benched object and held
// effect in the run save. This does not start a battle or mutate the input.
export function stageExpertBreederSolo(run,boxId){
 if(run?.screen!=='mystery'||run.mystery?.type!=='expert-breeder'||run.mystery.stage!=='confirm'||run.mystery.selection?.boxId!==boxId||!Array.isArray(run.modifiers))throw Error('브리더 선택을 확인하세요.');
 const choices=classicExpertBreederCandidates(run),choice=choices.find(entry=>entry.boxId===boxId);if(!choice)throw Error('브리더 참가 포켓몬을 확인하세요.');
 const index=run.party.findIndex(mon=>mon.boxId===boxId),party=structuredClone(run.party);[party[0],party[index]]=[party[index],party[0]];
 const savedParty=party.slice(1),savedIds=new Set(savedParty.map(mon=>mon.boxId));if(savedIds.size!==savedParty.length||savedIds.has(boxId))throw Error('브리더 파티 식별자를 확인하세요.');
 const held=run.modifiers.filter(m=>savedIds.has(m.boxId));if(held.some(m=>!Number.isSafeInteger(m.count)||m.count<1))throw Error('브리더 보관 도구를 확인하세요.');
 const next=structuredClone(run);next.party=[party[0]];next.modifiers=next.modifiers.filter(m=>!savedIds.has(m.boxId));next.mystery={...next.mystery,stage:'battle',chosenBoxId:boxId,rewardEggs:{common:choice.common,rare:choice.rare},savedParty,savedModifiers:structuredClone(held)};
 return next;
}
// Restore the exact benched records once. Friendship reward is handled by the
// eventual game handler, which has access to the user's starter system.
export function restoreExpertBreederParty(run,{won}){
 const m=run?.mystery;if(m?.type!=='expert-breeder'||m.stage!=='battle'||typeof won!=='boolean'||!Array.isArray(m.savedParty)||!Array.isArray(m.savedModifiers)||run.party?.length!==1||run.party[0].boxId!==m.chosenBoxId)throw Error('브리더 복원 기록을 확인하세요.');
 const ids=new Set(m.savedParty.map(mon=>mon.boxId));if(ids.size!==m.savedParty.length||ids.has(m.chosenBoxId)||run.modifiers.some(item=>ids.has(item.boxId))||m.savedModifiers.some(item=>!ids.has(item.boxId)||!Number.isSafeInteger(item.count)||item.count<1))throw Error('브리더 보관 기록이 충돌합니다.');
 const next=structuredClone(run);if(!won)next.party[0].friendship=0;next.party.push(...structuredClone(m.savedParty));next.modifiers.push(...structuredClone(m.savedModifiers));next.mystery.stage=won?'won':'lost';delete next.mystery.savedParty;delete next.mystery.savedModifiers;return next;
}
// Source grants 20 friendship after a win, including held Soothe Bells, and
// resets friendship on loss. The account copy includes earned candy progress.
export function finishExpertBreederParty(run,system,{won}){
 const next=restoreExpertBreederParty(run,{won}),account=structuredClone(system);
 if(won){const chosen=next.party[0],bells=next.modifiers.filter(item=>item.id==='soothebell'&&item.boxId===chosen.boxId).reduce((sum,item)=>sum+item.count,0);addClassicFriendship(chosen,20,account,{sootheBells:bells});}
 return {run:next,system:account};
}

// Generate the complete fixed egg batch on a document copy; an exception or
// retry cannot partially consume the original save or duplicate its awards.
export function stageExpertBreederEggs(document){
 const copy=structuredClone(document),state=copy?.classic,run=Number.isInteger(state?.activeSlot)?state.slots?.[state.activeSlot]:null,m=run?.mystery;
 if(m?.type!=='expert-breeder'||m.stage!=='won'||!Number.isInteger(run.wave)||!m.rewardEggs)throw Error('브리더 알 보상을 확인하세요.');
 if(m.eggsGranted)return {document:copy,alreadyGranted:true};
 const {common,rare}=m.rewardEggs;if(!Number.isInteger(common)||common<0||common>8||!Number.isInteger(rare)||rare<0||rare>6||common+4*rare>30)throw Error('브리더 알 개수를 확인하세요.');
 for(const [tier,count] of [['common',common],['rare',rare]])for(let index=0;index<count;index++)grantClassicEventEgg(copy,run,{tier,awardKey:`expert-breeder:${run.wave}:${tier}:${index}`,descriptor:'포켓몬 브리더'},()=>classicRandom(run));
 m.eggsGranted=true;return {document:copy,alreadyGranted:false};
}
