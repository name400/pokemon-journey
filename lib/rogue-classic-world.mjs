import trainerImages from '../data/rogue-trainer-appearance.json' with {type:'json'};
import {classicBossSegments} from './rogue-boss.mjs';
import templateRules from '../data/rogue-trainer-template-rules.json' with {type:'json'};
import memberRules from '../data/rogue-trainer-member-rules.json' with {type:'json'};
import {rogueSeededRandom} from './rogue-seeded-rng.mjs';
import {classicTrainerSpeciesRoots} from './rogue-trainer-filter.mjs';
import world from '../data/rogue-world-reference.json' with {type:'json'};
import names from '../data/rogue-ui-names.json' with {type:'json'};
import {Dex} from '@pkmn/sim';
import {rules,configure} from './pokemon-config.mjs';
import {rogueFormArt} from './rogue-form-art.mjs';
import {rogueSpecies,rogueReferenceData,makeReferenceMon,sourceAbility,sourceMove,sourceSpeciesFor} from './rogue-reference.mjs';
import {classicRandom} from './rogue-classic-state.mjs';
import {classicWildDoubleDivisor} from './rogue-lure.mjs';
import {classicWildLevel,classicTrainerLevel,classicStoryEvent,classicLuck} from './rogue-classic-rules.mjs';
import {classicTrainerAbility,classicTrainerIvs,classicTrainerFriendship} from './rogue-trainer-traits.mjs';
import {applyClassicTrainerFixedItems} from './rogue-trainer-items.mjs';

