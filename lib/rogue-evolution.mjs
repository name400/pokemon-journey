import {classicTracksFormItems} from './rogue-form-item-state.mjs';
import {inheritClassicFormItems} from './rogue-transformations.mjs';
import {classicChallengeLevelMoves,classicRandomizedMoveName,classicRandomizerEvolution} from './rogue-challenge-randomizers.mjs';
import {applyClassicPokemonChallenges} from './rogue-challenge-pokemon.mjs';
import {normalizeClassicTransientDynamax} from './rogue-transient-dynamax.mjs';
import {Dex} from '@pkmn/sim';
import {sourceSpeciesFor,rogueSpecies,rogueReferenceData,sourceMove,sourceAbility,makeReferenceMon} from './rogue-reference.mjs';
import {classicTimeOfDay} from './rogue-classic-world.mjs';
import {moves} from './game.mjs';
import {configure,rules} from './pokemon-config.mjs';
import {queueClassicMoves} from './rogue-classic-growth.mjs';
import {rogueSeededRandom} from './rogue-seeded-rng.mjs';
import {classicTypesWithCustomSecond} from './rogue-custom-types.mjs';
import {validatedClassicDnaFusion,classicDnaFusionTypes,reviewedClassicDnaDonorForm} from './rogue-dna-fusion.mjs';
const itemNames=new Map(Object.entries(rogueReferenceData.enums.EvolutionItem).map(([key,id])=>[id,key.toLowerCase().replaceAll('_','')]));
const typeNames={NORMAL:'노말',FIGHTING:'격투',FLYING:'비행',POISON:'독',GROUND:'땅',ROCK:'바위',BUG:'벌레',GHOST:'고스트',STEEL:'강철',FIRE:'불꽃',WATER:'물',GRASS:'풀',ELECTRIC:'전기',PSYCHIC:'에스퍼',ICE:'얼음',DRAGON:'드래곤',DARK:'악',FAIRY:'페어리'};
const typeById=Object.fromEntries(Object.entries(rogueReferenceData.enums.PokemonType).map(([k,v])=>[v,typeNames[k]]));
const natureIds=Object.fromEntries(Object.entries(rogueReferenceData.enums.Nature).map(([k,v])=>[k.toLowerCase(),v]));
const weatherIds={sunnyday:1,raindance:2,sandstorm:3,hail:4,snow:5,snowscape:5,fog:6,primordialsea:7,desolateland:8,deltastream:9};
export const CLASSIC_FUSION_EVOLUTION_CONDITIONS=Object.freeze(Array.from({length:15},(_,i)=>i+1));
const heldCount=(run,p,id)=>run.modifiers.filter(m=>m.boxId===p.boxId&&m.id===id).reduce((n,m)=>n+m.count,0);
function checkCondition(condition,mon,run,system,{legacyTracker=false,legacyRandom=false}={}){
 const known=mon.moves.map(m=>Dex.moves.get(moves[m]?.key||m).num),type=typeById[condition.pkmnType];
 switch(condition.key){
  case 1:return {met:(mon.friendship??50)>=condition.value,label:`친밀도 ${condition.value} 이상`};
  case 2:return {met:condition.time.includes(classicTimeOfDay(run)),label:condition.time.includes(1)?'낮·새벽':'밤·해질녘'};
  case 3:return {met:known.includes(condition.move),label:`${sourceMove(condition.move)} 배우기`};
  case 4:return {met:mon.moves.some(name=>(moves[name]?.type||typeNames[Dex.moves.get(name).type?.toUpperCase()])===type),label:`${type} 타입 기술 배우기`};
  case 5:return {met:run.party.some(p=>p.types.includes(type)),label:`파티에 ${type} 타입 포켓몬`};
  case 6:return {met:condition.weather.includes(weatherIds[run.combat?.weather??run.weather]||0),label:'해당 진화에 맞는 바이옴 날씨'};
  case 7:return {met:condition.biome.includes(Number(run.biome)),label:'해당 진화에 맞는 바이옴'};
  case 8:return {met:known.find(id=>[490,183,229].includes(id))===condition.move,label:`${sourceMove(condition.move)}을(를) 진화 기술 중 가장 앞에 배치`};
  case 9:return {met:false,label:'아이스크가 진화할 때 빈 파티와 몬스터볼로 함께 생성'};
  case 10:return {met:(legacyTracker||heldCount(run,mon,'evolutiontracker')>0)&&heldCount(run,mon,'evolutiontracker')+(mon.rogueTreasureCount||0)>=condition.value,label:`진화 보물 추적 ${condition.value}개`};
  case 11:{let id=mon.personality>>>0;if(!Number.isInteger(mon.personality)){id=2166136261;for(const c of String(mon.boxId||mon.id))id=Math.imul(id^c.charCodeAt(0),16777619);id>>>=0;}const seed=String(run.seed||run.id||'classic'),shifted=seed.split('').map(c=>String.fromCharCode(c.charCodeAt(0)+id)).join('');return {met:legacyRandom?(mon.personality>>>0)%condition.value===0:Math.floor(rogueSeededRandom(shifted,{utf16:true})()*condition.value)===0,label:'이 개체의 희귀 진화 폼 조건'};}
  case 12:return {met:!!system?.dex?.[condition.speciesCaught]?.caught,label:`${rogueSpecies.get(condition.speciesCaught)?.name||condition.speciesCaught} 포획 기록`};
  case 13:return {met:mon.gender===(condition.gender===0?'M':'F'),label:condition.gender===0?'수컷':'암컷'};
  case 14:return {met:condition.nature.includes(natureIds[mon.rogueNatureOverride||mon.nature]),label:'진화 폼에 맞는 성격'};
  case 15:{const id=condition.itemKey.toLowerCase().replaceAll('_','');return {met:mon.item===id||heldCount(run,mon,id)>0,label:`${rules.items[id]?.name||id} 지니기`};}
  default:throw Error('정의되지 않은 진화 조건입니다.');
 }
}
export function classicEvolutionOptions(mon,run,system,context={}){
 const record=sourceSpeciesFor(mon);if(!record)return [];const form=record.formList.find(f=>f.formIndex===(mon.rogueFormIndex||0)),result=[];
 for(const [index,rawEvolution]of(record.evolutions||[]).entries()){
  const evolution=classicRandomizerEvolution(mon,rawEvolution);
  if(evolution.preFormKey!=null&&evolution.preFormKey!==(form?.formKey||''))continue;
  const target=rogueSpecies.get(evolution.speciesId);if(!target)throw Error('진화 대상 데이터가 없습니다.');
  const targetForm=target.formList.find(f=>f.formKey===(evolution.evoFormKey||''));
  const checks=[{met:mon.level>=evolution.level,label:`레벨 ${evolution.level} 이상`},...([].concat(evolution.condition||[]).map(c=>checkCondition(c,mon,run,system,context)))];
  const item=evolution.item?itemNames.get(evolution.item):null,withoutItem=checks.every(c=>c.met);
  if(item)checks.push({met:(run.evolutionItems?.[item]||0)>0,label:`${rules.items[item]?.name||item} 1개`});
  result.push({key:record.sourceId+':'+index,sourceId:target.sourceId,id:targetForm?.pokemonId||target.pokemonId,name:targetForm?.formName?target.name+' · '+targetForm.formName:target.name,formIndex:targetForm?.formIndex||0,conditions:checks,ready:checks.every(c=>c.met),readyWithoutItem:withoutItem,item,sourceItem:evolution.item||0,level:evolution.level});
 }
 // The source evaluates conditions on the fused Pokémon; only gender comes
 // from the secondary species. Unverified condition kinds remain unavailable.
 const fusion=mon.fusionSpecies&&validatedClassicDnaFusion(mon),donor=fusion?.donor,donorSource=donor&&sourceSpeciesFor(donor);
 if(donorSource&&!donor.rogueAbilityOverride){for(const [index,rawEvolution] of (donorSource.evolutions||[]).entries()){
  const e=classicRandomizerEvolution({...mon,rogueSourceId:donorSource.sourceId},rawEvolution);
  if(e.preFormKey!=null&&e.preFormKey!==(donorSource.formList.find(f=>f.formIndex===(donor.rogueFormIndex||0))?.formKey||'')||e.item&&!itemNames.has(e.item))continue;
  const conditions=[].concat(e.condition||[]),supported=new Set(CLASSIC_FUSION_EVOLUTION_CONDITIONS);if(conditions.some(c=>!supported.has(c.key)||c.key===13&&!['M','F','N'].includes(donor.gender)))continue;
  const target=rogueSpecies.get(e.speciesId),targetForm=target?.formList.find(f=>f.formKey===(e.evoFormKey||''));if(!target||targetForm?.formIndex>0&&!reviewedClassicDnaDonorForm(target.sourceId,targetForm.formIndex,targetForm.formKey,targetForm.pokemonId||target.pokemonId)||e.evoFormKey&&!targetForm)continue;
  const item=e.item?itemNames.get(e.item):null,checks=[{met:mon.level>=e.level,label:`레벨 ${e.level} 이상`},...conditions.map(c=>checkCondition(c,c.key===13?{...mon,gender:donor.gender}:mon,run,system,context))],withoutItem=checks.every(c=>c.met);if(item)checks.push({met:(run.evolutionItems?.[item]||0)>0,label:`${rules.items[item]?.name||item} 1개`});
  result.push({key:`fusion:${donorSource.sourceId}:${index}`,sourceId:target.sourceId,id:targetForm?.pokemonId||target.pokemonId,name:`${target.name}${targetForm?.formIndex>0?' · '+({female:'암컷',midnight:'한밤중',dusk:'황혼',lowkey:'로우',antique:'진품','ruby-cream':'루비크림','matcha-cream':'말차크림','mint-cream':'민트크림','lemon-cream':'레몬크림','salted-cream':'솔트크림','ruby-swirl':'루비믹스','caramel-swirl':'캐러멜믹스','rainbow-swirl':'레인보우믹스'}[targetForm.formKey]||targetForm.formName):''} (두 번째)`,formIndex:targetForm?.formIndex||0,conditions:checks,ready:checks.every(c=>c.met),readyWithoutItem:withoutItem,item,sourceItem:e.item||0,level:e.level,fusion:true});
 }}
 // The source chooses the first eligible level evolution; keep item choices independent.
 const first=result.findIndex(e=>!e.item&&e.ready);if(first>=0)for(let i=first+1;i<result.length;i++)if(!result[i].item&&result[i].ready){result[i].ready=false;result[i].conditions.push({met:false,label:'다른 진화 모습이 우선됩니다'});}
 return result;
}
export function classicEvolutionItemCandidates(run,system,{rare=false}={}){return run.party.flatMap(mon=>classicEvolutionOptions(mon,run,system).filter(e=>e.item&&e.readyWithoutItem&&((e.sourceItem>=51)===rare)&&!(run.evolutionItems?.[e.item]>0)).map(e=>({item:e.item,name:rules.items[e.item]?.name||e.item,boxId:mon.boxId,evolutionKey:e.key,pokemonName:mon.name})));}
function evolveClassicPokemonInternal(run,system,{boxId,evolutionKey},{weather,legacyTracker=false,legacyRandom=false}={},forcedOption=null){
 if(['battle','learn','capture'].includes(run.screen))throw Error('전투와 기술 선택을 마친 뒤 직접 진화하세요.');const index=run.party.findIndex(p=>p.boxId===boxId);if(index<0)throw Error('파티 포켓몬을 선택하세요.');const mon=run.party[index],conditionRun=weather===undefined?run:{...run,combat:{...run.combat,weather}},option=forcedOption||classicEvolutionOptions(mon,conditionRun,system,{legacyTracker,legacyRandom}).find(e=>e.key===evolutionKey&&e.ready);if(!option)throw Error('진화 조건을 충족하지 않았습니다.');
 const fusion=mon.fusionSpecies?validatedClassicDnaFusion(mon):null;if(mon.fusionSpecies&&(!fusion||option.formIndex!==0&&!(reviewedClassicDnaDonorForm(option.sourceId,option.formIndex,rogueSpecies.get(option.sourceId)?.formList.find(f=>f.formIndex===option.formIndex)?.formKey,option.id))))throw Error('이 융합 진화는 아직 지원하지 않습니다.');
 if(option.fusion){
  const source=rogueSpecies.get(option.sourceId),form=source.formList.find(f=>f.formIndex===option.formIndex),old=fusion.donor,fresh=makeReferenceMon(source.sourceId,old.level),slot=old.rogueAbilitySlot||sourceSpeciesFor(old)?.abilities.find(a=>a.key===old.ability)?.slot||'primary',abilities=form?.abilities||source.abilities,ability=abilities.find(a=>a.slot===slot)||abilities[0];if(!ability)throw Error('융합 특성 정보를 확인하세요.');
  const donorTypes=classicTypesWithCustomSecond(old,form?.types||source.types),donor=configure({...old,id:form?.pokemonId||fresh.id,identifier:fresh.identifier,artId:form?.pokemonId||fresh.artId,battleAppearance:null,battleArtId:null,battleSprite:form?.spriteKey||null,rogueBaseBattleAppearance:null,speciesId:fresh.speciesId,formId:fresh.formId,name:option.name.replace(/ \(두 번째\)$/,''),baseName:source.name,formName:form?.formName||'',rogueSourceId:source.sourceId,rogueFormIndex:option.formIndex,rogueBattleSpecies:form?.nativeSpecies||null,rogueSpriteKey:form?.spriteKey||null,sourceImage:form?.sourceImage||null,sourceBackImage:form?.sourceBackImage||null,sourceShinyImage:form?.sourceShinyImage||null,sourceShinyBackImage:form?.sourceShinyBackImage||null,sourceAppearanceMissing:!!form?.sourceAppearanceMissing,battleAppearance:null,battleArtId:null,battleSprite:null,...(option.formIndex>0?{rogueFormKey:form.formKey}:{rogueFormKey:null}),rogueBaseStats:{...(form?.baseStats||source.baseStats)},rogueTypes:donorTypes,types:donorTypes,type:donorTypes[0],ability:ability.key},{hp:old.hp});
  Object.assign(donor,applyClassicPokemonChallenges(donor,run));
  const combined=classicDnaFusionTypes(mon.rogueFusion.primaryTypes,donorTypes),next=configure({...mon,fusionSpecies:source.sourceId,ability:donor.ability,rogueTypes:combined,types:combined,type:combined[0],rogueFusion:{...mon.rogueFusion,baseStats:{...(form?.baseStats||source.baseStats)},donor}},{hp:mon.hp});
  Object.assign(next,applyClassicPokemonChallenges(next,run));
 next.hp=mon.hp>0?Math.min(next.maxHp,mon.hp+Math.max(0,next.maxHp-mon.maxHp)):0;if(!validatedClassicDnaFusion(next))throw Error('진화한 융합 정보를 확인하세요.');
  run.party[index]=next;if(option.item)run.evolutionItems[option.item]--;
  if(sourceSpeciesFor(old)?.sourceId===999)run.modifiers=run.modifiers.filter(m=>m.id!=='evolutiontracker'||m.boxId!==boxId);
  const learned=classicChallengeLevelMoves(next,[...(source.levelMoves||[]),...(source.formLevelMoves?.[form?.formKey||'']||[])],source).filter(([level])=>level===0).map(([,move])=>next.rogueMovesetSeed?classicRandomizedMoveName(move):sourceMove(move)).filter(move=>move&&!next.moves.includes(move));queueClassicMoves(run,next,learned);run.log=[`${old.name}이(가) ${source.name}(으)로 진화했다!`];return {before:mon,after:next,extra:null,fusionEvolved:true,displayBefore:old,displayAfter:donor};
 }
 const source=rogueSpecies.get(option.sourceId),form=source.formList.find(f=>f.formIndex===option.formIndex),ability=(form?.abilities||source.abilities).find(a=>a.slot===(mon.rogueAbilitySlot||'primary'))||(form?.abilities||source.abilities)[0];
 const primaryTypes=classicTypesWithCustomSecond(mon,form?.types||source.types),changedTypes=fusion?classicDnaFusionTypes(primaryTypes,fusion.donor.rogueTypes):primaryTypes,fresh=makeReferenceMon(source.sourceId,mon.level),next=configure({...fresh,...mon,id:option.id,artId:form?.pokemonId?fresh.artId:source.artId,battleAppearance:null,battleArtId:null,battleSprite:form?.spriteKey||null,rogueBaseBattleAppearance:null,name:option.name,baseName:source.name,speciesId:fresh.speciesId,formId:form?.pokemonId===option.id?fresh.formId:fresh.formId,rogueSourceId:source.sourceId,rogueFormIndex:option.formIndex,rogueFormKey:form?.formKey||null,rogueBaseStats:{...(form?.baseStats||source.baseStats)},rogueTypes:changedTypes,types:changedTypes,type:changedTypes[0],ability:fusion?mon.ability:mon.rogueAbilityOverride||ability.key,...(fusion?{rogueFusion:{...mon.rogueFusion,primaryAbility:ability.key,primaryTypes}}:{}),rogueBattleSpecies:form?.nativeSpecies||null,rogueSpriteKey:form?.spriteKey||null,sourceImage:form?.sourceImage||null,sourceBackImage:form?.sourceBackImage||null,sourceShinyImage:form?.sourceShinyImage||null,sourceShinyBackImage:form?.sourceShinyBackImage||null,sourceAppearanceMissing:form?.sourceAppearanceMissing||false,baseExperience:source.baseExp,captureRate:source.catchRate},{hp:mon.hp});
 next.roguePassiveAbility=mon.roguePassiveAbility?sourceAbility(form?.passiveAbilityId??source.passiveAbilityId):null;
 Object.assign(next,applyClassicPokemonChallenges(next,run));
 next.hp=mon.hp>0?Math.min(next.maxHp,mon.hp+Math.max(0,next.maxHp-mon.maxHp)):0;run.party[index]=next;if(option.item)run.evolutionItems[option.item]--;
 // Source evolution removes the Gimmighoul owner's entire tracker modifier.
 if(sourceSpeciesFor(mon)?.sourceId===999){const tracker=run.modifiers.find(m=>m.id==='evolutiontracker'&&m.boxId===boxId);if(tracker)run.modifiers=run.modifiers.filter(m=>m!==tracker);}
 const learned=classicChallengeLevelMoves(next,[...(source.levelMoves||[]),...(source.formLevelMoves?.[form?.formKey||'']||[])],source).filter(([level])=>level===0).map(([,move])=>next.rogueMovesetSeed?classicRandomizedMoveName(move):sourceMove(move)).filter(move=>move&&!next.moves.includes(move));
 queueClassicMoves(run,next,learned);
 let extra=null;
 if(!fusion&&sourceSpeciesFor(mon)?.sourceId===290&&source.sourceId===291&&run.party.length<6&&(run.balls?.pokeball||0)>0){
  const shed=rogueSpecies.get(292),id=crypto.randomUUID();extra=makeReferenceMon(292,mon.level,{boxId:id,...(mon.rogueFlipStats===true?{rogueFlipStats:true}:{}),...(mon.rogueMovesetSeed?{rogueMovesetSeed:mon.rogueMovesetSeed,rogueMovesetRandomizer:mon.rogueMovesetRandomizer,rogueNoEggRelearn:true}:{}),ivs:{...mon.ivs},evs:{...mon.evs},nature:mon.nature,gender:'N',shiny:mon.shiny,variant:mon.variant||0,moves:[...mon.moves],pp:{...mon.pp},item:mon.item,origin:mon.origin,...(mon.rogueBaseBoosts?{rogueBaseBoosts:{...mon.rogueBaseBoosts}}:{}),rogueMetBiome:mon.rogueMetBiome,rogueUsedTMs:[...(mon.rogueUsedTMs||[])],roguePassiveAbility:mon.roguePassiveAbility?sourceAbility(shed.passiveAbilityId):null});
  extra=applyClassicPokemonChallenges(extra,run);if(classicTracksFormItems(run))extra=inheritClassicFormItems(extra,mon,run,{system});run.party.push(extra);run.modifiers.push(...run.modifiers.filter(m=>m.boxId===boxId).map(m=>({...m,boxId:id})));
  for(const [level,id]of classicChallengeLevelMoves(extra,shed.levelMoves||[],shed))if(level===0){const move=extra.rogueMovesetSeed?classicRandomizedMoveName(id):sourceMove(id);if(move&&!extra.moves.includes(move))run.pendingMoves.push({boxId:extra.boxId,move,level:extra.level});}
 }
 run.log=[mon.name+'이(가) '+next.name+'(으)로 진화했다!'];return {before:mon,after:next,extra};
}

