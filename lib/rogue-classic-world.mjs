import trainerImages from '../data/rogue-trainer-appearance.json' with {type:'json'};
import {classicBossSegments} from './rogue-boss.mjs';
import templateRules from '../data/rogue-trainer-template-rules.json' with {type:'json'};
import memberRules from '../data/rogue-trainer-member-rules.json' with {type:'json'};
import {rogueSeededRandom} from './rogue-seeded-rng.mjs';
import {classicTrainerSpeciesRoots} from './rogue-trainer-filter.mjs';
import world from '../data/rogue-world-reference.json' with {type:'json'};
import names from '../data/rogue-ui-names.json' with {type:'json'};
import {Dex} from '@pkmn/sim';
import {rogueSpecies,rogueReferenceData,makeReferenceMon,sourceAbility,sourceMove,sourceSpeciesFor} from './rogue-reference.mjs';
import {classicRandom} from './rogue-classic-state.mjs';
import {classicWildLevel,classicTrainerLevel,classicStoryEvent,classicLuck} from './rogue-classic-rules.mjs';

const choose=(list,run)=>list[Math.floor(classicRandom(run)*list.length)];
const chooseNested=(value,run)=>Array.isArray(value)?chooseNested(choose(value,run),run):value;
const enumTypes=Object.fromEntries(Object.entries(rogueReferenceData.enums.PokemonType).map(([k,v])=>[v,k]));
const weather={1:'sunnyday',2:'raindance',3:'sandstorm',4:'hail',5:'snow',7:'primordialsea',8:'desolateland',9:'deltastream'};
export function classicTimeOfDay(run){if(Number(run.biome)===24)return 3;const cycle=(run.wave+(run.waveCycleOffset||0))%40;return cycle<15?1:cycle<20?2:cycle<35?3:0;}
export function classicBiome(run){const id=Number.isInteger(run.biome)?run.biome:0,record=world.biomes[id];if(!record)throw Error('등록되지 않은 바이옴입니다.');return {id,name:names.biomesById[id]||record.enumName,key:record.enumName.toLowerCase(),weather:run.weather||'',terrain:run.terrain||''};}
function weightedPool(pool,weights,run){const entries=Object.entries(pool).map(([id,weight])=>({id:Number(id),weight:Number(weight)})).filter(p=>p.weight>0);let n=classicRandom(run)*entries.reduce((a,b)=>a+b.weight,0);for(const entry of entries){n-=entry.weight;if(n<0)return entry.id;}return 0;}
export function classicBiomeChoices(run){
 if(run.wave>=180)return [{id:50,name:names.biomesById[50]||'엔드'}];
 const biome=world.biomes[Number(run.biome)||0],choices=(biome.linkRules||[]).filter(rule=>classicRandom(run)<rule.candidateInclusionProbability).map(rule=>({id:rule.to,name:names.biomesById[rule.to]||world.biomes[rule.to].enumName}));
 return choices.length?choices:[{id:biome.linkRules[0].to,name:names.biomesById[biome.linkRules[0].to]}];
}
export function enterClassicBiome(run,id){const biome=world.biomes[id];if(!biome)throw Error('이동할 바이옴을 확인하세요.');run.biome=id;run.biomeStep=1;run.weather=weather[weightedPool(biome.weatherPool,null,run)]||'';run.terrain=({1:'mistyterrain',2:'electricterrain',3:'grassyterrain',4:'psychicterrain'})[weightedPool(biome.terrainPool,null,run)]||'';}
function rarity(run,boss=false,luck=0){const roll=Math.floor(classicRandom(run)*((boss?64:512)-luck*(boss?.5:2)));return boss?(roll>=20?5:roll>=6?6:roll>=1?7:8):(roll>=156?0:roll>=32?1:roll>=6?2:roll>=1?3:4);}
function poolAt(biome,tier,time){const pool=biome.pokemonPool[tier]||{};return [...(pool[-1]||[]),...(pool[time]||[])];}
export function npcSpeciesForLevel(sourceId,level,run,{kind='wild',specialtyType=null}={}){
 let record=rogueSpecies.get(sourceId);if(!record)throw Error('출현 종을 찾지 못했습니다.');const seen=new Set(),thresholdKind=kind==='wild'?2:kind==='strong'?0:1,chain=[];let child=record;
 while(child){const previous=rogueSpecies.get(child.preEvolutionId??child.preEvolutionIds?.[0]);if(!previous)break;const evolution=previous.evolutions.find(e=>e.speciesId===child.sourceId);if(!evolution)break;const threshold=evolution.evoDelay?.[thresholdKind]??evolution.level;chain.unshift({sourceId:previous.sourceId,required:evolution.level===1?threshold:Math.min(evolution.level,threshold)});child=previous;}
 for(const ancestor of chain)if(level<ancestor.required)return ancestor.sourceId;
 while(!seen.has(record.sourceId)){
  seen.add(record.sourceId);let candidates=(record.evolutions||[]).filter(e=>rogueSpecies.has(e.speciesId)&&level>=Math.max(e.level||1,e.evoDelay?.[thresholdKind]||0));
  if(!candidates.length||kind!=='wild'&&run.wave===20)break;
  const typed=candidates.filter(e=>{const target=rogueReferenceData.species[e.speciesId],form=target.forms?.find(f=>f.formKey===(e.evoFormKey||''));return (form?.types||target.types).includes(specialtyType);});if(typed.length)candidates=typed;
  const chosen=choose(candidates,run),threshold=Math.max(chosen.level,chosen.evoDelay?.[thresholdKind]||0),maximum=Math.round(threshold*[1,1.1,1.2][thresholdKind]);if(threshold+Math.floor(classicRandom(run)*(maximum-threshold+1))>level)break;record=rogueSpecies.get(chosen.speciesId);
 }
 return record.sourceId;
}
function enemyMon(id,level,run,{trainer=false,boss=false}={}){
 const source=rogueSpecies.get(id);if(!source)throw Error('적 포켓몬 데이터를 확인하세요.');const hidden=source.abilities.find(a=>a.slot==='hidden'),ability=!trainer&&hidden&&Math.floor(classicRandom(run)*256)===0?hidden:choose(source.abilities.filter(a=>a.slot!=='hidden'),run)||source.abilities[0];
 const ivs=Object.fromEntries(['hp','atk','def','spa','spd','spe'].map(k=>[k,Math.floor(classicRandom(run)*32)]));
 return makeReferenceMon(id,level,{boxId:crypto.randomUUID(),origin:'encounter',rogueMetBiome:Number(run.biome)||0,ivs,ability:ability.key,rogueAbilitySlot:ability.slot,shiny:!trainer&&classicRandom(run)<1/1024,nature:choose(Dex.natures.all(),run).id,
  gender:source.malePercent==null?'N':classicRandom(run)*100<source.malePercent?'M':'F',rogueBoss:boss,rogueBossSegments:trainer?0:classicBossSegments(run.wave,level,source.baseTotal,{boss,legendary:source.legendary||source.subLegendary||source.mythical})});
}
function wild(run,event){const biome=world.biomes[Number(run.biome)||0],time=classicTimeOfDay(run);let tier=rarity(run,event.boss),pool=[];while(tier>=0){pool=poolAt(biome,tier,time);if(pool.length)break;tier--;}
 if(!pool.length)throw Error('바이옴에 출현 후보가 없습니다.');const level=classicWildLevel(run.wave,()=>classicRandom(run),{boss:event.boss}),id=npcSpeciesForLevel(choose(pool,run),level,run);
 const doubles=run.party.filter(p=>p.hp>0).length>=2&&run.wave>1&&!event.boss&&Math.floor(classicRandom(run)*32)===0;
 const ids=[id];if(doubles)ids.push(npcSpeciesForLevel(choose(pool,run),level,run));return {kind:'wild',trainer:null,boss:!!event.boss,doubles,team:ids.map(id=>enemyMon(id,level,run,{boss:event.boss})),biome:classicBiome(run)};
}
function templateSlots(template){if(!template)return [];if(template.__class==='TrainerPartyCompoundTemplate')return template.args.flatMap(templateSlots);if(template.__class==='TrainerPartyTemplate')return Array.from({length:template.args[0]},()=>template.args[1]);return [];}
// Apply only unambiguous top-level fixed ability slots and boss segments from the pinned trainer IR.
// Conditional post-processes, form changes and upstream moveset generation remain unsupported.
function fixedTrainerMetadata(id,index,relative,mon){
 const members=memberRules.trainers[id]?.members||[],member=members.find(m=>m.slot===index)||members.find(m=>m.slot===relative),post=member?.postProcess,ops=post?.operations||[];
 if(!post||post.unresolvedMarkers||post.deferredSeededChoices||ops.some(op=>['if','switch','let','setForm','return','break'].includes(op.op)))return mon;
 let next=mon;const moves=[...mon.moves];
 for(const op of ops){
  if(op.op==='ensureMove'&&op.acceptableAlternative==null&&Number.isInteger(op.preferredSlot)&&op.preferredSlot>=0&&op.preferredSlot<4){const name=sourceMove(op.moveId);if(name&&!moves.includes(name))moves[Math.min(op.preferredSlot,moves.length)]=name;}
  if(op.op==='replaceMove'){const target=sourceMove(op.targetMoveId),replacement=sourceMove(op.replacementMoveId),position=moves.indexOf(target);if(target&&replacement&&position>=0&&!moves.includes(replacement))moves[position]=replacement;}
 }
 next={...next,moves};const bosses=ops.filter(op=>op.op==='setBoss');
 if(bosses.length===1&&bosses[0].enabled===true&&Number.isInteger(bosses[0].segments)&&bosses[0].segments>=2)next={...next,rogueBoss:true,rogueBossSegments:bosses[0].segments};
 const changes=ops.filter(op=>op.op==='setAbilityIndex');if(changes.length!==1||!Number.isInteger(changes[0].value))return next;
 const slot=['primary','secondary','hidden'][changes[0].value],record=rogueSpecies.get(mon.rogueSourceId),ability=record?.abilities.find(a=>a.slot===slot);if(!ability)return next;
 return {...next,ability:ability.key,rogueAbilitySlot:slot};
}
function trainer(run,id,event){
 const config=world.trainerConfigs[id],selection=templateRules.trainers[id];if(!config||!selection)throw Error('트레이너 파티 자료가 없습니다.');
 const init=config.sourceCalls.find(c=>c.method.startsWith('initFor')),specialty=init?.args?.[2],gym=config.sourceCalls.some(c=>c.method==='initForGymLeader'),elite=config.sourceCalls.some(c=>c.method==='initForEliteFour'),champ=config.sourceCalls.some(c=>c.method==='initForChampion'),signature=world.signatureSpecies[config.enumName]||[];
 const range=selection.ranges.find(range=>run.wave>=range.from&&run.wave<=range.to);if(!range?.choices?.length)throw Error('이 웨이브의 파티 템플릿이 없습니다.');
 run.trainerTemplates||={};const key=run.wave+':'+id;run.trainerTemplates[key]||=choose(range.choices,run);const template=templateRules.templates[run.trainerTemplates[key]];
 if(!template)throw Error('트레이너 템플릿을 읽지 못했습니다.');
 const memberCalls=config.sourceCalls.filter(c=>c.method==='setPartyMemberFunc'),rawPool=config.sourceCalls.filter(c=>c.method==='setSpeciesPools').at(-1)?.args?.[0];
 const rootPool=classicTrainerSpeciesRoots(id);
 const team=[];
 for(const slot of template.slots){
  const index=slot.index,strength=slot.strength,level=classicTrainerLevel(run.wave,strength),relative=index-template.size,signatureChoice=signature[-relative-1];
  const member=memberCalls.find(c=>c.args[0]===index)||memberCalls.find(c=>c.args[0]===relative),memberPool=member?.args?.[1]?.__call==='getRandomPartyMemberFunc'?member.args[1].args[0]:null,forced=!!memberPool||gym&&signatureChoice!=null;
  let selected,chosenSource;
  for(let attempt=0;attempt<=25;attempt++){
   let pool=rawPool;
   if(pool&&!Array.isArray(pool)){let tier=rarity(run);while(tier>0&&!pool[tier]?.length)tier--;pool=pool[tier];}
   selected=memberPool?chooseNested(memberPool,run):gym&&signatureChoice!=null?chooseNested(signatureChoice,run):slot.sameSpecies&&index>slot.groupStart?team[slot.groupStart].rogueSourceId:chooseNested(pool?.length?pool:rootPool,run);
   if(!Number.isInteger(selected)||!rogueSpecies.has(selected))throw Error('트레이너 종 풀에 해석되지 않은 자료가 있습니다: '+config.enumName);
   const threshold=forced?slot.evoThresholdKind:template.rootEvoThresholdKind,kind=threshold===0?'strong':threshold===2?'wild':'trainer';
   chosenSource=memberPool&&member?.args[1].args[2]===true?selected:npcSpeciesForLevel(selected,level,run,{kind,specialtyType:Number.isInteger(specialty)?specialty:null});
   if(forced||slot.sameSpecies||attempt===25)break;
   const result=rogueSpecies.get(chosenSource),family=result.starterId,duplicate=team.some(p=>sourceSpeciesFor(p)?.starterId===family),overlap=slot.balanced&&team.some(p=>p.types.some(type=>result.types.includes(type)));
   if(!duplicate&&!overlap)break;
  }
  team.push(fixedTrainerMetadata(id,index,relative,enemyMon(chosenSource,level,run,{trainer:true})));
 }
 const label=names.trainersByType[id]?.label||config.enumName,money=config.sourceCalls.filter(c=>c.method==='setMoneyMultiplier').at(-1)?.args[0]||(gym?2.5:elite?3.25:champ?10:1);
 return {kind:event.kind,template:run.trainerTemplates[key],trainer:{id,name:label,title:gym?'체육관 관장':elite?'사천왕':champ?'챔피언':'트레이너',sprite:trainerImages.byEnumName[config.enumName]?.src||'/game/trainers/fallback.svg',artist:trainerImages.assets[trainerImages.byEnumName[config.enumName]?.spriteKey]?.artist||null,creditUrl:'https://play.pokemonshowdown.com/sprites/trainers/',moneyMultiplier:money},team,doubles:false,boss:!!(gym||elite||champ),biome:classicBiome(run)};
}
function rival(run,event){
 const fight=event.phase,key='RIVAL_'+fight+'_POOL',rows=world.rivals.fights[key];if(!rows)throw Error('라이벌 전투 데이터를 확인하세요.');
 run.rivalChoices||={};
 const team=rows.map((row,index)=>{
  const pool=row.pool,choiceKey='slot'+index;let selected=run.rivalChoices[choiceKey];
  if(!selected||selected.index>=pool.length){const n=Math.floor(classicRandom(run)*pool.length);selected={index:n,subIndex:Array.isArray(pool[n])?Math.floor(classicRandom(run)*pool[n].length):0};run.rivalChoices[choiceKey]=selected;}
  const choice=pool[selected.index],id=Array.isArray(choice)?choice[Math.min(selected.subIndex,choice.length-1)]:choice;
  const strength=templateSlots(world.trainerPartyTemplates[fight===1?'RIVAL':'RIVAL_'+fight])[index]??4;
  const sourceLevel=world.rivals.fixedLevelsByFight[fight]?.[index+1],level=sourceLevel?Math.min(100,sourceLevel):classicTrainerLevel(run.wave,strength);
  return enemyMon(id,level,run,{trainer:true});
 });
 return {kind:'rival',trainer:{id:374+fight,name:'라이벌',title:'라이벌 · '+fight+'차전',moneyMultiplier:1.5,sprite:'/game/trainers/fallback.svg'},team,doubles:false,boss:true,biome:classicBiome(run)};
}
export function classicEncounter(run){
 const event=classicStoryEvent(run);if(event.kind==='wild')return wild(run,event);if(event.kind==='rival')return rival(run,event);
 if(event.kind==='youngster')return trainer(run,63,event);
 if(event.kind==='gym'){const pools=world.biomes[Number(run.biome)||0].trainerPool;let gymPool=pools[5]||[];if(!gymPool.length)gymPool=Object.values(world.trainerConfigs).filter(t=>t.sourceCalls.some(c=>c.method==='initForGymLeader')).map(t=>world.enums.TrainerType[t.enumName]);return trainer(run,choose(gymPool,run),event);}
 if(event.kind==='elite'||event.kind==='champion'){run.leagueRegion??=Math.floor(classicRandom(run)*world.eliteFourChampionGroups.length);const region=world.eliteFourChampionGroups[run.leagueRegion],pool=region.trainerTypeOptionsByWave[run.wave];return trainer(run,chooseNested(pool,run),event);}
 if(event.kind==='evil'){run.evilGroup??=Math.floor(classicRandom(run)*10);const grunts=[64,69,72,75,79,82,88,90,92,94],leaders=[100,102,104,106,108,110,112,114,116,118];return trainer(run,event.event.startsWith('grunt')?grunts[run.evilGroup]:leaders[run.evilGroup]+(run.wave===165?1:0),event);}
 if(event.kind==='final')return {kind:'final',trainer:null,boss:true,doubles:false,phase:1,team:[makeReferenceMon(890,100,{boxId:crypto.randomUUID(),moves:['Eternabeam','Sludge Bomb','Flamethrower','Cosmic Power'],ability:'pressure',rogueBoss:true,rogueBossSegments:4,roguePassiveAbility:null})],biome:classicBiome(run)};
 throw Error('지원하는 전투 종류를 확인하세요.');
}
export {world as classicWorldReference};

export {trainer as classicTrainerEncounter};