const choose=(list,run)=>list[Math.floor(classicRandom(run)*list.length)];
const chooseNested=(value,run)=>Array.isArray(value)?chooseNested(choose(value,run),run):value;
const enumTypes=Object.fromEntries(Object.entries(rogueReferenceData.enums.PokemonType).map(([k,v])=>[v,k]));
const weather={1:'sunnyday',2:'raindance',3:'sandstorm',4:'hail',5:'snow',7:'primordialsea',8:'desolateland',9:'deltastream'};
// Fixed-wave group ordering follows the pinned trainer configuration.
const evilAdmins={
 'admin-1':[['PETREL'],['TABITHA','COURTNEY'],['MATT','SHELLY'],['JUPITER','MARS','SATURN'],['COLRESS'],['BRYONY','ALIANA','CELOSIA','MABLE'],['FABA'],['PLUMERIA'],['OLEANA'],['GIACOMO','MELA','ATTICUS','ORTEGA','ERI']],
 'admin-2':[['PROTON'],['TABITHA','COURTNEY'],['MATT','SHELLY'],['JUPITER','MARS','SATURN'],['ZINZOLIN'],['BRYONY','ALIANA','CELOSIA','MABLE'],['FABA'],['PLUMERIA'],['OLEANA'],['GIACOMO','MELA','ATTICUS','ORTEGA','ERI']],
 'admin-3':[['ARCHER','ARIANA'],['TABITHA','COURTNEY'],['MATT','SHELLY'],['JUPITER','MARS','SATURN'],['COLRESS'],['XEROSIC'],['FABA'],['PLUMERIA'],['OLEANA'],['GIACOMO','MELA','ATTICUS','ORTEGA','ERI']],
};
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
 const source=rogueSpecies.get(id);if(!source)throw Error('적 포켓몬 데이터를 확인하세요.');
 const charmCount=key=>Math.min(4,(run.modifiers||[]).filter(m=>m.id===key&&!m.boxId).reduce((n,m)=>n+(m.count||0),0)),abilityCharms=charmCount('abilitycharm'),shinyCharms=charmCount('shinycharm');
 const modern=trainer&&run.trainerTraitsRule==='source-v1',hidden=source.abilities.find(a=>a.slot==='hidden'),hiddenOdds=abilityCharms?256/2**(1+abilityCharms):256,ability=modern?classicTrainerAbility(source.abilities,()=>classicRandom(run)):!trainer&&hidden&&Math.floor(classicRandom(run)*hiddenOdds)===0?hidden:choose(source.abilities.filter(a=>a.slot!=='hidden'),run)||source.abilities[0];
 const ivs=modern?classicTrainerIvs(run.wave,()=>classicRandom(run)):Object.fromEntries(['hp','atk','def','spa','spd','spe'].map(k=>[k,Math.floor(classicRandom(run)*32)]));
 return makeReferenceMon(id,level,{boxId:crypto.randomUUID(),origin:'encounter',rogueMetBiome:Number(run.biome)||0,ivs,ability:ability.key,rogueAbilitySlot:ability.slot,...(modern?{friendship:classicTrainerFriendship(run.wave),rogueTrainerTraits:'source-v1'}:{}),shiny:!trainer&&classicRandom(run)<(shinyCharms?2**(1+shinyCharms):1)/1024,nature:choose(Dex.natures.all(),run).id,
  gender:source.malePercent==null?'N':classicRandom(run)*100<source.malePercent?'M':'F',rogueBoss:boss,rogueBossSegments:trainer?0:classicBossSegments(run.wave,level,source.baseTotal,{boss,legendary:source.legendary||source.subLegendary||source.mythical})});
}
function wild(run,event,abilityCount=0){const biome=world.biomes[Number(run.biome)||0],time=classicTimeOfDay(run);let tier=rarity(run,event.boss),pool=[];while(tier>=0){pool=poolAt(biome,tier,time);if(pool.length)break;tier--;}
 if(!pool.length)throw Error('바이옴에 출현 후보가 없습니다.');const level=classicWildLevel(run.wave,()=>classicRandom(run),{boss:event.boss}),id=npcSpeciesForLevel(choose(pool,run),level,run);
 const modern=run.encounterDoubleRule==='source-v2',eligible=modern?run.party.some(p=>p.hp>0):run.party.filter(p=>p.hp>0).length>=2&&run.wave>1&&!event.boss;
 const doubles=eligible&&Math.floor(classicRandom(run)*classicWildDoubleDivisor(run,{boss:!!event.boss,abilityCount}))===0;
 const ids=[id];if(doubles)ids.push(npcSpeciesForLevel(choose(pool,run),level,run));const team=ids.map(id=>enemyMon(id,level,run,{boss:event.boss}));
 if(modern&&team.filter(mon=>mon.rogueBossSegments>0).length>1){const totals=team.map(mon=>rogueSpecies.get(mon.rogueSourceId)?.baseTotal||1),total=totals.reduce((a,b)=>a+b,0);team.forEach((mon,i)=>{if(mon.rogueBossSegments>0)mon.rogueBossSegments=Math.ceil(mon.rogueBossSegments*totals[i]/total);});}
 return {kind:'wild',trainer:null,boss:!!event.boss,doubles,team,biome:classicBiome(run)};
}
function templateSlots(template){if(!template)return [];if(template.__class==='TrainerPartyCompoundTemplate')return template.args.flatMap(templateSlots);if(template.__class==='TrainerPartyTemplate')return Array.from({length:template.args[0]},()=>template.args[1]);return [];}
// Interpret only species-ID and wave-number equality; unknown predicates stay unresolved.
function trainerPredicate(p,mon,run){const left=p?.left;if(p?.op!=='eq'||left?.type!=='field'||!Number.isInteger(p.right))return null;if(left.scope==='pokemon'&&left.path?.length===2&&left.path[0]==='species'&&left.path[1]==='speciesId')return mon.rogueSourceId===p.right;if(left.scope==='battle'&&left.path?.length===1&&left.path[0]==='waveIndex'&&Number.isInteger(run?.wave))return run.wave===p.right;return null;}
function trainerValue(value,mon,run){if(value?.type!=='conditional')return value;const match=trainerPredicate(value.predicate,mon,run);return match===null?null:match?value.then:value.else;}
function trainerOperations(operations,mon,run){const result=[];for(const op of operations){if(op.op==='if'){const match=trainerPredicate(op.predicate,mon,run);if(match===null)return null;const branch=trainerOperations((match?op.then:op.else)||[],mon,run);if(!branch)return null;result.push(...branch);}else if(['switch','let','return','break'].includes(op.op))return null;else result.push(op);}return result;}
function trainerMovePredicate(predicate,name){const move=Dex.moves.get(rules.moves[name]?.key||name);if(!move.exists)return null;const evaluate=p=>{if(p?.op==='and'||p?.op==='or'){const a=evaluate(p.left),b=evaluate(p.right);return a===null||b===null?null:p.op==='and'?a&&b:a||b;}if(!['eq','gt'].includes(p?.op)||p.left?.type!=='field'||p.left.scope!=='move'||p.left.path?.length!==1||!Number.isInteger(p.right))return null;const field=p.left.path[0],actual=field==='type'?rogueReferenceData.enums.PokemonType[move.type.toUpperCase()]:field==='category'?({Physical:0,Special:1,Status:2})[move.category]:field==='power'?move.basePower:null;if(actual==null)return null;return p.op==='eq'?actual===p.right:actual>p.right;};return evaluate(predicate);}
function rivalBirdAbilityIndex(id){const cases=memberRules.rival.functions.forceRivalBirdAbility.operations.find(op=>op.op==='switch')?.cases||[],start=cases.findIndex(c=>c.match===id);if(start<0)return null;for(let i=start;i<cases.length;i++){const c=cases[i],ops=c.body||[];if(ops.length){const ability=ops.find(op=>op.op==='setAbilityIndex');return ops.every(op=>['setAbilityIndex','break'].includes(op.op))&&Number.isInteger(ability?.value)?ability.value:null;}if(!c.fallthrough)return null;}return null;}
function rivalFormCandidates(name,id){if(!['postProcessSlot4Fight3','postProcessSlot4Fight4'].includes(name))return null;const branch=memberRules.rival.functions[name]?.operations.find(op=>op.op==='switch')?.cases.find(c=>c.match===id);if(!branch)return null;const choice=branch.body.find(op=>op.value?.type==='seededCall'&&op.value.helper==='randSeedItem')?.value?.arguments?.[0];return Array.isArray(choice)&&choice.length&&choice.every(Number.isInteger)?choice:null;}
function fixedTrainerForm(mon,index){const record=rogueSpecies.get(mon.rogueSourceId),form=record?.formList.find(f=>f.formIndex===index);if(!form)return null;const base=Dex.species.get(rules.species[record.pokemonId]?.key),suffix=form.formKey==='gigantamax'?'Gmax':form.formKey,mapped=rules.species[form.pokemonId]?.key,native=Dex.species.get(form.nativeSpecies||(mapped&&(form.formIndex===0||mapped!==base.id)?mapped:base.name+(suffix?'-'+suffix:'')));// Starmobiles have source battle data but no separate simulator species or verified sprite.
 const starmobile=record.sourceId===966&&index>=1&&index<=5;
 if(!native.exists&&!starmobile)return null;
 const species=starmobile?base:native,ability=form.abilities.find(a=>a.slot===mon.rogueAbilitySlot)||form.abilities[0];
 return {form,mon:configure({...mon,...rogueFormArt(form,mon.shiny),...(starmobile?{name:mon.name+' · 스타모빌',sourceImage:`https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/fb8ccb6d0703ffe48cdf80a8102d5ed943c82dba/images/pokemon/966-${form.formKey}.png`,sourceAppearanceMissing:false,rogueWeightKg:form.weight}:{}),rogueFormIndex:form.formIndex,rogueFormKey:form.formKey,rogueBattleSpecies:species.id,rogueBaseStats:{...form.baseStats},rogueTypes:[...form.types],types:[...form.types],type:form.types[0],ability:ability?.key||mon.ability,gender:['M','F'].includes(species.gender)?species.gender:mon.gender,battleAppearance:species.id,battleSprite:starmobile?null:species.spriteid,mega:!!species.isMega,primal:!!species.isPrimal,ultra:species.forme==='Ultra'})};}
