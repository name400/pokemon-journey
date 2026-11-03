import {applyClassicEnemyBerries} from './rogue-enemy-berries.mjs';
import {classicTrainerAbility,classicTrainerIvs,classicTrainerFriendship} from './rogue-trainer-traits.mjs';
import {applyClassicTrainerFixedItems,applyClassicTrainerFieldItems} from './rogue-trainer-items.mjs';
import {classicWildShiny,classicTrainerShiny} from './rogue-wild-variants.mjs';
import trainerImages from '../data/rogue-trainer-appearance.json' with {type:'json'};
import {classicBossSegments} from './rogue-boss.mjs';
import templateRules from '../data/rogue-trainer-template-rules.json' with {type:'json'};
import trainerMemberRules from '../data/rogue-trainer-effects.json' with {type:'json'};
import {rogueSeededRandom} from './rogue-seeded-rng.mjs';
import {classicTrainerSpeciesRoots} from './rogue-trainer-filter.mjs';
import {trainerLevelMoves} from './rogue-trainer-moves.mjs';
import world from '../data/rogue-world-reference.json' with {type:'json'};
import names from '../data/rogue-ui-names.json' with {type:'json'};
import {Dex,toID} from '@pkmn/sim';
import {configure,rules} from './pokemon-config.mjs';
import {moves as gameMoves} from './game.mjs';
import {rogueSpecies,rogueReferenceData,makeReferenceMon,sourceAbility,sourceMove,sourceSpeciesFor} from './rogue-reference.mjs';
import {classicRandom} from './rogue-classic-state.mjs';
import {classicWildLevel,classicTrainerLevel,classicStoryEvent,classicLuck} from './rogue-classic-rules.mjs';

