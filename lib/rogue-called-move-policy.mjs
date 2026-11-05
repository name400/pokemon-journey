// Source call eligibility facts, AGPL-3.0-only, Pagefault Games and contributors.
import policy from '../data/rogue-called-move-policy.json' with {type:'json'};
import {rogueReferenceData} from './rogue-reference.mjs';
import {classicPreventRevive} from './rogue-challenge-rules.mjs';

export const classicMetronomeMoves=Object.freeze([...policy.metronomeMoves]);
const metronomeIds=new Set(classicMetronomeMoves);
const nativeId=name=>name.replace(/__(PHYSICAL|SPECIAL)$/,'').toLowerCase().replaceAll('_','').replace('tenmillionvoltthunderbolt','10000000voltthunderbolt');
const registered=new Set(Object.entries(rogueReferenceData.enums.MoveId).filter(([,id])=>typeof id==='number'&&id>0).map(([name])=>nativeId(name)));
const unimplemented=new Set(policy.unimplemented.map(nativeId));
const callers=Object.fromEntries(Object.entries(policy.callers).map(([id,entry])=>[id,{banned:new Set(entry.banned.map(nativeId)),flagExceptions:new Set(entry.nativeFlagExceptions),chargeExceptions:new Set(entry.chargeExceptions)}]));
export function classicCalledMoveAllowed(caller,move,combat){
 const entry=callers[caller];
 if(!entry||!move?.exists||!registered.has(move.id)||unimplemented.has(move.id)||entry.banned.has(move.id)||move.isZ||move.isMax||move.id==='revivalblessing'&&classicPreventRevive(combat))return false;
 const flag={copycat:'failcopycat',sleeptalk:'nosleeptalk',assist:'noassist',mirrormove:'mirror',instruct:'failinstruct'}[caller],flagBlocked=caller==='mirrormove'?!move.flags[flag]:!!move.flags[flag];
 return (!flagBlocked||entry.flagExceptions.has(move.id))&&(!move.flags.charge||!['sleeptalk','instruct'].includes(caller)||entry.chargeExceptions.has(move.id))&&(caller!=='instruct'||!move.flags.recharge);
}
const followUps=new Set(['metronome','copycat','sleeptalk','assist','mirrormove','naturepower']);
function lastSourceMove(pokemon,includeFollowUp){
 const saved=pokemon.m?.rogueCalledHistory?.[includeFollowUp?'mirror':'normal'];
 if(saved&&registered.has(saved))return saved;
 const used=pokemon.lastMoveUsed;
 if(includeFollowUp&&used&&!used.hasBounced&&followUps.has(used.sourceEffect))return used.id;
 return pokemon.lastMove?.id||null;
}
const installed=new WeakSet();
export function installClassicCalledMovePolicy(b,combat){
 if(combat?.calledMoveRule!=='source-pool-v1'||installed.has(b))return;
 installed.add(b);
 const nativeDex=b.dex,localDex=Object.create(nativeDex),overrides=new Map();
 Object.defineProperty(b,'rogueCalledMoveRelease',{configurable:true,enumerable:false,value(pokemon,move){
  const pending=pokemon?.volatiles?.twoturnmove,caller=pending?.sourceEffect?.sourceEffect;
  if(!move?.id||pending?.move!==move.id||!followUps.has(caller))return false;
  return caller==='metronome'?metronomeIds.has(move.id):classicCalledMoveAllowed(caller,this.dex.moves.get(move.id),combat);
 }});
 const handlers={metronome(pokemon){
  // One native sample keeps the battle PRNG/snapshot boundary intact. This
  // implements the source candidate policy, not the source PRNG algorithm.
  const id=this.sample(classicMetronomeMoves);
  if(!id)return false;
  const move=this.dex.moves.get(id);
  if(!move.exists)return false;
  this.actions.useMove(move,pokemon);
 },copycat(pokemon){
  let move=this.lastMove;
  if(!move)return;
  if(move.isMax&&move.baseMove)move=this.dex.moves.get(move.baseMove);
  if(!classicCalledMoveAllowed('copycat',move,combat))return false;
  this.actions.useMove(this.dex.moves.get(move.id),pokemon);
 },sleeptalk(pokemon){
  const moves=pokemon.moveSlots.map(slot=>this.dex.moves.get(slot.id)).filter(move=>classicCalledMoveAllowed('sleeptalk',move,combat));
  if(!moves.length)return false;
  this.actions.useMove(this.sample(moves),pokemon);
 },assist(pokemon){
  const moves=[];
  for(const ally of pokemon.side.pokemon){
   if(ally===pokemon||ally.m?.released||ally.m?.captured)continue;
   for(const slot of ally.moveSlots){const move=this.dex.moves.get(slot.id);if(classicCalledMoveAllowed('assist',move,combat))moves.push(move);}
  }
  if(!moves.length)return false;
  this.actions.useMove(this.sample(moves),pokemon);
 }};
 const mirror=nativeDex.moves.get('mirrormove');overrides.set('mirrormove',new nativeDex.Move({...mirror,onTryHit(target,pokemon){
  const id=lastSourceMove(target,true),move=id?this.dex.moves.get(id):null;
  if(!classicCalledMoveAllowed('mirrormove',move,combat))return false;
  this.actions.useMove(move,pokemon,{target});return null;
 }}));
 const instruct=nativeDex.moves.get('instruct');overrides.set('instruct',new nativeDex.Move({...instruct,onHit(target,source){
  const id=lastSourceMove(target,false),move=id?this.dex.moves.get(id):null,slot=id?target.getMoveData(id):null;
  if(!slot||slot.pp<=0||!classicCalledMoveAllowed('instruct',move,combat)||target.volatiles.dynamax||target.volatiles.beakblast||target.volatiles.focuspunch||target.volatiles.shelltrap)return false;
  this.add('-singleturn',target,'move: Instruct',`[of] ${source}`);
  this.queue.prioritizeAction(this.queue.resolveAction({choice:'move',pokemon:target,moveid:id,targetLoc:target.lastMoveTargetLoc})[0]);
 }}));
 for(const [id,onHit]of Object.entries(handlers))overrides.set(id,new nativeDex.Move({...nativeDex.moves.get(id),onHit}));
 if(combat.sketchCopyRule==='source-v1'){
  const sketch=nativeDex.moves.get('sketch');overrides.set('sketch',new nativeDex.Move({...sketch,onHit(target,source){
   const move=target.lastMove;if(source.transformed||!move||!registered.has(move.id)||source.moves.includes(move.id)||['struggle','sketch'].includes(move.id)||move.isZ||move.isMax)return false;
   const index=source.moves.indexOf('sketch');if(index<0)return false;
   const used=!!(this.rogueLastResortSourceLedger&&Array.isArray(source.m.rogueDirectMoveHistory)&&source.m.rogueDirectMoveHistory.includes(move.id));
   const learned={move:move.name,id:move.id,pp:move.pp,maxpp:move.pp,target:move.target,disabled:false,used};source.moveSlots[index]=learned;source.baseMoveSlots[index]=learned;this.add('-activate',source,'move: Sketch',move.name);
  }}));
 }
 const conditions=new Map();
 for(const id of ['slp','frz','confusion','flinch','attract','disable','taunt']){
  const native=nativeDex.conditions.get(id);
  conditions.set(id,new nativeDex.Condition({...native,onBeforeMove(pokemon,target,move){
   // The source queues a called charge release as FOLLOW_UP, skipping these
   // first checks and their counters. Preserve native status data otherwise.
   if(this.rogueCalledMoveRelease(pokemon,move))return;
   return native.onBeforeMove.call(this,pokemon,target,move);
  }}));
 }
 const imprison=nativeDex.conditions.get('imprison');conditions.set('imprison',new nativeDex.Condition({...imprison,onFoeBeforeMove(pokemon,target,move){if(this.rogueCalledMoveRelease(pokemon,move))return;return imprison.onFoeBeforeMove.call(this,pokemon,target,move);}}));
 Object.defineProperty(localDex,'conditions',{value:new Proxy(nativeDex.conditions,{get(target,key){
  if(key==='get'||key==='getByID')return function(name){const condition=target[key](name);return conditions.get(condition.id)||condition;};
  const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
 }})});
 const truant=nativeDex.abilities.get('truant'),patchedTruant=new nativeDex.Ability({...truant,onBeforeMove(pokemon,target,move){if(this.rogueCalledMoveRelease(pokemon,move))return;return truant.onBeforeMove.call(this,pokemon,target,move);}});
 Object.defineProperty(localDex,'abilities',{value:new Proxy(nativeDex.abilities,{get(target,key){if(key==='get'||key==='getByID')return function(name){const ability=target[key](name);return ability.id==='truant'?patchedTruant:ability;};const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}})});
 Object.defineProperty(localDex,'moves',{value:new Proxy(nativeDex.moves,{get(target,key){
  if(key==='get'||key==='getByID')return function(name){const move=target[key](name);return overrides.get(move.id)||move;};
  const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
 }})});
 b.dex=localDex;
 // Source Mirror Move includes FOLLOW_UP history; Instruct excludes it. Native
 // lastMoveUsed also includes Dancer/reflection, so retain the two source views
 // as small primitive IDs in the existing per-Pokemon snapshot state.
 b.onEvent('BeforeMove',b.format,{priority:1000},function(pokemon,target,move){
  if(this.rogueCalledMoveRelease(pokemon,move)){
   const history=pokemon.m.rogueCalledHistory;pokemon.m.rogueCalledHistory={normal:history?.normal||pokemon.lastMove?.id||pokemon.volatiles.twoturnmove.sourceEffect.sourceEffect,mirror:move.id};return;
  }
  if(!move.isExternal&&!move.hasBounced&&registered.has(move.id))pokemon.m.rogueCalledHistory={normal:move.id,mirror:move.id};
 });
 b.onEvent('BeforeSwitchIn',b.format,{priority:1000},function(pokemon){delete pokemon.m.rogueCalledHistory;});
 b.onEvent('AfterMove',b.format,{priority:1000},function(pokemon,target,move){
  // Instruct can release the source-allowed Razor Wind before native duration
  // expiry. Clear only its spent lock, after onTryMove removed its charge tag.
  const pending=pokemon.volatiles.twoturnmove;
  if(pending?.move===move.id&&callers.instruct.chargeExceptions.has(move.id)&&!pokemon.volatiles[move.id])pokemon.removeVolatile('twoturnmove');
 });
 const useMove=b.actions.useMove;
 Object.defineProperty(b.actions,'useMove',{configurable:true,enumerable:false,value(move,pokemon,options){
  const effect=options?.sourceEffect||b.effect,source=typeof effect==='string'?effect:effect?.id,id=typeof move==='string'?b.dex.moves.get(move).id:move?.id,followUp=followUps.has(source)&&!move?.hasBounced;
  const result=useMove.call(this,move,pokemon,options);
  if(followUp&&registered.has(id))pokemon.m.rogueCalledHistory={...pokemon.m.rogueCalledHistory,mirror:id};
  return result;
 }});
 const clearActiveMove=b.clearActiveMove;
 Object.defineProperty(b,'clearActiveMove',{configurable:true,enumerable:false,value(failed){
  const previous=this.lastMove,copying=['copycat','mirrormove'].includes(this.activeMove?.id),result=clearActiveMove.call(this,failed);
  // CopyMoveAttr never replaces the source battle's last-move pointer with the
  // caller itself. A real nested called move still reaches native recording.
  if(copying&&!failed)this.lastMove=previous;
  return result;
 }});
}
