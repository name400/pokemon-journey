// Source 7c088125: reviewed automatic ability forms. Native callbacks alone
// change appearance, leaving the source form/IV/fusion/save representation stale.
import {sourceSpeciesFor} from './rogue-reference.mjs';
import {validatedClassicDnaFusion} from './rogue-dna-fusion.mjs';
import {applyClassicSourceForm} from './rogue-transformations.mjs';
import {classicBattleSourceForm} from './rogue-zygarde.mjs';
import {calculateStats,classicEffectiveBaseStats} from './pokemon-config.mjs';
import {replaceAbilityPassive} from './rogue-ability-components.mjs';
export const CLASSIC_AUTOMATIC_FORM_SPECIES=Object.freeze({351:'forecast',421:'flowergift',681:'stancechange',555:'zenmode',4555:'zenmode',746:'schooling',774:'shieldsdown',964:'zerotohero',778:'disguise',875:'iceface',877:'hungerswitch',845:'gulpmissile',2658:'battlebond'});
export const CLASSIC_TRIGGER_FORM_SPECIES=Object.freeze({648:'relicsong',716:'active',1017:'tera'});
const nativeTypes={노말:'Normal',불꽃:'Fire',물:'Water',전기:'Electric',풀:'Grass',얼음:'Ice',격투:'Fighting',독:'Poison',땅:'Ground',비행:'Flying',에스퍼:'Psychic',벌레:'Bug',바위:'Rock',고스트:'Ghost',드래곤:'Dragon',악:'Dark',강철:'Steel',페어리:'Fairy',스텔라:'Stellar'};
const fields=['rogueFusion','stats','id','artId','rogueFormIndex','rogueFormKey','rogueBattleSpecies','rogueBaseStats','rogueTypes','types','type','baseExperience','ability','rogueAbilitySlot','roguePassiveAbility','sourceImage','sourceBackImage','sourceShinyImage','sourceShinyBackImage','sourceAppearanceMissing','rogueSpriteKey','battleAppearance','battleSprite','mega','primal','ultra','gigantamax','rogueAutomaticFormRule'];
function reviewed(mon){
 const source=sourceSpeciesFor(mon),trigger=CLASSIC_TRIGGER_FORM_SPECIES[source?.sourceId],ability=CLASSIC_AUTOMATIC_FORM_SPECIES[source?.sourceId]||trigger,form=source?.formList.find(f=>f.formIndex===(mon.rogueFormIndex||0));
 if(!ability||!form||mon.fusionSpecies&&(!trigger||!validatedClassicDnaFusion(mon))||mon.mega||mon.primal||mon.ultra||mon.gigantamax||mon.eternamax||!trigger&&mon.ability!==ability&&mon.roguePassiveAbility!==ability||mon.rogueFormKey!=null&&mon.rogueFormKey!==form.formKey||!Object.entries(form.baseStats).every(([k,v])=>mon.rogueBaseStats?.[k]===v))return null;
 return {source,form,ability,trigger};
}
function convert(mon,run,index){
 const info=reviewed(mon),form=info?.source.formList.find(f=>f.formIndex===index);if(!form)return mon;
 const slot=mon.rogueAbilitySlot||info.form.abilities.find(a=>a.key===mon.ability)?.slot||'primary',next=applyClassicSourceForm({...mon,rogueAbilitySlot:slot},run,form.formKey);
 next.id=form.pokemonId||info.source.pokemonId;next.artId=next.id;next.rogueAutomaticFormRule='source-v1';
 if(mon.dynamaxed){next.dynamaxed=true;next.maxHp=calculateStats(next).hp*2;next.hp=mon.hp>0?Math.min(next.maxHp,mon.hp+Math.max(0,next.maxHp-mon.maxHp)):0;}
 return next;
}
export function resetClassicAutomaticForm(mon,run,{freshBattle=false}={}){const info=reviewed(mon);if(info?.source.sourceId===1017&&freshBattle&&info.form.formIndex>=4)return {...convert(mon,run,info.form.formIndex-4),terastallized:null};if(info?.trigger)return info.source.sourceId===716&&freshBattle&&info.form.formIndex?convert(mon,run,0):mon;if(!info||['forecast','flowergift','stancechange','hungerswitch'].includes(info.ability)||info.ability==='gulpmissile'&&!freshBattle)return mon;const index=info.source.sourceId===774?info.form.formIndex%7:0;return index===info.form.formIndex?mon:convert(mon,run,index);}
export function installClassicAutomaticForms(b,combat,run,{sourceMon,applyStats}){
 const current=p=>classicBattleSourceForm(p,sourceMon(p));
 function victoryBoost(p,boost,effect){
  if(p.side.foePokemonLeft())return b.boost(boost,p,p,effect);
  // Source victory stages persist into the next wild encounter; the native
  // battle-ending guard would otherwise discard them. Preserve native boost
  // events (Simple/Contrary/etc.) through a scoped instance-only guard.
  const descriptor=Object.getOwnPropertyDescriptor(p.side,'foePokemonLeft');Object.defineProperty(p.side,'foePokemonLeft',{configurable:true,value:()=>1});
  try{return b.boost(boost,p,p,effect);}finally{if(descriptor)Object.defineProperty(p.side,'foePokemonLeft',descriptor);else delete p.side.foePokemonLeft;}
 }
 function change(p,forcedIndex,allowFainted=false){
  const mon=current(p),info=mon&&reviewed(mon);if(!info||p.transformed&&!info.trigger&&info.ability!=='battlebond'||!p.hp&&!allowFainted)return;
  const weather=p.effectiveWeather(),weatherIndex=['sunnyday','desolateland'].includes(weather)?1:['raindance','primordialsea'].includes(weather)?2:['hail','snow','snowscape'].includes(weather)?3:0;
  const index=Number.isInteger(forcedIndex)?forcedIndex:info.trigger?info.form.formIndex:['forecast','flowergift'].includes(info.ability)?(!p.hasAbility(info.ability)?0:info.ability==='forecast'?weatherIndex:weatherIndex===1?1:0):['stancechange','zerotohero','disguise','iceface','hungerswitch','gulpmissile','battlebond'].includes(info.ability)?info.form.formIndex:info.ability==='zenmode'?(p.hp<=p.maxhp/2?1:0):info.ability==='schooling'?(p.level<20||p.hp<=p.maxhp/4?0:1):info.form.formIndex%7+(p.hp<=p.maxhp/2?7:0);
  if(index===info.form.formIndex)return;
  const hp=p.hp,max=p.maxhp,next=convert({...mon,hp,maxHp:max,dynamaxed:!!p.volatiles.dynamax},run||{challenges:combat.challengeRestrictions||[]},index),native=b.dex.species.get(next.rogueBattleSpecies);
  p.m.rogueSourceForm=Object.fromEntries(fields.map(k=>[k,next[k]]));
  if(p.transformed)Object.assign(p.m.rogueSourceForm,{battleAppearance:p.species.id,battleSprite:p.species.spriteid});
  if(p.transformed){const stats=calculateStats(next);p.baseSpecies=new b.dex.Species({...native,baseStats:classicEffectiveBaseStats(next),types:next.rogueTypes?.map(t=>nativeTypes[t]||t)||native.types});p.set.species=native.name;p.baseStoredStats={...stats};delete p.baseStoredStats.hp;p.baseMaxhp=stats.hp;p.maxhp=stats.hp*(p.volatiles.dynamax?2:1);}
  else{p.setSpecies(native);p.baseSpecies=p.species;applyStats(p,next,{forceSpecies:true});p.baseSpecies=p.species;}
  p.hp=hp>0?Math.min(p.maxhp,hp+Math.max(0,p.maxhp-max)):0;p.details=p.getUpdatedDetails();
  const owned=p.side.n===0&&run?.party?.find(m=>String(m.boxId)===String(p.set.trainerToken));if(owned)Object.assign(owned,p.m.rogueSourceForm,{hp:p.hp,maxHp:p.maxhp});
  if(info.source.sourceId===1017){p.baseAbility=next.ability;p.set.ability=next.ability;if(!p.transformed&&p.ability!==next.ability){if(p.hp)p.setAbility(next.ability,p,null,true);else{p.ability=next.ability;p.abilityState=b.initEffectState({id:next.ability,target:p});}}}
  replaceAbilityPassive(b,p,next.roguePassiveAbility);
  b.add('-formechange',p,native.name,...(info.trigger?(info.trigger==='relicsong'?['[from] move: Relic Song']:[]):['[from] ability: '+b.dex.abilities.get(info.ability).name]));if(hp!==p.hp)b.add('-heal',p,p.getHealth,'[silent]');
 }
 const nativeDex=b.dex,local=Object.create(nativeDex),cache=new Map(),aspectStats={embodyaspectteal:'spe',embodyaspectwellspring:'spd',embodyaspecthearthflame:'atk',embodyaspectcornerstone:'def'},ids=new Set([...Object.values(CLASSIC_AUTOMATIC_FORM_SPECIES),...Object.keys(aspectStats)]);
 Object.defineProperty(local,'abilities',{value:new Proxy(nativeDex.abilities,{get(target,key){
  if(key==='get'||key==='getByID')return name=>{const a=target[key](name);if(!ids.has(a.id))return a;if(!cache.has(a.id)){
   const patched={...a,onStart:p=>change(p),onResidual:p=>change(p)};if(a.id==='zenmode')patched.onEnd=undefined;
   if(aspectStats[a.id]){delete patched.onResidual;patched.onStart=function(p){if(!p.transformed&&!this.effectState.embodied){this.effectState.embodied=true;this.boost({[aspectStats[a.id]]:1},p);}};}
   if(['forecast','flowergift'].includes(a.id)){patched.onWeatherChange=p=>change(p);patched.onEnd=p=>change(p,0);delete patched.onResidual;}
   if(a.id==='flowergift')for(const event of ['onAllyModifyAtk','onAllyModifySpD'])patched[event]=function(value,p){const owner=this.effectState.target,mon=current(owner);if(mon?.fusionSpecies||p.effectiveWeather()!=='sunnyday')return;return this.chainModify(1.5);};
   if(a.id==='battlebond'){
    patched.onStart=undefined;delete patched.onResidual;
    patched.onSwitchIn=p=>{delete p.m.rogueBattleBondUsed;};
    patched.onSourceAfterFaint=function(count,target,p,effect){if(effect?.effectType!=='Move'||!p.hp||!p.isActive)return;const mon=current(p);if(mon?.rogueSourceId===2658&&!mon.fusionSpecies){change(p,1);return;}if(!p.m.rogueBattleBondUsed){p.m.rogueBattleBondUsed=true;victoryBoost(p,{atk:1,spa:1,spe:1},a);}};
    patched.onFaint=p=>change(p,0,true);
    patched.onModifyMove=undefined;
   }
   if(a.id==='hungerswitch'){patched.onStart=undefined;patched.onResidual=p=>{const info=reviewed(current(p));if(info&&!p.terastallized)change(p,info.form.formIndex?0:1);};}
   if(a.id==='gulpmissile'){
    patched.flags={...a.flags,failroleplay:1,noreceiver:1,noentrain:1,notrace:1,failskillswap:1};
    patched.onStart=undefined;delete patched.onResidual;patched.onSourceTryPrimaryHit=undefined;patched.onDamagingHit=undefined;
    patched.onAfterMoveSecondarySelf=function(p,target,move){const info=reviewed(current(p));if(info&&info.form.formIndex===0&&move.id==='surf')change(p,p.hp>=p.maxhp/2?1:2);};
    patched.onDamage=function(damage,p,attacker,move){const info=reviewed(current(p));if(!info||p.transformed||info.form.formIndex===0||damage<=0||move?.effectType!=='Move'||!attacker?.hp||p.volatiles.dive||p.volatiles.substitute&&!move.flags?.bypasssub&&!move.infiltrates)return;
     const loaded=info.form.formIndex;change(p,0);this.damage(Math.max(1,Math.floor(attacker.maxhp/4)),attacker,p,a);if(loaded===1)this.boost({def:-1},attacker,p,null,true);else attacker.trySetStatus('par',p,move);};
    patched.onEnd=p=>change(p,0,true);
   }
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
 }})});
 // The pinned source has no freeze-triggered Sky -> Land transition.
 if((run?.moveBalanceRule||combat.moveBalanceRule)==='source-subset-v2'){
  const freeze=nativeDex.conditions.get('frz'),patchedFreeze=new nativeDex.Condition({...freeze,onStart(target,...args){
   const mon=current(target);if(mon?.rogueSourceId!==492||mon.rogueFormIndex!==1||target.transformed||mon.fusionSpecies&&!validatedClassicDnaFusion(mon))return freeze.onStart.call(this,target,...args);
   const original=target.formeChange,descriptor=Object.getOwnPropertyDescriptor(target,'formeChange');Object.defineProperty(target,'formeChange',{configurable:true,enumerable:false,value(form,...rest){if(String(form).toLowerCase()==='shaymin')return false;return original.call(this,form,...rest);}});
   try{return freeze.onStart.call(this,target,...args);}finally{if(descriptor)Object.defineProperty(target,'formeChange',descriptor);else delete target.formeChange;}
  }});
  Object.defineProperty(local,'conditions',{value:new Proxy(nativeDex.conditions,{get(target,key){if(key==='get'||key==='getByID')return name=>{const condition=target[key](name);return condition.id==='frz'?patchedFreeze:condition;};const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}})});
 }
 const dive=nativeDex.moves.get('dive'),patchedDive=new nativeDex.Move({...dive,onTryMove(p,...args){
  const native=p.formeChange,descriptor=Object.getOwnPropertyDescriptor(p,'formeChange');Object.defineProperty(p,'formeChange',{configurable:true,enumerable:false,value:function(form,...rest){if(['cramorantgulping','cramorantgorging'].includes(String(form).toLowerCase())){const info=reviewed(current(this));if(info&&!this.transformed)change(this,this.hp>=this.maxhp/2?1:2);return !!info;}return native.call(this,form,...rest);}});
  try{return dive.onTryMove.call(this,p,...args);}finally{if(descriptor)Object.defineProperty(p,'formeChange',descriptor);else delete p.formeChange;}
 }});
 const shuriken=nativeDex.moves.get('watershuriken'),patchedShuriken=new nativeDex.Move({...shuriken,onModifyMove(move,p){const mon=current(p);if(mon?.rogueSourceId===2658&&mon.rogueFormIndex===1){move.basePower=20;move.multihit=3;}}});
 const wheel=nativeDex.moves.get('aurawheel'),patchedWheel=new nativeDex.Move({...wheel,onTry:undefined,onModifyType(move,p){const mon=current(p),part=mon?.rogueSourceId===877?mon:mon?.rogueFusion?.donor?.rogueSourceId===877?mon.rogueFusion.donor:null;move.type=part?.rogueFormIndex===1?'Dark':'Electric';}});
 const technoType=p=>{const mon=current(p),part=mon?.rogueSourceId===649?mon:mon?.rogueFusion?.donor?.rogueSourceId===649?mon.rogueFusion.donor:null;return ['Normal','Electric','Fire','Ice','Water'][part?.rogueFormIndex||0]||'Normal';};
 if((run?.moveBalanceRule||combat.moveBalanceRule)==='source-subset-v2')b.rogueTechnoBlastType=technoType;
 const techno=nativeDex.moves.get('technoblast'),patchedTechno=new nativeDex.Move({...techno,onModifyType(move,p){move.type=technoType(p);}});
 const relic=nativeDex.moves.get('relicsong'),patchedRelic=new nativeDex.Move({...relic,onAfterMoveSecondarySelf(p){const info=reviewed(current(p));if(info?.source.sourceId===648&&!(run?.challenges||combat.challengeRestrictions||[]).some(c=>Number(c.id)===1&&Number(c.value)>0)&&!p.hasAbility('sheerforce'))change(p,info.form.formIndex?0:1);}});
 Object.defineProperty(local,'moves',{value:new Proxy(nativeDex.moves,{get(target,key){if(key==='get'||key==='getByID')return name=>{const move=target[key](name);return move.id==='dive'?patchedDive:move.id==='watershuriken'?patchedShuriken:move.id==='aurawheel'?patchedWheel:move.id==='technoblast'&&(run?.moveBalanceRule||combat.moveBalanceRule)==='source-subset-v2'?patchedTechno:move.id==='relicsong'?patchedRelic:move;};const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}})});b.dex=local;
 // Source getTeraType includes the fusion donor; form-change dispatch does not.
 for(const side of b.sides)for(const p of side.pokemon){const mon=current(p),part=mon?.rogueSourceId===1017?mon:mon?.rogueFusion?.donor?.rogueSourceId===1017?mon.rogueFusion.donor:null;if(part&&(!mon.fusionSpecies||validatedClassicDnaFusion(mon))){const type=['Grass','Water','Fire','Rock'][(part.rogueFormIndex||0)%4];p.teraType=type;p.set.teraType=type;}}
 const nativeTera=b.actions.terastallize;
 Object.defineProperty(b.actions,'terastallize',{configurable:true,value:function(p){
  const info=reviewed(current(p));if(info?.source.sourceId!==1017)return nativeTera.call(this,p);
  const native=p.formeChange,descriptor=Object.getOwnPropertyDescriptor(p,'formeChange');
  Object.defineProperty(p,'formeChange',{configurable:true,enumerable:false,value:function(form,...args){if(String(form).toLowerCase().startsWith('ogerpon')){change(this,info.form.formIndex%4+4);return true;}return native.call(this,form,...args);}});
  try{const result=nativeTera.call(this,p);if(p.terastallized)change(p,info.form.formIndex%4+4);return result;}finally{if(descriptor)Object.defineProperty(p,'formeChange',descriptor);else delete p.formeChange;}
 }});
 b.onEvent('Faint',b.format,{priority:101},function(p){const info=reviewed(current(p));if(info?.source.sourceId===1017&&info.form.formIndex>=4){p.terastallized=null;change(p,info.form.formIndex-4,true);}});
 for(const [event,index,allowFainted]of [['SwitchIn',1,false],['SwitchOut',0,false],['Faint',0,true]])b.onEvent(event,b.format,{priority:101},function(p){if(reviewed(current(p))?.source.sourceId===716)change(p,index,allowFainted);});
 b.onEvent('Update',b.format,{priority:-100},function(p){const info=p&&reviewed(current(p));if(info&&['forecast','flowergift'].includes(info.ability))change(p);});
}
