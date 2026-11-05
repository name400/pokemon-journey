// Source 7c088125: reviewed automatic ability forms. Native callbacks alone
// change appearance, leaving the source form/IV/fusion/save representation stale.
import {sourceSpeciesFor} from './rogue-reference.mjs';
import {applyClassicSourceForm} from './rogue-transformations.mjs';
import {classicBattleSourceForm} from './rogue-zygarde.mjs';
import {calculateStats} from './pokemon-config.mjs';
import {replaceAbilityPassive} from './rogue-ability-components.mjs';
export const CLASSIC_AUTOMATIC_FORM_SPECIES=Object.freeze({351:'forecast',421:'flowergift',681:'stancechange',555:'zenmode',4555:'zenmode',746:'schooling',774:'shieldsdown',964:'zerotohero',778:'disguise',875:'iceface'});
const fields=['stats','id','artId','rogueFormIndex','rogueFormKey','rogueBattleSpecies','rogueBaseStats','rogueTypes','types','type','baseExperience','ability','rogueAbilitySlot','roguePassiveAbility','sourceImage','sourceBackImage','sourceShinyImage','sourceShinyBackImage','sourceAppearanceMissing','rogueSpriteKey','battleAppearance','battleSprite','mega','primal','ultra','gigantamax','rogueAutomaticFormRule'];
function reviewed(mon){
 const source=sourceSpeciesFor(mon),ability=CLASSIC_AUTOMATIC_FORM_SPECIES[source?.sourceId],form=source?.formList.find(f=>f.formIndex===(mon.rogueFormIndex||0));
 if(!ability||!form||mon.fusionSpecies||mon.mega||mon.primal||mon.ultra||mon.gigantamax||mon.eternamax||mon.ability!==ability&&mon.roguePassiveAbility!==ability||mon.rogueFormKey!=null&&mon.rogueFormKey!==form.formKey||!Object.entries(form.baseStats).every(([k,v])=>mon.rogueBaseStats?.[k]===v))return null;
 return {source,form,ability};
}
function convert(mon,run,index){
 const info=reviewed(mon),form=info?.source.formList.find(f=>f.formIndex===index);if(!form)return mon;
 const slot=mon.rogueAbilitySlot||info.form.abilities.find(a=>a.key===mon.ability)?.slot||'primary',next=applyClassicSourceForm({...mon,rogueAbilitySlot:slot},run,form.formKey);
 next.id=form.pokemonId||info.source.pokemonId;next.artId=next.id;next.rogueAutomaticFormRule='source-v1';
 if(mon.dynamaxed){next.dynamaxed=true;next.maxHp=calculateStats(next).hp*2;next.hp=mon.hp>0?Math.min(next.maxHp,mon.hp+Math.max(0,next.maxHp-mon.maxHp)):0;}
 return next;
}
export function resetClassicAutomaticForm(mon,run){const info=reviewed(mon);if(!info||['forecast','flowergift','stancechange'].includes(info.ability))return mon;const index=info.source.sourceId===774?info.form.formIndex%7:0;return index===info.form.formIndex?mon:convert(mon,run,index);}
export function installClassicAutomaticForms(b,combat,run,{sourceMon,applyStats}){
 const current=p=>classicBattleSourceForm(p,sourceMon(p));
 function change(p,forcedIndex,allowFainted=false){
  const mon=current(p),info=mon&&reviewed(mon);if(!info||p.transformed||!p.hp&&!allowFainted)return;
  const weather=p.effectiveWeather(),weatherIndex=['sunnyday','desolateland'].includes(weather)?1:['raindance','primordialsea'].includes(weather)?2:['hail','snow','snowscape'].includes(weather)?3:0;
  const index=Number.isInteger(forcedIndex)?forcedIndex:['forecast','flowergift'].includes(info.ability)?(!p.hasAbility(info.ability)?0:info.ability==='forecast'?weatherIndex:weatherIndex===1?1:0):['stancechange','zerotohero','disguise','iceface'].includes(info.ability)?info.form.formIndex:info.ability==='zenmode'?(p.hp<=p.maxhp/2?1:0):info.ability==='schooling'?(p.level<20||p.hp<=p.maxhp/4?0:1):info.form.formIndex%7+(p.hp<=p.maxhp/2?7:0);
  if(index===info.form.formIndex)return;
  const hp=p.hp,max=p.maxhp,next=convert({...mon,hp,maxHp:max,dynamaxed:!!p.volatiles.dynamax},run||{challenges:combat.challengeRestrictions||[]},index),native=b.dex.species.get(next.rogueBattleSpecies);
  p.m.rogueSourceForm=Object.fromEntries(fields.map(k=>[k,next[k]]));
  p.setSpecies(native);p.baseSpecies=p.species;applyStats(p,next,{forceSpecies:true});p.baseSpecies=p.species;
  p.hp=hp>0?Math.min(p.maxhp,hp+Math.max(0,p.maxhp-max)):0;p.details=p.getUpdatedDetails();
  const owned=p.side.n===0&&run?.party?.find(m=>String(m.boxId)===String(p.set.trainerToken));if(owned)Object.assign(owned,p.m.rogueSourceForm,{hp:p.hp,maxHp:p.maxhp});
  replaceAbilityPassive(b,p,next.roguePassiveAbility);
  b.add('-formechange',p,native.name,'[from] ability: '+b.dex.abilities.get(info.ability).name);if(hp!==p.hp)b.add('-heal',p,p.getHealth,'[silent]');
 }
 const nativeDex=b.dex,local=Object.create(nativeDex),cache=new Map(),ids=new Set(Object.values(CLASSIC_AUTOMATIC_FORM_SPECIES));
 Object.defineProperty(local,'abilities',{value:new Proxy(nativeDex.abilities,{get(target,key){
  if(key==='get'||key==='getByID')return name=>{const a=target[key](name);if(!ids.has(a.id))return a;if(!cache.has(a.id)){
   const patched={...a,onStart:p=>change(p),onResidual:p=>change(p)};if(a.id==='zenmode')patched.onEnd=undefined;
   if(['forecast','flowergift'].includes(a.id)){patched.onWeatherChange=p=>change(p);patched.onEnd=p=>change(p,0);delete patched.onResidual;}
   if(a.id==='flowergift')for(const event of ['onAllyModifyAtk','onAllyModifySpD'])patched[event]=function(value,p){const owner=this.effectState.target,mon=current(owner);if(mon?.fusionSpecies||p.effectiveWeather()!=='sunnyday')return;return this.chainModify(1.5);};
   if(a.id==='zerotohero'){delete patched.onResidual;patched.onStart=undefined;patched.onSwitchOut=p=>change(p,1);}
   if(a.id==='stancechange'){delete patched.onResidual;patched.onStart=p=>change(p,0);patched.onEnd=p=>change(p,0);patched.onModifyMove=function(move,p){if(move.id==='kingsshield')change(p,0);else if(move.category!=='Status')change(p,1);};}

   if(['disguise','iceface'].includes(a.id)){
    delete patched.onResidual;patched.onStart=undefined;patched.onUpdate=undefined;
    for(const event of ['onCriticalHit','onEffectiveness'])if(a[event])patched[event]=function(...args){const p=args[event==='onCriticalHit'?0:1];if(!p||!reviewed(current(p))||p.transformed)return;return a[event].apply(this,args);};
    patched.onDamage=function(damage,p,source,move){const info=reviewed(current(p));if(!info||p.transformed||info.form.formIndex!==0||damage<=0||move?.effectType!=='Move'||a.id==='iceface'&&move.category!=='Physical')return;
     this.add('-activate',p,'ability: '+a.name);if(a.id==='disguise')this.directDamage(Math.max(1,Math.floor(p.maxhp/8)),p,p,a);change(p,1);return 0;};
    if(a.id==='disguise')patched.onFaint=p=>change(p,0,true);
    if(a.id==='iceface'){
     patched.onStart=function(p){if(['hail','snow','snowscape'].includes(p.effectiveWeather()))change(p,0);};
     patched.onWeatherChange=function(p,source,effect){if(!effect?.suppressWeather&&['hail','snow','snowscape'].includes(p.effectiveWeather()))change(p,0);};
    }
   }
   // Source NoFusion and NoTransform cover the meteor's immunity too.
   for(const event of ['onSetStatus','onTryAddVolatile'])if(a[event])patched[event]=function(status,p,...args){const info=reviewed(current(p));if(!info||p.transformed)return;return a[event].call(this,status,p,...args);};
   cache.set(a.id,new nativeDex.Ability(patched));}return cache.get(a.id);};
  const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
 }})});b.dex=local;
 b.onEvent('Update',b.format,{priority:-100},function(p){const info=p&&reviewed(current(p));if(info&&['forecast','flowergift'].includes(info.ability))change(p);});
}
