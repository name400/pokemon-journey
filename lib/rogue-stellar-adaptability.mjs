// Rules from the supplied PokéRogue ZIP, commit 7c0881255af5cd51992e513ff93c2f71adbe40e0:
// pokemon.ts calculateStabMultiplier/getTeraTypeBoost; move-effect-phase.ts postAnimCallback.
// Upstream notices: AGPL-3.0-only, Pagefault Games and contributors.
import {sourceSpeciesFor} from './rogue-reference.mjs';
import {validatedClassicDnaFusion} from './rogue-dna-fusion.mjs';
const installed=new WeakSet();
export function installClassicStellarAdaptability(b,combat,run){
 if((run?.adaptabilityRule||combat.adaptabilityRule)!=='source-subset-v2'||installed.has(b))return;
 installed.add(b);
 // The ZIP floors power only when the move type equals the Tera type. Native
 // Stellar also floors unused non-Stellar types. Its post-BasePower Dex read
 // is only the floor eligibility check: use a one-read view that opts out of
 // that check, without changing the active move's priority or action order.
 const nativeGetDamage=b.actions.getDamage,nativeRunEvent=b.runEvent,actionDex=b.actions.dex,localActionDex=Object.create(actionDex),floorMoves=new Map();let floorContext=null;
 Object.defineProperty(localActionDex,'moves',{value:new Proxy(actionDex.moves,{get(target,key){
  if(key==='get'||key==='getByID')return function(name){const move=target[key](name);if(floorContext?.move!==move.id)return move;floorContext.move=null;if(!floorMoves.has(move.id))floorMoves.set(move.id,new actionDex.Move({...move,priority:1}));return floorMoves.get(move.id);};
  const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
 }})});
 Object.defineProperty(b.actions,'dex',{configurable:true,enumerable:false,writable:true,value:localActionDex});
 Object.defineProperty(b.actions,'getDamage',{configurable:true,enumerable:false,value(source,...args){const previous=floorContext;floorContext={source,move:null};try{return nativeGetDamage.call(this,source,...args);}finally{floorContext=previous;}}});
 Object.defineProperty(b,'runEvent',{configurable:true,enumerable:false,value(event,target,source,effect,relay,...args){const result=nativeRunEvent.call(this,event,target,source,effect,relay,...args);if(event==='BasePower'&&floorContext?.source===target&&target?.terastallized==='Stellar'&&effect?.type!=='Stellar'&&typeof result==='number'&&result>0&&result<60)floorContext.move=effect.id;return result;}});
 const nativeDamage=b.actions.modifyDamage,nativeRandomizer=b.randomizer,nativeModify=b.modify,strikes=new WeakMap();let context=null;
 const hasTerapagos=p=>{const mon=(p.side.n===0?run?.party:null)?.find(m=>String(m.boxId)===String(p.set.trainerToken))||combat.teams[p.side.n]?.find(m=>String(m.boxId)===String(p.set.trainerToken));return !!mon&&(sourceSpeciesFor(mon)?.sourceId===1024||mon.rogueFusionRule==='preview-v1'&&validatedClassicDnaFusion(mon)?.donor?.rogueSourceId===1024);};
 Object.defineProperty(b.actions,'modifyDamage',{configurable:true,enumerable:false,value(damage,p,target,move,...args){
  if(p.terastallized!=='Stellar'||!move.type||move.type==='???')return nativeDamage.call(this,damage,p,target,move,...args);
  const type=move.type,original=!!move.forceSTAB||p.getTypes(false,true).includes(type),hit=move.hit||1,terapagos=hasTerapagos(p);
  let strike=strikes.get(move);if(!strike||strike.hit!==hit){strike={hit,available:terapagos||!p.stellarBoostedTypes.includes(type)};strikes.set(move,strike);}
  const nativeBoost=!p.stellarBoostedTypes.includes(type)||move.stellarBoosted,nativeStab=nativeBoost?(original?2:[4915,4096]):original?1.5:1;
  const prior=context;context={p,original,available:strike.available,nativeStab,ready:false};
  try{return nativeDamage.call(this,damage,p,target,move,...args);}finally{context=prior;}
 }});
 // @pkmn/sim 0.10.12 applies STAB with the first modify call after randomizer.
 // Correct that multiplier before rounding, preserving the native weather,
 // critical, spread, type, burn, item and final-damage pipeline. A mismatched
 // native multiplier falls back unchanged rather than modifying another stage.
 Object.defineProperty(b,'randomizer',{configurable:true,enumerable:false,value(...args){const frame=context,result=nativeRandomizer.apply(this,args);if(frame&&context===frame)frame.ready=true;return result;}});
 Object.defineProperty(b,'modify',{configurable:true,enumerable:false,value(value,multiplier,...args){
  const frame=context;if(frame?.ready){frame.ready=false;const expected=frame.nativeStab,matches=Array.isArray(expected)?Array.isArray(multiplier)&&multiplier[0]===expected[0]&&multiplier[1]===expected[1]:multiplier===expected;
   if(matches){const base=frame.original?(frame.p.hasAbility('adaptability')?2:1.5):1;multiplier=Math.min(2.25,base+(frame.available?(frame.original?0.5:0.2):0));}
  }
  return nativeModify.call(this,value,multiplier,...args);
 }});
 // The source records a completed damaging move's type even on a miss, on a
 // fixed-damage move, or before Terastallization. A charging setup is not a hit.
 b.onEvent('AfterMove',b.format,{priority:-100},function(p,target,move){if(!p?.set||!move?.type||move.type==='???'||move.category==='Status'||move.flags?.charge&&p.volatiles.twoturnmove||move.flags?.futuremove)return;p.stellarBoostedTypes=[...new Set([...p.stellarBoostedTypes,move.type])];});
}