const choose=(list,run)=>list[Math.floor(classicRandom(run)*list.length)];
const chooseNested=(value,run)=>Array.isArray(value)?chooseNested(choose(value,run),run):value;
const enumTypes=Object.fromEntries(Object.entries(rogueReferenceData.enums.PokemonType).map(([k,v])=>[v,k]));
const weather={1:'sunnyday',2:'raindance',3:'sandstorm',4:'hail',5:'snowscape',6:'fog',7:'primordialsea',8:'desolateland',9:'deltastream'};
export function classicTimeOfDay(run){if(Number(run.biome)===24)return 3;const cycle=(run.wave+(run.waveCycleOffset||0))%40;return cycle<15?1:cycle<20?2:cycle<35?3:0;}
export function classicBiome(run){const id=Number.isInteger(run.biome)?run.biome:0,record=world.biomes[id];if(!record)throw Error('등록되지 않은 바이옴입니다.');const combat=run.combat?.biomeId===id?run.combat:null;return {id,name:names.biomesById[id]||record.enumName,key:record.enumName.toLowerCase(),weather:combat?.weather??run.weather??'',terrain:combat?.terrain??run.terrain??''};}
function weightedPool(pool,weights,run){const entries=Object.entries(pool).map(([id,weight])=>({id:Number(id),weight:Number(weight)})).filter(p=>p.weight>0);let n=classicRandom(run)*entries.reduce((a,b)=>a+b.weight,0);for(const entry of entries){n-=entry.weight;if(n<0)return entry.id;}return 0;}
export function classicBiomeChoices(run){
 if(run.wave>=180)return [{id:50,name:names.biomesById[50]||'엔드'}];
 const biome=world.biomes[Number(run.biome)||0],choices=(biome.linkRules||[]).filter(rule=>classicRandom(run)<rule.candidateInclusionProbability).map(rule=>({id:rule.to,name:names.biomesById[rule.to]||world.biomes[rule.to].enumName}));
 return choices.length?choices:[{id:biome.linkRules[0].to,name:names.biomesById[biome.linkRules[0].to]}];
}
export function enterClassicBiome(run,id){const biome=world.biomes[id];if(!biome)throw Error('이동할 바이옴을 확인하세요.');run.biome=id;run.biomeStep=1;const weatherPool={...biome.weatherPool},time=classicTimeOfDay({...run,wave:Math.min(200,run.wave+1)});if(time===2||time===3){weatherPool[1]=0;if(biome.enumName==='FOREST')weatherPool[6]=1;}if(!Object.values(weatherPool).some(weight=>Number(weight)>0))weatherPool[0]=1;run.weather=weather[weightedPool(weatherPool,null,run)]||'';run.terrain=({1:'mistyterrain',2:'electricterrain',3:'grassyterrain',4:'psychicterrain'})[weightedPool(biome.terrainPool,null,run)]||'';}
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
 const source=rogueSpecies.get(id);if(!source)throw Error('적 포켓몬 데이터를 확인하세요.');const modern=trainer&&run.trainerTraitsRule==='source-v1',hidden=source.abilities.find(a=>a.slot==='hidden'),ability=modern?classicTrainerAbility(source.abilities,()=>classicRandom(run)):!trainer&&hidden&&Math.floor(classicRandom(run)*256)===0?hidden:choose(source.abilities.filter(a=>a.slot!=='hidden'),run)||source.abilities[0];
 const stats=['hp','atk','def','spa','spd','spe'],segments=trainer?0:classicBossSegments(run.wave,level,source.baseTotal,{boss,legendary:source.legendary||source.subLegendary||source.mythical}),charms=Math.min(4,(run.modifiers||[]).filter(m=>m.id==='shinycharm').reduce((sum,m)=>sum+(m.count||0),0)),shinyChance=(charms>0?2**(1+charms):1)/1024;
 const ivs=modern?classicTrainerIvs(run.wave,()=>classicRandom(run)):Object.fromEntries(stats.map(k=>[k,Math.floor(classicRandom(run)*32)]));
 if(segments>1){const secondary=Math.floor(classicRandom(run)*4294967296)>>>0;for(const [index,stat] of stats.entries()){const other=(secondary>>>[25,20,15,10,5,0][index])&31,low=Math.min(ivs[stat],other),high=Math.max(ivs[stat],other);ivs[stat]=Math.round(low+(high-low)*.75);}}
 const shinyState=trainer&&run.trainerShinyRule==='source-v1'?classicTrainerShiny(id,()=>classicRandom(run)):!trainer&&run.wildVariantRule==='source-v1'?classicWildShiny(id,charms,()=>classicRandom(run)):{shiny:!trainer&&classicRandom(run)<shinyChance};
 return makeReferenceMon(id,level,{boxId:crypto.randomUUID(),origin:'encounter',rogueMetBiome:Number(run.biome)||0,ivs,ability:ability.key,rogueAbilitySlot:ability.slot,...(id===235&&((trainer&&run.trainerSketchRule==='source-v1')||(!trainer&&run.wildSketchRule==='source-v1'))?{moves:Array(4).fill(sourceMove(166)),rogueSketchRule:'source-v1'}:{}),...(modern?{friendship:classicTrainerFriendship(run.wave),rogueTrainerTraits:'source-v1'}:{}),...shinyState,nature:choose(Dex.natures.all(),run).id,
  gender:source.malePercent==null?'N':classicRandom(run)*100<source.malePercent?'M':'F',rogueBoss:segments>1,rogueBossSegments:segments});
}
// Arena tier selection uses the wave boss check; forced boss affects evolution and HP separately.
export function classicMysteryBoss(run,{level:fixedLevel=null}={}){
 const biome=world.biomes[Number(run.biome)||0],time=classicTimeOfDay(run),luck=classicLuck(run.party),level=fixedLevel??Math.min(100,classicWildLevel(run.wave,()=>classicRandom(run),{boss:false})+Math.round(run.wave/10)),bossPool=classicBossSegments(run.wave,level,0)>0&&poolAt(biome,5,time).length>0;
 let selected;for(let attempt=0;attempt<=10;attempt++){let tier=rarity(run,bossPool,luck),pool=[];while(tier>=0){pool=poolAt(biome,tier,time);if(pool.length)break;tier--;}if(!pool.length)throw Error('바이옴에 출현 후보가 없습니다.');selected=choose(pool,run);const candidate=rogueSpecies.get(selected);if(!candidate)throw Error('야생 포켓몬 종을 확인할 수 없습니다.');const legendLike=candidate.legendary||candidate.subLegendary||candidate.mythical,tooEarly=legendLike&&run.wave<(candidate.baseTotal>=660?80:55);if(!tooEarly||attempt===10)break;}
 return enemyMon(npcSpeciesForLevel(selected,level,run,{kind:'boss'}),level,run,{boss:true});
}
function classicDoubleAbilityBoosts(run){
 const indexes=run.combat?.activeBySide?.[0]||[],snapshot=run.combat?.snapshot?.sides?.[0]?.pokemon||[],active=indexes.map(index=>run.party?.[index]).filter(mon=>mon&&mon.hp>0);
 const native=mon=>snapshot.find(p=>String(p.set?.trainerToken)===String(mon.boxId)),ability=mon=>toID(mon.currentAbility||mon.ability||''),gas=active.some(mon=>ability(mon)==='neutralizinggas'&&!native(mon)?.volatiles?.gastroacid),boosting=new Set(['illuminate','arenatrap','noguard','commander']);
 return active.reduce((total,mon)=>{const suppressed=!!native(mon)?.volatiles?.gastroacid||gas&&ability(mon)!=='neutralizinggas'&&toID(mon.item||'')!=='abilityshield';if(suppressed)return total;return total+Number(boosting.has(ability(mon)))+Number(boosting.has(toID(mon.roguePassiveAbility||'')));},0);
}
function classicDoubleDenominator(run){const lures=(run.modifiers||[]).filter(m=>['lure','superlure','maxlure'].includes(m.id)&&Number.isInteger(m.remaining)&&m.remaining>0).length,base=run.wave%10===0?32:8;return Math.max(1,Math.floor(base/(4**(lures+classicDoubleAbilityBoosts(run)))));}
function wild(run,event){const biome=world.biomes[Number(run.biome)||0],time=classicTimeOfDay(run),luck=classicLuck(run.party),bossPool=!!event.boss&&poolAt(biome,5,time).length>0;
 const generate=()=>{const level=classicWildLevel(run.wave,()=>classicRandom(run),{boss:event.boss});let selected;
  for(let attempt=0;attempt<=10;attempt++){let tier=rarity(run,bossPool,luck),pool=[];while(tier>=0){pool=poolAt(biome,tier,time);if(pool.length)break;tier--;}
   if(!pool.length)throw Error('바이옴에 출현 후보가 없습니다.');selected=choose(pool,run);const candidate=rogueSpecies.get(selected);if(!candidate)throw Error('야생 포켓몬 종을 확인할 수 없습니다.');
   const legendLike=candidate.legendary||candidate.subLegendary||candidate.mythical,tooEarly=legendLike&&run.wave<(candidate.baseTotal>=660?80:55);if(!tooEarly||attempt===10)break;
  }
  const id=npcSpeciesForLevel(selected,level,run);return enemyMon(id,level,run,{boss:event.boss});};
 const first=generate(),doubleDenominator=classicDoubleDenominator(run),doubles=run.party.filter(p=>p.hp>0).length>=2&&run.wave>1&&!event.boss&&Math.floor(classicRandom(run)*doubleDenominator)===0;
 const team=[first];if(doubles)team.push(generate());return {kind:'wild',trainer:null,boss:!!event.boss,doubles,team,biome:classicBiome(run)};
}
function templateSlots(template){if(!template)return [];if(template.__class==='TrainerPartyCompoundTemplate')return template.args.flatMap(templateSlots);if(template.__class==='TrainerPartyTemplate')return Array.from({length:template.args[0]},()=>template.args[1]);return [];}
function trainerMovePredicate(node,move){
 if(typeof node==='number'||typeof node==='boolean')return node;
 if(!node||typeof node!=='object')return undefined;
 if(node.type==='field'&&node.scope==='move'&&node.path?.length===1){const key=node.path[0];if(key==='type')return rogueReferenceData.enums.PokemonType[move.type.toUpperCase()];if(key==='power')return move.basePower;if(key==='category')return ({Physical:0,Special:1,Status:2})[move.category];if(key==='id')return move.num;return undefined;}
 const left=trainerMovePredicate(node.left,move),right=trainerMovePredicate(node.right,move);if(left===undefined||right===undefined)return undefined;
 if(node.op==='and')return Boolean(left&&right);if(node.op==='or')return Boolean(left||right);if(node.op==='eq')return left===right;if(node.op==='gt')return left>right;return undefined;
}
function trainerMoveAlternative(mon,alternative){
 if(alternative===null)return false;if(alternative?.type!=='movePredicate')return undefined;
 const outcomes=mon.moves.map(name=>{const move=Dex.moves.get(gameMoves[name]?.key||name);return move.exists?trainerMovePredicate(alternative.predicate,move):undefined;});
 if(outcomes.some(value=>value===undefined))return undefined;return outcomes.some(Boolean);
}
function trainerSpeciesPredicate(node,sourceId){
 if(!node||typeof node!=='object'||!Number.isInteger(sourceId))return undefined;
 if(node.op==='and'||node.op==='or'){const left=trainerSpeciesPredicate(node.left,sourceId),right=trainerSpeciesPredicate(node.right,sourceId);if(left===undefined||right===undefined)return undefined;return node.op==='and'?left&&right:left||right;}
 if(node.op==='eq'&&node.left?.type==='field'&&node.left.scope==='pokemon'&&node.left.path?.join('.')==='species.speciesId'&&Number.isInteger(node.right))return sourceId===node.right;
 return undefined;
}
function trainerAttributeValue(value,sourceId){
 if(Number.isInteger(value))return value;if(value?.type!=='conditional')return undefined;
 const match=trainerSpeciesPredicate(value.predicate,sourceId);if(match===undefined)return undefined;
 const result=match?value.then:value.else;return Number.isInteger(result)?result:undefined;
}
// Apply static member attributes and the supported species comparisons only.
// Other branches, form changes and custom move generators remain explicit gaps.
function trainerSeededValue(value,run,sourceId=null){
 if(Number.isInteger(value))return value;if(value?.type==='conditional')return trainerAttributeValue(value,sourceId);if(value?.type!=='seededCall')return undefined;const args=value.arguments||[];
 if(value.helper==='randSeedInt'&&Number.isInteger(args[0])&&args[0]>0&&args[0]<=64&&(args[1]===undefined||Number.isInteger(args[1])&&args[1]>=0&&args[1]<=64))return (args[1]||0)+Math.floor(classicRandom(run)*args[0]);
 if(value.helper==='randSeedIntRange'&&Number.isInteger(args[0])&&Number.isInteger(args[1])&&args[0]>=0&&args[1]>=args[0]&&args[1]-args[0]<=32)return args[0]+Math.floor(classicRandom(run)*(args[1]-args[0]+1));
 if(value.helper==='randSeedItem'&&Array.isArray(args[0])&&args[0].length>0&&args[0].length<=32&&args[0].every(Number.isInteger))return args[0][Math.floor(classicRandom(run)*args[0].length)];
 return undefined;
}
function resolveTrainerConditions(operations,mon,run,state={formIndex:mon.rogueFormIndex||0}){
 const resolved=[];for(const op of operations||[]){
  if(op.op==='setForm'){const value=trainerSeededValue(op.value,run,sourceSpeciesFor(mon)?.sourceId);state.formIndex=value;resolved.push({...op,value:value??null});continue;}
  if(op.op!=='if'){resolved.push(op);continue;}const p=op.predicate,field=p?.left;let value;
  if(p?.op==='eq'&&field?.type==='field'&&field.scope==='battle'&&field.path?.join('.')==='waveIndex')value=run.wave;
  else if(p?.op==='eq'&&field?.type==='field'&&field.scope==='pokemon'&&field.path?.join('.')==='species.speciesId')value=sourceSpeciesFor(mon)?.sourceId;
  else if(p?.op==='eq'&&field?.type==='field'&&field.scope==='pokemon'&&field.path?.join('.')==='formIndex')value=state.formIndex;
  if(value===undefined||!Number.isInteger(p?.right)){resolved.push({op:'if'});continue;}resolved.push(...resolveTrainerConditions(value===p.right?op.then:op.else,mon,run,state));
 }return resolved;
}
function trainerFormCandidate(mon,source,index){
 if(index===0&&(mon.rogueFormIndex||0)===0)return {unchanged:true};if(!Number.isInteger(index)||!source)return null;
 const form=source.formList.find(entry=>entry.formIndex===index),key=form?.pokemonId&&(form.nativeSpecies||rules.species[form.pokemonId]?.key),native=key?Dex.species.get(key):null,base=Dex.species.get(rules.species[source.pokemonId]?.key||'');
 if(form?.pokemonId===source.pokemonId&&native?.id===base.id&&!form.sourceImage&&!form.spriteKey)return null;
 return form?.pokemonId&&form.baseStats&&form.types?.length&&native?.exists?{form,native}:null;
}
function applyTrainerForm(mon,candidate){
 if(candidate.unchanged)return false;const {form,native}=candidate,abilities=form.abilities||[],ability=abilities.find(item=>item.slot===(mon.rogueAbilitySlot||'primary'))||abilities.find(item=>item.slot==='primary')||abilities[0];
 Object.assign(mon,{id:form.pokemonId,artId:form.pokemonId,rogueFormIndex:form.formIndex,rogueFormKey:form.formKey,rogueBattleSpecies:native.id,rogueBaseStats:{...form.baseStats},rogueTypes:[...form.types],types:[...form.types],type:form.types[0],battleAppearance:native.id,battleSprite:form.spriteKey||native.spriteid,rogueSpriteKey:form.spriteKey||null,sourceImage:mon.shiny?(form.sourceShinyImage||null):(form.sourceImage||null),sourceBackImage:mon.shiny?(form.sourceShinyBackImage||null):(form.sourceBackImage||null),sourceShinyImage:form.sourceShinyImage||null,sourceShinyBackImage:form.sourceShinyBackImage||null,sourceAppearanceMissing:!!form.sourceAppearanceMissing,mega:!!native.isMega,primal:!!native.isPrimal,ultra:native.forme==='Ultra',gigantamax:form.formKey.startsWith('gigantamax'),dynamaxed:form.formKey.startsWith('gigantamax')});
 if(ability){mon.ability=ability.key;mon.rogueAbilitySlot=ability.slot;}Object.assign(mon,configure(mon));return true;
}
function applyTrainerMemberAttributes(mon,trainerId,index,relative,run,{allowEggMoves=false}={}){
 const members=trainerMemberRules.trainers[trainerId]?.members||[],member=members.find(m=>m.slot===index)||members.find(m=>m.slot===relative),raw=member?.postProcess?.operations||[],operations=resolveTrainerConditions(raw,mon,run),source=sourceSpeciesFor(mon),forms=operations.filter(op=>op.op==='setForm');let virtualForm=mon.rogueFormIndex||0;const invalidForm= forms.some(op=>{const candidate=trainerFormCandidate({...mon,rogueFormIndex:virtualForm},source,op.value);if(!candidate)return true;virtualForm=op.value;return false;}),hasFormChange=operations.some(op=>op.op==='if'||op.op==='switch')||invalidForm;let changedForm=false;
 if(hasFormChange&&forms.some(op=>op.value==null||op.value!==(mon.rogueFormIndex||0)))mon.rogueFormUnavailable=true;
 for(const op of operations){
  if(op.op==='setForm'&&!hasFormChange){const candidate=trainerFormCandidate(mon,source,op.value);if(candidate)changedForm=applyTrainerForm(mon,candidate)||changedForm;}
  else if(op.op==='generateMoveset'&&!hasFormChange&&changedForm){mon.moves=trainerLevelMoves(mon,()=>classicRandom(run),{allowEggMoves});changedForm=false;}
  else if(op.op==='replaceMoveset'&&!hasFormChange){const names=(op.moves||[]).map(item=>sourceMove(item.moveId));if(names.length>0&&names.length<=4&&names.every(name=>name&&Dex.moves.get(gameMoves[name]?.key||name).exists)&&new Set(names).size===names.length)mon.moves=names;}
  else if(op.op==='setAbilityIndex'&&!hasFormChange){const value=trainerAttributeValue(op.value,source?.sourceId);if(Number.isInteger(value)&&value>=0&&value<=2){const slot=['primary','secondary','hidden'][value],form=source?.formList.find(item=>item.formIndex===(mon.rogueFormIndex||0)),available=form?.abilities?.length?form.abilities:source?.abilities||[],ability=available.find(a=>a.slot===slot)||(slot==='secondary'?available.find(a=>a.slot==='primary'):null);if(ability){mon.ability=ability.key;mon.rogueAbilitySlot=ability.slot;}}}
  else if(op.op==='setGender'&&!hasFormChange){const value=trainerAttributeValue(op.value,source?.sourceId),gender=({'-1':'N','0':'M','1':'F'})[value],ratio=source?.malePercent;if(gender==='N'&&ratio==null||gender==='M'&&ratio>0||gender==='F'&&ratio!=null&&ratio<100)mon.gender=gender;}
  else if(op.op==='setFriendship'&&Number.isInteger(op.value)&&op.value>=0&&op.value<=255)mon.friendship=op.value;
  else if(op.op==='setBoss'&&op.enabled===true&&Number.isInteger(op.segments)&&op.segments>1){mon.rogueBoss=true;mon.rogueBossSegments=op.segments;}
  else if(op.op==='setTeraType'&&!hasFormChange){const field=op.value?.type==='field'&&op.value.scope==='pokemon'?op.value.path?.join('.'):null,index=trainerAttributeValue(op.value,source?.sourceId),nativeType=Number.isInteger(index)?Dex.types.get(enumTypes[index]||''):null,type=field==='species.type1'?mon.types?.[0]:field==='species.type2'?mon.types?.[1]:nativeType?.exists?nativeType.name:null;if(type)mon.teraType=type;}
  else if(op.op==='ensureMove'&&!hasFormChange&&Number.isInteger(op.preferredSlot)&&op.preferredSlot>=0&&op.preferredSlot<4){const move=sourceMove(op.moveId),alternative=trainerMoveAlternative(mon,op.acceptableAlternative);if(move&&alternative===false&&!mon.moves.includes(move)){const slot=Math.min(op.preferredSlot,mon.moves.length);mon.moves[slot]=move;}}
  else if(op.op==='replaceMove'&&!hasFormChange){const oldMove=sourceMove(op.targetMoveId),newMove=sourceMove(op.replacementMoveId),slot=mon.moves.indexOf(oldMove);if(newMove&&slot>=0&&!mon.moves.includes(newMove))mon.moves[slot]=newMove;}
  else if(op.op==='setMove'&&!hasFormChange&&Number.isInteger(op.index)&&op.index>=0&&op.index<4){const moveId=trainerSeededValue(op.move?.moveId,run,source?.sourceId),move=sourceMove(moveId);if(move)mon.moves[Math.min(op.index,mon.moves.length)]=move;}
 }
 mon.moves=(mon.rogueSketchRule==='source-v1'?mon.moves.filter(Boolean):[...new Set(mon.moves.filter(Boolean))]).slice(0,4);return configure(mon);
}
function applyInstantTrainerTera(team,trainerId,run){
 const calls=world.trainerConfigs[trainerId]?.sourceCalls||[];
 for(const call of calls)if(call.method==='setInstantTera'&&call.args?.length===1&&Number.isInteger(call.args[0])&&team[call.args[0]])team[call.args[0]].rogueInstantTera=true;
 const setup=calls.find(call=>call.method==='initForGymLeader'||call.method==='initForEliteFour');if(!setup||!team.length)return;
 const gym=setup.method==='initForGymLeader',args=setup.args||[],enabled=!gym||args[3]===true||run.wave>=100,specialty=args[2];if(!enabled||!Number.isInteger(specialty))return;
 const nativeType=Dex.types.get(enumTypes[specialty]||'');if(!nativeType.exists)return;
 const eligible=team.map((mon,index)=>({mon,index})).filter(({mon})=>mon.rogueSourceId!==292||nativeType.name==='Bug');if(!eligible.length)return;
 const slot=gym?args[4]:args[3],wrapped=Number.isInteger(slot)?((slot%team.length)+team.length)%team.length:null;
 const selected=eligible.find(entry=>entry.index===wrapped)||choose(eligible,run);selected.mon.teraType=nativeType.name;selected.mon.rogueInstantTera=true;
}
function trainer(run,id,event){
 const config=world.trainerConfigs[id],selection=templateRules.trainers[id];if(!config||!selection)throw Error('트레이너 파티 자료가 없습니다.');
 const init=config.sourceCalls.find(c=>c.method.startsWith('initFor')),specialty=init?.args?.[2],gym=config.sourceCalls.some(c=>c.method==='initForGymLeader'),elite=config.sourceCalls.some(c=>c.method==='initForEliteFour'),champ=config.sourceCalls.some(c=>c.method==='initForChampion'),evilLeader=config.sourceCalls.some(c=>c.method==='initForEvilTeamLeader'),signature=world.signatureSpecies[config.enumName]||[];
 const range=selection.ranges.find(range=>run.wave>=range.from&&run.wave<=range.to);if(!range?.choices?.length)throw Error('이 웨이브의 파티 템플릿이 없습니다.');
 run.trainerTemplates||={};const key=run.wave+':'+id;run.trainerTemplates[key]||=choose(range.choices,run);const template=templateRules.templates[run.trainerTemplates[key]];
 if(!template)throw Error('트레이너 템플릿을 읽지 못했습니다.');
 const memberCalls=config.sourceCalls.filter(c=>c.method==='setPartyMemberFunc'),rawPool=config.sourceCalls.filter(c=>c.method==='setSpeciesPools').at(-1)?.args?.[0];
 const allowEggMoves=config.sourceCalls.some(c=>['setEggMovesAllowed','setBoss','initForGymLeader','initForEliteFour','initForChampion','initForEvilTeamAdmin','initForEvilTeamLeader','initForStatTrainer'].includes(c.method));
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
  const mon=enemyMon(chosenSource,level,run,{trainer:true});if(!mon.rogueSketchRule)mon.moves=trainerLevelMoves(mon,()=>classicRandom(run),{allowEggMoves});team.push(applyTrainerMemberAttributes(mon,id,index,relative,run,{allowEggMoves}));
 }
 applyInstantTrainerTera(team,id,run);
 if(run.trainerItemsRule==='source-v1')applyClassicTrainerFixedItems(team,config.enumName);
 if(run.trainerFieldItemsRule==='source-v1')applyClassicTrainerFieldItems(team,config.enumName);
 const label=names.trainersByType[id]?.label||config.enumName,money=config.sourceCalls.filter(c=>c.method==='setMoneyMultiplier').at(-1)?.args[0]||(gym||evilLeader?2.5:elite?3.25:champ?10:1);
 const doubleOnly=config.sourceCalls.some(c=>c.method==='setDoubleOnly'),hasDouble=config.sourceCalls.some(c=>c.method==='setHasDouble');
 const doubles=event.kind==='trainer'&&team.length>=2&&run.party.filter(p=>p.hp>0).length>=2&&(doubleOnly||hasDouble&&Math.floor(classicRandom(run)*classicDoubleDenominator(run))===0);
 const appearance=trainerImages.byEnumName[config.enumName],portrait=(doubles&&appearance?.variants?.double)||appearance;
 return {kind:event.kind,template:run.trainerTemplates[key],trainer:{id,name:label,title:gym?'체육관 관장':elite?'사천왕':champ?'챔피언':evilLeader?'조직 보스':doubles?'더블 트레이너':'트레이너',hasVoucher:!!(gym||elite||champ||evilLeader),sprite:portrait?.src||'/game/trainers/fallback.svg',artist:trainerImages.assets[portrait?.spriteKey]?.artist||null,creditUrl:'https://play.pokemonshowdown.com/sprites/trainers/',moneyMultiplier:money},team,doubles,boss:!!(gym||elite||champ||evilLeader),biome:classicBiome(run)};
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
  const mon=enemyMon(id,level,run,{trainer:true});if(!mon.rogueSketchRule)mon.moves=trainerLevelMoves(mon,()=>classicRandom(run),{allowEggMoves:fight>=4,forRivalSignature:fight>=5&&index<2});
  if(index===0){const primary=sourceSpeciesFor(mon)?.abilities.find(ability=>ability.slot==='primary');if(primary){mon.ability=primary.key;mon.rogueAbilitySlot='primary';}mon.teraType=mon.types?.[0]||mon.teraType;if(fight>=5){mon.rogueBoss=true;mon.rogueBossSegments=fight===5?2:3;}}
  if(index===5&&fight>=5&&id===384){mon.shiny=true;mon.variant=1;mon.originBall='masterball';mon.rogueBoss=true;mon.rogueBossSegments=fight===5?3:classicBossSegments(run.wave,level,sourceSpeciesFor(mon)?.baseTotal||680,{boss:true,legendary:true});
   if(fight===6){const mega=sourceSpeciesFor(mon)?.formList.find(form=>form.formKey==='mega'),native=Dex.species.get('rayquazamega');if(mega&&native.exists){mon.rogueFormIndex=mega.formIndex;mon.rogueFormKey=mega.formKey;mon.rogueBattleSpecies=native.id;mon.rogueBaseStats={...mega.baseStats};mon.rogueTypes=[...mega.types];mon.types=[...mega.types];mon.type=mega.types[0];mon.ability=mega.abilities.find(ability=>ability.slot==='primary')?.key||mon.ability;mon.rogueAbilitySlot='primary';mon.battleAppearance=native.id;mon.battleSprite=native.spriteid;mon.mega=true;mon.sourceImage=null;mon.sourceBackImage=null;mon.sourceAppearanceMissing=false;}}
  }
  return configure(mon);
 });
 applyInstantTrainerTera(team,374+fight,run);
 if(run.trainerItemsRule==='source-v1')applyClassicTrainerFixedItems(team,'RIVAL_'+fight);
 const multiplier=world.trainerConfigs[374+fight]?.sourceCalls.filter(call=>call.method==='setMoneyMultiplier').at(-1)?.args[0];
 return {kind:'rival',trainer:{id:374+fight,name:'라이벌',title:'라이벌 · '+fight+'차전',moneyMultiplier:Number.isFinite(multiplier)?multiplier:1,sprite:'/game/trainers/fallback.svg'},team,doubles:false,boss:true,biome:classicBiome(run)};
}
// Ordinary-trainer candidates use a wave-offset seed, independently of the
// random cursor consumed by rewards and encounter composition.
function seededTrainerCandidate(run,wave,chance){const seed=String(run.seed||run.id||'classic'),shifted=seed.split('').map(char=>String.fromCharCode(char.charCodeAt(0)+wave)).join('');return Math.floor(rogueSeededRandom(shifted)()*chance)===0;}
function randomTrainer(run,event){
 const wave=run.wave,biome=world.biomes[Number(run.biome)||0],chance=Number(biome?.trainerChance)||0;
 if(event.boss||!chance||wave%10===1||wave%10===0)return null;
 const segmentStart=Math.floor(wave/10)*10+2;
 for(let nearby=Math.max(segmentStart,wave-2);nearby<=Math.min(200,Math.floor(wave/10)*10+10,wave+2);nearby++){
  if(nearby===wave)continue;
  if(classicStoryEvent(run,nearby).kind!=='wild')return null;
  if(nearby<wave&&seededTrainerCandidate(run,nearby,chance))return null;
 }
 if(!seededTrainerCandidate(run,wave,chance))return null;
 let tier=rarity(run);while(tier>0&&!biome.trainerPool[tier]?.length)tier--;
 const pool=biome.trainerPool[tier]||[],id=pool.length?chooseNested(pool,run):world.enums.TrainerType.BREEDER;
 const result=trainer(run,id,{kind:'trainer'});run.lastRandomTrainerWave=wave;return result;
}
export function classicEncounter(run){
 const event=classicStoryEvent(run);let encounter;
 if(event.kind==='wild')encounter=randomTrainer(run,event)||wild(run,event);
 else if(event.kind==='rival')encounter=rival(run,event);
 else if(event.kind==='youngster')encounter=trainer(run,63,event);
 else if(event.kind==='gym'){const pools=world.biomes[Number(run.biome)||0].trainerPool;let gymPool=pools[5]||[];if(!gymPool.length)gymPool=Object.values(world.trainerConfigs).filter(t=>t.sourceCalls.some(c=>c.method==='initForGymLeader')).map(t=>world.enums.TrainerType[t.enumName]);encounter=trainer(run,choose(gymPool,run),event);}
 else if(event.kind==='elite'||event.kind==='champion'){run.leagueRegion??=Math.floor(classicRandom(run)*world.eliteFourChampionGroups.length);const region=world.eliteFourChampionGroups[run.leagueRegion],pool=region.trainerTypeOptionsByWave[run.wave];encounter=trainer(run,chooseNested(pool,run),event);}
 else if(event.kind==='evil'){run.evilGroup??=Math.floor(classicRandom(run)*10);const grunts=[64,69,72,75,79,82,88,90,92,94],leaders=[100,102,104,106,108,110,112,114,116,118];encounter=trainer(run,event.event.startsWith('grunt')?grunts[run.evilGroup]:leaders[run.evilGroup]+(run.wave===165?1:0),event);}
 else if(event.kind==='final')return {kind:'final',trainer:null,boss:true,doubles:false,phase:1,team:[makeReferenceMon(890,100,{boxId:crypto.randomUUID(),moves:['Eternabeam','Sludge Bomb','Flamethrower','Cosmic Power'],ability:'pressure',rogueBoss:true,rogueBossSegments:4,roguePassiveAbility:null})],biome:classicBiome(run)};
 else throw Error('지원하는 전투 종류를 확인하세요.');
 if(run.enemyBerryRule!=='source-v1')return encounter;
 const calls=world.trainerConfigs[encounter.trainer?.id]?.sourceCalls||[];encounter.rogueTrainerBoss=!!encounter.trainer&&calls.some(c=>['setBoss','initForGymLeader','initForEliteFour','initForChampion','initForEvilTeamAdmin','initForEvilTeamLeader','initForStatTrainer'].includes(c.method));
 return applyClassicEnemyBerries(encounter,run,()=>classicRandom(run));
}

export {world as classicWorldReference};

export {trainer as classicTrainerEncounter};
