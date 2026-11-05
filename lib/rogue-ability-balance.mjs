// Ability metadata from pagefaultgames/pokerogue, commit
// 29441f7aa7482d9e816b253d324293788936dc3e, init-abilities.ts.
// Upstream: AGPL-3.0-only; Pagefault Games and contributors.
export function installClassicAbilityBalance(b,combat,run){
 const patches={};
 if((run?.ruinIgnoreRule||combat.ruinIgnoreRule)==='source-subset-v1')for(const id of ['vesselofruin','tabletsofruin'])patches[id]={breakable:1};
 if((run?.traceTargetRule||combat.traceTargetRule)==='source-subset-v1')patches.gulpmissile={notrace:1};
 if(!Object.keys(patches).length)return;
 const nativeDex=b.dex,localDex=Object.create(nativeDex),cache=new Map();
 Object.defineProperty(localDex,'abilities',{value:new Proxy(nativeDex.abilities,{
  get(target,key){
   if(key==='get'||key==='getByID')return function(name){const ability=target[key](name);if(!patches[ability.id])return ability;if(!cache.has(ability.id))cache.set(ability.id,new nativeDex.Ability({...ability,flags:{...ability.flags,...patches[ability.id]}}));return cache.get(ability.id);};
   const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
  },
 })});
 b.dex=localDex;
}
