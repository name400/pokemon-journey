import {rogueFormArt} from './rogue-form-art.mjs';
import {Dex} from '@pkmn/sim';
import {sourceSpeciesFor,rogueSpecies,rogueReferenceData,sourceMove,sourceAbility,makeReferenceMon} from './rogue-reference.mjs';
import {classicTimeOfDay} from './rogue-classic-world.mjs';
import {moves} from './game.mjs';
import {configure,rules} from './pokemon-config.mjs';
import {queueClassicMoves} from './rogue-classic-growth.mjs';
const itemNames=new Map(Object.entries(rogueReferenceData.enums.EvolutionItem).map(([key,id])=>[id,key.toLowerCase().replaceAll('_','')]));
const typeNames={NORMAL:'노말',FIGHTING:'격투',FLYING:'비행',POISON:'독',GROUND:'땅',ROCK:'바위',BUG:'벌레',GHOST:'고스트',STEEL:'강철',FIRE:'불꽃',WATER:'물',GRASS:'풀',ELECTRIC:'전기',PSYCHIC:'에스퍼',ICE:'얼음',DRAGON:'드래곤',DARK:'악',FAIRY:'페어리'};
const typeById=Object.fromEntries(Object.entries(rogueReferenceData.enums.PokemonType).map(([k,v])=>[v,typeNames[k]]));
const natureIds=Object.fromEntries(Object.entries(rogueReferenceData.enums.Nature).map(([k,v])=>[k.toLowerCase(),v]));
const weatherIds={sunnyday:1,raindance:2,sandstorm:3,hail:4,snow:5,fog:6,primordialsea:7,desolateland:8,deltastream:9};
const heldCount=(run,p,id)=>run.modifiers.filter(m=>m.boxId===p.boxId&&m.id===id).reduce((n,m)=>n+m.count,0);
function checkCondition(condition,mon,run,system){
 const known=mon.moves.map(m=>Dex.moves.get(moves[m]?.key||m).num),type=typeById[condition.pkmnType];
 switch(condition.key){
  case 1:return {met:(mon.friendship??50)>=condition.value,label:`친밀도 ${condition.value} 이상`};
  case 2:return {met:condition.time.includes(classicTimeOfDay(run)),label:condition.time.includes(1)?'낮·새벽':'밤·해질녘'};
  case 3:return {met:known.includes(condition.move),label:`${sourceMove(condition.move)} 배우기`};
  case 4:return {met:mon.moves.some(name=>(moves[name]?.type||typeNames[Dex.moves.get(moves[name]?.key||name).type.toUpperCase()])===type),label:`${type} 타입 기술 배우기`};
  case 5:return {met:run.party.some(p=>p.types.includes(type)),label:`파티에 ${type} 타입 포켓몬`};
  case 6:return {met:condition.weather.includes(weatherIds[run.weather]||0),label:'해당 진화에 맞는 바이옴 날씨'};
  case 7:return {met:condition.biome.includes(Number(run.biome)),label:'해당 진화에 맞는 바이옴'};
  case 8:return {met:known.find(id=>[490,183,229].includes(id))===condition.move,label:`${sourceMove(condition.move)}을(를) 진화 기술 중 가장 앞에 배치`};
  case 9:return {met:false,label:'아이스크가 진화할 때 빈 파티와 몬스터볼로 함께 생성'};
  case 10:return {met:heldCount(run,mon,'evolutiontracker')+(mon.rogueTreasureCount||0)>=condition.value,label:`진화 보물 추적 ${condition.value}개`};
  case 11:return {met:(mon.personality>>>0)%condition.value===0,label:'이 개체의 희귀 진화 폼 조건'};
  case 12:return {met:!!system?.dex?.[condition.speciesCaught]?.caught,label:`${rogueSpecies.get(condition.speciesCaught)?.name||condition.speciesCaught} 포획 기록`};
  case 13:return {met:mon.gender===(condition.gender===0?'M':'F'),label:condition.gender===0?'수컷':'암컷'};
  case 14:return {met:condition.nature.includes(natureIds[mon.nature]),label:'진화 폼에 맞는 성격'};
  case 15:{const id=condition.itemKey.toLowerCase().replaceAll('_','');return {met:mon.item===id||heldCount(run,mon,id)>0,label:`${rules.items[id]?.name||id} 지니기`};}
  default:throw Error('정의되지 않은 진화 조건입니다.');
 }
}
export function classicEvolutionOptions(mon,run,system){
 const record=sourceSpeciesFor(mon);if(!record)return [];const form=record.formList.find(f=>f.formIndex===(mon.rogueFormIndex||0)),result=[];
 for(const [index,evolution]of(record.evolutions||[]).entries()){
  if(evolution.preFormKey!=null&&evolution.preFormKey!==(form?.formKey||''))continue;
  const target=rogueSpecies.get(evolution.speciesId);if(!target)throw Error('진화 대상 데이터가 없습니다.');
  const targetForm=target.formList.find(f=>f.formKey===(evolution.evoFormKey||''));
  const checks=[{met:mon.level>=evolution.level,label:`레벨 ${evolution.level} 이상`},...([].concat(evolution.condition||[]).map(c=>checkCondition(c,mon,run,system)))];
  const item=evolution.item?itemNames.get(evolution.item):null,withoutItem=checks.every(c=>c.met);
  if(item)checks.push({met:(run.evolutionItems?.[item]||0)>0,label:`${rules.items[item]?.name||item} 1개`});
  result.push({key:record.sourceId+':'+index,sourceId:target.sourceId,id:targetForm?.pokemonId||target.pokemonId,name:targetForm?.formName?target.name+' · '+targetForm.formName:target.name,formIndex:targetForm?.formIndex||0,conditions:checks,ready:checks.every(c=>c.met),readyWithoutItem:withoutItem,item,sourceItem:evolution.item||0,level:evolution.level});
 }
 return result;
}
export function classicEvolutionItemCandidates(run,system,{rare=false}={}){return run.party.flatMap(mon=>classicEvolutionOptions(mon,run,system).filter(e=>e.item&&e.readyWithoutItem&&((e.sourceItem>=51)===rare)&&!(run.evolutionItems?.[e.item]>0)).map(e=>({item:e.item,name:rules.items[e.item]?.name||e.item,boxId:mon.boxId,evolutionKey:e.key,pokemonName:mon.name})));}
export function evolveClassicPokemon(run,system,{boxId,evolutionKey}){
 if(['battle','learn','capture'].includes(run.screen))throw Error('전투와 기술 선택을 마친 뒤 직접 진화하세요.');const index=run.party.findIndex(p=>p.boxId===boxId);if(index<0)throw Error('파티 포켓몬을 선택하세요.');const mon=run.party[index],option=classicEvolutionOptions(mon,run,system).find(e=>e.key===evolutionKey&&e.ready);if(!option)throw Error('진화 조건을 충족하지 않았습니다.');
 const source=rogueSpecies.get(option.sourceId),form=source.formList.find(f=>f.formIndex===option.formIndex),ability=(form?.abilities||source.abilities).find(a=>a.slot===(mon.rogueAbilitySlot||'primary'))||(form?.abilities||source.abilities)[0];
 const fresh=makeReferenceMon(source.sourceId,mon.level),next=configure({...fresh,...mon,id:option.id,artId:form?.pokemonId?fresh.artId:source.artId,name:option.name,baseName:source.name,speciesId:fresh.speciesId,formId:form?.pokemonId===option.id?fresh.formId:fresh.formId,rogueSourceId:source.sourceId,rogueFormIndex:option.formIndex,rogueBaseStats:{...(form?.baseStats||source.baseStats)},rogueTypes:[...(form?.types||source.types)],types:[...(form?.types||source.types)],ability:ability.key,rogueBattleSpecies:form?.nativeSpecies||null,rogueSpriteKey:form?.spriteKey||null,...rogueFormArt(form,mon.shiny),baseExperience:source.baseExp,captureRate:source.catchRate},{hp:mon.hp});
 next.roguePassiveAbility=mon.roguePassiveAbility?sourceAbility(form?.passiveAbilityId??source.passiveAbilityId):null;
 next.hp=mon.hp>0?Math.min(next.maxHp,mon.hp+Math.max(0,next.maxHp-mon.maxHp)):0;run.party[index]=next;if(option.item)run.evolutionItems[option.item]--;
 const learned=[...(source.levelMoves||[]),...(source.formLevelMoves?.[form?.formKey||'']||[])].filter(([level])=>level===0).map(([,move])=>sourceMove(move)).filter(move=>move&&!next.moves.includes(move));
 queueClassicMoves(run,next,learned);
 let extra=null;
 if(sourceSpeciesFor(mon)?.sourceId===290&&source.sourceId===291&&run.party.length<6&&(run.balls?.pokeball||0)>0){
  const shed=rogueSpecies.get(292),id=crypto.randomUUID();extra=makeReferenceMon(292,mon.level,{boxId:id,ivs:{...mon.ivs},evs:{...mon.evs},nature:mon.nature,gender:'N',shiny:mon.shiny,variant:mon.variant||0,moves:[...mon.moves],pp:{...mon.pp},item:mon.item,origin:mon.origin,rogueMetBiome:mon.rogueMetBiome,rogueUsedTMs:[...(mon.rogueUsedTMs||[])],roguePassiveAbility:mon.roguePassiveAbility?sourceAbility(shed.passiveAbilityId):null});
  run.party.push(extra);run.modifiers.push(...run.modifiers.filter(m=>m.boxId===boxId).map(m=>({...m,boxId:id})));
  for(const [level,id]of shed.levelMoves||[])if(level===0){const move=sourceMove(id);if(move&&!extra.moves.includes(move))run.pendingMoves.push({boxId:extra.boxId,move,level:extra.level});}
 }
 run.log=[mon.name+'이(가) '+next.name+'(으)로 진화했다!'];return {before:mon,after:next,extra};
}
