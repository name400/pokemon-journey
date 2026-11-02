import {rogueFormArt} from './rogue-form-art.mjs';
import {Dex} from '@pkmn/sim';
import {sourceSpeciesFor,sourceAbility,rogueReferenceData,rogueForms} from './rogue-reference.mjs';
import {configure,rules} from './pokemon-config.mjs';

const items=new Map(Object.entries(rogueReferenceData.enums.FormChangeItem).map(([name,id])=>[id,name.toLowerCase().replaceAll('_','')]));
const displayNames={maxmushrooms:'다이버섯',charizarditex:'리자몽나이트X',charizarditey:'리자몽나이트Y',blueorb:'쪽빛구슬',redorb:'주홍구슬',ultranecroziumz:'울트라네크로Z'};
function nativeForm(record,form){
 const base=Dex.species.get(rules.species[record.pokemonId]?.key),suffix=form.formKey==='gigantamax'?'Gmax':form.formKey;
 const candidate=Dex.species.get(base.name+(suffix?'-'+suffix:''));return candidate.exists?candidate:null;
}
export function classicFormOptions(mon,run,{includeUnavailable=false}={}){
 const record=sourceSpeciesFor(mon);if(!record)return [];
 const owned=run.formItems?.[mon.boxId]||[],currentIndex=mon.rogueFormIndex??rogueForms.get(Number(mon.id))?.formIndex??0,currentKey=record.formList.find(f=>f.formIndex===currentIndex)?.formKey||'';
 return (record.formChanges||[]).filter(change=>change.__class==='SpeciesFormChange'&&change.preFormKey===currentKey&&change.trigger?.__class==='SpeciesFormChangeItemTrigger'&&!change.conditions?.length).flatMap(change=>{
  const itemId=change.trigger.args?.[0],item=items.get(itemId),form=record.formList.find(f=>f.formKey===change.evoFormKey);if(!item||!form)return [];
  const native=nativeForm(record,form);if(!native)return [];
  const tool=change.evoFormKey.startsWith('mega')?'megaBracelet':change.evoFormKey==='gigantamax'?'dynamaxBand':null;
  const available=owned.includes(item)&&(!tool||run.tools?.[tool]);
  if(!available&&!includeUnavailable)return [];
  return [{key:item,sourceItemId:itemId,name:displayNames[item]||Dex.items.get(item).name||item,formIndex:form.formIndex,formKey:form.formKey,appearance:native.id,available,tool,requiresItem:!owned.includes(item)}];
 });
}
export function applyClassicForm(mon,run,item){
 const option=classicFormOptions(mon,run).find(o=>o.key===item);if(!option)throw Error('이 도전에 필요한 변신 도구와 장비가 없습니다.');
 const source=sourceSpeciesFor(mon),form=source.formList.find(f=>f.formIndex===option.formIndex),native=nativeForm(source,form),oldMax=mon.maxHp,oldHp=mon.hp;
 const abilitySlot=mon.rogueAbilitySlot||'primary',ability=sourceAbility(form.abilities.find(a=>a.slot===abilitySlot)?.sourceId||form.abilities[0]?.sourceId)||form.abilities[0]?.key||mon.ability;
 const next=configure({...mon,...rogueFormArt(form,mon.shiny),rogueFormIndex:form.formIndex,roguePreviousFormIndex:mon.rogueFormIndex??rogueForms.get(Number(mon.id))?.formIndex??0,rogueFormKey:form.formKey,rogueBattleSpecies:native.id,rogueBaseStats:{...form.baseStats},rogueTypes:[...form.types],types:[...form.types],type:form.types[0],baseExperience:form.baseExp||source.baseExp,ability,
  roguePassiveAbility:mon.roguePassiveAbility?sourceAbility(form.passiveAbilityId??source.passiveAbilityId):null,
  battleAppearance:native.id,battleArtId:null,battleSprite:native.spriteid,mega:!!native.isMega,primal:!!native.isPrimal,ultra:native.forme==='Ultra',gigantamax:form.formKey==='gigantamax',dynamaxed:form.formKey==='gigantamax',
  ...((native.isMega||form.formKey==='gigantamax')?{terastallized:null}:{}),
 },{hp:oldHp});
 next.hp=oldHp>0?Math.min(next.maxHp,oldHp+Math.max(0,next.maxHp-oldMax)):0;return next;
}
// Item-based forms can be deactivated without consuming the acquired item.
export function classicFormReversion(mon,run){
 const record=sourceSpeciesFor(mon);if(!record)return null;const currentIndex=mon.rogueFormIndex??rogueForms.get(Number(mon.id))?.formIndex??0,current=record.formList.find(f=>f.formIndex===currentIndex),key=current?.formKey||'';
 const changes=(record.formChanges||[]).filter(c=>c.evoFormKey===key&&c.trigger?.__class==='SpeciesFormChangeItemTrigger'),keys=[...new Set(changes.map(c=>c.preFormKey))];if(!changes.length)return null;
 const stored=Number.isInteger(mon.roguePreviousFormIndex),owned=run?.formItems?.[mon.boxId]||[],hasItem=changes.some(c=>owned.includes(items.get(c.trigger.args?.[0])));
 let previous=stored?record.formList.find(f=>f.formIndex===mon.roguePreviousFormIndex):null;
 if(!previous&&!stored&&hasItem&&keys.length===1)previous=record.formList.find(f=>f.formKey===keys[0])||(!keys[0]?{formIndex:0,formKey:'',baseStats:record.baseStats,types:record.types,abilities:record.abilities,baseExp:record.baseExp,passiveAbilityId:record.passiveAbilityId}:null);
 if(!previous||!keys.includes(previous.formKey||''))return null;const native=nativeForm(record,previous);if(!native)return null;
 return {form:previous,native,name:previous.formName&&previous.formKey?previous.formName:'기본 모습'};
}
export function revertClassicForm(mon,run){
 const option=classicFormReversion(mon,run);if(!option)throw Error('되돌릴 이전 모습을 확인할 수 없습니다.');
 const source=sourceSpeciesFor(mon),form=option.form,native=option.native,oldMax=mon.maxHp,oldHp=mon.hp,slot=mon.rogueAbilitySlot||'primary',ability=form.abilities.find(a=>a.slot===slot)||form.abilities[0];
 const next=configure({...mon,...rogueFormArt(form,mon.shiny),rogueFormIndex:form.formIndex,roguePreviousFormIndex:null,rogueFormKey:form.formKey,rogueBattleSpecies:native.id,rogueBaseStats:{...form.baseStats},rogueTypes:[...form.types],types:[...form.types],type:form.types[0],baseExperience:form.baseExp||source.baseExp,ability:ability?.key||mon.ability,roguePassiveAbility:mon.roguePassiveAbility?sourceAbility(form.passiveAbilityId??source.passiveAbilityId):null,battleAppearance:native.id,battleArtId:null,battleSprite:native.spriteid,mega:!!native.isMega,primal:!!native.isPrimal,ultra:native.forme==='Ultra',gigantamax:form.formKey==='gigantamax',dynamaxed:form.formKey==='gigantamax'},{hp:oldHp});
 next.hp=oldHp>0?Math.min(next.maxHp,oldHp+Math.max(0,next.maxHp-oldMax)):0;return next;
}
export function classicTransformationItems(mon,run){return classicFormOptions(mon,run,{includeUnavailable:true}).filter(o=>!o.tool||run.tools?.[o.tool]).filter(o=>o.requiresItem);}

