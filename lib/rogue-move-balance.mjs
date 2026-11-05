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

export const classicMoveBalanceV2=Object.freeze({...classicMoveBalance,...Object.fromEntries(Object.entries({
 snipeshot:{basePower:85},boltbeak:{basePower:80},fishiousrend:{basePower:80},
 appleacid:{basePower:90},gravapple:{basePower:90},meteorassault:{basePower:170},
 astralbarrage:{basePower:110},psyshieldbash:{basePower:90},mountaingale:{basePower:120},
 infernalparade:{basePower:65},tripledive:{basePower:35},makeitrain:{accuracy:95},
 hyperdrill:{basePower:120},bloodmoon:{basePower:130},syrupbomb:{accuracy:90},
}).map(([id,stats])=>[id,Object.freeze(stats)]))});

export function installClassicMoveBalance(b,combat,run){
 const rule=run?.moveBalanceRule||combat.moveBalanceRule;
 const balance=rule==='source-subset-v2'?classicMoveBalanceV2:rule==='source-subset-v1'?classicMoveBalance:null;
 if(!balance)return;
 const nativeDex=b.dex,localDex=Object.create(nativeDex),cache=new Map();
 Object.defineProperty(localDex,'moves',{value:new Proxy(nativeDex.moves,{
  get(target,key){
   if(key==='get'||key==='getByID')return function(name){const move=target[key](name),patch=balance[move.id];if(!patch)return move;if(!cache.has(move.id))cache.set(move.id,new nativeDex.Move({...move,...patch}));return cache.get(move.id);};
   const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
  },
 })});
 b.dex=localDex;
}
