// Ability metadata from pagefaultgames/pokerogue, commit
// 29441f7aa7482d9e816b253d324293788936dc3e, init-abilities.ts.
// Upstream: AGPL-3.0-only; Pagefault Games and contributors.
export function installClassicRuinIgnore(b,combat,run){
 if((run?.ruinIgnoreRule||combat.ruinIgnoreRule)!=='source-subset-v1')return;
 const nativeDex=b.dex,localDex=Object.create(nativeDex),cache=new Map();
 Object.defineProperty(localDex,'abilities',{value:new Proxy(nativeDex.abilities,{
  get(target,key){
   if(key==='get'||key==='getByID')return function(name){const ability=target[key](name);if(!['vesselofruin','tabletsofruin'].includes(ability.id))return ability;if(!cache.has(ability.id))cache.set(ability.id,new nativeDex.Ability({...ability,flags:{...ability.flags,breakable:1}}));return cache.get(ability.id);};
   const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
  },
 })});
 b.dex=localDex;
}
