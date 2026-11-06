import {classicMagnitudeResult} from './rogue-magnitude-seed.mjs';
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

export const classicMoveFlags=Object.freeze(Object.fromEntries(Object.entries({
 razorwind:{wind:1},metalclaw:{slicing:1},crushclaw:{slicing:1},silverwind:{wind:1},
 dragonclaw:{slicing:1},shadowclaw:{slicing:1},ominouswind:{wind:1},dualchop:{slicing:1},
 direclaw:{slicing:1},doubleshock:{punch:1},dragoncheer:{sound:1},
}).map(([id,flags])=>[id,Object.freeze(flags)])));

// Static source type for non-battle systems; runtime ability/form changes are separate.
export function classicStaticMoveType(move,run){return move?.id==='snaptrap'&&run?.snapTrapRule==='source-v1'?'Steel':move?.type;}

// Use the same reviewed data in non-battle trainer decisions.
export function classicStaticMoveStats(move,run){if(run?.trainerMoveDataRule!=='source-v1')return {basePower:move?.basePower,accuracy:move?.accuracy};const balance=run?.moveBalanceRule==='source-subset-v2'?classicMoveBalanceV2:run?.moveBalanceRule==='source-subset-v1'?classicMoveBalance:null,patch=balance?.[move?.id];return {basePower:move?.id==='zippyzap'&&run?.zippyZapRule==='source-v1'?50:patch?.basePower??move?.basePower,accuracy:move?.id==='darkvoid'&&run?.darkVoidRule==='source-subset-v1'?80:patch?.accuracy??move?.accuracy};}

const installed=new WeakSet();
export function installClassicMoveBalance(b,combat,run){
 const rule=run?.moveBalanceRule||combat.moveBalanceRule;
 const balance=rule==='source-subset-v2'?classicMoveBalanceV2:rule==='source-subset-v1'?classicMoveBalance:null;
 const flags=(run?.moveFlagRule||combat.moveFlagRule)==='source-subset-v1'?classicMoveFlags:null;
 const zippy=(run?.zippyZapRule||combat.zippyZapRule)==='source-v1',snapTrap=(run?.snapTrapRule||combat.snapTrapRule)==='source-v1',magnitudeSeed=combat.magnitudeSeed??run?.seed,magnitudeWave=combat.magnitudeWave??run?.wave,magnitude=(run?.magnitudeSeedRule||combat.magnitudeSeedRule)==='source-v1'&&typeof magnitudeSeed==='string'&&!!magnitudeSeed&&Number.isSafeInteger(magnitudeWave)&&magnitudeWave>0;
 if((!balance&&!flags&&!zippy&&!snapTrap&&!magnitude)||installed.has(b))return;
 installed.add(b);
 const nativeDex=b.dex,localDex=Object.create(nativeDex),cache=new Map();
 Object.defineProperty(localDex,'moves',{value:new Proxy(nativeDex.moves,{
  get(target,key){
   if(key==='get'||key==='getByID')return function(name){const move=target[key](name),patch=balance?.[move.id],flagPatch=flags?.[move.id],zippyPatch=zippy&&move.id==='zippyzap'?{basePower:50,willCrit:true,secondary:null,secondaries:null}:null,snapPatch=snapTrap&&move.id==='snaptrap'?{type:'Steel'}:null,magnitudePatch=magnitude&&move.id==='magnitude'?{onModifyMove(activeMove){const result=classicMagnitudeResult(magnitudeSeed,magnitudeWave,this.turn);if(result){activeMove.magnitude=result.magnitude;activeMove.basePower=result.power;}}}:null;if(!patch&&!flagPatch&&!zippyPatch&&!snapPatch&&!magnitudePatch)return move;if(!cache.has(move.id))cache.set(move.id,new nativeDex.Move({...move,...patch,...zippyPatch,...snapPatch,...magnitudePatch,...(flagPatch?{flags:{...move.flags,...flagPatch}}:{})}));return cache.get(move.id);};
   const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
  },
 })});
 b.dex=localDex;
 // Native Z eligibility reads the actions' original Dex rather than battle Dex.
 // Limit the temporary lookup change to holders of the corrected move.
 if(snapTrap){const nativeCanZMove=b.actions.canZMove;Object.defineProperty(b.actions,'canZMove',{configurable:true,enumerable:false,value(pokemon){if(!pokemon?.moveSlots?.some(slot=>slot.id==='snaptrap'))return nativeCanZMove.call(this,pokemon);const old=this.dex;try{this.dex=b.dex;return nativeCanZMove.call(this,pokemon);}finally{this.dex=old;}}});}
 // Native actions.dex was captured before these battle-local lookups existed.
 // Called moves commonly arrive as strings (Metronome, Sleep Talk, Copycat).
 // Resolve those through the current battle Dex, including later local layers,
 // while preserving a caller-supplied Move/ActiveMove object and native hooks.
 for(const method of ['useMove','runMove']){
  const native=b.actions[method];
  Object.defineProperty(b.actions,method,{configurable:true,enumerable:false,value(move,...args){return native.call(this,typeof move==='string'?b.dex.moves.get(move):move,...args);}});
 }
}
