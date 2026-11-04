// Safari Zone subset based on PokéRogue beta 7c088125.
import {Dex} from '@pkmn/sim';
import {classicRandom} from './rogue-classic-state.mjs';
import {classicWildLevel,classicWaveMoney} from './rogue-classic-rules.mjs';
import {classicWildShiny} from './rogue-wild-variants.mjs';
import {rogueSpecies,rogueReferenceData,makeReferenceMon} from './rogue-reference.mjs';

const paradox=new Set(['GREAT_TUSK','SCREAM_TAIL','BRUTE_BONNET','FLUTTER_MANE','SLITHER_WING','SANDY_SHOCKS','ROARING_MOON','WALKING_WAKE','GOUGING_FIRE','RAGING_BOLT','IRON_TREADS','IRON_BUNDLE','IRON_HANDS','IRON_JUGULIS','IRON_MOTH','IRON_THORNS','IRON_VALIANT','IRON_LEAVES','IRON_BOULDER','IRON_CROWN'].map(k=>rogueReferenceData.enums.SpeciesId[k]).filter(Number.isInteger));
const pool=[...rogueSpecies.values()].filter(s=>s.isStarter&&Number.isFinite(s.starterCost)&&s.starterCost<=5&&!s.legendary&&!s.subLegendary&&!s.mythical&&!paradox.has(s.sourceId));
const clamp=n=>Math.max(-6,Math.min(6,n));
const roll=(run,n)=>Math.floor(classicRandom(run)*n);
export const classicSafariCost=run=>classicWaveMoney(run.wave,2);
export function classicSafariStageMultiplier(stage){if(!Number.isInteger(stage)||stage< -6||stage>6)throw Error('사파리 단계를 확인하세요.');return (2+Math.max(0,stage))/(2-Math.min(0,stage));}
export function classicSafariCatchThreshold(catchRate,stage){if(!Number.isFinite(catchRate)||catchRate<=0||catchRate>255)throw Error('포획률을 확인하세요.');const value=Math.round(catchRate*1.5*classicSafariStageMultiplier(stage));return Math.round(1048560/Math.sqrt(Math.sqrt(16711680/value)));}
export function classicSafariFleeRate(catchRate,stage){if(!Number.isFinite(catchRate)||catchRate<=0||catchRate>255)throw Error('포획률을 확인하세요.');return ((255*255-catchRate*catchRate)/255/2)*classicSafariStageMultiplier(stage);}
function offsetSeed(run,index){let n=2166136261;for(const c of String(run.seed||run.id)+':safari:'+run.wave+':'+index){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0||1;}
export function classicSafariPokemon(run,index){
 if(!Number.isInteger(index)||index<0||index>2||!pool.length)throw Error('사파리 조우를 확인하세요.');
 const local={rng:offsetSeed(run,index)},record=pool[roll(local,pool.length)],level=classicWildLevel(run.wave,()=>classicRandom(local),{boss:false}),regular=record.abilities.filter(a=>a.slot!=='hidden'),hidden=record.abilities.find(a=>a.slot==='hidden');
 let ability=hidden&&(roll(local,256)===0||roll(local,256)===0)?hidden:regular[roll(local,regular.length)]||record.abilities[0];
 const charms=Math.min(4,(run.modifiers||[]).filter(m=>m.id==='shinycharm').reduce((n,m)=>n+(m.count||0),0));let shiny=classicWildShiny(record.sourceId,charms,()=>classicRandom(local));if(!shiny.shiny)shiny=classicWildShiny(record.sourceId,charms,()=>classicRandom(local));
 const ivs=Object.fromEntries(['hp','atk','def','spa','spd','spe'].map(key=>[key,roll(local,32)])),nature=Dex.natures.all()[roll(local,Dex.natures.all().length)].id,gender=record.malePercent==null?'N':roll(local,100)<record.malePercent?'M':'F';
 return makeReferenceMon(record.sourceId,level,{boxId:crypto.randomUUID(),origin:'encounter',rogueMetBiome:Number(run.biome)||0,ability:ability.key,rogueAbilitySlot:ability.slot,ivs,nature,gender,...shiny});
}
function next(run){const state=run.mystery.safari;state.index++;state.catchStage=0;state.fleeStage=0;state.current=state.index<3?classicSafariPokemon(run,state.index):null;state.finished=state.index>=3;}
export function startClassicSafari(run){if(run.mystery?.type!=='safari-zone'||run.mystery.stage!=='confirm'||run.mystery.selection?.job!=='enter')throw Error('사파리 입장 단계를 확인하세요.');const price=classicSafariCost(run);if(!Number.isFinite(run.money)||run.money<price)throw Error('입장료가 부족합니다.');const current=classicSafariPokemon(run,0);run.money-=price;run.mystery.safari={index:0,step:0,catchStage:0,fleeStage:0,current,finished:false};run.mystery.stage='safari';return current;}
export function actClassicSafari(run,action,expectedStep){
 const state=run.mystery?.safari;if(run.screen!=='safari'||run.mystery?.type!=='safari-zone'||run.mystery.stage!=='safari'||!state?.current||state.finished||!Number.isSafeInteger(expectedStep)||expectedStep!==state.step||!['ball','bait','mud','leave'].includes(action))throw Error('사파리 행동을 확인하세요.');
 const current=state.current,rate=rogueSpecies.get(current.rogueSourceId)?.catchRate;if(!rate)throw Error('포획률을 확인할 수 없습니다.');let caught=null,outcome=action;
 if(action==='leave')next(run);
 else if(action==='ball'){
  const threshold=classicSafariCatchThreshold(rate,state.catchStage);let shakes=0;while(shakes<3&&roll(run,65536)<threshold)shakes++;if(shakes===3){caught={...structuredClone(current),boxId:crypto.randomUUID(),originEnemyBoxId:current.boxId,origin:'capture',originBall:'pokeball',rogueWasBoss:false};outcome='caught';next(run);}else outcome='miss';
 }else if(action==='bait'){state.catchStage=clamp(state.catchStage+2);if(roll(run,10)<8)state.fleeStage=clamp(state.fleeStage+1);}
 else {state.fleeStage=clamp(state.fleeStage-2);if(roll(run,10)<8)state.catchStage=clamp(state.catchStage-1);}
 if(!caught&&action!=='leave'&&roll(run,256)<classicSafariFleeRate(rate,state.fleeStage)){outcome='fled';next(run);}
 state.step++;state.lastOutcome=outcome;return {caught,outcome,finished:state.finished};
}
