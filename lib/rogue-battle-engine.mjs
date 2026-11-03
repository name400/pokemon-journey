import {moveDetails} from './move-description.mjs';
import zMoveNames from '../data/rogue-zmove-names.json' with {type:'json'};
import {Battle,PRNG,Dex} from '@pkmn/sim';
import {nativeTeamSet,syncNativeTeams} from './party-battle.mjs';
import {battleLines,battleVisuals} from './full-battle.mjs';
import {rules,moveNameByKey,calculateStats} from './pokemon-config.mjs';
import {moves} from './game.mjs';
import {bindAbilityComponents} from './rogue-ability-components.mjs';
import {markInitialEncounter,continueWild} from './rogue-battle-continuity.mjs';
import {installWildLifecycle} from './rogue-battle-lifecycle.mjs';
import {installEncounterGuards} from './rogue-encounter-guards.mjs';
import {classicMaxPP} from './rogue-classic-services.mjs';
import {awardClassicExperience,classicExpToNext} from './rogue-classic-growth.mjs';
import {attemptClassicCapture} from './rogue-classic-capture.mjs';
import {classicBossDamage,classicBossIndex,classicBossBoosts} from './rogue-boss.mjs';
import {bindClassicFinalBattle} from './rogue-final-battle.mjs';
import {rogueSpecies} from './rogue-reference.mjs';
const classicStarterRecords=[...rogueSpecies.values()].filter(species=>species.isStarter);

