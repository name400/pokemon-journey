import {species,moves} from './game.mjs';
import {classicChallengeStarterEligibility} from './rogue-challenge-eligibility.mjs';
import {rules,configure} from './pokemon-config.mjs';
import {dailyPokerusIds,rogueSeededRandom} from './rogue-seeded-rng.mjs';
import {DEFAULT_STARTER_IDS,DEFAULT_STARTER_IV,STARTER_BUDGET,rogueSpecies,rogueForms,sourceSpeciesFor,sourceMove,sourceAbility,reducedStarterCost,makeReferenceMon} from './rogue-reference.mjs';

const stats=['hp','atk','def','spa','spd','spe'];
const emptyIVs=()=>Object.fromEntries(stats.map(k=>[k,0]));
const neutralNatures=['hardy','docile','serious','bashful','quirky'];
// The default starter block has its own fixed "default" seed in the source.
// Facts independently derived from Phaser 3.90's seeded RNG, not a species cycle.
const defaultNatureIndices=[1,4,0,1,2,2,1,2,3,3,0,2,4,2,2,3,3,0,4,3,3,0,4,2,0,3,3];
const candyReductionCosts=[[25,60],[25,60],[20,50],[15,40],[12,35],[10,30],[8,20],[5,15],[5,15],[5,15]];
const passiveCosts=[40,40,35,30,25,20,15,10,10,10];
export const SAME_SPECIES_EGG_COSTS=Object.freeze([20,20,15,12,10,8,7,6,6,5]);
const byPokemon=new Map(species.map(p=>[p.id,p]));
const starterRecords=[...rogueSpecies.values()].filter(p=>p.isStarter);
const unique=list=>[...new Set(list)];
function dexEntry(){return {caught:false,registered:false,seen:false,ivs:emptyIVs(),natures:[],abilitySlots:[],genders:[],shiny:false,forms:[],caughtCount:0,hatchedCount:0};}
function starterEntry(){return {candies:0,friendshipPoints:0,costReduction:0,passiveUnlocked:false,eggMask:0};}
function ownRecord(object,id,factory){const key=String(id);if(!Object.hasOwn(object,key))object[key]=factory();return object[key];}
export function starterProgress(system,id){system.starterData||={};return ownRecord(system.starterData,id,starterEntry);}
export function starterDexEntry(system,id){system.dex||={};return ownRecord(system.dex,id,dexEntry);}
function ancestors(id){const result=[],seen=new Set();while(rogueSpecies.has(id)&&!seen.has(id)){seen.add(id);result.push(id);const record=rogueSpecies.get(id);id=record.preEvolutionId??record.preEvolutionIds?.[0];}return result;}
function singleInitialStarter(system,legacyCollection,seed){
 const chosen=DEFAULT_STARTER_IDS.includes(system.initialStarterId)?system.initialStarterId:DEFAULT_STARTER_IDS[Math.floor(rogueSeededRandom(seed||'initial-starter-default')()*DEFAULT_STARTER_IDS.length)];
 const legacyEggs=new Set(legacyCollection.filter(m=>m.origin==='gacha'||m.origin==='egg').flatMap(m=>ancestors(sourceSpeciesFor(m)?.sourceId))),legacyCaught=new Set(legacyCollection.filter(m=>m.origin==='capture').flatMap(m=>ancestors(sourceSpeciesFor(m)?.sourceId)));
 for(const [index,id]of DEFAULT_STARTER_IDS.entries()){let d=starterDexEntry(system,id);const earned=d.adminGranted||d.eggRegistered||d.hatchedCount>0||legacyEggs.has(id);
  if(id===chosen){d.registered=true;d.caught=true;d.seen=true;d.forms=unique([...d.forms,0]);d.natures=unique([...d.natures,neutralNatures[defaultNatureIndices[index]]]);d.abilitySlots=unique([...d.abilitySlots,'primary']);d.genders=unique([...d.genders,'M','F']);for(const stat of stats)d.ivs[stat]=Math.max(DEFAULT_STARTER_IV,d.ivs[stat]||0);}
  else if(!earned){d.registered=false;if(!d.caughtCount&&!legacyCaught.has(id)){system.dex[id]=dexEntry();}}
 }
 system.initialStarterId=chosen;system.defaultUnlockPolicy='one-random-starter';system.dexVersion=4;return ensureStarterSystem(system,legacyCollection,{seed});
}
export function ensureStarterSystem(system,legacyCollection=[],{seed='initial-starter-default'}={}){
 if(system.dexVersion===5)return system;
 if(system.dexVersion===4){for(const [id,d] of Object.entries(system.dex||{})){if(d&&Number(d.caughtCount)>0&&rogueSpecies.has(Number(id)))d.registered=true;}system.dexVersion=5;return system;}
 if(system.dexVersion===3)return singleInitialStarter(system,legacyCollection,seed);
 if(system.dexVersion===2){system.initialStarterId||=DEFAULT_STARTER_IDS[Math.floor(rogueSeededRandom(seed)()*DEFAULT_STARTER_IDS.length)];for(const [id,d]of Object.entries(system.dex||{}))d.registered=DEFAULT_STARTER_IDS.includes(Number(id))||d.hatchedCount>0||!!d.adminGranted;system.dexVersion=3;for(const mon of legacyCollection)if(['gacha','admin'].includes(mon.origin))registerStarterCaught(system,mon,{kind:mon.origin==='admin'?'admin':'hatch',increment:false});return singleInitialStarter(system,legacyCollection,seed);}
 if(system.dexVersion===1){
  const legacyIds=new Set(legacyCollection.map(m=>sourceSpeciesFor(m)?.sourceId));
  for(const [index,id]of DEFAULT_STARTER_IDS.entries()){const d=starterDexEntry(system,id),nature=neutralNatures[defaultNatureIndices[index]];d.natures=!d.caughtCount&&!d.hatchedCount&&!legacyIds.has(id)?[nature]:unique([...d.natures,nature]);}
  system.dexVersion=2;return ensureStarterSystem(system,legacyCollection,{seed});
 }
 system.dex={};system.starterData={};
 for(const [index,id] of DEFAULT_STARTER_IDS.entries()){const d=starterDexEntry(system,id);Object.assign(d,{caught:true,registered:true,seen:true,ivs:Object.fromEntries(stats.map(k=>[k,DEFAULT_STARTER_IV])),natures:[neutralNatures[defaultNatureIndices[index]]],abilitySlots:['primary'],genders:['M','F'],forms:[0]});}
 system.initialStarterId||=DEFAULT_STARTER_IDS[Math.floor(rogueSeededRandom(seed)()*DEFAULT_STARTER_IDS.length)];system.dexVersion=3;
 for(const mon of legacyCollection)registerStarterCaught(system,mon,{kind:mon.origin==='gacha'?'hatch':mon.origin==='admin'?'admin':mon.origin==='capture'?'capture':'migration',increment:false});
 return singleInitialStarter(system,legacyCollection,seed);
}
export function registerStarterCaught(system,mon,{kind='capture',increment=true,boss=false}={}){
 ensureStarterSystem(system);const source=sourceSpeciesFor(mon);if(!source)return {unlocked:[],candies:0};
 const formIndex=Number.isInteger(mon.rogueFormIndex)?mon.rogueFormIndex:rogueForms.get(Number(mon.id))?.formIndex||0;
 const form=source.formList.find(f=>f.formIndex===formIndex),chain=ancestors(source.sourceId),unlocked=[];
 const requestedSlot=mon.rogueAbilitySlot||source.abilities.find(a=>a.key===mon.ability)?.slot;const slot=['primary','secondary','hidden'].includes(requestedSlot)?requestedSlot:'primary';const nature=Object.hasOwn(rules.natures,mon.nature||'')?mon.nature:'hardy',gender=['M','F','N'].includes(mon.gender)?mon.gender:source.malePercent==null?'N':source.malePercent===0?'F':'M';
 for(const id of chain){const record=rogueSpecies.get(id),d=starterDexEntry(system,id);if(['hatch','admin','capture'].includes(kind)){if(!d.registered&&record.isStarter)unlocked.push(id);d.registered=true;if(kind==='admin')d.adminGranted=true;else if(kind==='hatch')d.eggRegistered=true;}d.caught=true;d.seen=true;
  const corresponding=id===source.sourceId?formIndex:record.formList.find(f=>f.formKey===form?.formKey)?.formIndex||0;
  const transformed=record.formChanges?.some(c=>c.evoFormKey===form?.formKey&&c.preFormKey==='');d.forms=unique([...d.forms,corresponding,...(transformed?[0]:[])]);d.natures=unique([...d.natures,nature]);d.abilitySlots=unique([...d.abilitySlots,slot]);d.genders=unique([...d.genders,gender]);if(mon.shiny){const variant=Number.isInteger(mon.variant)?Math.max(0,Math.min(2,mon.variant)):0;const previous=Number.isInteger(d.shinyVariantMask)?d.shinyVariantMask:d.shiny?1<<Math.max(0,Math.min(2,d.highestShinyVariant||0)):0;d.shinyVariantMask=previous|(1<<variant);d.highestShinyVariant=Math.max(d.highestShinyVariant||0,variant);d.shiny=true;}
  if(increment){if(kind==='hatch')d.hatchedCount++;else if(kind==='capture')d.caughtCount++;}
 }
 // IVs start at the first selectable species, then propagate to its pre-evolutions.
 const first=chain.findIndex(id=>rogueSpecies.get(id).isStarter);
 for(const id of chain.slice(first<0?chain.length:first)){const d=starterDexEntry(system,id);for(const stat of stats)d.ivs[stat]=Math.max(d.ivs[stat]||0,Number.isInteger(mon.ivs?.[stat])?Math.min(31,Math.max(0,mon.ivs[stat])):0);}
 const family=rogueSpecies.get(source.starterId)||source,p=starterProgress(system,family.sourceId);
 let candy=increment?(kind==='hatch'?2:kind==='capture'?1:0):0;
 if(boss)candy*=2;if(mon.shiny===true)candy*=([5,10,20][mon.variant||0]||5);p.candies=Math.min(9999,p.candies+candy);
 return {unlocked,candies:candy,candyFamilyId:family.sourceId};
}
function formMoves(record,form,eggMask){
 const rows=[...(record.levelMoves||[]),...(record.formLevelMoves?.[form?.formKey||'']||[])],names=[];
 for(const [level,id] of rows)if(level>0&&level<=5){const name=sourceMove(id);if(name&&!names.includes(name))names.push(name);}
 for(const [i,id] of (record.eggMoves||[]).entries())if((eggMask&(1<<i))!==0){const name=sourceMove(id);if(name&&!names.includes(name))names.push(name);}
 return names.length?names:['몸부림'];
}
/** Moves selectable at the start: level-five moves plus already-unlocked egg moves. */
export function starterLegalMoves(system,sourceId,formIndex=0){
 const record=rogueSpecies.get(Number(sourceId));if(!record?.isStarter)throw Error('스타터로 선택할 수 있는 포켓몬이 아닙니다.');
 const form=record.formList.find(f=>f.formIndex===formIndex)||{formKey:''};
 return unique(formMoves(record,form,starterProgress(system,record.sourceId).eggMask));
}
export function starterCatalog(system,{includeLocked=true,now=Date.now()}={}){
 ensureStarterSystem(system);const result=[],pokerus=new Set(dailyPokerusIds(starterRecords.map(p=>p.sourceId),now));
 for(const record of starterRecords){const d=starterDexEntry(system,record.sourceId),own=starterProgress(system,record.sourceId),family=starterProgress(system,record.starterId),cost=reducedStarterCost(record.starterCost,own.costReduction),shinyMask=Number.isInteger(d.shinyVariantMask)?d.shinyVariantMask:d.shiny?1<<Math.max(0,Math.min(2,d.highestShinyVariant||0)):0,shinyVariants=[0,1,2].filter(v=>(shinyMask&(1<<v))!==0);
  const forms=record.formList.length?record.formList.filter(f=>(f.formIndex===0||f.selectable)&&f.pokemonId):[{formIndex:0,formKey:'',formName:'',pokemonId:record.pokemonId,types:record.types,abilities:record.abilities,baseStats:record.baseStats}];
  for(const form of forms){const unlocked=!!d.registered&&d.forms.includes(form.formIndex);if(!unlocked&&!includeLocked)continue;const mon=byPokemon.get(form.pokemonId);if(!mon)continue;
   const natures=d.natures.length?d.natures:['hardy'],allowedAbilities=form.abilities.filter(a=>d.abilitySlots.includes(a.slot));const abilities=(allowedAbilities.length?allowedAbilities:form.abilities.slice(0,1)).map(a=>({key:a.key,name:rules.abilities[a.key]?.name||a.key}));
   const allowedMoves=unique(formMoves(record,form,own.eggMask)),preferred=form.formIndex===0&&Array.isArray(own.adminPreferredMoves)?own.adminPreferredMoves.filter(move=>allowedMoves.includes(move)):[],ivs={...d.ivs};
   const preview=configure({...makeReferenceMon(record.sourceId,5),id:form.pokemonId,ivs,evs:emptyIVs()},{nature:'hardy',level:5});
   result.push({id:record.sourceId+form.formIndex*1000000,sourceId:record.sourceId,formIndex:form.formIndex,pokemonId:form.pokemonId,speciesId:record.sourceId,artId:mon.artId,sourceImage:form.sourceImage,sourceShinyImage:form.sourceShinyImage,sourceAppearanceMissing:form.sourceAppearanceMissing,name:mon.name,formName:form.formName||'',types:form.types,generation:record.generation,challengeRibbons:{generations:Array.isArray(system.challengeRibbonSpecies?.[record.sourceId]?.generations)?[...system.challengeRibbonSpecies[record.sourceId].generations]:[],types:Array.isArray(system.challengeRibbonSpecies?.[record.sourceId]?.types)?[...system.challengeRibbonSpecies[record.sourceId].types]:[]},pokerus:pokerus.has(record.sourceId),cost,baseCost:record.starterCost,unlocked,ivs,stats:preview.stats,abilities,natures:natures.map(key=>({key,name:rules.natures[key]?.name||key})),defaultNature:natures.includes(own.adminPreferredNature)?own.adminPreferredNature:null,genders:d.genders.length?d.genders:mon.genderRate<0?['N']:['M','F'],shinyUnlocked:!!d.shiny,shinyVariants,luck:shinyVariants.length?shinyVariants.at(-1)+1:0,moves:allowedMoves,defaultMoves:preferred.length?preferred.slice(0,4):allowedMoves.slice(0,4),candies:own.candies,sameEggCandies:own.candies,sameEggCost:SAME_SPECIES_EGG_COSTS[record.starterCost-1]??null,costReduction:own.costReduction,reductionCost:!record.preEvolutionIds?.length&&own.costReduction<2?candyReductionCosts[record.starterCost-1]?.[own.costReduction]:null,passive:{key:sourceAbility(form.passiveAbilityId??record.passiveAbilityId),name:rules.abilities[sourceAbility(form.passiveAbilityId??record.passiveAbilityId)]?.name||'',unlocked:own.passiveUnlocked,cost:!record.preEvolutionIds?.length?passiveCosts[record.starterCost-1]:null}});
  }
 }
 return result;
}
export function starterUnlockedCount(system){
 ensureStarterSystem(system);let count=0;for(const record of starterRecords){const d=starterDexEntry(system,record.sourceId);if(!d.registered)continue;const forms=record.formList.length?record.formList.filter(f=>(f.formIndex===0||f.selectable)&&f.pokemonId):[{formIndex:0,pokemonId:record.pokemonId}];if(forms.some(form=>d.forms.includes(form.formIndex)&&byPokemon.has(form.pokemonId)))count++;}return count;
}
export function buildStarterParty(system,selection,{newId=()=>crypto.randomUUID(),challenges=[]}={}){
 if(!Array.isArray(selection)||selection.length<1||selection.length>6)throw Error('스타터는 1–6마리로 편성하세요.');
 const catalog=new Map(starterCatalog(system).map(p=>[p.id,p])),picked=[],ids=new Set();let units=0;
 for(const choice of selection){const entry=catalog.get(choice?.id);if(!entry||!entry.unlocked)throw Error('해금한 스타터만 선택할 수 있습니다.');if(ids.has(entry.speciesId))throw Error('동일한 스타터를 중복 편성할 수 없습니다.');ids.add(entry.speciesId);units+=Math.round(entry.cost*4);
  if(!entry.abilities.some(a=>a.key===choice.ability)||!entry.natures.some(n=>n.key===choice.nature)||!entry.genders.includes(choice.gender)||choice.shiny&&!entry.shinyUnlocked)throw Error('해금하지 않은 특성·성격·성별·색상입니다.');
  const variant=choice.shiny?(choice.variant??entry.shinyVariants.at(-1)):0;if(choice.shiny&&(!Number.isInteger(variant)||!entry.shinyVariants.includes(variant)))throw Error('해금한 이로치 변종만 선택하세요.');
  if(choice.passive===true&&(!entry.passive.unlocked||!entry.passive.key))throw Error('해금한 패시브 특성만 사용할 수 있습니다.');
  if(!Array.isArray(choice.moves)||choice.moves.length<1||choice.moves.length>4||new Set(choice.moves).size!==choice.moves.length||choice.moves.some(m=>!entry.moves.includes(m)))throw Error('스타터 기술은 배울 수 있는 고유 기술 1–4개입니다.');
  const record=rogueSpecies.get(entry.sourceId),form=record.formList.find(f=>f.formIndex===entry.formIndex),ability=(form?.abilities||record.abilities).find(a=>a.key===choice.ability);
  const challengeEligible=classicChallengeStarterEligibility({id:entry.pokemonId,rogueSourceId:entry.sourceId,rogueFormIndex:entry.formIndex,rogueFormKey:form?.formKey,gender:choice.gender},challenges);if(challengeEligible!==true)throw Error(challengeEligible===false?'챌린지 조건에 맞는 스타터만 선택할 수 있습니다.':'지원하지 않거나 확인할 수 없는 챌린지입니다.');
  const mon=configure({...makeReferenceMon(entry.sourceId,5),id:entry.pokemonId,artId:entry.artId,name:entry.name,type:entry.types[0],types:[...entry.types],rogueBaseStats:{...(form?.baseStats||record.baseStats)},rogueTypes:[...entry.types],rogueSourceId:entry.sourceId,rogueFormIndex:entry.formIndex,...(entry.formIndex>0&&form?.formKey?{rogueFormKey:form.formKey}:{}),rogueBattleSpecies:form?.nativeSpecies||null,rogueSpriteKey:form?.spriteKey||null,sourceImage:form?.sourceImage,sourceBackImage:form?.sourceBackImage,sourceShinyImage:form?.sourceShinyImage,sourceShinyBackImage:form?.sourceShinyBackImage,sourceAppearanceMissing:form?.sourceAppearanceMissing||false,rogueAbilitySlot:ability?.slot||'primary',rogueStarterId:entry.sourceId,roguePassiveAbility:entry.passive.unlocked&&choice.passive!==false?entry.passive.key:null,boxId:newId(),origin:'starter',rogueMetBiome:-1,pokerus:!!entry.pokerus,luck:choice.shiny?variant+1:0,variant,ivs:{...entry.ivs},evs:emptyIVs(),moves:[...choice.moves],ability:choice.ability,nature:choice.nature,gender:choice.gender,shiny:!!choice.shiny,experience:0,status:null,pp:{},item:''},{level:5,nature:choice.nature});picked.push(mon);
 }
 if(units>STARTER_BUDGET*4)throw Error('스타터 편성 포인트 10점을 초과했습니다.');
 return {party:picked,cost:units/4};
}
export function reduceStarterCost(system,id){
 const record=rogueSpecies.get(Number(id));if(!record?.isStarter||!starterDexEntry(system,id).registered)throw Error('등록한 스타터를 선택하세요.');if(record.preEvolutionIds?.length)throw Error('사탕은 진화 전 스타터의 메뉴에서 사용하세요.');const progress=starterProgress(system,id),family=progress;
 if(progress.costReduction>=2)throw Error('비용 감소를 이미 두 번 적용했습니다.');const cost=candyReductionCosts[record.starterCost-1][progress.costReduction];if(family.candies<cost)throw Error('스타터 사탕이 부족합니다.');family.candies-=cost;progress.costReduction++;return {spent:cost,cost:reducedStarterCost(record.starterCost,progress.costReduction)};
}

