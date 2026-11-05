import {applyClassicPokemonChallenges} from './rogue-challenge-pokemon.mjs';
import {Dex} from '@pkmn/sim';
import {sourceSpeciesFor,sourceAbility,rogueReferenceData} from './rogue-reference.mjs';
import {configure,calculateStats,rules} from './pokemon-config.mjs';
import {classicTypesWithCustomSecond} from './rogue-custom-types.mjs';

const items=new Map(Object.entries(rogueReferenceData.enums.FormChangeItem).map(([name,id])=>[id,name.toLowerCase().replaceAll('_','')]));
const displayNames={maxmushrooms:'다이버섯',charizarditex:'리자몽나이트X',charizarditey:'리자몽나이트Y',blueorb:'쪽빛구슬',redorb:'주홍구슬',ultranecroziumz:'울트라네크로Z',darkstone:'다크스톤',lightstone:'라이트스톤',nsolarizer:'네크로플러스솔',nlunarizer:'네크로플러스루나',icyreinsofunity:'백의고삐',shadowreinsofunity:'흑의고삐'};
// Source getSpeciesDependentFormChangeCondition uses the caught dex entry;
// it does not consume or require the partner to be in the party.
const requiredCaught={646:{black:644,white:643},800:{'dusk-mane':791,'dawn-wings':792},898:{ice:896,shadow:897}};
function nativeForm(record,form){
 if(record.sourceId===892&&form.formKey==='gigantamax-single')return Dex.species.get('urshifugmax');
 if(record.sourceId===892&&form.formKey==='gigantamax-rapid')return Dex.species.get('urshifurapidstrikegmax');
 const base=Dex.species.get(rules.species[record.pokemonId]?.key),mapped=form.pokemonId?Dex.species.get(form.nativeSpecies||rules.species[form.pokemonId]?.key||''):null;if(mapped?.exists&&(form.formIndex===0||form.pokemonId!==record.pokemonId||mapped.id!==base.id))return mapped;
 const suffix=form.formKey.startsWith('gigantamax')?'Gmax':form.formKey,candidate=Dex.species.get(base.name+(suffix?'-'+suffix:''));return candidate.exists&&(candidate.id!==base.id||!form.formKey)?candidate:null;
}
export {nativeForm as classicNativeForm};
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
export function classicFormOptions(mon,run,{includeUnavailable=false,system=null}={}){
 const record=sourceSpeciesFor(mon);if(!record)return [];
 const owned=run.formItems?.[mon.boxId]||[],current=record.formList.find(form=>form.formIndex===(mon.rogueFormIndex||0))?.formKey||'';
 return (record.formChanges||[]).filter(change=>change.__class==='SpeciesFormChange'&&(change.preFormKey||'')===current&&change.trigger?.__class==='SpeciesFormChangeItemTrigger').flatMap(change=>{
  const requiredDex=requiredCaught[record.sourceId]?.[change.evoFormKey];if(requiredDex?(change.conditions?.length!==1||change.conditions[0]!=='__unparsedCall'||system?.dex?.[requiredDex]?.caught!==true):!!change.conditions?.length)return [];
  const itemId=change.trigger.args?.[0],item=items.get(itemId),form=record.formList.find(f=>f.formKey===change.evoFormKey);if(!item||!form)return [];
  const native=nativeForm(record,form);if(!native)return [];
  const tool=change.evoFormKey.startsWith('mega')?'megaBracelet':change.evoFormKey.startsWith('gigantamax')?'dynamaxBand':null;
  const available=owned.includes(item)&&(!tool||run.tools?.[tool]);
  if(!available&&!includeUnavailable)return [];
  return [{key:item,sourceItemId:itemId,name:displayNames[item]||Dex.items.get(item).name||item,formIndex:form.formIndex,formKey:form.formKey,appearance:native.id,available,tool,requiresItem:!owned.includes(item),...(requiredDex?{requiredDex}:{})}];
 });
}
export function applyClassicForm(mon,run,item,system=null){
 const option=classicFormOptions(mon,run,{system}).find(o=>o.key===item);if(!option)throw Error('이 도전에 필요한 변신 도구와 장비가 없습니다.');
 const source=sourceSpeciesFor(mon),form=source.formList.find(f=>f.formIndex===option.formIndex),native=nativeForm(source,form),oldMax=mon.maxHp,oldHp=mon.hp;
 const abilitySlot=mon.rogueAbilitySlot||'primary',ability=sourceAbility(form.abilities.find(a=>a.slot===abilitySlot)?.sourceId||form.abilities[0]?.sourceId)||form.abilities[0]?.key||mon.ability;
 const changedTypes=classicTypesWithCustomSecond(mon,form.types),next=configure({...mon,rogueFormIndex:form.formIndex,rogueFormKey:form.formKey,rogueBattleSpecies:native.id,rogueBaseStats:{...form.baseStats},rogueTypes:changedTypes,types:changedTypes,type:changedTypes[0],baseExperience:form.baseExp||source.baseExp,ability:mon.rogueAbilityOverride||ability,
  roguePassiveAbility:mon.roguePassiveAbility?sourceAbility(form.passiveAbilityId??source.passiveAbilityId):null,
  sourceImage:mon.shiny?(form.sourceShinyImage||null):(form.sourceImage||null),sourceBackImage:mon.shiny?(form.sourceShinyBackImage||null):(form.sourceBackImage||null),sourceShinyImage:form.sourceShinyImage||null,sourceShinyBackImage:form.sourceShinyBackImage||null,sourceAppearanceMissing:!!form.sourceAppearanceMissing,rogueSpriteKey:form.spriteKey||null,
  battleAppearance:native.id,battleSprite:form.spriteKey||native.spriteid,mega:!!native.isMega,primal:!!native.isPrimal,ultra:native.forme==='Ultra',gigantamax:form.formKey.startsWith('gigantamax'),dynamaxed:form.formKey.startsWith('gigantamax'),
  ...(source.sourceId===800&&option.formKey==='ultra'?{rogueUltraOrigin:mon.rogueFormKey}:{}),
 },{hp:oldHp});
 Object.assign(next,applyClassicPokemonChallenges(next,run));
 next.hp=oldHp>0?Math.min(next.maxHp,oldHp+Math.max(0,next.maxHp-oldMax)):0;return next;
}
export function classicTransformationItems(mon,run,system=null){return classicFormOptions(mon,run,{includeUnavailable:true,system}).filter(o=>!o.tool||run.tools?.[o.tool]).filter(o=>o.requiresItem);}