// Apply only unambiguous top-level fixed trainer properties from the pinned trainer IR.
// Only simple equality branches and known static forms are supported; upstream moveset generation remains unsupported.
function fixedTrainerMetadata(id,index,relative,mon,run){
 const members=memberRules.trainers[id]?.members||[],member=members.find(m=>m.slot===index)||members.find(m=>m.slot===relative),post=member?.postProcess,ops=trainerOperations(post?.operations||[],mon,run);
 if(!post||post.unresolvedMarkers||post.deferredSeededChoices||!ops)return mon;
 let next=mon;const forms=ops.filter(op=>op.op==='setForm');let currentForm=null;if(forms.length){if(forms.length!==1||!Number.isInteger(forms[0].value))return mon;const result=fixedTrainerForm(mon,forms[0].value);if(!result)return mon;next=result.mon;currentForm=result.form;}
 const moves=[...mon.moves];
 for(const op of ops){
  if(op.op==='replaceMoveset'&&Array.isArray(op.moves)){const next=op.moves.map(move=>move?.type==='pokemonMove'&&Number.isInteger(move.moveId)?sourceMove(move.moveId):null);if(next.length>=1&&next.length<=4&&next.every(Boolean)&&new Set(next).size===next.length)moves.splice(0,moves.length,...next);}
  if(op.op==='ensureMove'&&Number.isInteger(op.preferredSlot)&&op.preferredSlot>=0&&op.preferredSlot<4){const name=sourceMove(op.moveId),alternative=op.acceptableAlternative;if(name&&!moves.includes(name)){const matches=alternative==null?[]:alternative.type==='movePredicate'?moves.map(move=>trainerMovePredicate(alternative.predicate,move)):[null];if(!matches.includes(null)&&!matches.includes(true))moves[Math.min(op.preferredSlot,moves.length)]=name;}}
  if(op.op==='replaceMove'){const target=sourceMove(op.targetMoveId),replacement=sourceMove(op.replacementMoveId),position=moves.indexOf(target);if(target&&replacement&&position>=0&&!moves.includes(replacement))moves[position]=replacement;}
 }
 next={...next,moves};const genders=ops.filter(op=>op.op==='setGender'),gender=trainerValue(genders[0]?.value,mon,run);if(genders.length===1&&[-1,0,1].includes(gender))next={...next,gender:({'-1':'N',0:'M',1:'F'})[gender]};
 const teras=ops.filter(op=>op.op==='setTeraType');if(teras.length===1){const value=trainerValue(teras[0].value,mon,run),record=rogueSpecies.get(mon.rogueSourceId),typeId=Number.isInteger(value)?value:value?.type==='field'&&value.scope==='pokemon'&&value.path?.[0]==='species'&&value.path?.length===2?record?.types?.[value.path[1]==='type1'?0:value.path[1]==='type2'?1:-1]:null;const type=Dex.types.get(enumTypes[typeId]||'');if(type.exists)next={...next,teraType:type.name};}
 const bosses=ops.filter(op=>op.op==='setBoss');
 if(bosses.length===1&&bosses[0].enabled===true&&Number.isInteger(bosses[0].segments)&&bosses[0].segments>=2)next={...next,rogueBoss:true,rogueBossSegments:bosses[0].segments};
 const changes=ops.filter(op=>op.op==='setAbilityIndex'),abilityIndex=trainerValue(changes[0]?.value,mon,run);if(changes.length!==1||!Number.isInteger(abilityIndex))return next;
 const slot=['primary','secondary','hidden'][abilityIndex],record=rogueSpecies.get(mon.rogueSourceId),ability=(currentForm?.abilities||record?.abilities)?.find(a=>a.slot===slot);if(!ability)return next;
 return {...next,ability:ability.key,rogueAbilitySlot:slot};
}
function trainer(run,id,event,{doubles=false}={}){
 const config=world.trainerConfigs[id],selection=templateRules.trainers[id];if(!config||!selection)throw Error('트레이너 파티 자료가 없습니다.');
 const init=config.sourceCalls.find(c=>c.method.startsWith('initFor')),specialty=init?.args?.[2],gym=config.sourceCalls.some(c=>c.method==='initForGymLeader'),elite=config.sourceCalls.some(c=>c.method==='initForEliteFour'),champ=config.sourceCalls.some(c=>c.method==='initForChampion'),signature=world.signatureSpecies[config.enumName]||[];
 const range=selection.ranges.find(range=>run.wave>=range.from&&run.wave<=range.to);if(!range?.choices?.length)throw Error('이 웨이브의 파티 템플릿이 없습니다.');
 run.trainerTemplates||={};const key=run.wave+':'+id;run.trainerTemplates[key]||=choose(range.choices,run);const template=templateRules.templates[run.trainerTemplates[key]];
 if(!template)throw Error('트레이너 템플릿을 읽지 못했습니다.');
 const memberCalls=config.sourceCalls.filter(c=>c.method==='setPartyMemberFunc'),rawPool=config.sourceCalls.filter(c=>c.method==='setSpeciesPools').at(-1)?.args?.[0];
 const rootPool=classicTrainerSpeciesRoots(id);
 const duo=doubles&&['TATE','LIZA'].includes(config.enumName),partnerId=duo?(config.enumName==='TATE'?223:222):null,partnerSignature=duo?world.signatureSpecies[world.trainerConfigs[partnerId].enumName]:null;
 const instantTeraSlots=config.sourceCalls.filter(call=>call.method==='setInstantTera'&&call.args.length===1&&Number.isInteger(call.args[0])).map(call=>call.args[0]);
 const team=[],slots=doubles&&template.slots.length===1?[template.slots[0],{...template.slots[0],index:1,sameSpecies:false,balanced:false,groupStart:1}]:template.slots,partySize=slots.length;
 for(const slot of slots){
  const index=slot.index,strength=slot.strength,level=classicTrainerLevel(run.wave,strength),relative=index-partySize,signatureChoice=signature[-relative-1];
  const member=duo?null:memberCalls.find(c=>c.args[0]===index)||memberCalls.find(c=>c.args[0]===relative),memberPool=member?.args?.[1]?.__call==='getRandomPartyMemberFunc'?member.args[1].args[0]:null;
  const available=duo?(index<2?[index===0?(id===222?338:337):(id===222?337:338)]:(index%2?partnerSignature:signature).filter(entry=>!(Array.isArray(entry)?entry:[entry]).some(speciesId=>team.some(mon=>mon.rogueSourceId===speciesId))).flat()):null,duoPool=available?.length?available:null,forced=!!memberPool||!!duoPool||!duo&&gym&&signatureChoice!=null;
  let selected,chosenSource;
  for(let attempt=0;attempt<=25;attempt++){
   let pool=rawPool;
   if(pool&&!Array.isArray(pool)){let tier=rarity(run);while(tier>0&&!pool[tier]?.length)tier--;pool=pool[tier];}
   selected=duoPool?chooseNested(duoPool,run):memberPool?chooseNested(memberPool,run):!duo&&gym&&signatureChoice!=null?chooseNested(signatureChoice,run):slot.sameSpecies&&index>slot.groupStart?team[slot.groupStart].rogueSourceId:chooseNested(pool?.length?pool:rootPool,run);
   if(!Number.isInteger(selected)||!rogueSpecies.has(selected))throw Error('트레이너 종 풀에 해석되지 않은 자료가 있습니다: '+config.enumName);
   const threshold=forced?slot.evoThresholdKind:template.rootEvoThresholdKind,kind=threshold===0?'strong':threshold===2?'wild':'trainer';
   chosenSource=memberPool&&member?.args[1].args[2]===true?selected:npcSpeciesForLevel(selected,level,run,{kind,specialtyType:Number.isInteger(specialty)?specialty:null});
   if(forced||slot.sameSpecies||attempt===25)break;
   const result=rogueSpecies.get(chosenSource),family=result.starterId,duplicate=team.some(p=>sourceSpeciesFor(p)?.starterId===family),overlap=slot.balanced&&team.some(p=>p.types.some(type=>result.types.includes(type)));
   if(!duplicate&&!overlap)break;
  }
  const generated=enemyMon(chosenSource,level,run,{trainer:true}),mon=duo?generated:fixedTrainerMetadata(id,index,relative,generated,run);team.push(instantTeraSlots.includes(index)?{...mon,rogueInstantTera:true}:mon);
 }
 // Gym leaders begin using one Tera at wave 100 unless explicitly exempted;
 // Elite Four always choose one. A specified slot wraps around the party size.
 if(elite||gym&&(init.args[3]===true||run.wave>=100)){const requested=elite?init.args[3]:init.args[4],eligible=team.map((mon,index)=>({mon,index})).filter(({mon})=>mon.rogueSourceId!==292||specialty==null||specialty===rogueReferenceData.enums.PokemonType.BUG);if(eligible.length){const wrapped=Number.isInteger(requested)?((requested%team.length)+team.length)%team.length:null,chosen=eligible.find(item=>item.index===wrapped)||choose(eligible,run),type=Dex.types.get(enumTypes[specialty]||'');team[chosen.index]={...chosen.mon,rogueInstantTera:true,...(type.exists?{teraType:type.name}:{})};}}
 if(run.trainerItemsRule==='source-v1'&&!duo)applyClassicTrainerFixedItems(team,config.enumName);
 const label=names.trainersByType[id]?.label||config.enumName,money=config.sourceCalls.filter(c=>c.method==='setMoneyMultiplier').at(-1)?.args[0]||(gym?2.5:elite?3.25:champ?10:1);
 return {kind:event.kind,template:run.trainerTemplates[key],trainer:{id,...(duo?{partnerId}:{}),name:duo?label+' · '+names.trainersByType[partnerId].label:label,title:gym?'체육관 관장':elite?'사천왕':champ?'챔피언':event.kind==='evil'&&event.event?.startsWith('admin')?'악의 조직 간부':event.kind==='evil'&&event.event?.startsWith('leader')?'악의 조직 보스':event.kind==='evil'&&event.event?.startsWith('grunt')?'악의 조직 조무래기':'트레이너',sprite:trainerImages.byEnumName[config.enumName]?.src||'/game/trainers/fallback.svg',artist:trainerImages.assets[trainerImages.byEnumName[config.enumName]?.spriteKey]?.artist||null,creditUrl:'https://play.pokemonshowdown.com/sprites/trainers/',moneyMultiplier:money},team,doubles,boss:!!(gym||elite||champ),biome:classicBiome(run)};
}
function rival(run,event){
 const fight=event.phase,key='RIVAL_'+fight+'_POOL',rows=world.rivals.fights[key];if(!rows)throw Error('라이벌 전투 데이터를 확인하세요.');
 const config=world.trainerConfigs[374+fight],instantTeraSlots=config?.sourceCalls.filter(call=>call.method==='setInstantTera'&&call.args.length===1&&Number.isInteger(call.args[0])).map(call=>call.args[0])||[];
 run.rivalChoices||={};
 const team=rows.map((row,index)=>{
  const pool=row.pool,choiceKey='slot'+index;let selected=run.rivalChoices[choiceKey];
  if(!selected||selected.index>=pool.length){const n=Math.floor(classicRandom(run)*pool.length);selected={index:n,subIndex:Array.isArray(pool[n])?Math.floor(classicRandom(run)*pool[n].length):0};run.rivalChoices[choiceKey]=selected;}
  const choice=pool[selected.index],id=Array.isArray(choice)?choice[Math.min(selected.subIndex,choice.length-1)]:choice;
  const strength=templateSlots(world.trainerPartyTemplates[fight===1?'RIVAL':'RIVAL_'+fight])[index]??4;
  const sourceLevel=world.rivals.fixedLevelsByFight[fight]?.[index+1],level=sourceLevel?Math.min(100,sourceLevel):classicTrainerLevel(run.wave,strength);
  let mon=enemyMon(id,level,run,{trainer:true});const post=memberRules.rival.fights[key]?.[index]?.postProcess,call=post?.type==='inlineRule'&&post.operations?.length===1&&post.operations[0].op==='callRule'&&post.operations[0].rule==='forceRivalStarterTraits'?post.operations[0]:null;
  if(post?.type==='ruleReference'&&post.name==='forceRivalStarterTraits'||call){const record=rogueSpecies.get(id),ability=record?.abilities.find(a=>a.slot==='primary'),tera=Dex.types.get(enumTypes[rogueReferenceData.species[id]?.types?.[0]]||'');if(ability)mon={...mon,ability:ability.key,rogueAbilitySlot:'primary'};if(tera.exists)mon={...mon,teraType:tera.name};const bars=call?.arguments?.[1];if(Number.isInteger(bars)&&bars>=2)mon={...mon,rogueBoss:true,rogueBossSegments:bars};}
  const birdCall=post?.type==='inlineRule'&&post.operations?.length===1&&post.operations[0].op==='callRule'&&post.operations[0].rule==='forceRivalBirdAbility'?post.operations[0]:null;if(post?.type==='ruleReference'&&post.name==='forceRivalBirdAbility'||birdCall){const slot=['primary','secondary','hidden'][rivalBirdAbilityIndex(id)],ability=rogueSpecies.get(id)?.abilities.find(a=>a.slot===slot);if(ability)mon={...mon,ability:ability.key,rogueAbilitySlot:slot};const bars=birdCall?.arguments?.[1];if(Number.isInteger(bars)&&bars>=2)mon={...mon,rogueBoss:true,rogueBossSegments:bars};}
  const formRule=post?.type==='ruleReference'?post.name:post?.type==='inlineRule'&&post.operations?.length===1&&post.operations[0].op==='callRule'?post.operations[0].rule:null,candidates=rivalFormCandidates(formRule,id);if(candidates){const form=fixedTrainerForm(mon,choose(candidates,run));if(form)mon=form.mon;}
  if(id===384&&post?.type==='ruleReference'&&['postProcessSlot6Fight5','postProcessSlot6Fight6'].includes(post.name)){mon={...mon,shiny:true};const form=fixedTrainerForm(mon,post.name==='postProcessSlot6Fight6'?1:0);if(form)mon=form.mon;const total=Object.values(mon.rogueBaseStats).reduce((sum,n)=>sum+n,0),bars=post.name==='postProcessSlot6Fight5'?3:classicBossSegments(run.wave,mon.level,total,{boss:true});mon={...mon,rogueBoss:true,rogueBossSegments:bars};}
  return instantTeraSlots.includes(index)?{...mon,rogueInstantTera:true}:mon;
 });
 if(run.trainerItemsRule==='source-v1')applyClassicTrainerFixedItems(team,'RIVAL_'+fight);
 return {kind:'rival',trainer:{id:374+fight,name:'라이벌',title:'라이벌 · '+fight+'차전',moneyMultiplier:1.5,sprite:'/game/trainers/fallback.svg'},team,doubles:false,boss:true,biome:classicBiome(run)};
}
// Original 7c088125 checks wave-seeded candidate rolls, including earlier
// candidate waves even when those waves were themselves blocked.
function classicTrainerRoll(seed,wave,chance){const shifted=seed.split('').map(c=>String.fromCharCode(c.charCodeAt(0)+wave)).join('');return Math.floor(rogueSeededRandom(shifted)()*chance);}
export function classicRandomTrainerEligible(run){
 if(run.randomTrainerRule!=='source-v1'||typeof run.seed!=='string'||classicStoryEvent(run).kind!=='wild')return false;
 const wave=run.wave,chance=world.biomes[Number(run.biome)||0]?.trainerChance||0;if(!chance||wave%10===0||wave%10===1)return false;
 const base=Math.floor(wave/10)*10;for(let w=Math.max(wave-2,base+2);w<=Math.min(wave+2,base+10);w++){if(w===wave)continue;if(classicStoryEvent(run,w).kind!=='wild'||w<wave&&classicTrainerRoll(run.seed,w,chance)===0)return false;}
 return classicTrainerRoll(run.seed,wave,chance)===0;
}
function randomTrainer(run,doubleAbilityCount){
 const pools=world.biomes[Number(run.biome)||0].trainerPool;let tier=rarity(run);while(tier>0&&!pools[tier]?.length)tier--;const id=chooseNested(pools[tier]?.length?pools[tier]:[world.enums.TrainerType.BREEDER],run),config=world.trainerConfigs[id],calls=config?.sourceCalls||[];
 const only=calls.some(call=>call.method==='setDoubleOnly'),has=calls.some(call=>call.method==='setHasDouble'),partner=calls.some(call=>call.method==='setDoubleTrainerType'),eligible=has&&(!partner||['TATE','LIZA'].includes(config.enumName));
 const doubles=only||eligible&&Math.floor(classicRandom(run)*classicWildDoubleDivisor(run,{abilityCount:doubleAbilityCount}))===0;
 return trainer(run,id,{kind:'trainer'},{doubles});
}
export function classicEncounter(run,{doubleAbilityCount=0}={}){
 const event=classicStoryEvent(run);if(event.kind==='wild')return classicRandomTrainerEligible(run)?randomTrainer(run,doubleAbilityCount):wild(run,event,doubleAbilityCount);if(event.kind==='rival')return rival(run,event);
 if(event.kind==='youngster')return trainer(run,63,event);
 if(event.kind==='gym'){const pools=world.biomes[Number(run.biome)||0].trainerPool;let gymPool=pools[5]||[];if(!gymPool.length)gymPool=Object.values(world.trainerConfigs).filter(t=>t.sourceCalls.some(c=>c.method==='initForGymLeader')).map(t=>world.enums.TrainerType[t.enumName]);const id=choose(gymPool,run),eligible=run.randomTrainerRule==='source-v1'&&[222,223].includes(id),doubles=eligible&&Math.floor(classicRandom(run)*classicWildDoubleDivisor(run,{boss:true,abilityCount:doubleAbilityCount}))===0;return trainer(run,id,event,{doubles});}
 if(event.kind==='elite'||event.kind==='champion'){run.leagueRegion??=Math.floor(classicRandom(run)*world.eliteFourChampionGroups.length);const region=world.eliteFourChampionGroups[run.leagueRegion],pool=region.trainerTypeOptionsByWave[run.wave];return trainer(run,chooseNested(pool,run),event);}
 if(event.kind==='evil'){run.evilGroup??=Math.floor(classicRandom(run)*10);const grunts=[64,69,72,75,79,82,88,90,92,94],leaders=[100,102,104,106,108,110,112,114,116,118];let id;if(event.event.startsWith('grunt'))id=grunts[run.evilGroup];else if(evilAdmins[event.event]){run.evilAdminChoices||={};id=run.evilAdminChoices[event.event];if(!Number.isInteger(id)){const pool=evilAdmins[event.event][run.evilGroup].map(name=>world.enums.TrainerType[name]),used=Object.values(run.evilAdminChoices),unused=pool.filter(candidate=>!used.includes(candidate));id=choose(unused.length?unused:pool,run);run.evilAdminChoices[event.event]=id;}}else id=leaders[run.evilGroup]+(run.wave===165?1:0);const config=world.trainerConfigs[id],eligible=run.trainerDoubleRule==='source-v1'&&event.event.startsWith('grunt')&&config?.sourceCalls.some(call=>call.method==='setHasDouble'),doubles=!!eligible&&Math.floor(classicRandom(run)*3)===0;return trainer(run,id,event,{doubles});}
 if(event.kind==='final')return {kind:'final',trainer:null,boss:true,doubles:false,phase:1,team:[makeReferenceMon(890,100,{boxId:crypto.randomUUID(),moves:['Eternabeam','Sludge Bomb','Flamethrower','Cosmic Power'],ability:'pressure',rogueBoss:true,rogueBossSegments:4,roguePassiveAbility:null})],biome:classicBiome(run)};
 throw Error('지원하는 전투 종류를 확인하세요.');
}
export {world as classicWorldReference};

export {trainer as classicTrainerEncounter};