// Nincada's extra Pokémon is a new individual with a copy of the pre-evolution
// fusion. Evolve only the Nincada side of each copy; never replace the partner.
// Stage both evolutions so a malformed extra cannot consume items or change the
// original party before validation has finished.
export function evolveClassicPokemon(run,system,payload,context={}){
 const original=run.party.find(p=>p.boxId===payload.boxId),fusion=original?.fusionSpecies&&validatedClassicDnaFusion(original);
 if(!fusion){if(!classicTracksFormItems(run))return evolveClassicPokemonInternal(run,system,payload,context);const staged=structuredClone(run),result=evolveClassicPokemonInternal(staged,system,payload,context);Object.assign(run,staged);return result;}
 const conditionRun=context.weather===undefined?run:{...run,combat:{...run.combat,weather:context.weather}},options=classicEvolutionOptions(original,conditionRun,system,context),option=options.find(e=>e.key===payload.evolutionKey&&e.ready),evolving=option?.fusion?sourceSpeciesFor(fusion.donor):sourceSpeciesFor(original);
 if(evolving?.sourceId!==290||option?.sourceId!==291)return evolveClassicPokemonInternal(run,system,payload,context);
 const staged=structuredClone(run),index=staged.party.findIndex(p=>p.boxId===payload.boxId),before=normalizeClassicTransientDynamax(staged.party[index]);staged.party[index]=before;
 const result=evolveClassicPokemonInternal(staged,system,payload,context);if(!validatedClassicDnaFusion(result.after))throw Error('진화한 토중몬의 융합 정보를 확인하세요.');let extra=null;
 if(staged.party.length<6&&(staged.balls?.pokeball||0)>0){
  const shed=options.find(e=>e.sourceId===292&&!!e.fusion===!!option.fusion);if(!shed)throw Error('껍질몬 융합 진화 정보를 확인하세요.');
  const boxId=crypto.randomUUID(),copy={...structuredClone(before),boxId,rogueShedinjaHpRule:'source-ability-v1',gender:'N',hp:before.maxHp,status:null,rogueStatusState:null,terastallized:null,boosts:{},battleAppearance:null,battleArtId:null,battleSprite:null,currentAbility:null,currentTypes:null,damageTaken:0,recoilDamage:0,experience:0,friendship:sourceSpeciesFor(before).baseFriendship??50};delete copy.pauseEvolutions;delete copy.personality;
  const modifiers=staged.modifiers.filter(m=>m.boxId===before.boxId).map(m=>({...structuredClone(m),boxId})),extraRun={...staged,party:[copy],modifiers,pendingMoves:[],pendingGrowth:[],autoLearned:[]};
  extra=evolveClassicPokemonInternal(extraRun,system,{boxId,evolutionKey:shed.key},context,{...shed,ready:true}).after;
  if(!validatedClassicDnaFusion(extra))throw Error('추가 껍질몬의 융합 정보를 확인하세요.');
  extra=inheritClassicFormItems(extra,before,staged,{system});
  staged.party.push(extra);staged.modifiers.push(...modifiers);staged.pendingMoves||=[];staged.pendingMoves.push(...extraRun.pendingMoves);
  if(extraRun.autoLearned.length)staged.autoLearned=[...(staged.autoLearned||[]),...extraRun.autoLearned];
 }
 Object.assign(run,staged);return {...result,before:original,extra};
}
