import {classicNativeForm as nativeForm,classicPersistentFormKind} from './rogue-native-form.mjs';
import {normalizeClassicTransientDynamax} from './rogue-transient-dynamax.mjs';
import {validatedClassicDnaFusion,classicDnaFusionTypes,reviewedClassicDnaDonorForm} from './rogue-dna-fusion.mjs';
import {applyClassicPokemonChallenges} from './rogue-challenge-pokemon.mjs';
import {Dex} from '@pkmn/sim';
import {sourceSpeciesFor,sourceAbility,rogueReferenceData,rogueSpecies} from './rogue-reference.mjs';
import {configure,calculateStats} from './pokemon-config.mjs';
import {classicTypesWithCustomSecond} from './rogue-custom-types.mjs';

const items=new Map(Object.entries(rogueReferenceData.enums.FormChangeItem).map(([name,id])=>[id,name.toLowerCase().replaceAll('_','')]));
const displayNames={maxmushrooms:'다이버섯',charizarditex:'리자몽나이트X',charizarditey:'리자몽나이트Y',blueorb:'쪽빛구슬',redorb:'주홍구슬',ultranecroziumz:'울트라네크로Z',darkstone:'다크스톤',lightstone:'라이트스톤',nsolarizer:'네크로플러스솔',nlunarizer:'네크로플러스루나',icyreinsofunity:'백의고삐',shadowreinsofunity:'흑의고삐'};
// Source getSpeciesDependentFormChangeCondition uses the caught dex entry;
// it does not consume or require the partner to be in the party.
const requiredCaught={646:{black:644,white:643},800:{'dusk-mane':791,'dawn-wings':792},898:{ice:896,shadow:897}};
export {classicNativeForm} from './rogue-native-form.mjs';
// Previous versions mapped only Rapid Strike G-Max to the Single Strike
// simulator species. Repair this exact self-consistent legacy signature without
// changing health, items, types, or any other saved field.
export function repairClassicRapidGmax(mon){
 if(mon?.rogueSourceId!==892||Number(mon.id)!==10191||mon.rogueFormIndex!==3||mon.rogueFormKey!=='gigantamax-rapid'||mon.rogueBattleSpecies!=='urshifugmax'||mon.gigantamax!==true||mon.dynamaxed!==true||mon.fusionSpecies||mon.mega||mon.primal||mon.ultra||mon.eternamax)return mon;
 const source=sourceSpeciesFor(mon),form=source?.formList.find(f=>f.formIndex===3&&f.formKey==='gigantamax-rapid'),native=source&&form?nativeForm(source,form):null;
 if(!form||native?.id!=='urshifurapidstrikegmax'||!Number.isSafeInteger(mon.level)||mon.level<1||!Number.isSafeInteger(mon.hp)||!Number.isSafeInteger(mon.maxHp)||mon.hp<0||mon.hp>mon.maxHp||['hp','atk','def','spa','spd','spe'].some(stat=>mon.rogueBaseStats?.[stat]!==form.baseStats?.[stat]))return mon;
 try{const types=classicTypesWithCustomSecond(mon,form.types);if(calculateStats(mon).hp!==mon.maxHp||!Array.isArray(mon.rogueTypes)||mon.rogueTypes.length!==types.length||mon.rogueTypes.some((type,index)=>type!==types[index]))return mon;}catch{return mon;}
 return {...mon,rogueBattleSpecies:native.id,...(mon.battleAppearance==='urshifugmax'?{battleAppearance:native.id}:{}),...(mon.battleSprite==='urshifu-gmax'?{battleSprite:native.spriteid}:{})};
}
export function classicPersistentFormItems(record){return [...new Set((record.formChanges||[]).filter(c=>c.__class==='SpeciesFormChange'&&c.trigger?.__class==='SpeciesFormChangeItemTrigger'&&classicPersistentFormKind(record,record.formList.find(f=>f.formKey===c.evoFormKey)||{})).map(c=>items.get(c.trigger.args?.[0])).filter(Boolean))];}
let knownPersistentItems;
export function classicKnownPersistentFormItem(key){knownPersistentItems||=new Set([...rogueSpecies.values()].flatMap(classicPersistentFormItems));return knownPersistentItems.has(key);}
export function classicFormItemLabel(key){return displayNames[key]||Dex.items.get(key).name||key;}
function classicItemChanges(record){
 return (record.formChanges||[]).filter(c=>c.__class==='SpeciesFormChange').flatMap(change=>{
  if(change.trigger?.__class==='SpeciesFormChangeItemTrigger')return [{...change,...(change.trigger.args?.[1]===false?{reverse:true}:{})}];
  // Meowstic has explicit item-inactive reverses selected by its default sex
  // form. Do not synthesize a male reverse for a female Mega or generalize
  // unknown compound triggers to other source content.
  const args=change.trigger?.args;
  if(record.sourceId!==678||change.preFormKey!=='mega'||!['male','female'].includes(change.evoFormKey)||change.trigger?.__class!=='SpeciesFormChangeCompoundTrigger'||args?.length!==2)return [];
  const [item,match]=args;if(item?.__class!=='SpeciesFormChangeItemTrigger'||item.args?.[0]!==85||item.args?.[1]!==false||match?.__class!=='SpeciesDefaultFormMatchTrigger'||match.args?.[0]!==change.evoFormKey)return [];
  return [{...change,trigger:item,reverse:true,defaultForm:change.evoFormKey}];
 });
}
export function classicFormOptions(mon,run,{includeUnavailable=false,system=null}={}){
 const record=sourceSpeciesFor(mon);if(!record)return [];
 const owned=run.formItems?.[mon.boxId]||[],current=record.formList.find(form=>form.formIndex===(mon.rogueFormIndex||0))?.formKey||'';
 const changes=classicItemChanges(record);
 // The pinned registry synthesizes an item-inactive reverse for every forward
 // item change without an explicit opposite. Keep that registry insertion order.
 const reverse=changes.filter(c=>!c.reverse&&!changes.some(r=>r.preFormKey===c.evoFormKey&&r.evoFormKey===(c.preFormKey||''))).map(c=>({...c,preFormKey:c.evoFormKey,evoFormKey:c.preFormKey||'',conditions:[],reverse:true}));
 const seen=new Set();return [...changes,...reverse].filter(change=>(change.preFormKey||'')===current).flatMap(change=>{
  // Two source Complete variants enter the same Mega. Remember which one was
  // used; legacy Mega saves without that field keep their old 50% reverse.
  if(record.sourceId===718&&current==='mega'&&change.reverse&&change.evoFormKey!==(mon.rogueZygardeMegaOrigin??'complete'))return [];
  const sexForm=mon.gender==='F'?'female':mon.gender==='M'?'male':null;
  if(change.defaultForm&&change.defaultForm!==sexForm||record.sourceId===678&&change.preFormKey!=='mega'&&change.preFormKey!==sexForm)return [];
  const requiredDex=!change.reverse&&requiredCaught[record.sourceId]?.[change.evoFormKey];if(requiredDex?(change.conditions?.length!==1||change.conditions[0]!=='__unparsedCall'||system?.dex?.[requiredDex]?.caught!==true):!!change.conditions?.length)return [];
  const itemId=change.trigger.args?.[0],item=items.get(itemId),form=record.formList.find(f=>f.formKey===change.evoFormKey);if(!item||!form)return [];
  const native=nativeForm(record,form,mon),kind=classicPersistentFormKind(record,form,mon),fusion=mon.fusionSpecies&&validatedClassicDnaFusion(mon);
  const reversibleBase=change.reverse&&(form.formIndex===0||reviewedClassicDnaDonorForm(record.sourceId,form.formIndex,form.formKey,record.sourceId===718?form.pokemonId||10118:mon.id));
  if(!native||mon.fusionSpecies&&(!fusion||!kind&&!reversibleBase))return [];
  const tool=change.reverse?null:change.evoFormKey.startsWith('mega')?'megaBracelet':change.evoFormKey.startsWith('gigantamax')?'dynamaxBand':null;
  const key=change.reverse?'reverse:'+item:item,available=owned.includes(item)&&(!tool||run.tools?.[tool]);
  if(seen.has(key)||!available&&!includeUnavailable)return [];seen.add(key);
  const name=displayNames[item]||Dex.items.get(item).name||item;
  return [{key,itemKey:item,sourceItemId:itemId,name:change.reverse?name+' · 해제':name,formIndex:form.formIndex,formKey:form.formKey,appearance:native.id,available,tool,requiresItem:!change.reverse&&!owned.includes(item),...(change.reverse?{reverse:true}:{}),...(requiredDex?{requiredDex}:{})}];
 });
}

