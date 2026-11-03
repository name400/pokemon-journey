import {rogueFormArt} from './rogue-form-art.mjs';
import {Dex} from '@pkmn/sim';
import {sourceSpeciesFor,sourceAbility,rogueReferenceData,rogueForms} from './rogue-reference.mjs';
import {configure,rules} from './pokemon-config.mjs';

const items=new Map(Object.entries(rogueReferenceData.enums.FormChangeItem).map(([name,id])=>[id,name.toLowerCase().replaceAll('_','')]));
// The six conditions below are independently verified against the pinned source's
// getSpeciesDependentFormChangeCondition: a caught dex entry, no party consumption.
const fusionRequirements={'646:black':644,'646:white':643,'800:dawn-wings':792,'800:dusk-mane':791,'898:ice':896,'898:shadow':897};
// The pinned source uses hasAbility(MULTITYPE / RKS_SYSTEM) for these
// otherwise unparsed conditions. Passive abilities are supported as well.
function formCondition(change,record,mon,system){
 if(!change.conditions?.length)return true;
 if(change.conditions.length!==1)return false;
 if(change.conditions[0]==='__unparsedCall')return !!(fusionRequirements[record.sourceId+':'+change.evoFormKey]&&system?.dex?.[fusionRequirements[record.sourceId+':'+change.evoFormKey]]?.caught);
 const required={493:'multitype',773:'rkssystem'}[record.sourceId];
 return !!(required&&change.conditions[0]?.__class==='SpeciesFormChangeCondition'&&change.conditions[0].args?.[0]==='__unparsedFunction'&&mon.hp>0&&(mon.ability===required||mon.roguePassiveAbility===required));
}
const displayNames={nlunarizer:'네크로플러스루나',nsolarizer:'네크로플러스솔',darkstone:'다크스톤',lightstone:'라이트스톤',icyreinsofunity:'얼음의고삐',shadowreinsofunity:'어둠의고삐',maxmushrooms:'다이버섯',rayquazite:'레쿠쟈나이트',charizarditex:'리자몽나이트X',charizarditey:'리자몽나이트Y',blueorb:'쪽빛구슬',redorb:'주홍구슬',ultranecroziumz:'울트라네크로Z'};
function nativeForm(record,form){
 const aliases={801:{'mega-original':'Original-Mega'},978:{'mega-curly':'Curly-Mega','mega-droopy':'Droopy-Mega','mega-stretchy':'Stretchy-Mega'}};
 const base=Dex.species.get(rules.species[record.pokemonId]?.key),suffix=aliases[record.sourceId]?.[form.formKey]||(form.formKey==='gigantamax'?'Gmax':form.formKey==='gigantamax-single'?'Gmax':form.formKey==='gigantamax-rapid'?'Rapid-Strike-Gmax':form.formKey);
 const candidate=Dex.species.get(base.name+(suffix?'-'+suffix:''));return candidate.exists?candidate:null;
}
export function classicFormOptions(mon,run,{includeUnavailable=false,system=null}={}){
 const record=sourceSpeciesFor(mon);if(!record)return [];
 const owned=run.formItems?.[mon.boxId]||[],currentIndex=mon.rogueFormIndex??rogueForms.get(Number(mon.id))?.formIndex??0,currentKey=record.formList.find(f=>f.formIndex===currentIndex)?.formKey||'';
 return (record.formChanges||[]).filter(change=>change.__class==='SpeciesFormChange'&&change.preFormKey===currentKey&&change.trigger?.__class==='SpeciesFormChangeItemTrigger'&&formCondition(change,record,mon,system)).flatMap(change=>{
  const itemId=change.trigger.args?.[0],item=items.get(itemId),form=record.formList.find(f=>f.formKey===change.evoFormKey);if(!item||!form)return [];
  const native=nativeForm(record,form);if(!native)return [];
  const tool=/^(mega|primal)/.test(change.evoFormKey)?'megaBracelet':(change.evoFormKey.startsWith('gigantamax')||change.evoFormKey==='eternamax')?'dynamaxBand':null;
  const available=owned.includes(item)&&(!tool||run.tools?.[tool]);
  if(!available&&!includeUnavailable)return [];
  return [{key:item,sourceItemId:itemId,name:displayNames[item]||rules.items[item]?.name||Dex.items.get(item).name||item,formIndex:form.formIndex,formKey:form.formKey,appearance:native.id,available,tool,requiresItem:!owned.includes(item)}];
 });
}
export function applyClassicForm(mon,run,item,system=null){
 const option=classicFormOptions(mon,run,{system}).find(o=>o.key===item);if(!option)throw Error('이 도전에 필요한 변신 도구와 장비가 없습니다.');
 const source=sourceSpeciesFor(mon),form=source.formList.find(f=>f.formIndex===option.formIndex),native=nativeForm(source,form),oldMax=mon.maxHp,oldHp=mon.hp;
 const abilitySlot=mon.rogueAbilitySlot||'primary',ability=sourceAbility(form.abilities.find(a=>a.slot===abilitySlot)?.sourceId||form.abilities[0]?.sourceId)||form.abilities[0]?.key||mon.ability;
 const next=configure({...mon,...rogueFormArt(form,mon.shiny),rogueFormIndex:form.formIndex,roguePreviousFormIndex:mon.rogueFormIndex??rogueForms.get(Number(mon.id))?.formIndex??0,rogueFormKey:form.formKey,rogueBattleSpecies:native.id,rogueBaseStats:{...form.baseStats},rogueTypes:[...form.types],types:[...form.types],type:form.types[0],baseExperience:form.baseExp||source.baseExp,ability,
  roguePassiveAbility:mon.roguePassiveAbility?sourceAbility(form.passiveAbilityId??source.passiveAbilityId):null,
  battleAppearance:native.id,battleArtId:null,battleSprite:native.spriteid,mega:!!native.isMega||form.formKey.startsWith('mega'),primal:!!native.isPrimal,ultra:native.forme==='Ultra',gigantamax:form.formKey.startsWith('gigantamax'),eternamax:form.formKey==='eternamax',dynamaxed:form.formKey.startsWith('gigantamax')||form.formKey==='eternamax',
  ...((native.isMega||form.formKey.startsWith('mega')||native.isPrimal||native.forme==='Ultra'||(form.formKey.startsWith('gigantamax')||form.formKey==='eternamax'))?{terastallized:null}:{}),
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
 const next=configure({...mon,...rogueFormArt(form,mon.shiny),rogueFormIndex:form.formIndex,roguePreviousFormIndex:null,rogueFormKey:form.formKey,rogueBattleSpecies:native.id,rogueBaseStats:{...form.baseStats},rogueTypes:[...form.types],types:[...form.types],type:form.types[0],baseExperience:form.baseExp||source.baseExp,ability:ability?.key||mon.ability,roguePassiveAbility:mon.roguePassiveAbility?sourceAbility(form.passiveAbilityId??source.passiveAbilityId):null,battleAppearance:native.id,battleArtId:null,battleSprite:native.spriteid,mega:!!native.isMega||form.formKey.startsWith('mega'),primal:!!native.isPrimal,ultra:native.forme==='Ultra',gigantamax:form.formKey.startsWith('gigantamax'),eternamax:form.formKey==='eternamax',dynamaxed:form.formKey.startsWith('gigantamax')||form.formKey==='eternamax'},{hp:oldHp});
 next.hp=oldHp>0?Math.min(next.maxHp,oldHp+Math.max(0,next.maxHp-oldMax)):0;return next;
}
export function classicTransformationItems(mon,run,{rare=null,system=null}={}){return classicFormOptions(mon,run,{includeUnavailable:true,system}).filter(o=>!o.tool||run.tools?.[o.tool]).filter(o=>o.requiresItem&&(rare===null||((o.sourceItemId>0&&o.sourceItemId<150)===rare)));}

