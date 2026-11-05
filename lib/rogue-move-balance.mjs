// Numeric balance facts from pagefaultgames/pokerogue, commit
// 29441f7aa7482d9e816b253d324293788936dc3e, src/data/moves/move.ts.
// Upstream: AGPL-3.0-only; Pagefault Games and contributors.
const values={
 crabhammer:{accuracy:95},slash:{basePower:80},bonerush:{basePower:30},
 nightdaze:{basePower:90},geargrind:{basePower:60,accuracy:90},
 firstimpression:{basePower:100},spiritshackle:{basePower:90},
 anchorshot:{basePower:90},firelash:{basePower:90},revelationdance:{basePower:100},
 tropkick:{basePower:85},beakblast:{basePower:120},dragonhammer:{basePower:100},
};
export const classicMoveBalance=Object.freeze(Object.fromEntries(Object.entries(values).map(([id,stats])=>[id,Object.freeze(stats)])));

export function installClassicMoveBalance(b,combat,run){
 if((run?.moveBalanceRule||combat.moveBalanceRule)!=='source-subset-v1')return;
 const nativeDex=b.dex,localDex=Object.create(nativeDex),cache=new Map();
 Object.defineProperty(localDex,'moves',{value:new Proxy(nativeDex.moves,{
  get(target,key){
   if(key==='get'||key==='getByID')return function(name){const move=target[key](name),patch=classicMoveBalance[move.id];if(!patch)return move;if(!cache.has(move.id))cache.set(move.id,new nativeDex.Move({...move,...patch}));return cache.get(move.id);};
   const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
  },
 })});
 b.dex=localDex;
}