export function applyClassicForm(mon,run,item,system=null){
 mon=normalizeClassicTransientDynamax(mon);
 const option=classicFormOptions(mon,run,{system}).find(o=>o.key===item);if(!option)throw Error('이 도전에 필요한 변신 도구와 장비가 없습니다.');
 return applyClassicSourceForm(mon,run,option.formKey);
}
// Internal source transition shared by item actions and reviewed ability hooks.
// API item actions must still pass classicFormOptions above.
export function applyClassicSourceForm(mon,run,formKey){
 const source=sourceSpeciesFor(mon),form=source?.formList.find(f=>f.formKey===formKey),native=form&&nativeForm(source,form,mon),oldMax=mon.maxHp,oldHp=mon.hp;
 if(!native)throw Error('지원하는 포켓로그 폼을 확인하세요.');
 const abilitySlot=mon.rogueAbilitySlot||'primary',ability=sourceAbility(form.abilities.find(a=>a.slot===abilitySlot)?.sourceId||form.abilities[0]?.sourceId)||form.abilities[0]?.key||mon.ability;
 const fusion=mon.fusionSpecies&&validatedClassicDnaFusion(mon),primaryTypes=classicTypesWithCustomSecond(mon,form.types),changedTypes=fusion?classicDnaFusionTypes(primaryTypes,fusion.donor.rogueTypes):primaryTypes,next=configure({...mon,rogueFormIndex:form.formIndex,rogueFormKey:form.formKey,rogueBattleSpecies:native.id,rogueBaseStats:{...form.baseStats},rogueTypes:changedTypes,types:changedTypes,type:changedTypes[0],baseExperience:form.baseExp||source.baseExp,ability:fusion?mon.ability:mon.rogueAbilityOverride||ability,...(fusion?{rogueFusion:{...mon.rogueFusion,primaryAbility:ability,primaryTypes}}:{}),
  roguePassiveAbility:mon.roguePassiveAbility?sourceAbility(form.passiveAbilityId??source.passiveAbilityId):null,
  sourceImage:mon.shiny?(form.sourceShinyImage||null):(form.sourceImage||null),sourceBackImage:mon.shiny?(form.sourceShinyBackImage||null):(form.sourceBackImage||null),sourceShinyImage:form.sourceShinyImage||null,sourceShinyBackImage:form.sourceShinyBackImage||null,sourceAppearanceMissing:!!form.sourceAppearanceMissing,rogueSpriteKey:form.spriteKey||null,
  battleAppearance:native.id,battleSprite:form.spriteKey||native.spriteid,mega:!!native.isMega,primal:!!native.isPrimal,ultra:native.forme==='Ultra',gigantamax:form.formKey.startsWith('gigantamax'),dynamaxed:form.formKey.startsWith('gigantamax'),
  ...(source.sourceId===800&&form.formKey==='ultra'?{rogueUltraOrigin:mon.rogueFormKey}:{}),
  ...(source.sourceId===718&&form.formKey==='mega'?{rogueZygardeMegaOrigin:mon.rogueFormKey}:{}),
  ...(source.sourceId===718?{id:form.pokemonId||10118}:{}),
 },{hp:oldHp});
 Object.assign(next,applyClassicPokemonChallenges(next,run));
 if(fusion&&!validatedClassicDnaFusion(next))throw Error('변신한 융합 정보를 확인하세요.');
 next.hp=oldHp>0?Math.min(next.maxHp,oldHp+Math.max(0,next.maxHp-oldMax)):0;return next;
}
export function classicTransformationItems(mon,run,system=null){return classicFormOptions(mon,run,{includeUnavailable:true,system}).filter(o=>!o.tool||run.tools?.[o.tool]).filter(o=>o.requiresItem);}

