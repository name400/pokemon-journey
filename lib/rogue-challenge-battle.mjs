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