export function unlockStarterPassive(system,id,expectedCost){
 const record=rogueSpecies.get(Number(id));if(!record?.isStarter||!starterDexEntry(system,id).registered)throw Error('등록한 스타터를 선택하세요.');if(record.preEvolutionIds?.length)throw Error('진화 전 스타터의 메뉴에서 해금하세요.');const progress=starterProgress(system,id),cost=passiveCosts[record.starterCost-1];
 if(progress.passiveUnlocked)throw Error('이미 패시브 특성을 해금했습니다.');if(!sourceAbility(record.passiveAbilityId)&&!record.formList.some(form=>sourceAbility(form.passiveAbilityId)))throw Error('해금할 패시브 특성이 없습니다.');if(!Number.isSafeInteger(cost)||cost!==expectedCost)throw Error('사탕 비용이 변경되었습니다. 다시 확인하세요.');if(progress.candies<cost)throw Error('스타터 사탕이 부족합니다.');
 progress.candies-=cost;progress.passiveUnlocked=true;return {spent:cost};
}

// Match the source Training Session's nature unlock without registering an
// otherwise unowned starter or changing caught, shiny or count data.
export function unlockClassicTrainingNature(system,mon,nature){
 const source=sourceSpeciesFor(mon);if(!source||!Object.hasOwn(rules.natures,nature))return false;
 const chain=ancestors(source.sourceId),root=chain.at(-1);if(!root||!system.dex?.[root]?.caught)return false;
 for(const id of chain){const entry=starterDexEntry(system,id);entry.natures=unique([...(entry.natures||[]),nature]);}
 return true;
}
