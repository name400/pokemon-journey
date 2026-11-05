// Ability metadata from pagefaultgames/pokerogue, commit
// 29441f7aa7482d9e816b253d324293788936dc3e, init-abilities.ts.
// Upstream: AGPL-3.0-only; Pagefault Games and contributors.
export function installClassicAbilityBalance(b,combat,run){
 const patches={};
 if((run?.typedPowerRule||combat.typedPowerRule)==='source-subset-v1')for(const [id,type,multiplier] of [['transistor','Electric',1.3],['dragonsmaw','Dragon',1.5]])patches[id]={onModifyAtk:undefined,onModifySpA:undefined,onBasePower(power,source,target,move){if(move.type===type)return this.chainModify(multiplier);}};
 if((run?.waterBubbleRule||combat.waterBubbleRule)==='source-subset-v1')patches.waterbubble={onModifyAtk:undefined,onModifySpA:undefined,onSourceModifyAtk:undefined,onSourceModifySpA:undefined,onBasePower(power,source,target,move){if(move.type==='Water')return this.chainModify(2);},onSourceModifyDamage(damage,source,target,move){if(move.type==='Fire')return Math.max(1,Math.floor(damage/2));}};
 if((run?.typeResistRule||combat.typeResistRule)==='source-subset-v1')for(const id of ['thickfat','heatproof'])patches[id]={onSourceModifyAtk:undefined,onSourceModifySpA:undefined,onSourceModifyDamage(damage,source,target,move){if(move.type==='Fire'||id==='thickfat'&&move.type==='Ice')return Math.max(1,Math.floor(damage/2));}};
 if((run?.furCoatRule||combat.furCoatRule)==='source-subset-v1')patches.furcoat={onModifyDef:undefined,onSourceModifyDamage(damage,source,target,move){if(move.category==='Physical')return Math.max(1,Math.floor(damage/2));}};
 if((run?.entryBoostRule||combat.entryBoostRule)==='source-subset-v1'){
  patches.intrepidsword={onStart(p){this.boost({atk:1},p);}};
  patches.dauntlessshield={onStart(p){this.boost({def:1},p);}};
 }
 if((run?.ruinIgnoreRule||combat.ruinIgnoreRule)==='source-subset-v1')for(const id of ['vesselofruin','tabletsofruin'])patches[id]={flags:{breakable:1}};
 if((run?.traceTargetRule||combat.traceTargetRule)==='source-subset-v1')patches.gulpmissile={flags:{notrace:1}};
 if(!Object.keys(patches).length)return;
 const nativeDex=b.dex,localDex=Object.create(nativeDex),cache=new Map();
 Object.defineProperty(localDex,'abilities',{value:new Proxy(nativeDex.abilities,{
  get(target,key){
   if(key==='get'||key==='getByID')return function(name){const ability=target[key](name);if(!patches[ability.id])return ability;if(!cache.has(ability.id))cache.set(ability.id,new nativeDex.Ability({...ability,...patches[ability.id],flags:{...ability.flags,...patches[ability.id].flags}}));return cache.get(ability.id);};
   const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
  },
 })});
 b.dex=localDex;
}
