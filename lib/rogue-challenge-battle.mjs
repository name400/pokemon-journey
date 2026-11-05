import {calculateStats,classicEffectiveBaseStats} from './pokemon-config.mjs';
import {classicChallengeValue} from './rogue-challenge-rules.mjs';
// Keep the global simulator Dex untouched. Both Battle and BattleActions retain
// Dex references, so each gets its own chart view, preserving existing wrappers.
export function installClassicInverseBattle(b,combat){
 if(!classicChallengeValue(combat,5))return;
 const wrap=dex=>{const local=Object.create(dex),cache=new Map();Object.defineProperty(local,'types',{value:new Proxy(dex.types,{get(target,key){if(key==='get'||key==='getByID')return name=>{const type=target[key](name);if(!type.exists)return type;if(!cache.has(type.name)){const damageTaken={...type.damageTaken};for(const attack of dex.types.names())if(Object.hasOwn(damageTaken,attack))damageTaken[attack]=({0:0,1:2,2:1,3:1})[damageTaken[attack]];cache.set(type.name,{...type,damageTaken});}return cache.get(type.name);};const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}})});return local;};
 Object.defineProperty(b,'dex',{configurable:true,enumerable:false,writable:true,value:wrap(b.dex)});
 Object.defineProperty(b.actions,'dex',{configurable:true,enumerable:false,writable:true,value:wrap(b.actions.dex)});
 b.onEvent('ModifyMove',b.format,{priority:110},function(move){if(move?.id==='thousandarrows')move.onEffectiveness=undefined;});
 Object.defineProperty(b,'rogueInverseBattle',{configurable:true,enumerable:false,value:true});
}
export function prepareClassicInversePokemon(p){
 if(!p.battle.rogueInverseBattle)return;
 const native=p.runImmunity;
 Object.defineProperty(p,'runImmunity',{configurable:true,enumerable:false,value(source,...args){
  if((typeof source==='string'?source:source?.type)!=='Ground')return native.call(this,source,...args);
  // Only Ground attack immunity ignores Flying. Grounding for terrain, hazards,
  // Levitate, Magnet Rise and Air Balloon must retain native behavior.
  const own=Object.getOwnPropertyDescriptor(this,'isGrounded'),grounded=this.isGrounded;
  Object.defineProperty(this,'isGrounded',{configurable:true,enumerable:false,value(){return grounded.call(this,true);}});
  try{return native.call(this,source,...args);}finally{if(own)Object.defineProperty(this,'isGrounded',own);else delete this.isGrounded;}
 }});
}

// Dynamic native forms recalculate stats after sourceStats has run. Apply Flip
// at that boundary too, including restored forms, without flipping copied
// Transform stats or applying HP deltas twice on restore.
export function prepareClassicFlippedPokemon(p,mon){
 if(!mon?.rogueFlipStats)return;
 const setSpecies=p.setSpecies;
 Object.defineProperty(p,'setSpecies',{configurable:true,enumerable:false,value(species,source,isTransform=false){
  const oldHp=this.hp,oldMax=this.maxhp,result=setSpecies.call(this,species,source,isTransform);if(!result||isTransform||this.transformed)return result;
  const raw=this.species.rogueUnflippedBaseStats||this.species.baseStats,current={...mon,level:this.level,rogueBaseStats:raw},stats=calculateStats(current),view=new this.battle.dex.Species({...this.species,baseStats:classicEffectiveBaseStats(current)});
  Object.defineProperty(view,'rogueUnflippedBaseStats',{configurable:true,enumerable:true,value:{...raw}});this.species=view;this.storedStats={...stats};delete this.storedStats.hp;this.baseStoredStats={...this.storedStats};this.baseMaxhp=stats.hp;this.maxhp=this.volatiles.dynamax&&this.baseSpecies.id!=='shedinja'?Math.floor(stats.hp*(1.5+this.dynamaxLevel*.05)):stats.hp;
  this.hp=oldHp>0?Math.min(this.maxhp,oldHp+Math.max(0,this.maxhp-oldMax)):0;this.updateSpeed();return result;
 }});
 // A dynamic form in a snapshot still carries its old native Species object.
 const expected=mon.rogueBattleSpecies||p.baseSpecies.id;if(p.species.id!==expected&&!p.transformed)p.setSpecies(p.species);
}