const types={노말:'Normal',불꽃:'Fire',물:'Water',전기:'Electric',풀:'Grass',얼음:'Ice',격투:'Fighting',독:'Poison',땅:'Ground',비행:'Flying',에스퍼:'Psychic',벌레:'Bug',바위:'Rock',고스트:'Ghost',드래곤:'Dragon',악:'Dark',강철:'Steel',페어리:'Fairy',스텔라:'Stellar'};
const statuses={독:'psn',맹독:'tox',화상:'brn',마비:'par',잠듦:'slp',얼음:'frz'};
const bindings=new WeakMap();
const token=p=>String(p.set.trainerToken);
const recordActiveParticipants=(run,b)=>{run.participants=[...new Set([...(run.participants||[]),...b.p1.active.filter(p=>p?.hp>0).map(token)])];};
function reconcileLivingCounts(b){for(const side of b.sides)side.pokemonLeft=side.pokemon.filter(p=>p.hp>0&&!p.fainted&&!p.m?.released&&!p.m?.captured).length;}
function savedClassicStatusState(p){if(p?.status==='frz'){const turns=p.statusState?.rogueFreezeTurns;return {kind:'frz',turns:Number.isInteger(turns)&&turns>=1&&turns<=3?turns:3};}const time=p?.status==='slp'?p.statusState?.time:null;if(!Number.isInteger(time)||time<1||time>5)return null;const start=Number.isInteger(p.statusState.startTime)&&p.statusState.startTime>=time&&p.statusState.startTime<=5?p.statusState.startTime:time;return {kind:'slp',time,startTime:start};}
function fogWeatherSuppressed(battle){return battle.field.suppressingWeather();}
function set(mon,i){return {...nativeTeamSet(mon,i),species:mon.rogueBattleSpecies||rules.species[mon.id].key,teraType:types[mon.teraType]||mon.teraType||types[mon.types?.[0]],...(mon.rogueTrainerTraits==='source-v1'?{happiness:mon.friendship}:{})};}
function sourceMon(combat,p){return combat.teams[p.side.n].find(m=>String(m.boxId)===token(p));}
function sourceStats(p,mon,{initial=false,forceSpecies=false}={}){
 if(!mon)return;
 const expected=mon.rogueBattleSpecies||rules.species[mon.id]?.key;
 if((initial||forceSpecies)&&expected&&p.species.id!==expected){const form=p.battle.dex.species.get(expected);if(form.exists){p.setSpecies(form);p.baseSpecies=form;p.details=p.getUpdatedDetails();}}
 if(!p.transformed&&p.species.id===expected){
  p.level=mon.level;p.set.level=mon.level;
  const form=new p.battle.dex.Species({...p.species,baseStats:mon.rogueBaseStats||p.species.baseStats,types:mon.rogueTypes?.map(t=>types[t]||t)||p.species.types});
  p.species=form;if(initial||p.baseSpecies.id===expected)p.baseSpecies=form;
  if(initial||forceSpecies)p.setType(form.types,true);
  const stats=calculateStats(mon);p.storedStats={...stats};delete p.storedStats.hp;p.baseStoredStats={...p.storedStats};
  p.baseMaxhp=stats.hp;p.maxhp=p.volatiles.dynamax&&p.baseSpecies.id!=='shedinja'?Math.floor(stats.hp*(1.5+p.dynamaxLevel*.05)):stats.hp;p.m.roguePermanentDynamax=String(mon.rogueFormKey||'').startsWith('gigantamax');p.updateSpeed();
 }
 if(initial){
  p.hp=Math.max(0,Math.min(p.maxhp,mon.hp));
  if(!p.hp&&!p.fainted){p.fainted=true;p.status='fnt';p.side.pokemonLeft--;}
  if(mon.status&&p.hp){p.status=statuses[mon.status]||mon.status;p.statusState=p.battle.initEffectState({id:p.status,target:p});if(p.status==='slp'){const stored=mon.rogueStatusState,time=stored?.kind==='slp'&&Number.isInteger(stored.time)&&stored.time>=1&&stored.time<=5?stored.time:(p.battle.randomChance(1,3)?2:3),start=Number.isInteger(stored?.startTime)&&stored.startTime>=time&&stored.startTime<=5?stored.startTime:time;p.statusState.time=time;p.statusState.startTime=start;}if(p.status==='frz'){const stored=mon.rogueStatusState,turns=stored?.kind==='frz'&&Number.isInteger(stored.turns)&&stored.turns>=1&&stored.turns<=3?stored.turns:3;p.statusState.rogueFreezeTurns=turns;}if(p.status==='tox')p.statusState.stage=0;}
 }
 const learnedMoves=mon.moves.map(name=>p.battle.dex.moves.get(moves[name]?.key||name));
 if(initial&&(mon.rogueSketchRule==='source-v1'||mon.rogueTrainerSketch==='source-v1')||learnedMoves.length!==p.baseMoveSlots.length||learnedMoves.some((move,i)=>p.baseMoveSlots[i]?.id!==move.id)){p.set.moves=learnedMoves.map(m=>m.id);p.baseMoveSlots=learnedMoves.map((move,i)=>({move:move.name,id:move.id,pp:((mon.rogueSketchRule==='source-v1'||mon.rogueTrainerSketch==='source-v1')?mon.rogueSketchPP?.[i]:undefined)??mon.pp?.[move.id]??classicMaxPP(mon,i),maxpp:classicMaxPP(mon,i),target:move.target,disabled:false,disabledSource:'',used:false}));if(!p.transformed)p.moveSlots=p.baseMoveSlots.map(m=>({...m}));}
 for(const [index,slot]of p.baseMoveSlots.entries()){
  const max=classicMaxPP(mon,index);slot.maxpp=max;
  if(initial){const stored=(mon.rogueSketchRule==='source-v1'||mon.rogueTrainerSketch==='source-v1')?mon.rogueSketchPP?.[index]:undefined;slot.pp=Math.min(max,Number.isInteger(stored)?stored:Number.isInteger(mon.pp?.[slot.id])?mon.pp[slot.id]:max);}
  p.ppUps[index]=Math.max(0,Math.min(3,mon.roguePPUps?.[slot.id]||0));
 }
 if(!p.transformed)for(const [index,slot] of p.moveSlots.entries()){const base=p.baseMoveSlots[index]?.id===slot.id?p.baseMoveSlots[index]:p.baseMoveSlots.find(m=>m.id===slot.id);if(base){slot.maxpp=base.maxpp;if(initial)slot.pp=base.pp;}}
}
function prepareBossPokemon(p,combat){
 const nativeDamage=p.damage;
 Object.defineProperty(p,'damage',{configurable:true,enumerable:false,value(amount,source,effect){
  const mon=sourceMon(combat,this),segments=mon?.rogueBossSegments||0;if(this.side.n!==1||segments<2)return nativeDamage.call(this,amount,source,effect);
  const firstFinal=combat.finalBoss&&this.battle.rogueFinal?.phase===1,previous=this.m.rogueBossIndex??classicBossIndex(this.hp,this.maxhp,segments),result=classicBossDamage(amount,this.hp,this.maxhp,segments,{index:previous,minimumIndex:firstFinal?1:0});
  if(firstFinal)result.damage=Math.min(result.damage,Math.max(0,this.hp-1));
  const dealt=nativeDamage.call(this,result.damage,source,effect);
  if(result.cleared<=previous){const next=classicBossBoosts(segments,previous,result.cleared,this.storedStats,this.boosts,()=>this.battle.random(0,1000000)/1000000);this.m.rogueBossIndex=next.index;if(!combat.trainer&&this.hp>0)for(const [stat,amount]of Object.entries(next.boosts)){this.boosts[stat]+=amount;this.battle.add('-boost',this,stat,amount);this.statsRaisedThisTurn=true;}this.updateSpeed();}
  return dealt;
 }});
}
function prepareNativePokemon(p,combat,run){
 if(p.side.n===0){const nativeRequest=p.getDynamaxRequest;Object.defineProperty(p,'getDynamaxRequest',{configurable:true,enumerable:false,value(skipChecks){if(!skipChecks&&(this.terastallized||this.m.roguePermanentDynamax||this.species.isMega||this.species.isPrimal||this.species.forme==='Ultra'))return;return nativeRequest.call(this,skipChecks);}});}
 const source=sourceMon(combat,p);if((source?.rogueSketchRule==='source-v1'||source?.rogueTrainerSketch==='source-v1')){
  const deduct=p.deductPP;Object.defineProperty(p,'deductPP',{configurable:true,enumerable:false,value(move,...args){
   if(!this.transformed&&this.battle.dex.moves.get(move).id==='sketch'){const first=this.moveSlots.findIndex(s=>s.id==='sketch'),usable=this.moveSlots.findIndex(s=>s.id==='sketch'&&s.pp>0);if(first>=0&&usable>first&&this.moveSlots[first].pp<=0){for(const slots of new Set([this.moveSlots,this.baseMoveSlots]))[slots[first],slots[usable]]=[slots[usable],slots[first]];}}
   return deduct.call(this,move,...args);
  }});
 }
 prepareBossPokemon(p,combat);const native=p.setSpecies;Object.defineProperty(p,'setSpecies',{configurable:true,enumerable:false,value(...args){const value=native.apply(this,args);sourceStats(this,run?.party?.find(m=>String(m.boxId)===token(this))||sourceMon(combat,this));return value;}});
}
function capturedStub(b,p){p.m.captured=true;p.hp=0;p.fainted=true;p.faintQueued=false;p.isActive=false;p.isStarted=false;p.switchFlag=false;p.forceSwitchFlag=false;b.p2.pokemonLeft=Math.max(0,b.p2.pokemonLeft-1);b.queue.cancelAction(p);b.singleEvent('End',p.getAbility(),p.abilityState,p);b.singleEvent('End',p.getItem(),p.itemState,p);p.clearVolatile();p.status='fnt';}
function install(b,combat,run=null,system=null){
 b.rogueClassicZRing=!!combat.zRing;
 if(b.rogueClassicDynamaxVersion!==1){b.p1.dynamaxUsed=false;b.rogueClassicDynamaxVersion=1;}
 Object.defineProperty(b.p1,'canDynamaxNow',{configurable:true,enumerable:false,value(){return !!combat.dynamaxBand&&!this.dynamaxUsed;}});
 const descriptor={version:2,pokemon:combat.teams.flatMap((team,side)=>team.filter(p=>p.roguePassiveAbility).map(p=>({side,token:String(p.boxId),passive:p.roguePassiveAbility})))};
 const abilities=bindAbilityComponents(b,descriptor);bindings.set(b,abilities);
 const nativeFindEventHandlers=b.findEventHandlers;Object.defineProperty(b,'findEventHandlers',{configurable:true,enumerable:false,value(target,eventName,...args){const handlers=nativeFindEventHandlers.call(this,target,eventName,...args);return eventName==='BeforeMove'?handlers.filter(handler=>!(handler.effect?.effectType==='Status'&&handler.effect.id==='par')):handlers;}});
 b.onEvent('BeforeMove',b.format,{priority:1},function(pokemon){if(pokemon.status==='par'&&this.randomChance(1,8)){this.add('cant',pokemon,'par');return false;}});
 // The native pass parser expects a Pokémon object even for an empty doubles slot.
 for(const side of b.sides){const nativePass=side.choosePass;Object.defineProperty(side,'choosePass',{configurable:true,enumerable:false,value(){const index=this.getChoiceIndex(true);if(['move','switch'].includes(this.requestState)&&index<this.active.length&&!this.active[index]){this.choice.actions.push({choice:'pass'});return true;}return nativePass.call(this);}});}
 Object.defineProperty(b,'checkFainted',{configurable:true,enumerable:false,value(){for(const side of this.sides){if(!this.canSwitch(side))continue;for(const pokemon of side.active)if(pokemon?.fainted){pokemon.status='fnt';pokemon.switchFlag=true;}}}});
 for(const side of b.sides)for(const p of side.pokemon)prepareNativePokemon(p,combat,run);
 const count=(id,owner)=>combat.modifiers.filter(m=>m.id===id&&(!owner||m.boxId===owner)).reduce((n,m)=>n+m.count,0);
 // Fog is a PokéRogue weather that the native simulator does not define.
 const nativeSuppressWeather=b.field.suppressingWeather;
 Object.defineProperty(b.field,'suppressingWeather',{configurable:true,enumerable:false,value(){return nativeSuppressWeather.call(this)||this.battle.sides.some(side=>side.active.some(p=>p?.hp>0&&!p.fainted&&p.hasAbility(['cloudnine','airlock'])));}});
 const nativeSetWeather=b.field.setWeather;
 Object.defineProperty(b.field,'setWeather',{configurable:true,enumerable:false,value(status,...args){const changed=nativeSetWeather.call(this,status,...args);if(changed&&this.battle.rogueFog)this.battle.rogueFog=false;return changed;}});
 for(const [method,stateKey] of [['setWeather','weatherState'],['setTerrain','terrainState']]){
  const original=b.field[method];Object.defineProperty(b.field,method,{configurable:true,enumerable:false,value(...args){const changed=original.apply(this,args),state=this[stateKey],source=state?.source;if(changed&&state.duration>0&&source&&!source.ignoringItem())state.duration+=2*Math.min(2,count('mysticalrock',token(source)));return changed;}});
 }

 const nativeTrySpreadMoveHit=b.actions.trySpreadMoveHit;
 Object.defineProperty(b.actions,'trySpreadMoveHit',{configurable:true,enumerable:false,value(targets,pokemon,move,...args){
  if(!b.rogueFog||move?.id!=='defog'||typeof move.onHit!=='function')return nativeTrySpreadMoveHit.call(this,targets,pokemon,move,...args);
  const originalHit=move.onHit;move.onHit=function(target,source,activeMove){const result=originalHit.call(this,target,source,activeMove);if(this.rogueFog){this.rogueFog=false;this.add('-weather','none');return true;}return result;};
  try{return nativeTrySpreadMoveHit.call(this,targets,pokemon,move,...args);}finally{move.onHit=originalHit;}
 }});
 b.onEvent('AfterSetStatus',b.format,{priority:0},function(status,pokemon,source,effect){if(status?.id==='slp'&&pokemon?.status==='slp'&&effect?.id!=='rest'){const time=this.randomChance(1,3)?2:3;pokemon.statusState.time=time;pokemon.statusState.startTime=time;}});
 b.onEvent('BeforeMove',b.format,{priority:11},function(pokemon,target,move){if(pokemon.status!=='frz')return;if(move?.flags?.defrost&&!(move.id==='burnup'&&!pokemon.hasType('Fire')))return;const state=pokemon.statusState;if(!Number.isInteger(state.rogueFreezeTurns)||state.rogueFreezeTurns<1||state.rogueFreezeTurns>3)state.rogueFreezeTurns=3;state.rogueFreezeTurns--;if(this.randomChance(1,4)||state.rogueFreezeTurns<=0){pokemon.cureStatus();return;}this.add('cant',pokemon,'frz');return false;});
 b.onEvent('ModifyAccuracy',b.format,{priority:-1},function(accuracy){if(this.rogueFog&&!fogWeatherSuppressed(this)&&typeof accuracy==='number')return Math.floor(accuracy*.9);});
 b.onEvent('Accuracy',b.format,{priority:-1},function(accuracy,target,source,move){if(this.rogueFog&&!fogWeatherSuppressed(this)&&move?.ohko&&typeof accuracy==='number')return Math.floor(accuracy*.9);});
 b.onEvent('TryHeal',b.format,{priority:1},function(amount,target,source,effect){if(this.rogueFog&&!this.field.suppressingWeather()&&target&&effect?.effectType==='Move'&&['synthesis','morningsun','moonlight'].includes(effect.id))return this.modify(target.maxhp,.25);});
 b.onEvent('TryHeal',b.format,{priority:.5},function(amount,target,source,effect){const n=count('healingcharm');if(target?.side?.n===0&&n>0&&typeof amount==='number'&&amount>0){const multiplier=1+.1*Math.min(5,n),ooze=typeof source?.hasAbility==='function'&&source.hasAbility('liquidooze')&&['drain','leechseed','strengthsap'].includes(effect?.id);return Math.max(1,(ooze?Math.ceil:Math.floor)(amount*multiplier));}});
 b.onEvent('BasePower',b.format,{priority:15},function(power,p,target,move){const n=combat.modifiers.filter(m=>m.boxId===token(p)&&m.typeBoost===move.type).reduce((sum,m)=>sum+m.count,0);if(n&&!p.ignoringItem())this.chainModify(100+20*n,100);if(this.rogueFog&&!this.field.suppressingWeather()){if(['solarbeam','solarblade'].includes(move.id))this.chainModify(1,2);if(move.id==='weatherball')this.chainModify(2,1);}});
 b.onEvent('FractionalPriority',b.format,{priority:-3},function(priority,pokemon,target,move){
  if(!pokemon?.set||!move||pokemon.ignoringItem())return;const n=Math.min(3,count('quickclaw',token(pokemon)));
  if(n&&this.randomChance(n,10)&&!(pokemon.hasAbility('myceliummight')&&move.category==='Status')&&priority<0.1){this.add('-activate',pokemon,'item: Quick Claw');return 0.1;}
 });
 b.onEvent('DamagingHit',b.format,{priority:-1},function(damage,target,source,move){
  if(!source?.set||!target?.hp||!move||move.category==='Status'||source.ignoringItem()||(target.hasAbility('shielddust')&&!source.hasAbility(['moldbreaker','teravolt','turboblaze']))||target.hasItem('covertcloak'))return;
  const n=Math.min(3,count('kingsrock',token(source))),original=this.dex.moves.get(move.id),hasFlinch=original.secondaries?.some(effect=>effect.volatileStatus==='flinch')||original.secondary?.volatileStatus==='flinch';
  if(n&&typeof damage==='number'&&damage>=0&&!hasFlinch&&this.randomChance(n,10))target.addVolatile('flinch',source,move);
 });
 // A source reviver seed resolves before the simulator commits a faint.
 b.onEvent('BeforeFaint',b.format,{priority:-100},function(p,source,effect){
  // Source post-turn poison, toxic and burn explicitly prevent instant revival.
  if(!p?.set||p.hp>0||p.fainted||['psn','tox','brn'].includes(effect?.id))return;
  const item=combat.modifiers.find(m=>m.id==='reviverseed'&&m.boxId===token(p)&&m.count>0);if(!item)return;
  // These two source effects happen before the instant revival.
  for(const id of ['destinybond','grudge'])if(p.volatiles[id])this.singleEvent('Faint',this.dex.conditions.get(id),p.volatiles[id],p,source,effect);
  item.count--;if(run&&p.side.n===0){const stored=run.modifiers.find(m=>m.id==='reviverseed'&&m.boxId===token(p)&&m.count>0);if(stored){stored.count--;if(stored.count===0)run.modifiers=run.modifiers.filter(m=>m!==stored);}}
  const passive=Object.entries(p.volatiles).filter(([key])=>key.startsWith('roguepassive:'));
  p.clearVolatile(false);for(const [key,state] of passive)p.volatiles[key]=state;
  p.faintQueued=false;p.fainted=false;p.status='';p.statusState=this.initEffectState({id:'',target:p});p.hp=Math.max(1,Math.floor(p.maxhp/2));
  this.add('-heal',p,p.getHealth,'[from] item: Reviver Seed');return false;
 });
 b.onEvent('Damage',b.format,{priority:-41},function(damage,target){if(!target?.set)return;const n=Math.min(5,count('focusband',token(target)));if(n&&target.hp>0&&!target.ignoringItem()&&typeof damage==='number'&&damage>=target.hp&&this.randomChance(n,10)){this.add('-activate',target,'item: Focus Band');return target.hp-1;}});
 b.onEvent('Residual',b.format,{order:5,subOrder:4},function(p){const n=count('leftovers',token(p));if(n&&p.hp&&!p.ignoringItem())this.heal(p.baseMaxhp*n/16,p,p,this.dex.items.get('leftovers'));});
 b.onEvent('Residual',b.format,{order:28},function(p){
  if(!p?.hp||!count('miniblackhole',token(p)))return;
  const foes=p.adjacentFoes().filter(target=>target.hp>0);if(!foes.length)return;const target=this.sample(foes);if(target.hasAbility('stickyhold')){this.add('-activate',target,'ability: Sticky Hold');return;}
  const transferables=combat.modifiers.filter(m=>m.boxId===token(target)&&m.count>0&&m.transferable!==false&&m.id!=='miniblackhole'),options=transferables.map(m=>({kind:'modifier',entry:m}));
  if(target.item&&!p.item)options.push({kind:'item',entry:target.getItem()});if(!options.length)return;
  const selected=this.sample(options);
  if(selected.kind==='item'){const item=target.takeItem(p);if(!item||!p.setItem(item,target,this.dex.moves.get('thief')))return;this.add('-item',p,item.name,'[from] move: Thief',`[of] ${target}`);return;}
  const item=selected.entry,maximum=({leftovers:4,soothebell:3,mysticalrock:2,reviverseed:1,focusband:5,kingsrock:3,quickclaw:3})[item.id]||99,owned=combat.modifiers.find(m=>m.boxId===token(p)&&m.id===item.id&&m.typeBoost===item.typeBoost);if((owned?.count||0)>=maximum)return;
  item.count--;if(owned)owned.count++;else combat.modifiers.push({...item,boxId:token(p),count:1});
  if(run){const previous=run.modifiers.find(m=>m.boxId===token(target)&&m.id===item.id&&m.typeBoost===item.typeBoost);if(previous)previous.count=Math.max(0,previous.count-1);const received=run.modifiers.find(m=>m.boxId===token(p)&&m.id===item.id&&m.typeBoost===item.typeBoost);if(received)received.count++;else run.modifiers.push({...item,boxId:token(p),count:1});}
  this.add('message',`${p.name}의 미니블랙홀이 ${target.name}의 도구 한 개를 흡수했다!`);
 });
 if(run)b.onEvent('BeforeSwitchIn',b.format,{priority:101},function(p){if(p.side.n===0)run.participants=[...new Set([...(run.participants||[]),token(p)])];});
 if(run)b.onEvent('Faint',b.format,{priority:-50},function(p){
  if(p.side.n===0){run.participants=(run.participants||[]).filter(id=>String(id)!==token(p));const mon=run.party.find(m=>String(m.boxId)===token(p));if(mon)mon.friendship=Math.max(0,(mon.friendship??50)-5);return;}
  const foe=sourceMon(combat,p);if(!foe||run.awardedFoes?.includes(foe.boxId))return;
  run.awardedFoes||=[];run.awardedFoes.push(foe.boxId);run.party=syncNativeTeams(this,[run.party,combat.teams[1]])[0];
  // Source faint processing includes active and just-fainted participants for
  // EXP Share, including simultaneous knockouts, before distributing EXP.
  const participants=[...new Set([...(run.participants||[]),...this.p1.active.filter(Boolean).map(token)])];
  run.expNotices=[...(run.expNotices||[]),...awardClassicExperience(run,[foe],{system,participants,weather:this.rogueFog?'fog':this.field.weather||''})];
  for(const mon of run.party){const native=this.p1.pokemon.find(p=>token(p)===String(mon.boxId));if(native){sourceStats(native,mon);native.hp=Math.min(native.maxhp,mon.hp);native.level=mon.level;native.set.level=mon.level;}}
 });
 if(b.rogueWild){installWildLifecycle(b);installEncounterGuards(b);}
 bindClassicFinalBattle(b,combat,run,{preparePokemon:prepareBossPokemon,applyStats:sourceStats});
 // Reconcile stale counters only at the simulator's terminal check, after faint processing.
 const checkWin=b.checkWin;Object.defineProperty(b,'checkWin',{configurable:true,enumerable:false,value(...args){reconcileLivingCounts(this);return checkWin.apply(this,args);}});
 return abilities;
}
function snapshot(b){const registry=Object.getOwnPropertyDescriptor(b,'events');try{delete b.events;return JSON.parse(JSON.stringify(b.toJSON()));}finally{if(registry)Object.defineProperty(b,'events',registry);}}
function restore(combat,run=null,system=null){
 const state=structuredClone(combat.snapshot),requests=state.sides.map(s=>s.activeRequest!==null);for(const side of state.sides)side.activeRequest=null;
 const b=Battle.fromJSON(state),evolved=new Set();
 // Evolution can change the species passive while this Pokémon remains on the
 // field. Prepare its serialized component before binding the new descriptor.
 for(const p of b.p1.pokemon){const mon=(run?.party||combat.teams[0]).find(m=>String(m.boxId)===token(p)),expected=mon?.rogueBattleSpecies||rules.species[mon?.id]?.key;if(!mon||!expected||p.baseSpecies.id===expected)continue;evolved.add(p);
  const desired=mon.roguePassiveAbility?b.dex.abilities.get(mon.roguePassiveAbility).id:null,key=desired?'roguepassive:'+desired:null;
  for(const old of Object.keys(p.volatiles))if(old.startsWith('roguepassive:')&&old!==key)delete p.volatiles[old];
  if(key&&p.isActive&&p.hp>0&&!p.volatiles[key])p.volatiles[key]=b.initEffectState({id:key,target:p,queryActive:true,ready:true,started:true,nativeState:b.initEffectState({id:desired,target:p})});
 }
 install(b,combat,run,system);
 for(const side of b.sides)for(const p of side.pokemon){const mon=(p.side.n===0&&run?.party?.find(m=>String(m.boxId)===token(p)))||sourceMon(combat,p),expected=mon?.rogueBattleSpecies||rules.species[mon?.id]?.key,changed=evolved.has(p);sourceStats(p,mon,{forceSpecies:!!mon&&!p.transformed&&p.baseSpecies.id!==expected});
  if(changed&&mon){if(p.transformed){const species=b.dex.species.get(expected);if(species.exists){p.baseSpecies=new b.dex.Species({...species,baseStats:mon.rogueBaseStats||species.baseStats,types:mon.rogueTypes?.map(t=>types[t]||t)||species.types});p.set.species=species.name;p.level=mon.level;p.set.level=mon.level;const stats=calculateStats(mon);p.baseStoredStats={...stats};delete p.baseStoredStats.hp;p.baseMaxhp=stats.hp;p.maxhp=p.volatiles.dynamax&&species.id!=='shedinja'?Math.floor(stats.hp*(1.5+p.dynamaxLevel*.05)):stats.hp;}}const ability=b.dex.abilities.get(mon.ability).id,oldBase=p.baseAbility;if(ability){p.baseAbility=ability;p.set.ability=ability;if(!p.transformed&&p.ability===oldBase){p.ability=ability;p.abilityState=b.initEffectState({id:ability,target:p});}}p.hp=mon.hp>0?Math.min(p.maxhp,mon.hp):0;}
  if(p.species.isMega||p.species.isPrimal||p.species.forme==='Ultra'||p.m.roguePermanentDynamax)p.canTerastallize=null;}
 reconcileLivingCounts(b);
 if(requests.some(Boolean)){const next=b.getRequests(b.requestState);b.sides.forEach((side,i)=>side.activeRequest=requests[i]?next[i]:null);b.prng=new PRNG(state.prng);}
 return b;
}
const uncertainEffectivenessMoves=new Set(['weatherball','judgment','revelationdance','multiattack','terrainpulse','naturalgift','technoblast','hiddenpower','aurawheel','ragingbull','ivycudgel','terablast','terastarstorm','struggle']);
function previewKnownMoveType(b,p,move){if(move.id==='terablast'&&typeof p.terastallized==='string')return {type:p.terastallized,power:move.basePower,uncertain:p.terastallized==='Stellar'};if(move.id==='hiddenpower'&&p.hpType)return {type:p.hpType,power:move.basePower};if(move.id==='weatherball'){if(p.hasAbility('megasol'))return null;const weather=p.effectiveWeather(),weatherType={sunnyday:'Fire',desolateland:'Fire',raindance:'Water',primordialsea:'Water',sandstorm:'Rock',hail:'Ice',snowscape:'Ice'}[weather],fog=!!b.rogueFog&&!b.field.suppressingWeather();return {type:weatherType||move.type,power:move.basePower*(weatherType||fog?2:1)};}if(move.id==='terrainpulse'){const terrain=p.isGrounded()?b.field.terrain:'',terrainType={electricterrain:'Electric',grassyterrain:'Grass',mistyterrain:'Fairy',psychicterrain:'Psychic'}[terrain];return {type:terrainType||move.type,power:move.basePower*(terrainType?2:1)};}return null;}
function combatHasZ(b,side,p,a){return side===0&&!!b.rogueClassicZRing&&!!a?.canZMove&&!p?.terastallized&&!p?.volatiles.dynamax&&!p?.m.roguePermanentDynamax&&!p?.species.isMega&&!p?.species.isPrimal&&p?.species.forme!=='Ultra';}
function actorRequest(b,side,slot,team,allTeams){
 const s=b.sides[side],req=s.activeRequest,p=s.active[slot],active=team.findIndex(m=>String(m.boxId)===String(p?.set.trainerToken)),forced=!!req?.forceSwitch?.[slot];
 if(b.ended||!req||req.wait||!p||p.hp<=0&&!forced||req.forceSwitch&&!forced)return {slot,kind:'wait',active,moves:[],switches:[],specials:[]};
 const a=req.active?.[slot],switches=s.pokemon.map((candidate,index)=>({slot:index+1,index:team.findIndex(m=>String(m.boxId)===token(candidate)),name:team.find(m=>String(m.boxId)===token(candidate))?.name||candidate.name,hp:candidate.hp,maxHp:candidate.maxhp})).filter(q=>q.index>=0&&q.hp>0&&!s.active.some(active=>active&&token(active)===String(team[q.index].boxId))&&(!a?.trapped||forced));
 const specialEffectiveness=move=>b.sides[1-side].active.map((foe,slot)=>{if(!foe?.hp)return null;const visible=foe.illusion||foe,multiplier=move.category==='Status'?null:b.dex.getImmunity(move.type,visible)?2**b.dex.getEffectiveness(move.type,visible):0;return {slot,name:visible.name.replace(/#\d+$/,''),multiplier};}).filter(Boolean);
 const specials=[];if(a?.canDynamax)specials.push({key:'dynamax',label:'다이맥스'});if(a?.canTerastallize&&!p?.volatiles.dynamax)specials.push({key:'terastallize',label:'테라스탈'});if(combatHasZ(b,side,p,a))specials.push({key:'zmove',label:'Z기술'});
 const legal=(a?.moves||[]).map((move,index)=>({move,index})).filter(({move:m})=>!m.disabled&&(m.pp===undefined||m.pp>0)).map(({move:m,index})=>{
  const baseMove=b.dex.moves.get(m.id),activeMax=!!p?.volatiles.dynamax,move=activeMax?b.actions.getActiveMaxMove(baseMove,p):baseMove,targets=[],targetKind=activeMax?move.target:m.target||move.target;
  if(b.activePerHalf>1&&['normal','any','adjacentFoe','adjacentAlly','adjacentAllyOrSelf'].includes(targetKind)){
   for(const candidateSide of b.sides)for(const [i,target]of candidateSide.active.entries())if(target?.hp&&b.validTarget(target,p,targetKind))targets.push({side:candidateSide.n,index:allTeams[candidateSide.n].findIndex(q=>String(q.boxId)===token(target)),slot:i,name:target.name.replace(/#\d+$/,''),target:p.getLocOf(target)});
  }
  const name=activeMax?(moveNameByKey[move.id]||move.name):(moveNameByKey[m.id]||m.move),possibleTypes=[];if(p.hasAbility('normalize'))possibleTypes.push('Normal');if(move.type==='Normal')for(const [ability,type] of [['pixilate','Fairy'],['aerilate','Flying'],['refrigerate','Ice'],['galvanize','Electric'],['dragonize','Dragon']])if(p.hasAbility(ability))possibleTypes.push(type);if(move.flags?.sound&&p.hasAbility('liquidvoice'))possibleTypes.push('Water');const converted=[...new Set(possibleTypes)],known=previewKnownMoveType(b,p,move),unknown=move.category==='Status'&&move.id!=='thunderwave'||!!known?.uncertain||uncertainEffectivenessMoves.has(move.id)&&!known||!known&&converted.length>1,effectiveType=known?.type||(unknown?move.type:converted[0]||move.type),displayType=Object.keys(types).find(key=>types[key]===effectiveType)||effectiveType;
  const effectivenessByTarget=b.sides[1-side].active.map((foe,slot)=>{if(!foe?.hp)return null;const visibleFoe=foe.illusion||foe;let multiplier=null;if(!unknown){const targetTypes=visibleFoe.getTypes();if(move.id==='thousandarrows'&&effectiveType==='Ground'){multiplier=2**targetTypes.filter(type=>type!=='Flying').reduce((sum,type)=>sum+b.dex.getEffectiveness(effectiveType,type),0);}else if(!b.dex.getImmunity(effectiveType,visibleFoe)){multiplier=0;}else{let stages=targetTypes.reduce((sum,type)=>sum+(move.id==='freezedry'&&type==='Water'?1:b.dex.getEffectiveness(effectiveType,type)),0);if(move.id==='flyingpress')stages+=b.dex.getEffectiveness('Flying',visibleFoe);multiplier=2**stages;}}return {slot,name:visibleFoe.name.replace(/#\d+$/,''),multiplier};}).filter(Boolean);
  const teraType=String(p.teraType||p.set?.teraType||''),teraName=Object.keys(types).find(key=>types[key]===teraType),teraTargets=move.id==='terablast'&&a?.canTerastallize&&teraName?b.sides[1-side].active.map((foe,slot)=>{if(!foe?.hp)return null;const visibleFoe=foe.illusion||foe;return {slot,name:visibleFoe.name.replace(/#\d+$/,''),multiplier:teraType==='Stellar'?null:b.dex.getImmunity(teraType,visibleFoe)?2**b.dex.getEffectiveness(teraType,visibleFoe):0};}).filter(Boolean):null,teraPreview=teraTargets?{type:teraName,typeKey:teraType.toLowerCase(),effectiveness:teraTargets[0]?.multiplier??null,effectivenessByTarget:teraTargets}:null;
  const result={id:m.id,slot:index+1,name,pp:m.pp??1,maxPp:m.maxpp??1,type:displayType,typeKey:effectiveType.toLowerCase(),power:known?.power??move.basePower,...moveDetails(move),accuracy:move.accuracy===true?100:move.accuracy,category:move.category,target:targetKind,targets,effectiveness:effectivenessByTarget[0]?.multiplier??null,effectivenessByTarget,...(teraPreview?{teraPreview}:{})};
  if(a?.canDynamax){const max=b.actions.getActiveMaxMove(baseMove,p);if(max){const maxTargets=[];if(b.activePerHalf>1&&['normal','any','adjacentFoe','adjacentAlly','adjacentAllyOrSelf'].includes(max.target)){for(const candidateSide of b.sides)for(const [i,target] of candidateSide.active.entries())if(target?.hp&&b.validTarget(target,p,max.target))maxTargets.push({side:candidateSide.n,index:allTeams[candidateSide.n].findIndex(q=>String(q.boxId)===token(target)),slot:i,name:target.name.replace(/#\d+$/,''),target:p.getLocOf(target)});}const maxEffect=specialEffectiveness(max);result.variants={dynamax:{effectiveness:maxEffect[0]?.multiplier??null,effectivenessByTarget:maxEffect,name:moveNameByKey[max.id]||max.name,type:Object.keys(types).find(key=>types[key]===max.type)||max.type,typeKey:max.type.toLowerCase(),power:max.basePower,...moveDetails(max),accuracy:100,category:max.category,target:max.target,targets:maxTargets,disabled:!!a.maxMoves?.maxMoves?.[index]?.disabled}};}}
  if(combatHasZ(b,side,p,a)){const zRequest=a.canZMove[index];if(zRequest){const z=b.actions.getActiveZMove(baseMove,p),zTargets=[];if(b.activePerHalf>1&&['normal','any','adjacentFoe','adjacentAlly','adjacentAllyOrSelf'].includes(zRequest.target)){for(const candidateSide of b.sides)for(const [i,target] of candidateSide.active.entries())if(target?.hp&&!(zRequest.target==='normal'&&candidateSide.n===side)&&b.validTarget(target,p,zRequest.target))zTargets.push({side:candidateSide.n,index:allTeams[candidateSide.n].findIndex(q=>String(q.boxId)===token(target)),slot:i,name:target.name.replace(/#\d+$/,''),target:p.getLocOf(target)});}const zEffect=specialEffectiveness(z);result.variants={...result.variants,zmove:{effectiveness:zEffect[0]?.multiplier??null,effectivenessByTarget:zEffect,name:baseMove.category==='Status'?'Z-'+(moveNameByKey[baseMove.id]||baseMove.name):(zMoveNames.names[z.id]||moveNameByKey[z.id]||z.name),type:Object.keys(types).find(key=>types[key]===z.type)||z.type,typeKey:z.type.toLowerCase(),power:z.basePower,...moveDetails(z),accuracy:100,category:z.category,target:zRequest.target,targets:zTargets}};}else result.variants={...result.variants,zmove:{disabled:true}};}
  return result;
 });
 return {slot,kind:forced?'switch':'move',active,teraType:String(p.teraType||p.set?.teraType||'').toLowerCase(),moves:legal.length||forced?legal:[{id:'struggle',name:'몸부림',pp:1,maxPp:1,targets:[]}],switches,specials};
}
function request(b,side,teams){const actors=b.sides[side].active.map((p,slot)=>actorRequest(b,side,slot,teams[side],teams));return {...(actors.find(a=>a.kind!=='wait')||actors[0]),actors};}
function output(b,combat,start=0,run=null,initialConditions=null){
 const teams=syncNativeTeams(b,combat.teams).map((team,side)=>team.map(mon=>{const p=b.sides[side].pokemon.find(p=>token(p)===String(mon.boxId)),boss=p&&mon.rogueBossSegments?{rogueBossSegmentIndex:p.m.rogueBossIndex??classicBossIndex(p.hp,p.maxhp,mon.rogueBossSegments)}:{};return {...mon,...(side===0?{rogueStatusState:savedClassicStatusState(p)}:{}),...boss,captured:!!p?.m.captured,...(p?.m.roguePermanentDynamax?{dynamaxed:true,gigantamax:true,battleAppearance:p.species.id,battleSprite:p.species.spriteid}:{})};}));
 // Sketch replaces its source slot; save exact moves and PP before restoration.
 for(const [side,team] of teams.entries())for(const mon of team)if((mon.rogueSketchRule==='source-v1'||mon.rogueTrainerSketch==='source-v1')){const p=b.sides[side].pokemon.find(p=>token(p)===String(mon.boxId));if(p&&!p.transformed){mon.moves=p.baseMoveSlots.map(slot=>moveNameByKey[slot.id]||slot.move);mon.rogueSketchPP=p.baseMoveSlots.map(slot=>slot.pp);if(side===0){const owned=run?.party?.find(q=>String(q.boxId)===String(mon.boxId));if(owned){owned.moves=[...mon.moves];owned.rogueSketchPP=[...mon.rogueSketchPP];}}}}
 // XP may have changed party levels inside Faint before this final sync.
 if(run)for(const mon of teams[0]){const grown=run.party.find(p=>p.boxId===mon.boxId);if(grown){Object.assign(mon,{level:grown.level,experience:grown.experience,friendship:grown.friendship,stats:grown.stats,moves:[...grown.moves],roguePPUps:grown.roguePPUps});}}
 const requests=[request(b,0,teams),request(b,1,teams)];
 return {...combat,teams,snapshot:snapshot(b),requests,activeBySide:requests.map(r=>r.actors.map(a=>a.active)),turn:b.turn,ended:b.ended,winner:b.ended?(b.winner===b.p1.name?0:b.winner===b.p2.name?1:null):null,
  log:battleLines(b,start,{classicStyle:true}),events:battleVisuals(b,start,combat.teams,{classicStyle:true,initialConditions}),before:combat.teams,beforeActive:combat.requests?.map(r=>r.active)||[0,0],beforeActiveBySide:combat.activeBySide||requests.map(r=>r.actors.map(a=>a.active)),weather:b.rogueFog?'fog':b.field.weather||'',terrain:b.field.terrain||''};
}
export function createClassicCombat(run,foes,{trainer=false,doubles=false,weather='',terrain='',weatherDuration=0,terrainDuration=0,carryActive=[],system=null}={}){
 if(!run.party.some(p=>p.hp>0))throw Error('싸울 수 있는 포켓몬이 없습니다.');
 const teams=[run.party,foes].map(team=>structuredClone(team).map(mon=>mon.dynamaxed&&!mon.gigantamax&&!mon.eternamax?{...mon,hp:Math.ceil(mon.hp*calculateStats(mon).hp/Math.max(1,mon.maxHp)),maxHp:calculateStats(mon).hp,dynamaxed:false}:mon).sort((a,b)=>Number(b.hp>0)-Number(a.hp>0)));
 if(carryActive.length){const activeOrder=new Map(carryActive.map((p,i)=>[String(p.id),i]));teams[0].sort((a,b)=>Number(b.hp>0)-Number(a.hp>0)||(activeOrder.get(String(a.boxId))??99)-(activeOrder.get(String(b.boxId))??99));}
 const modifiers=structuredClone(run.modifiers||[]);for(const mon of teams[1])for(const modifier of mon.rogueFixedModifiers||[])modifiers.push({...modifier,boxId:String(mon.boxId)});
 const combat={classic:true,biomeId:Number(run.biome)||0,dynamaxBand:!!run.tools?.dynamaxBand,zRing:!!run.tools?.zRing,teams,modifiers,trainer,doubles,finalBoss:run.encounter?.kind==='final',finalPhase:run.encounter?.phase||null};
 const seed=Array.from({length:4},()=>{run.rng=(Math.imul(run.rng||1,1664525)+1013904223)>>>0;return run.rng%65536;});
 const b=new Battle({formatid:doubles?'gen9doublescustomgame':'gen9customgame',seed,p1:{name:'플레이어',team:teams[0].map(set)},p2:{name:'상대',team:teams[1].map(set)}});
 const startedBeforeRestore=b.sides.some(side=>side.active.some(Boolean));
 if(!trainer)markInitialEncounter(b,run.id+':'+run.wave,String(run.biome));
 if(b.rogueWild)b.rogueWild.wave=run.wave;
 install(b,combat,run,system);
 for(const side of b.sides)for(const p of side.pokemon){const mon=sourceMon(combat,p);sourceStats(p,mon,{initial:true});const allowed=side.n===0?run.tools.teraOrb&&run.teraCharged:!!combat.trainer&&!!mon?.rogueInstantTera;p.canTerastallize=allowed&&!p.species.isMega&&!p.species.isPrimal&&p.species.forme!=='Ultra'&&!p.m.roguePermanentDynamax?p.canTerastallize:null;}
 const initialConditions=new Map();if(startedBeforeRestore)for(const side of b.sides)for(const p of side.active)if(p)initialConditions.set(side.n+':'+token(p),{hp:p.hp,maxHp:p.maxhp,status:({psn:'독',tox:'맹독',brn:'화상',par:'마비',slp:'잠듦',frz:'얼음'})[p.status]||null});
 if(b.requestState==='teampreview')b.makeChoices(teams[0].map((_,i)=>i+1).join('').replace(/^/,'team '),teams[1].map((_,i)=>i+1).join('').replace(/^/,'team '));
 reconcileLivingCounts(b);
 if(carryActive.length){const remembered=new Map(carryActive.map(p=>[String(p.id),p.boosts]));for(const p of b.p1.active){const boosts=p&&remembered.get(token(p));if(!boosts)continue;for(const key of ['atk','def','spa','spd','spe','accuracy','evasion'])if(Number.isInteger(boosts[key]))p.boosts[key]=Math.max(-6,Math.min(6,boosts[key]));p.updateSpeed();}}
 if(weather==='fog'&&!b.field.weather){b.rogueFog=true;b.add('-weather','Fog');}
 const nativeWeather=weather==='fog'?'':weather==='snow'?'snowscape':weather;
 if(nativeWeather&&!b.field.weather){b.field.setWeather(nativeWeather,b.p1.active[0],b.dex.moves.get(nativeWeather));b.field.weatherState.duration=Number.isInteger(weatherDuration)?Math.max(0,weatherDuration):0;}
 if(terrain&&!b.field.terrain){b.field.setTerrain(terrain,b.p1.active[0],b.dex.moves.get(terrain));b.field.terrainState.duration=Number.isInteger(terrainDuration)?Math.max(0,terrainDuration):0;}
 // The first request can predate the per-side Tera restrictions above.
 if(!b.ended&&b.requestState==='move'){const prng=b.prng.clone();try{b.makeRequest('move');}finally{b.prng=prng;}}
 const active=b.p1.active.filter(p=>p?.hp).map(token);run.participants=[...new Set([...(run.participants||[]),...active])];
 return output(b,combat,0,run,initialConditions);
}
function commandFor(command,req){
 const actions=req.actors.filter(a=>a.kind!=='wait'),chosen=command?.type==='turn'?command.actions:[{...command,actor:actions[0]?.slot}];
 if(!Array.isArray(chosen)||chosen.length!==actions.length)throw Error('전장에 나온 포켓몬의 행동을 모두 선택하세요.');
 if(['terastallize','dynamax','zmove'].some(kind=>chosen.filter(action=>action?.type==='move'&&action.special===kind).length>1))throw Error('같은 특수 변화는 한 턴에 한 번만 사용할 수 있습니다.');
 const seen=new Set(),switches=new Set();return req.actors.map(actor=>{
  if(actor.kind==='wait')return 'pass';const cmd=chosen.find(c=>c.actor===actor.slot);if(!cmd||seen.has(cmd.actor))throw Error('행동을 선택할 포켓몬을 확인하세요.');seen.add(cmd.actor);
  if(cmd.type==='switch'){if(!actor.switches.some(s=>s.slot===cmd.slot)||switches.has(cmd.slot))throw Error('교체할 수 없는 포켓몬입니다.');switches.add(cmd.slot);return 'switch '+cmd.slot;}
  if(cmd.type!=='move'||actor.kind!=='move')throw Error('먼저 쓰러진 포켓몬을 교체하세요.');const move=actor.moves.find(m=>m.id===cmd.move||m.name===cmd.move);if(!move)throw Error('사용할 수 없는 기술입니다.');
  if(cmd.special&&!actor.specials.some(s=>s.key===cmd.special))throw Error('지금 사용할 수 없는 변화입니다.');
  const selected=cmd.special?move.variants?.[cmd.special]||move:move;if(selected.disabled)throw Error('이 변화로 사용할 수 없는 기술입니다.');
  if(selected.targets.length&&!selected.targets.some(t=>t.target===cmd.target))throw Error('기술의 대상을 선택하세요.');
  if(!selected.targets.length&&cmd.target!==undefined)throw Error('이 기술은 대상을 선택할 수 없습니다.');
  // @pkmn/sim can omit target metadata for locked random moves or recharge.
  // Its name parser defaults to a selectable target; the displayed slot
  // preserves automatic targeting when the public request has no target.
  const moveChoice=(move.id==='sketch'||!selected.targets.length)&&move.slot?move.slot:move.id;
  return `move ${moveChoice}${selected.targets.length?' '+cmd.target:''}${cmd.special?' '+cmd.special:''}`;
 }).join(', ');
}
function aiInput(b,combat){
 const req=request(b,1,combat.teams),simulation=restore({...combat,snapshot:snapshot(b)}),used=new Set();let usedTera=false;
 return req.actors.map(actor=>{
  const att=simulation.p2.active[actor.slot],foes=simulation.p1.active.filter(p=>p?.hp);if(actor.kind==='wait')return 'pass';
  const damage=(a,d,id)=>{try{return Number(simulation.actions.getDamage(a,d,simulation.dex.moves.get(id),true))||0;}catch{return 0;}};
  const scoreMove=(a,id,target)=>{
   if(!a||!target)return 0;const m=simulation.dex.moves.get(id);let score=0;
   if(m.category!=='Status'){
    if(target.side===a.side)score=-1000;else{const predicted=damage(a,target,id),remaining=Math.max(1,target.hp);score=predicted;if(predicted>=remaining){score+=target.maxhp*.35;if((m.priority||0)>0)score+=target.maxhp*.2;}if(m.recoil&&a.hp<=predicted*(m.recoil[0]/m.recoil[1]))score*=.7;}
   }
   else if(['protect','detect','spikyshield','kingsshield','banefulbunker','obstruct','silktrap','burningbulwark'].includes(m.id)&&!a.volatiles.stall){const ally=simulation.p2.active.some(p=>p&&p!==a&&p.hp>0),residual=foes.some(p=>['psn','tox','brn'].includes(p.status)||p.volatiles.leechseed),incoming=Math.max(0,...foes.flatMap(f=>f.getMoves().map(move=>damage(f,a,move.id))));if((ally||residual)&&incoming>=a.hp*.65)score=Math.min(a.maxhp*.5,incoming*.5);}
   else if(m.heal||['synthesis','morningsun','moonlight','shoreup'].includes(m.id)){const recipient=m.target==='self'?a:target;if(recipient?.side===a.side&&!recipient.volatiles.healblock&&recipient.hp<recipient.maxhp*.65){const weather=simulation.rogueFog&&!fogWeatherSuppressed(simulation)?'fog':simulation.field.effectiveWeather(),ratio=m.heal?m.heal[0]/m.heal[1]:m.id==='shoreup'?(weather==='sandstorm'?2/3:.5):['sunnyday','desolateland'].includes(weather)?2/3:['raindance','primordialsea','sandstorm','hail','snowscape','fog'].includes(weather)?0.25:0.5,recovery=Math.min(recipient.maxhp-recipient.hp,recipient.maxhp*ratio),danger=Math.max(0,...foes.flatMap(f=>f.getMoves().map(move=>damage(f,recipient,move.id))));score=recovery;if(danger>=recipient.hp+recovery)score*=.25;else if(danger>=recipient.hp)score*=1.25;}}
   else if(m.status&&target.side!==a.side&&!target.status&&target.runStatusImmunity(m.status==='tox'?'psn':m.status)&&!(target.isGrounded()&&(simulation.field.isTerrain('mistyterrain')||m.status==='slp'&&simulation.field.isTerrain('electricterrain')))&&(!target.side.sideConditions.safeguard||a.hasAbility('infiltrator'))&&(!target.volatiles.substitute||m.flags?.bypasssub||a.hasAbility('infiltrator'))&&(m.id!=='thunderwave'||simulation.dex.getImmunity('Electric',target))&&(!m.flags?.reflectable||!target.hasAbility('magicbounce')||a.hasAbility(['moldbreaker','teravolt','turboblaze'])))score=target.maxhp*(m.status==='slp'?.35:.2);
   else if(m.volatileStatus&&target.side!==a.side&&!target.volatiles[m.volatileStatus]&&(!target.volatiles.substitute||m.flags?.bypasssub)){
    if(m.volatileStatus==='confusion'&&!target.hasAbility('owntempo'))score=target.maxhp*.13;
    else if(m.volatileStatus==='leechseed'&&!target.hasType('Grass'))score=target.maxhp*.22;
    else if(m.volatileStatus==='taunt'&&target.getMoves().some(move=>simulation.dex.moves.get(move.id).category==='Status'))score=target.maxhp*.14;
   }
   else if(m.weather&&!simulation.field.suppressingWeather()&&simulation.field.weather!==m.weather&&!['primordialsea','desolateland','deltastream'].includes(simulation.field.weather)){
    const usefulTypes={sunnyday:['Fire'],raindance:['Water']}[m.weather]||[],abilities={sunnyday:['chlorophyll','solarpower'],raindance:['swiftswim','raindish'],sandstorm:['sandrush','sandforce'],snowscape:['slushrush','icebody'],hail:['slushrush','icebody']}[m.weather]||[];
    const offense=a.getMoves().some(move=>{const attack=simulation.dex.moves.get(move.id);return attack.category!=='Status'&&(usefulTypes.includes(attack.type)||m.weather==='sunnyday'&&['solarbeam','solarblade'].includes(attack.id));});
    const defense=m.weather==='sandstorm'&&a.hasType('Rock')||['snowscape','hail'].includes(m.weather)&&a.hasType('Ice');
    if(offense||defense||a.hasAbility(abilities))score=a.maxhp*(a.hp/a.maxhp<.35?.05:.18);
   }
   else if(m.boosts){
    const holder=m.target==='self'?a:target,friendly=holder.side===a.side;
    const useful=Object.entries(m.boosts).filter(([stat,n])=>friendly?n>0&&holder.boosts[stat]<2:n<0&&holder.boosts[stat]>=0);
    if(useful.length){const attacker=friendly?holder:a,opponent=friendly?foes[0]:holder,attacks=attacker.getMoves().map(move=>simulation.dex.moves.get(move.id)).filter(move=>move.category!=='Status'),best=Math.max(0,...attacks.map(move=>opponent?damage(attacker,opponent,move.id):0));
     // One setup/debuff can be useful. Repeated Growl below 0 is not a plan.
     score=best*(friendly?.7:.55);if(friendly&&useful.every(([stat])=>stat==='atk')&&!attacks.some(move=>move.category==='Physical'))score=0;if(friendly&&useful.every(([stat])=>stat==='spa')&&!attacks.some(move=>move.category==='Special'))score=0;
    }
   }else if(m.sideCondition){
    const side=['allySide','allyTeam','self'].includes(m.target)?a.side:target.side,existing=side.sideConditions[m.sideCondition],layerCap=({spikes:3,toxicspikes:2})[m.sideCondition]||1,layers=existing?.layers??(existing?1:0);
    if(layers<layerCap){const friendly=side===a.side,reserves=side.pokemon.filter(p=>p.hp>0&&!p.isActive&&!p.m?.released).length;if(friendly)score=a.maxhp*.18;else if(reserves>0)score=target.maxhp*.15*Math.min(2,reserves);}
   }
   return score*(m.accuracy===true?1:(m.accuracy||100)/100);
  };
  const bench=actor.switches.filter(s=>!used.has(s.slot)).map(s=>{const p=simulation.p2.pokemon[s.slot-1],offense=Math.max(0,...p.getMoves().map(m=>scoreMove(p,m.id,foes[0]))),incoming=Math.max(0,...foes.flatMap(f=>f.getMoves().map(m=>damage(f,p,m.id))));return {...s,score:offense/Math.max(1,foes[0]?.hp)-incoming/Math.max(1,p.hp)};}).sort((a,b)=>b.score-a.score);
  if(actor.kind==='switch'){if(!bench[0])return 'pass';used.add(bench[0].slot);return 'switch '+bench[0].slot;}
  const ranked=actor.moves.flatMap(m=>{const fallback=simulation.activePerHalf>1&&simulation.actions.targetTypeChoices(m.target)?[1,2,-1,-2].find(loc=>simulation.validTargetLoc(loc,att,m.target)):undefined;return (m.targets.length?m.targets:[{target:fallback,side:0,slot:0}]).map(t=>{const target=simulation.sides[t.side]?.active[t.slot]||foes[0];return {m,t,score:scoreMove(att,m.id,target)};});}).sort((a,b)=>b.score-a.score);
  const incoming=Math.max(0,...foes.flatMap(f=>f.getMoves().map(m=>damage(f,att,m.id)))),active=ranked[0].score/Math.max(1,foes[0]?.hp)-incoming/Math.max(1,att.hp);
  if(combat.trainer&&bench[0]&&bench[0].score>active+.7&&incoming>att.hp*.65&&(b.turn-(combat.lastSwitchTurn||-10)>2)){used.add(bench[0].slot);combat.lastSwitchTurn=b.turn;return 'switch '+bench[0].slot;}
  const best=ranked[0],canTera=!usedTera&&!!combat.teams[1]?.[actor.active]?.rogueInstantTera&&actor.specials.some(s=>s.key==='terastallize');if(canTera)usedTera=true;return 'move '+((best.m.id==='sketch'||best.t.target===undefined)&&best.m.slot?best.m.slot:best.m.id)+(best.t.target!==undefined?' '+best.t.target:'')+(canTera?' terastallize':'');
 }).join(', ');
}
export function playClassicCombat(run,command,{system=null}={}){
 const combat=structuredClone(run.combat);combat.dynamaxBand=!!run.tools?.dynamaxBand;combat.zRing=!!run.tools?.zRing;combat.teams[0]=structuredClone(run.party);const b=restore(combat,run,system),start=b.log.length;if(b.ended)throw Error('이미 끝난 전투입니다.');
 const input=commandFor(command,request(b,0,combat.teams));recordActiveParticipants(run,b);const cpuNeeded=!!b.p2.activeRequest&&!b.p2.activeRequest.wait,cpu=cpuNeeded?aiInput(b,combat):null;
 if(!b.choose('p1',input))throw Error(b.p1.choice.error||'행동을 처리하지 못했습니다.');
 if(cpuNeeded&&!b.ended&&!b.choose('p2',cpu))throw Error(b.p2.choice.error||'상대 행동을 처리하지 못했습니다.');
 for(let i=0;i<12&&!b.ended;i++){const own=request(b,0,combat.teams),foe=request(b,1,combat.teams);if(own.kind!=='wait'||foe.kind==='wait')break;{const choice=aiInput(b,combat);if(!b.choose('p2',choice))throw Error('상대 행동을 처리하지 못했습니다.');}}
 run.participants=[...new Set([...(run.participants||[]),...b.p1.active.filter(p=>p?.hp).map(token)])];
 if(b.p1.pokemon.some(p=>p.terastallized))run.teraCharged=false;
 return output(b,combat,start,run);
}
export function initialClassicSwitch(run,slot,boxId,{system=null}={}){
 const combat=structuredClone(run.combat);combat.teams[0]=structuredClone(run.party);const b=restore(combat,run,system),start=b.log.length,actor=request(b,0,combat.teams).actors.find(a=>a.slot===slot);
 if(!actor||actor.kind!=='move'||!actor.switches.some(option=>String(combat.teams[0][option.index]?.boxId)===String(boxId)))throw Error('교체할 수 없는 포켓몬입니다.');
 const incoming=b.p1.pokemon.find(p=>token(p)===String(boxId));if(!incoming||!b.p1.active[slot]?.hp)throw Error('교체할 포켓몬을 확인하세요.');
 b.actions.switchIn(incoming,slot);const index=b.queue.list.findIndex(action=>action.choice==='runSwitch'&&action.pokemon===incoming);if(index>=0){b.queue.list.splice(index,1);b.actions.runSwitch(incoming);}b.resolveFaints({checkWinIfNoFaints:true});
 if(!b.ended){b.checkFainted();const forced=b.sides.some(side=>side.active.some(p=>p?.switchFlag));b.makeRequest(forced?'switch':'move');}
 return output(b,combat,start,run);
}
export function classicCombatView(combat){const {teams,before,beforeActive,beforeActiveBySide,turn,ended,winner,log,events,weather,terrain}=combat;const b=restore(combat),requests=[request(b,0,teams),request(b,1,teams)],activeBySide=requests.map(r=>r.actors.map(a=>a.active));const decorate=(team,own)=>team.map(mon=>{const base=mon.rogueBattleSpecies||rules.species[mon.id]?.key,native=base?Dex.species.get(base):null;return {...mon,rogueBaseBattleAppearance:native?.exists?native.id:null,...(own?{rogueExperienceToNext:classicExpToNext(mon)}:{})};}),viewTeams=[decorate(teams[0],true),decorate(teams[1],false)],viewBefore=Array.isArray(before)?[decorate(before[0]||[],true),decorate(before[1]||[],false)]:before;return {teams:viewTeams,before:viewBefore,beforeActive,beforeActiveBySide,requests:[requests[0]],turn,ended,winner,log,events,weather,terrain,activeBySide,side:0,active:requests.map(r=>r.active)};}

export function continueClassicWild(run,foes,{system=null}={}){
 const previous=run.combat;if(!previous||previous.trainer)throw Error('야생 연속 전투 경계를 확인하세요.');
 const combat={...previous,biomeId:Number(run.biome)||0,dynamaxBand:!!run.tools?.dynamaxBand,zRing:!!run.tools?.zRing,teams:[structuredClone(run.party),structuredClone(foes)],modifiers:structuredClone(run.modifiers||[])};
 // Bind against new descriptors before entry. Archived foes keep their own
 // native volatile references but are excluded from public teams and AI choices.
 const b=restore({...combat,snapshot:previous.snapshot},run,system),start=b.log.length;
 // A continuous encounter has no player switch-in event: record the field
 // before opposing entry effects or a first-turn knockout can award EXP.
 recordActiveParticipants(run,b);
 continueWild(b,foes.map((mon,i)=>set(mon,b.p2.pokemon.length+i)),{id:run.id+':'+run.wave,biome:String(run.biome),beforeEntry:p=>{sourceStats(p,sourceMon(combat,p),{initial:true});prepareNativePokemon(p,combat,run);}});
 for(const p of b.p1.pokemon){const mon=sourceMon(combat,p);if(mon){const old=p.hp;sourceStats(p,mon);p.hp=old>0?Math.min(p.maxhp,mon.hp):0;if((mon.item||'')!==p.item){if(p.isActive&&p.hp)p.setItem(mon.item||'');else{p.item=mon.item||'';p.itemState=b.initEffectState({id:p.item,target:p});}}
  const nextMoves=mon.moves.map(name=>b.dex.moves.get(moves[name]?.key||name));
  if(nextMoves.some((move,i)=>p.baseMoveSlots[i]?.id!==move.id)||nextMoves.length!==p.baseMoveSlots.length){p.set.moves=nextMoves.map(m=>m.id);p.baseMoveSlots=nextMoves.map((move,i)=>({move:move.name,id:move.id,pp:mon.rogueSketchPP?.[i]??mon.pp?.[move.id]??classicMaxPP(mon,i),maxpp:classicMaxPP(mon,i),target:move.target,disabled:false,disabledSource:'',used:false}));if(!p.transformed)p.moveSlots=p.baseMoveSlots.map(m=>({...m}));}
  for(const [index,slot] of p.baseMoveSlots.entries()){const pp=mon.rogueSketchPP?.[index]??mon.pp?.[slot.id];if(Number.isInteger(pp))slot.pp=Math.min(slot.maxpp,pp);}
 }}
 if(!b.ended&&b.requestState==='move'){const prng=b.prng.clone();try{b.makeRequest('move');}finally{b.prng=prng;}}
 return output(b,combat,start,run);
}
function appendOwnedPokemon(b,combat,run,mon){
 if(b.p1.pokemon.length>=24)throw Error('현재 전투 구간의 파티 교체가 너무 많습니다. 다음 구간에서 다시 시도하세요.');
 const input=set(mon,b.p1.pokemon.length);b.p1.team.push(input);const p=b.p1.addPokemon(input);if(!p)throw Error('파티에 포켓몬을 추가하지 못했습니다.');sourceStats(p,mon,{initial:true});prepareNativePokemon(p,combat,run);return p;
}
function resolveCaptureItemTurn(b,combat){
 if(b.ended)return;b.makeRequest('move');const cpu=aiInput(b,combat);b.p1.clearChoice();for(let slot=0;slot<b.p1.active.length;slot++)b.p1.choice.actions.push({choice:'pass'});if(!b.choose('p2',cpu))throw Error(b.p2.choice.error||'상대의 행동을 처리하지 못했습니다.');
}
export function attemptClassicEscape(run,{system=null,rng=Math.random}={}){
 if(run.encounter?.trainer||run.encounter?.kind==='final'||run.biome===50)throw Error('이 전투에서는 도망칠 수 없습니다.');
 const combat=structuredClone(run.combat);combat.teams[0]=structuredClone(run.party);
 const b=restore(combat,run,system),start=b.log.length,req=request(b,0,combat.teams);
 if(b.ended||req.kind!=='move')throw Error('먼저 싸울 포켓몬을 내보내세요.');
 const allies=b.p1.active.filter(p=>p?.hp),foes=b.p2.active.filter(p=>p?.hp);if(!allies.length||!foes.length)throw Error('도망칠 수 있는 전투가 아닙니다.');
 const hasRunAway=allies.some(p=>p.hasAbility('runaway'));
 if(!hasRunAway&&allies.some((p,i)=>b.p1.activeRequest?.active?.[b.p1.active.indexOf(p)]?.trapped&&!p.hasType('Ghost')))throw Error('붙잡혀 있어 도망칠 수 없습니다.');
 const totalSpeed=list=>list.reduce((sum,p)=>sum+Math.max(1,p.getStat('spe')),0),boss=foes.some(p=>(sourceMon(combat,p)?.rogueBossSegments||0)>1||sourceMon(combat,p)?.rogueBoss),tries=Number.isSafeInteger(run.escapeAttempts)?run.escapeAttempts:0;
 const ratio=totalSpeed(allies)/Math.max(1,totalSpeed(foes)),max=boss?25:95,cap=boss?6:4,bonus=boss?2:10,chance=hasRunAway?100:Math.max(5,Math.min(max,Math.round((max-5)/cap*ratio+5+bonus*tries)));
 run.escapeAttempts=tries+1;const escaped=rng()*100<chance;b.add('message',escaped?'무사히 도망쳤다!':'도망칠 수 없었다!');
 if(!escaped)resolveCaptureItemTurn(b,combat);
 return {escaped,combat:output(b,combat,start,run)};
}
export function captureClassicCombat(run,ballId,{system=null,targetBoxId=null,rng=Math.random}={}){
 const multipliers={pokeball:1,greatball:1.5,ultraball:2,rogueball:3,masterball:-1};if(!Object.hasOwn(multipliers,ballId)||!(run.balls[ballId]>0))throw Error('사용할 볼이 없습니다.');if(run.encounter.trainer)throw Error('트레이너의 포켓몬은 포획할 수 없습니다.');
 if(run.encounter.kind==='final'&&classicStarterRecords.filter(s=>system?.dex?.[s.sourceId]?.caught).length<classicStarterRecords.length-1)throw Error('최종 보스의 포획에는 다른 스타터 전부의 포획·부화 기록이 필요합니다.');
 const combat=structuredClone(run.combat);combat.teams[0]=structuredClone(run.party);const before=structuredClone(combat.teams),b=restore(combat,run,system),start=b.log.length,targets=b.p2.active.filter(p=>p?.hp&&!p.m.captured);
 if(!targets.length)throw Error('포획할 수 있는 야생 포켓몬이 없습니다.');if(run.biome===50&&run.encounter.kind!=='final'&&targets.some(p=>{const mon=sourceMon(combat,p);return !system?.dex?.[mon?.rogueSourceId]?.caught;}))throw Error('엔드 지역에서는 이전에 포획 기록이 있는 포켓몬만 잡을 수 있습니다.');if(targets.length>1&&!targetBoxId)throw Error('볼을 던질 포켓몬을 선택하세요.');const target=targets.find(p=>!targetBoxId||token(p)===targetBoxId);if(!target)throw Error('포획 대상을 확인하세요.');
 const original=sourceMon(combat,target),segments=original.rogueBossSegments||0,bossIndex=target.m.rogueBossIndex??classicBossIndex(target.hp,target.maxhp,segments),masterBypass=ballId==='masterball'&&(run.encounter.kind!=='final'||!run.challenges?.length);if(segments>1&&bossIndex>0&&!masterBypass&&!target.hasAbility('wonderguard'))throw Error('보스의 마지막 HP 구간에서 포획할 수 있습니다.');if(request(b,0,combat.teams).kind!=='move')throw Error('먼저 싸울 포켓몬을 내보내세요.');
 const caughtMon=syncNativeTeams(b,combat.teams)[1].find(p=>p.boxId===original.boxId),caughtSpecies=Object.values(system?.dex||{}).filter(d=>d.caught).length,{caught,shakes,critical}=attemptClassicCapture(caughtMon,ballId,{caughtSpecies},rng);run.balls[ballId]--;
 let owned=null,autoAdded=false;
 b.add('message',caught?caughtMon.name+'을(를) 잡았다!':'포켓몬이 볼에서 빠져나왔다!');
 if(caught){
  owned={...caughtMon,rogueStatusState:savedClassicStatusState(target),boxId:crypto.randomUUID(),originEnemyBoxId:original.boxId,origin:'capture',originBall:ballId,rogueMetBiome:run.biome,rogueWasBoss:!!original.rogueBoss||segments>1,rogueBoss:false,rogueBossSegments:0,captured:false};
  run.party=syncNativeTeams(b,combat.teams)[0];capturedStub(b,target);
  if(run.party.length<6){run.party.push(owned);combat.teams[0]=structuredClone(run.party);appendOwnedPokemon(b,combat,run,owned);autoAdded=true;}
  run.expNotices=[...(run.expNotices||[]),...awardClassicExperience(run,[caughtMon],{system,weather:b.rogueFog?'fog':b.field.weather||''})];
  for(const mon of run.party){const p=b.p1.pokemon.find(p=>token(p)===String(mon.boxId));if(p){const hp=p.hp;sourceStats(p,mon);p.hp=Math.min(p.maxhp,mon.hp);if(p.hp>hp)b.add('-heal',p,p.getHealth,'[from] level up');}}
  if(b.p2.pokemonLeft===0){b.win(b.p1);if(b.rogueWild)b.rogueWild.settledEncounterId=b.rogueWild.encounterId;}else if(!autoAdded)combat.captureTurnPending=true;
 }
 if(!combat.captureTurnPending)resolveCaptureItemTurn(b,combat);
 const result=output(b,combat,start,run);result.before=before;result.events.unshift({kind:'capture',side:1,boxId:original.boxId,targetBoxId:original.boxId,targetSide:1,activeSlot:b.p2.active.indexOf(target),ballId,shakes,caught,critical,type:'normal',category:'status',hit:false,text:caught?caughtMon.name+' 포획 성공!':'볼에서 빠져나왔다!'});
 return {combat:result,caught:owned,autoAdded,shakes};
}
// Persist an evolution into the in-progress native battle without consuming a
// turn or re-triggering switch-in abilities. New Shedinja is added as a reserve.
export function reconcileClassicEvolution(run,{system=null}={}){
 if(!run.combat?.snapshot)return null;const combat=structuredClone(run.combat);combat.teams[0]=structuredClone(run.party);
 const b=restore(combat,run,system),start=b.log.length;for(const mon of run.party)if(!b.p1.pokemon.some(p=>token(p)===String(mon.boxId)))appendOwnedPokemon(b,combat,run,mon);
 if(!b.ended&&b.requestState){const requested=b.sides.map(s=>s.activeRequest!==null),prng=b.prng.clone(),requests=b.getRequests(b.requestState);b.sides.forEach((side,i)=>side.activeRequest=requested[i]?requests[i]:null);b.prng=prng;}
 return output(b,combat,start,run);
}
export function reconcileClassicCaptureParty(run,nextParty,{system=null}={}){
 const combat=structuredClone(run.combat);combat.teams[0]=structuredClone(nextParty);run.party=nextParty;const b=restore(combat,run,system),start=b.log.length,ids=new Set(nextParty.map(p=>String(p.boxId))),activeReplaced=[];
 for(const p of b.p1.pokemon)if(!ids.has(token(p))&&!p.m.released){const slot=b.p1.active.indexOf(p);if(slot>=0)activeReplaced.push(slot);const alive=p.hp>0;p.m.released=true;p.hp=0;p.fainted=true;p.isActive=false;p.isStarted=false;p.faintQueued=false;p.switchFlag=false;p.forceSwitchFlag=false;if(alive)b.p1.pokemonLeft--;b.queue.cancelAction(p);b.singleEvent('End',p.getAbility(),p.abilityState,p);b.singleEvent('End',p.getItem(),p.itemState,p);p.clearVolatile();p.status='fnt';}
 const added=[];for(const mon of nextParty)if(!b.p1.pokemon.some(p=>token(p)===String(mon.boxId)))added.push(appendOwnedPokemon(b,combat,run,mon));
 for(const slot of activeReplaced){const p=added.shift()||b.p1.pokemon.find(p=>p.hp&&!p.isActive&&!p.m.released);if(!p)continue;if(!b.actions.switchIn(p,slot))throw Error('새 파티원을 내보내지 못했습니다.');if(!b.ended){const queued=b.queue.list.findIndex(a=>a.choice==='runSwitch'&&a.pokemon===p);if(queued>=0)b.queue.list.splice(queued,1);b.actions.runSwitch(p);}else{b.roguePlayerStarts||=[];b.roguePlayerStarts.push(token(p));}}
 if(combat.captureTurnPending){delete combat.captureTurnPending;resolveCaptureItemTurn(b,combat);}else if(!b.ended){const hasReplacement=b.p1.pokemon.some(p=>p.hp>0&&!p.isActive&&!p.m.released),needsReplacement=hasReplacement&&b.p1.active.some(p=>!!p?.switchFlag);b.makeRequest(needsReplacement?'switch':'move');}
 return output(b,combat,start,run);
}
export {restore as restoreClassicNativeBattle,snapshot as snapshotClassicNativeBattle};
