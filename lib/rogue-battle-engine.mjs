import {syncClassicKeldeoMoveForm} from './rogue-transformations.mjs';
import {installClassicCalledMovePolicy} from './rogue-called-move-policy.mjs';
import {classicAiMatchupScore,classicAiHazardMultiplier,classicAiSwitchDecision,classicAiTieIndex,classicAiTypeMultiplier} from './rogue-ai-matchup.mjs';
import {installClassicAutomaticForms,resetClassicAutomaticForm} from './rogue-automatic-forms.mjs';
import {installClassicNaturePower} from './rogue-nature-power.mjs';
import {classicCanReceiveHeldItem} from './rogue-held-item-cap.mjs';
import {classicModifierLabel,classicMovableNativeItem} from './rogue-classic-rewards.mjs';
import {chooseClassicRankedMove,chooseClassicTiedTarget} from './rogue-ai-selection.mjs';
import {applyClassicPokemonChallenges} from './rogue-challenge-pokemon.mjs';
import {classicNativeMegaSpecies} from './rogue-native-form.mjs';
import {installClassicZygarde,resetClassicZygarde,classicBattleSourceForm} from './rogue-zygarde.mjs';
import {classicBallType} from './rogue-ball-types.mjs';
import {classicPreventRevive,classicCatchJoinAllowed} from './rogue-challenge-rules.mjs';
import {installClassicInverseBattle,prepareClassicInversePokemon,prepareClassicFlippedPokemon} from './rogue-challenge-battle.mjs';
import {installClassicPartnerOwnership} from './rogue-partner-trainers.mjs';
import {classicChallengeBattleEligibility} from './rogue-challenge-eligibility.mjs';
import {installClassicBallFetch} from './rogue-field-abilities.mjs';
import {installClassicLootLedger} from './rogue-loot-ledger.mjs';
import {installClassicBerries,classicBerryMax} from './rogue-battle-berries.mjs';
import {installClassicMoveBalance} from './rogue-move-balance.mjs';
import {moveDetails} from './move-description.mjs';
import zMoveNames from '../data/rogue-zmove-names.json' with {type:'json'};
import {Battle,PRNG,Dex} from '@pkmn/sim';
import {nativeTeamSet,syncNativeTeams} from './party-battle.mjs';
import {battleLines,battleVisuals} from './full-battle.mjs';
import {rules,moveNameByKey,calculateStats,classicEffectiveBaseStats} from './pokemon-config.mjs';
import {classicWaveMoney,classicMoneyGain} from './rogue-classic-rules.mjs';
import {moves} from './game.mjs';
import {installClassicAbilityBalance} from './rogue-ability-balance.mjs';
import {installClassicStellarAdaptability} from './rogue-stellar-adaptability.mjs';
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
function reconcileLivingCounts(b){for(const side of b.sides)side.pokemonLeft=side.pokemon.filter(p=>p.hp>0&&!p.fainted&&!p.m?.released&&!p.m?.captured&&(!b.rogueChallengeAllowed||side.n!==0||b.rogueChallengeAllowed(p))).length;}
function savedClassicStatusState(p){if(p?.status==='frz'){const turns=p.statusState?.rogueFreezeTurns;return {kind:'frz',turns:Number.isInteger(turns)&&turns>=1&&turns<=3?turns:3};}const time=p?.status==='slp'?p.statusState?.time:null;if(!Number.isInteger(time)||time<1||time>5)return null;const start=Number.isInteger(p.statusState.startTime)&&p.statusState.startTime>=time&&p.statusState.startTime<=5?p.statusState.startTime:time;return {kind:'slp',time,startTime:start};}
function fogWeatherSuppressed(battle){return battle.field.suppressingWeather();}
function set(mon,i){const happiness=Number.isFinite(mon.friendship)?Math.max(0,Math.min(255,Math.floor(mon.friendship))):undefined;return {...nativeTeamSet(mon,i),species:mon.rogueBattleSpecies||rules.species[mon.id].key,teraType:types[mon.teraType]||mon.teraType||types[mon.types?.[0]],...(happiness===undefined?{}:{happiness})};}
function sourceMon(combat,p){return combat.teams[p.side.n].find(m=>String(m.boxId)===token(p));}
const enemyReviveEligible=mon=>!!mon&&!mon.rogueBoss&&!(Number(mon.rogueBossSegments)>1);
function sourceStats(p,mon,{initial=false,forceSpecies=false}={}){
 if(!mon)return;
 mon=classicBattleSourceForm(p,mon);
 const expected=mon.rogueBattleSpecies||rules.species[mon.id]?.key;
 if((initial||forceSpecies)&&expected&&p.species.id!==expected){const form=p.battle.dex.species.get(expected);if(form.exists){p.setSpecies(form);p.baseSpecies=form;p.details=p.getUpdatedDetails();}}
 if(!p.transformed&&p.species.id===expected){
  p.level=mon.level;p.set.level=mon.level;
  const form=classicNativeMegaSpecies(new p.battle.dex.Species({...p.species,baseStats:mon.rogueFusionRule==='preview-v1'||mon.rogueFlipStats===true?classicEffectiveBaseStats(mon):mon.rogueBaseStats||p.species.baseStats,types:mon.rogueTypes?.map(t=>types[t]||t)||p.species.types}),mon);
  // Source form types are independent of the simulator's held Plate/Memory slot.
  if(p.battle.rogueSourceTypedForm?.(p))form.onType=types=>types;
  if(mon.rogueFlipStats)Object.defineProperty(form,'rogueUnflippedBaseStats',{configurable:true,enumerable:true,value:{...(mon.rogueBaseStats||p.species.baseStats)}});
  p.species=form;if(initial||p.baseSpecies.id===expected)p.baseSpecies=form;
  if(initial||forceSpecies)p.setType(form.types,true);
  const stats=calculateStats(mon);p.storedStats={...stats};delete p.storedStats.hp;p.baseStoredStats={...p.storedStats};
  p.baseMaxhp=stats.hp;p.maxhp=p.volatiles.dynamax&&p.baseSpecies.id!=='shedinja'?Math.floor(stats.hp*(1.5+p.dynamaxLevel*.05)):stats.hp;p.m.roguePermanentDynamax=String(mon.rogueFormKey||'').startsWith('gigantamax');p.updateSpeed();
 }
 if(initial){
  p.hp=Math.max(0,Math.min(p.maxhp,mon.hp));
  if(!p.hp&&!p.fainted){p.fainted=true;p.status='fnt';p.side.pokemonLeft--;}
  if(mon.status&&p.hp){p.status=statuses[mon.status]||mon.status;p.statusState=p.battle.initEffectState({id:p.status,target:p});if(p.status==='slp'){const stored=mon.rogueStatusState,time=stored?.kind==='slp'&&Number.isInteger(stored.time)&&stored.time>=1&&stored.time<=(mon.rogueMysterySleep?6:5)?stored.time:(p.battle.randomChance(1,3)?2:3),start=Number.isInteger(stored?.startTime)&&stored.startTime>=time&&stored.startTime<=(mon.rogueMysterySleep?6:5)?stored.startTime:time;p.statusState.time=time;p.statusState.startTime=start;}if(p.status==='frz'){const stored=mon.rogueStatusState,turns=stored?.kind==='frz'&&Number.isInteger(stored.turns)&&stored.turns>=1&&stored.turns<=3?stored.turns:3;p.statusState.rogueFreezeTurns=turns;}if(p.status==='tox')p.statusState.stage=0;}
 }
 const learnedMoves=mon.moves.map(name=>p.battle.dex.moves.get(moves[name]?.key||name));
 if(initial&&(mon.rogueSketchRule==='source-v1'||mon.rogueTrainerSketch==='source-v1')||learnedMoves.length!==p.baseMoveSlots.length||learnedMoves.some((move,i)=>p.baseMoveSlots[i]?.id!==move.id)){const previous=p.battle.rogueLastResortHistoryRule&&!initial?(p.transformed?p.baseMoveSlots:p.moveSlots):[];p.set.moves=learnedMoves.map(m=>m.id);p.baseMoveSlots=learnedMoves.map((move,i)=>({move:move.name,id:move.id,pp:((mon.rogueSketchRule==='source-v1'||mon.rogueTrainerSketch==='source-v1')?mon.rogueSketchPP?.[i]:undefined)??mon.pp?.[move.id]??classicMaxPP(mon,i,p.battle),maxpp:classicMaxPP(mon,i,p.battle),target:move.target,disabled:false,disabledSource:'',used:previous.some(slot=>slot.id===move.id&&slot.used===true)||!!(p.battle.rogueLastResortSourceLedger&&!initial&&Array.isArray(p.m.rogueDirectMoveHistory)&&p.m.rogueDirectMoveHistory.includes(move.id))}));if(!p.transformed)p.moveSlots=p.baseMoveSlots.map(m=>({...m}));}
 for(const [index,slot]of p.baseMoveSlots.entries()){
  const max=classicMaxPP(mon,index,p.battle);slot.maxpp=max;
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
// Native Pokemon construction grants Tera by default, including newly caught
// party members and foes appended at a continuous wild boundary. Reapply the
// game's access rules when adding/restoring any member, not just at battle start.
function applyClassicTeraAccess(p,combat,run){
 const owned=p.side.n===0,allowed=owned?(run?run.tools?.teraOrb&&run.teraCharged:combat.teraOrb&&combat.teraCharged):combat.trainer&&sourceMon(combat,p)?.rogueInstantTera;
 const blocked=!allowed||p.terastallized||p.side.pokemon.some(ally=>ally.terastallized)||p.species.isMega||p.species.isPrimal||p.species.forme==='Ultra'||p.m.roguePermanentDynamax;
 if(blocked)p.canTerastallize=null;
 else if(p.canTerastallize!==false)p.canTerastallize=p.battle.actions.canTerastallize(p);
}
function prepareNativePokemon(p,combat,run){
 p.battle.rogueInstallTeraShell?.(p);
 // Source canTransformInto excludes either participant if fused. Bind this to
 // the individual battle instance so Transform and Imposter share the guard.
 if((run?.dnaFusionRule||combat.dnaFusionRule)==='source-subset-v1'){const nativeTransform=p.transformInto;Object.defineProperty(p,'transformInto',{configurable:true,enumerable:false,value(target,...args){
  if(sourceMon(combat,this)?.fusionSpecies||target&&sourceMon(combat,target)?.fusionSpecies)return false;
  // The native simulator adds Tera-specific Transform restrictions absent
  // from source canTransformInto. Mask them only during its initial guard;
  // restore both real states before species, type or ability effects execute.
  const userTera=this.terastallized,targetTera=target?.terastallized,guard=userTera==='Stellar'||(['Ogerpon','Terapagos'].includes(target?.species?.baseSpecies)&&!!(userTera||targetTera));
  if(!guard||!target||target===this)return nativeTransform.call(this,target,...args);
  const originalSet=this.setSpecies,descriptor=Object.getOwnPropertyDescriptor(this,'setSpecies');let restored=false;const restoreTera=()=>{if(restored)return;restored=true;this.terastallized=userTera;target.terastallized=targetTera;};this.terastallized=null;target.terastallized=null;
  Object.defineProperty(this,'setSpecies',{configurable:true,enumerable:false,value(...setArgs){restoreTera();return originalSet.apply(this,setArgs);}});
  try{return nativeTransform.call(this,target,...args);}finally{restoreTera();if(descriptor)Object.defineProperty(this,'setSpecies',descriptor);else delete this.setSpecies;}
 }});}
 applyClassicTeraAccess(p,combat,run);
 prepareClassicInversePokemon(p);
 prepareClassicFlippedPokemon(p,sourceMon(combat,p));
 // PokéRogue's ordinary damaging binds use 1/8 max HP per residual turn.
 const nativeAddVolatile=p.addVolatile;Object.defineProperty(p,'addVolatile',{configurable:true,enumerable:false,value(status,...args){const result=nativeAddVolatile.call(this,status,...args),id=typeof status==='string'?this.battle.toID(status):status?.id,v=this.volatiles?.partiallytrapped;if(id==='partiallytrapped'&&v&&classicBindingMoves.has(classicBindingId(v.sourceEffect)))v.boundDivisor=8;return result;}});
 // Some fixed mystery-trainer native items represent explicitly nontransferable
 // source modifiers. Self-use still works; opponents cannot remove or take them.
 const originalTakeItem=p.takeItem;Object.defineProperty(p,'takeItem',{configurable:true,enumerable:false,value(source){
  const mon=sourceMon(combat,this),effect=this.battle.effect?.id;
  if(mon?.rogueNativeItemNontransferable&&((source&&source!==this)||(!source&&effect==='knockoff')))return false;
  // Block acquisition before removing the donor item; item destruction such
  // as Knock Off/Corrosive Gas must remain independent of the attacker's cap.
  if(source&&source!==this){
   const swaps=['trick','switcheroo'].includes(effect);
   if((swaps||['thief','covet','magician','pickpocket'].includes(effect))&&!classicCanReceiveHeldItem(this.item,combat.modifiers,token(source),swaps?'':source.item))return false;
   if(swaps&&!classicCanReceiveHeldItem(source.item,combat.modifiers,token(this),''))return false;
  }
  if(!source&&['bestow','symbiosis'].includes(effect)){
   const recipient=this.battle.event?.target;
   if(recipient?.set&&recipient!==this&&!classicCanReceiveHeldItem(this.item,combat.modifiers,token(recipient),recipient.item))return false;
  }
  return originalTakeItem.call(this,source);
 }});
 if(p.side.n===0){const nativeRequest=p.getDynamaxRequest;Object.defineProperty(p,'getDynamaxRequest',{configurable:true,enumerable:false,value(skipChecks){if(!skipChecks&&(this.terastallized||this.m.roguePermanentDynamax||this.species.isMega||this.species.isPrimal||this.species.forme==='Ultra'))return;return nativeRequest.call(this,skipChecks);}});}
 const source=sourceMon(combat,p),sketchRule=source?.rogueSketchRule==='source-v1'||source?.rogueTrainerSketch==='source-v1';if(sketchRule||p.battle.rogueLastResortSourceLedger){
  const deduct=p.deductPP;Object.defineProperty(p,'deductPP',{configurable:true,enumerable:false,value(move,...args){
   const id=this.battle.dex.moves.get(move).id;if(sketchRule&&!this.transformed&&id==='sketch'){const first=this.moveSlots.findIndex(s=>s.id==='sketch'),usable=this.moveSlots.findIndex(s=>s.id==='sketch'&&s.pp>0);if(first>=0&&usable>first&&this.moveSlots[first].pp<=0){for(const slots of new Set([this.moveSlots,this.baseMoveSlots]))[slots[first],slots[usable]]=[slots[usable],slots[first]];}}
   const result=deduct.call(this,move,...args);if(result>0&&this.battle.rogueLastResortSourceLedger){const history=Array.isArray(this.m.rogueDirectMoveHistory)?this.m.rogueDirectMoveHistory:[];if(!history.includes(id))history.push(id);this.m.rogueDirectMoveHistory=history;}return result;
  }});
 }
 if(p.battle.rogueLastResortHistoryRule){const nativeTransform=p.transformInto;Object.defineProperty(p,'transformInto',{configurable:true,enumerable:false,value(...args){const used=new Set(this.moveSlots.filter(slot=>slot.used).map(slot=>slot.id));if(this.battle.rogueLastResortSourceLedger&&Array.isArray(this.m.rogueDirectMoveHistory))for(const id of this.m.rogueDirectMoveHistory)used.add(id);const result=nativeTransform.apply(this,args);if(result)for(const slot of this.moveSlots)if(used.has(slot.id))slot.used=true;return result;}});}
 prepareBossPokemon(p,combat);const native=p.setSpecies;Object.defineProperty(p,'setSpecies',{configurable:true,enumerable:false,value(...args){const value=native.apply(this,args);sourceStats(this,run?.party?.find(m=>String(m.boxId)===token(this))||sourceMon(combat,this));return value;}});
}
const classicBindingMoves=new Set(['bind','wrap','firespin','whirlpool','clamp','sandtomb','magmastorm','snaptrap','thundercage','infestation']);
function classicBindingId(effect){if(typeof effect==='string')return /^\[(?:DataMove|Move):([a-z0-9]+)\]$/.exec(effect)?.[1]||effect;return effect?.id;}
function releaseClassicBindings(b,source){for(const side of b.sides)for(const p of side.pokemon){const v=p.volatiles?.partiallytrapped;if(v?.source===source&&classicBindingMoves.has(classicBindingId(v.sourceEffect)))p.removeVolatile('partiallytrapped');}}
function capturedStub(b,p){releaseClassicBindings(b,p);p.m.captured=true;p.hp=0;p.fainted=true;p.faintQueued=false;p.isActive=false;p.isStarted=false;p.switchFlag=false;p.forceSwitchFlag=false;b.p2.pokemonLeft=Math.max(0,b.p2.pokemonLeft-1);b.queue.cancelAction(p);b.singleEvent('End',p.getAbility(),p.abilityState,p);b.singleEvent('End',p.getItem(),p.itemState,p);p.clearVolatile();p.status='fnt';}
function install(b,combat,run=null,system=null){
 if(combat.poltergeistRule==='source-subset-v1'||combat.knockOffRule==='source-subset-v1'||combat.incinerateRule==='source-subset-v1'){
  Object.defineProperty(b,'rogueTransferableHeldItems',{configurable:true,enumerable:false,value(target){if(!target?.set)return [];const items=combat.modifiers.filter(m=>String(m.boxId)===token(target)&&Number.isSafeInteger(m.count)&&m.count>0&&m.transferable!==false).map(modifier=>({kind:'modifier',modifier,name:classicModifierLabel(modifier)}));const mon=sourceMon(combat,target),item=target.getItem();if(target.item&&!mon?.rogueNativeItemNontransferable&&!item.zMove&&!item.isPrimalOrb&&classicMovableNativeItem(item))items.push({kind:'native',item,name:rules.items[item.id]?.name||'알 수 없는 도구'});return items;}});
  Object.defineProperty(b,'roguePoltergeistTargetItem',{configurable:true,enumerable:false,value(target){return this.rogueTransferableHeldItems(target)[0]||null;}});
 }
 if(combat.incinerateRule==='source-subset-v1')Object.defineProperty(b,'rogueIncinerateBerry',{configurable:true,enumerable:false,value(target,source){
  if(!target?.set||target.hasAbility('stickyhold'))return null;
  const owned=run&&target.side.n===0?(run.party||[]).find(m=>String(m.boxId)===token(target)):null;
  const savedMatch=entry=>{if(!run||target.side.n!==0)return null;const keys=Object.keys(entry);return (run.modifiers||[]).find(m=>{if(!m||typeof m!=='object')return false;for(const key of new Set([...keys,...Object.keys(m)])){if(key==='count'){if(m.count!==entry.count)return false;}else if(JSON.stringify(m[key])!==JSON.stringify(entry[key]))return false;}return true;})||null;};
  const options=this.rogueTransferableHeldItems(target).filter(entry=>entry.kind==='modifier'?!!classicBerryMax(entry.modifier.id):!!entry.item.isBerry).map(entry=>({...entry,saved:entry.kind==='modifier'?savedMatch(entry.modifier):null})).filter(entry=>!run||target.side.n!==0||(entry.kind==='modifier'?!!entry.saved:!!owned&&owned.item===target.item));if(!options.length)return null;
  const selected=this.sample(options);if(selected.kind==='modifier'){
   selected.modifier.count--;if(selected.saved){selected.saved.count--;if(!selected.saved.count)run.modifiers=run.modifiers.filter(m=>m!==selected.saved);}
  }else{if(!target.takeItem(source))return null;if(owned)owned.item=target.item;}
  return selected.name;
 }});
 b.rogueLastResortSourceLedger=(run?.lastResortHistoryRule||combat.lastResortHistoryRule)==='source-v2';b.rogueLastResortHistoryRule=b.rogueLastResortSourceLedger||(run?.lastResortHistoryRule||combat.lastResortHistoryRule)==='source-v1';b.rogueZippyPpRule=(run?.zippyPpRule||combat.zippyPpRule)==='source-v1';b.rogueSourceMovePpRule=(run?.sourceMovePpRule||combat.sourceMovePpRule)==='source-v1';
 if(b.rogueLastResortSourceLedger)b.onEvent('SwitchIn',b.format,{priority:1000},function(p){if(p?.m)delete p.m.rogueDirectMoveHistory;});
 if(combat.challengeEligibilityRule==='source-subset-v1'){const challenges=combat.challengeRestrictions;Object.defineProperty(b,'rogueChallengeEligibility',{configurable:true,enumerable:false,value(p,hp=p.hp){const mon=(run?.party||combat.teams[0]).find(m=>String(m.boxId)===token(p));return mon?classicChallengeBattleEligibility({...mon,hp},challenges):null;}});Object.defineProperty(b,'rogueChallengeAllowed',{configurable:true,enumerable:false,value(p){return this.rogueChallengeEligibility(p)===true;}});}
 Object.defineProperty(b,'rogueChallengeRestrictions',{configurable:true,enumerable:false,value:combat.challengeRestrictions||[]});
 b.rogueClassicZRing=!!combat.zRing;
 if(b.rogueClassicDynamaxVersion!==1){b.p1.dynamaxUsed=false;b.rogueClassicDynamaxVersion=1;}
 Object.defineProperty(b.p1,'canDynamaxNow',{configurable:true,enumerable:false,value(){return !!combat.dynamaxBand&&!this.dynamaxUsed;}});
 const descriptor={version:2,pokemon:combat.teams.flatMap((team,side)=>team.filter(p=>p.roguePassiveAbility).map(p=>({side,token:String(p.boxId),passive:p.roguePassiveAbility})))};
 installClassicAbilityBalance(b,combat,run);
 installClassicZygarde(b,combat,run,{sourceMon:p=>(p.side.n===0?run?.party:null)?.find(m=>String(m.boxId)===token(p))||sourceMon(combat,p),applyStats:sourceStats});
 installClassicAutomaticForms(b,combat,run,{sourceMon:p=>(p.side.n===0?run?.party:null)?.find(m=>String(m.boxId)===token(p))||sourceMon(combat,p),applyStats:sourceStats});
 if((run?.stakeoutRule||combat.stakeoutRule)==='source-subset-v1')b.onEvent('BeforeSwitchIn',b.format,{priority:102},function(p){if(p?.m)delete p.m.rogueStakeoutInitialTurn;});
 const abilities=bindAbilityComponents(b,descriptor);bindings.set(b,abilities);
 installClassicMoveBalance(b,combat,run);
 installClassicCalledMovePolicy(b,combat);
 installClassicNaturePower(b,combat);
 installClassicStellarAdaptability(b,combat,run);
 installClassicInverseBattle(b,combat);
 if(classicPreventRevive(combat))b.onEvent('DisableMove',b.format,{priority:100},function(p){if(p.side.n===0)p.disableMove('revivalblessing');});
 // Source special attack-stat moves use the selected stat owner's modifiers.
 // Foul Play's source attribute passes the target itself as the stat opponent.
 const sourceBodyPress=(run?.bodyPressStatRule||combat.bodyPressStatRule)==='source-subset-v1',sourceFoulPlay=(run?.foulPlayStatRule||combat.foulPlayStatRule)==='source-subset-v1';
 let bodyPressStatOwner=null;
 if(sourceBodyPress||sourceFoulPlay){const nativeRunEvent=b.runEvent;Object.defineProperty(b,'runEvent',{configurable:true,enumerable:false,value(event,target,source,effect,relay,...args){if(sourceFoulPlay&&event==='ModifyAtk'&&effect?.id==='foulplay'&&source?.set)return nativeRunEvent.call(this,event,source,source,effect,relay,...args);if(!sourceBodyPress||event!=='ModifyAtk'||effect?.id!=='bodypress')return nativeRunEvent.call(this,event,target,source,effect,relay,...args);const previous=bodyPressStatOwner;bodyPressStatOwner=target;try{return nativeRunEvent.call(this,'ModifyDef',target,source,effect,relay,...args);}finally{bodyPressStatOwner=previous;}}});}
 // Source Pollen Puff is a healing move for Triage, including offensive use.
 if((run?.triageRule||combat.triageRule)==='source-subset-v1')b.onEvent('ModifyPriority',b.format,{priority:0},function(priority,p,target,move){if(move?.id==='pollenpuff'&&!move.flags?.heal&&p?.hasAbility('triage'))return priority+3;});
 // The pinned source uses the pre-Gen-9 Protean/Libero rule for every move.
 // Reset only the simulator's once-per-switch latch; its own callback still
 // handles suppression, move exclusions, type changes, and transformations.
 if((run?.proteanRule||combat.proteanRule)==='source-subset-v1')b.onEvent('PrepareHit',b.format,{priority:100},function(p,target,move){if(!p?.set)return;for(const id of ['protean','libero']){for(const state of [p.ability===id?p.abilityState:null,p.volatiles?.['roguepassive:'+id]?.nativeState])if(state){if(move?.id==='struggle')state[id]=true;else delete state[id];}}});
 installClassicBallFetch(b,combat,run);
 installClassicLootLedger(b,combat,run);
 const nativeFindEventHandlers=b.findEventHandlers;Object.defineProperty(b,'findEventHandlers',{configurable:true,enumerable:false,value(target,eventName,...args){const handlers=nativeFindEventHandlers.call(this,target,eventName,...args);return eventName==='BeforeMove'?handlers.filter(handler=>!(handler.effect?.effectType==='Status'&&handler.effect.id==='par')):handlers;}});
 const nativePokemonHandlers=b.findPokemonEventHandlers;Object.defineProperty(b,'findPokemonEventHandlers',{configurable:true,enumerable:false,value(pokemon,callbackName,...args){const handlers=nativePokemonHandlers.call(this,pokemon,callbackName,...args);return callbackName==='onResidual'?handlers.filter(handler=>!['pickup','roguepassive:pickup'].includes(handler.effect?.id)):handlers;}});
 b.onEvent('BeforeMove',b.format,{priority:1},function(pokemon,target,move){if(this.rogueCalledMoveRelease?.(pokemon,move))return;if(pokemon.status==='par'&&this.randomChance(1,8)){this.add('cant',pokemon,'par');return false;}});
 b.onEvent('TryMove',b.format,{priority:1},function(pokemon,target,move){if((run?.auroraVeilWeatherRule||combat.auroraVeilWeatherRule)==='source-v1'&&move?.id==='auroraveil'&&pokemon.hasAbility('megasol')){this.add('-fail',pokemon);return false;}});
 b.onEvent('TryMove',b.format,{priority:1},function(pokemon,target,move){if(move?.id!=='revivalblessing')return;if(pokemon.side.n===0&&classicPreventRevive(combat)){this.add('-fail',pokemon);return false;}if(pokemon.side.n!==1)return;if(!combat.trainer||!pokemon.side.pokemon.some(p=>p.fainted&&!p.m?.released&&!p.m?.captured&&enemyReviveEligible(sourceMon(combat,p)))){this.add('-fail',pokemon);return false;}});
 // Source Dark Void keeps its pre-Gen-7 accuracy and has no species restriction.
 b.rogueDarkVoidRule=(run?.darkVoidRule||combat.darkVoidRule)==='source-subset-v1';
 if(b.rogueDarkVoidRule)b.onEvent('ModifyMove',b.format,{priority:100},function(move){if(move?.id==='darkvoid'){move.accuracy=80;move.onTry=()=>{};}});
 // The source allows Hyperspace Fury regardless of the user's species.
 if((run?.moveBalanceRule||combat.moveBalanceRule)==='source-subset-v2')b.onEvent('ModifyMove',b.format,{priority:100},function(move){if(move?.id==='hyperspacefury')move.onTry=()=>{};});
 // The simulator's post-action switch loop dereferences empty doubles slots.
 // Skip nulls only during native action iteration; indexed slots and snapshots stay unchanged.
 const nativeRunAction=b.runAction;Object.defineProperty(b,'runAction',{configurable:true,enumerable:false,value(action){const arrays=this.sides.map(side=>side.active),patched=[];for(const active of arrays)if(active.some(p=>p==null)){const previous=Object.getOwnPropertyDescriptor(active,Symbol.iterator);Object.defineProperty(active,Symbol.iterator,{configurable:true,value:function*(){for(let i=0;i<this.length;i++)if(this[i]!=null)yield this[i];}});patched.push({active,previous});}try{return nativeRunAction.call(this,action);}finally{for(const {active,previous} of patched){if(previous)Object.defineProperty(active,Symbol.iterator,previous);else delete active[Symbol.iterator];}}}});
 // Native getChoiceIndex dereferences empty active slots. Auto-pass those slots
 // in either position while preserving normal choice indexing and switch flags.
 for(const side of b.sides){const nativeChoiceIndex=side.getChoiceIndex;Object.defineProperty(side,'getChoiceIndex',{configurable:true,enumerable:false,value(isPass){if(!this.active.some(p=>p==null)||!['move','switch'].includes(this.requestState))return nativeChoiceIndex.call(this,isPass);let index=this.choice.actions.length;if(!isPass)while(index<this.active.length){const p=this.active[index],skip=!p||(this.requestState==='move'&&(p.fainted||p.volatiles.commanding))||(this.requestState==='switch'&&!p.switchFlag);if(!skip)break;if(!this.choosePass())break;index++;}return index;}});}
 // The native pass parser expects a Pokémon object even for an empty doubles slot.
 for(const side of b.sides){const nativePass=side.choosePass;Object.defineProperty(side,'choosePass',{configurable:true,enumerable:false,value(){const index=this.getChoiceIndex(true);if(['move','switch'].includes(this.requestState)&&index<this.active.length&&!this.active[index]){this.choice.actions.push({choice:'pass'});return true;}return nativePass.call(this);}});}
 // Include inactive reserves whose team index overlaps an empty doubles position.
 const nativePossibleSwitches=b.possibleSwitches;Object.defineProperty(b,'possibleSwitches',{configurable:true,enumerable:false,value(side){const available=nativePossibleSwitches.call(this,side),queued=this.queue.getSwitches(side).map(action=>action.target);for(let i=0;i<Math.min(side.active.length,side.pokemon.length);i++){const p=side.pokemon[i];if(p&&!p.isActive&&p.hp>0&&!p.fainted&&!p.m?.captured&&!p.m?.released&&!queued.includes(p)&&!available.includes(p))available.push(p);}return side.n===0&&this.rogueChallengeAllowed?available.filter(p=>this.rogueChallengeAllowed(p)):available;}});
 // A newly recruited reserve may occupy the numeric index of an empty active slot.
 // Native chooseSwitch assumes every index below active.length is occupied.
 const nativePlayerSwitch=b.p1.chooseSwitch;Object.defineProperty(b.p1,'chooseSwitch',{configurable:true,enumerable:false,value(slotText){const slot=Number(slotText)-1,index=this.getChoiceIndex(),actor=this.active[index],target=this.pokemon[slot],revival=!!actor&&!!this.slotConditions[actor.position]?.revivalblessing;if(target&&this.battle.rogueChallengeAllowed&&(revival?this.battle.rogueChallengeEligibility(target,1)===null:!this.battle.rogueChallengeAllowed(target)))return this.emitChoiceError('교체할 수 없는 포켓몬입니다.');if(Number.isInteger(slot)&&slot>=0&&slot<this.active.length&&target&&!target.isActive&&actor&&!this.slotConditions[actor.position]?.revivalblessing&&['move','switch'].includes(this.requestState)){if(target.fainted||target.hp<=0||this.choice.switchIns.has(slot)||this.requestState==='move'&&actor.trapped)return this.emitChoiceError('교체할 수 없는 포켓몬입니다.');if(this.requestState==='move'&&actor.maybeTrapped)this.choice.cantUndo=true;if(this.requestState==='switch'){if(!this.choice.forcedSwitchesLeft)return this.emitChoiceError('교체할 차례가 아닙니다.');this.choice.forcedSwitchesLeft--;}this.choice.switchIns.add(slot);this.choice.actions.push({choice:this.requestState==='switch'?'instaswitch':'switch',pokemon:actor,target});return true;}return nativePlayerSwitch.call(this,slotText);}});
 Object.defineProperty(b,'checkFainted',{configurable:true,enumerable:false,value(){for(const side of this.sides){if(!this.canSwitch(side))continue;for(const pokemon of side.active)if(pokemon?.fainted){pokemon.status='fnt';pokemon.switchFlag=true;}}}});
 installClassicPartnerOwnership(b,combat);
 for(const side of b.sides)for(const p of side.pokemon)prepareNativePokemon(p,combat,run);
 const count=(id,owner)=>combat.modifiers.filter(m=>m.id===id&&(!owner||m.boxId===owner)).reduce((n,m)=>n+m.count,0);
 Object.defineProperty(b,'rogueBatonOwners',{configurable:true,enumerable:false,value:new Set(combat.modifiers.filter(m=>m.id==='baton'&&m.count>0).map(m=>String(m.boxId)))});
 // Source Baton turns a voluntary switch into a Baton Pass and follows its
 // recipient only when the recipient doesn't already have one.
 const nativeSwitchIn=b.actions.switchIn;
 Object.defineProperty(b.actions,'switchIn',{configurable:true,enumerable:false,value(p,pos,sourceEffect=null,isDrag){
  const old=p?.side?.active?.[pos],held=old?.hp>0&&combat.modifiers.find(m=>m.id==='baton'&&String(m.boxId)===token(old)&&m.count>0),manual=!!held&&!isDrag&&!sourceEffect&&!!b.rogueBatonPassTokens?.has(token(old));
  const pass=!!held&&!isDrag&&(manual||sourceEffect?.selfSwitch==='copyvolatile');
  const result=nativeSwitchIn.call(this,p,pos,manual?this.dex.moves.get('batonpass'):sourceEffect,isDrag);
  // PokéRogue resets summon data when a Pokémon enters after a switch.
  // Native Rage Fist otherwise retains the previous summon’s hit count.
  if(result&&old&&old!==p&&!old.isActive)releaseClassicBindings(b,old);
  if(result&&p?.side?.active?.[pos]===p)p.timesAttacked=0;
  if(pass&&result&&p.side.active[pos]===p&&!combat.modifiers.some(m=>m.id==='baton'&&String(m.boxId)===token(p)&&m.count>0)){
   held.boxId=token(p);b.rogueBatonOwners.delete(token(old));b.rogueBatonOwners.add(token(p));if(run&&p.side.n===0){const saved=run.modifiers.find(m=>m.id==='baton'&&String(m.boxId)===token(old)&&m.count>0);if(saved)saved.boxId=token(p);}
  }
  return result;
 }});
 const syncSoulDew=p=>{const n=combat.modifiers.filter(m=>m.id==='souldew'&&m.boxId===token(p)&&m.count>0).reduce((sum,m)=>sum+m.count,0),saved=run?.party?.find(m=>String(m.boxId)===token(p)),battleMon=sourceMon(combat,p);for(const mon of [saved,battleMon])if(mon){mon.rogueNatureDewCount=n;mon.stats=calculateStats(mon);}sourceStats(p,saved||battleMon);};
 if(combat.knockOffRule==='source-subset-v1')Object.defineProperty(b,'rogueSyncKnockOffItem',{configurable:true,enumerable:false,value(p,item){if(item?.id==='souldew')syncSoulDew(p);}});
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
 b.onEvent('BeforeMove',b.format,{priority:11},function(pokemon,target,move){if(this.rogueCalledMoveRelease?.(pokemon,move))return;if(pokemon.status!=='frz')return;if(move?.flags?.defrost&&!(move.id==='burnup'&&!pokemon.hasType('Fire')))return;const state=pokemon.statusState;if(!Number.isInteger(state.rogueFreezeTurns)||state.rogueFreezeTurns<1||state.rogueFreezeTurns>3)state.rogueFreezeTurns=3;state.rogueFreezeTurns--;if(this.randomChance(1,4)||state.rogueFreezeTurns<=0){pokemon.cureStatus();return;}this.add('cant',pokemon,'frz');return false;});
 b.onEvent('ModifyAccuracy',b.format,{priority:-1},function(accuracy,target,source){if(this.rogueFog&&!fogWeatherSuppressed(this)&&!((run?.megaSolFogRule||combat.megaSolFogRule)==='source-v1'&&source?.hasAbility('megasol'))&&typeof accuracy==='number')return Math.floor(accuracy*.9);});
 b.onEvent('Accuracy',b.format,{priority:-1},function(accuracy,target,source,move){if(this.rogueFog&&!fogWeatherSuppressed(this)&&!((run?.megaSolFogRule||combat.megaSolFogRule)==='source-v1'&&source?.hasAbility('megasol'))&&move?.ohko&&typeof accuracy==='number')return Math.floor(accuracy*.9);});
 b.onEvent('TryHeal',b.format,{priority:3},function(amount,target,source,effect){if((run?.megaSolShoreUpRule||combat.megaSolShoreUpRule)==='source-v1'&&effect?.id==='shoreup'&&target?.hasAbility('megasol'))return Math.round(target.maxhp/2);});
 b.onEvent('TryHeal',b.format,{priority:1},function(amount,target,source,effect){if(this.rogueFog&&!this.field.suppressingWeather()&&target&&!((run?.megaSolFogRule||combat.megaSolFogRule)==='source-v1'&&target.hasAbility('megasol'))&&effect?.effectType==='Move'&&['synthesis','morningsun','moonlight'].includes(effect.id))return this.modify(target.maxhp,.25);});
 b.onEvent('TryHeal',b.format,{priority:2},function(amount,target,source,effect){const move=this.activeMove;if((run?.shellBellRule||combat.shellBellRule)!=='source-v3'||effect?.id!=='shellbell'||!target?.hasItem('shellbell')||this.activePokemon!==target||!move)return;if(move.rogueShellBellHealed)return false;const damage=(move.totalDamage||0)+(move.rogueShellBellSubDamage||0);if(damage<=0)return;move.rogueShellBellHealed=true;const stacks=Math.min(4,1+count('shellbell',token(target)));return Math.max(1,Math.floor(damage*stacks/8));});
 b.onEvent('TryHeal',b.format,{priority:.5},function(amount,target,source,effect){const n=count('healingcharm');if(target?.side?.n===0&&n>0&&typeof amount==='number'&&amount>0){const multiplier=1+.1*Math.min(5,n),ooze=typeof source?.hasAbility==='function'&&source.hasAbility('liquidooze')&&['drain','leechseed','strengthsap'].includes(effect?.id);return Math.max(1,(ooze?Math.ceil:Math.floor)(amount*multiplier));}});
 b.onEvent('BasePower',b.format,{priority:15},function(power,p,target,move){const n=combat.modifiers.filter(m=>m.boxId===token(p)&&m.typeBoost===move.type).reduce((sum,m)=>sum+m.count,0),sourceRule=(run?.typeItemRule||combat.typeItemRule)==='source-v2';if(n&&!p.ignoringItem()&&!(sourceRule&&move.id==='struggle')){if(sourceRule)return Math.floor(power*(1+.2*n));this.chainModify(100+20*n,100);}});
 b.onEvent('BasePower',b.format,{priority:14},function(power,p,target,move){if((run?.weatherBallStrongWindsRule||combat.weatherBallStrongWindsRule)==='source-v1'&&move.id==='weatherball'&&this.field.effectiveWeather()==='deltastream'&&!p.hasAbility('megasol'))this.chainModify(2,1);});
 b.onEvent('BasePower',b.format,{priority:15},function(power,p,target,move){if(this.rogueFog&&!this.field.suppressingWeather()&&!((run?.megaSolFogRule||combat.megaSolFogRule)==='source-v1'&&p.hasAbility('megasol'))){if(['solarbeam','solarblade'].includes(move.id))this.chainModify(1,2);if(move.id==='weatherball')this.chainModify(2,1);}});
 b.onEvent('FractionalPriority',b.format,{priority:-3},function(priority,pokemon,target,move){
  if(!pokemon?.set||!move||pokemon.ignoringItem())return;const n=Math.min(3,count('quickclaw',token(pokemon)));
  if(n&&this.randomChance(n,10)&&!(pokemon.hasAbility('myceliummight')&&move.category==='Status')&&priority<0.1){this.add('-activate',pokemon,'item: Quick Claw');return 0.1;}
 });
 // Source Golden Punch pays immediately for each actual hit against an enemy.
 // The owner and stack are read from the live combat ledger after transfers.
 if(run?.goldenPunchRule==='source-v1')b.onEvent('DamagingHit',b.format,{priority:0},function(damage,target,source,move){
  if(!source?.set||source.side.n!==0||target?.side?.n!==1||!move||move.category==='Status'||!Number.isFinite(damage)||damage<=0)return;
  const stacks=Math.min(5,count('goldenpunch',token(source)));if(!stacks)return;const base=Math.floor(damage*.5*stacks);if(!base)return;const amount=classicMoneyGain(run,base);if(!Number.isSafeInteger(run.money)||run.money<0||!Number.isSafeInteger(amount))throw Error('황금주먹 재화를 확인하세요.');run.money=Math.min(Number.MAX_SAFE_INTEGER,run.money+amount);
 });
 // Grip Claw transfers one source-style held modifier per successful damaging hit.
 b.onEvent('DamagingHit',b.format,{priority:-2},function(damage,target,source,move){
  if(!source?.set||!target?.set||source===target||!source.hp||!move||move.category==='Status'||source.ignoringItem())return;
  const n=Math.min(5,count('gripclaw',token(source)));if(!n||!this.randomChance(n,10))return;
  if(target.hasAbility('stickyhold')&&!source.hasAbility(['moldbreaker','teravolt','turboblaze'])&&((run?.gripClawRule||combat.gripClawRule)!=='source-v2'||target.side.n!==source.side.n))return;
  const options=combat.modifiers.filter(m=>m.boxId===token(target)&&m.count>0&&m.transferable!==false&&m.id!=='miniblackhole').map(item=>({kind:'modifier',item}));
  // Native items have one simulator slot. Respect form-bound and item-specific restrictions.
  const native=target.getItem();if(!source.item&&!sourceMon(combat,target)?.rogueNativeItemNontransferable&&native.exists&&!native.zMove&&!native.megaStone&&!native.forcedForme&&!native.onPlate&&!native.onDrive&&!native.onMemory&&native.onTakeItem===undefined)options.push({kind:'native',item:native});
  if(!options.length)return;const selected=this.sample(options);
  if(selected.kind==='native'){
   if(!classicCanReceiveHeldItem(selected.item.id,combat.modifiers,token(source),source.item))return;
   const previousState={...target.itemState},previousStaleness=target.pendingStaleness,item=target.takeItem(source);if(!item)return;
   if(!source.setItem(item,target,move)){target.item=item.id;target.itemState=previousState;target.pendingStaleness=previousStaleness;return;}
   if(run)for(const p of [source,target])if(p.side.n===0){const stored=run.party.find(m=>String(m.boxId)===token(p));if(stored)stored.item=p.item;}
   this.add('-item',source,item.name,'[from] item: Grip Claw',`[of] ${target}`);return;
  }
  const item=selected.item,same=m=>m.id===item.id&&(m.typeBoost||null)===(item.typeBoost||null)&&(m.stat||null)===(item.stat||null),max=classicBerryMax(item.id)||({leftovers:4,soothebell:3,mysticalrock:2,scopelens:1,widelens:3,gripclaw:5,souldew:10,multilens:2,shellbell:4,reviverseed:1,focusband:5,kingsrock:3,quickclaw:3,goldenpunch:5})[item.id]||99;
  const owned=combat.modifiers.filter(m=>m.boxId===token(source)&&same(m));if(owned.reduce((total,m)=>total+m.count,0)>=max||!classicCanReceiveHeldItem(item.id,combat.modifiers,token(source),source.item,1,item.typeBoost||null))return;
  item.count--;if(owned.length)owned[0].count++;else combat.modifiers.push({...item,boxId:token(source),count:1});
  if(run&&target.side.n===0){const old=run.modifiers.find(m=>m.boxId===token(target)&&same(m)&&m.count>0);if(old)old.count--;}
  if(run&&source.side.n===0){const existing=run.modifiers.find(m=>m.boxId===token(source)&&same(m));if(existing)existing.count++;else run.modifiers.push({...item,boxId:token(source),count:1});}
  if(item.id==='souldew'){syncSoulDew(source);syncSoulDew(target);}
  this.add('message',`${source.name}의 집게손톱이 ${target.name}의 도구 한 개를 빼앗았다!`);
 });
 b.onEvent('DamagingHit',b.format,{priority:-1},function(damage,target,source,move){
  if(!source?.set||!target?.hp||!move||move.category==='Status'||source.ignoringItem()||(target.hasAbility('shielddust')&&!source.hasAbility(['moldbreaker','teravolt','turboblaze']))||target.hasItem('covertcloak'))return;
  const n=Math.min(3,count('kingsrock',token(source))),original=this.dex.moves.get(move.id),hasFlinch=original.secondaries?.some(effect=>effect.volatileStatus==='flinch')||original.secondary?.volatileStatus==='flinch';
  if(n&&typeof damage==='number'&&damage>=0&&!hasFlinch&&this.randomChance(n,10))target.addVolatile('flinch',source,move);
 });
 // A source reviver seed resolves before the simulator commits a faint.
 b.onEvent('TrapPokemon',b.format,{priority:0},function(p){if(p.volatiles?.partiallytrapped?.rogueEscapedSource&&!p.hasAbility('runaway'))p.tryTrap();});
 b.onEvent('Faint',b.format,{priority:-40},function(p){releaseClassicBindings(this,p);});
 b.onEvent('BeforeFaint',b.format,{priority:-100},function(p,source,effect){
  // Source post-turn poison, toxic and burn explicitly prevent instant revival.
  if(!p?.set||p.hp>0||p.fainted||['psn','tox','brn'].includes(effect?.id))return;
  const item=combat.modifiers.find(m=>m.id==='reviverseed'&&m.boxId===token(p)&&m.count>0);if(!item)return;
  // These two source effects happen before the instant revival.
  for(const id of ['destinybond','grudge'])if(p.volatiles[id])this.singleEvent('Faint',this.dex.conditions.get(id),p.volatiles[id],p,source,effect);
  item.count--;if(run&&p.side.n===0){const stored=run.modifiers.find(m=>m.id==='reviverseed'&&m.boxId===token(p)&&m.count>0);if(stored){stored.count--;if(stored.count===0)run.modifiers=run.modifiers.filter(m=>m!==stored);}}
  const passive=Object.entries(p.volatiles).filter(([key])=>key.startsWith('roguepassive:'));
  p.clearVolatile(false);for(const [key,state] of passive)p.volatiles[key]=state;
  delete p.m.rogueBerryCud;p.faintQueued=false;p.fainted=false;p.status='';p.statusState=this.initEffectState({id:'',target:p});p.hp=Math.max(1,Math.floor(p.maxhp/2));
  this.add('-heal',p,p.getHealth,'[from] item: Reviver Seed');return false;
 });
 b.onEvent('ModifyAccuracy',b.format,{priority:0},function(accuracy,target,source,move){const n=source?.set?Math.min(3,count('widelens',token(source))):0;if(n&&typeof accuracy==='number'&&!move?.ohko&&!source.ignoringItem())return accuracy+5*n;});
 // Classic money moves use a battle-local purse; the game settles it only once at victory.
 if(run?.economyRule==='source-v1'){
  b.onEvent('ModifyMove',b.format,{priority:0},function(move){if(move?.id==='makeitrain'&&move.self?.boosts)move.self={...move.self,boosts:{...move.self.boosts,spa:-2}};});
  b.onEvent('AfterMoveSecondarySelf',b.format,{priority:-2},function(p,target,move){
   if(!move)return;if(move.id==='happyhour'){combat.happyHour=true;return;}
   if(['payday','makeitrain','celebrate'].includes(move.id)){combat.moneyScattered=(combat.moneyScattered||0)+classicWaveMoney(run.wave,.2)*Math.max(1,move.hitTargets?.length||0);this.add('message','금화가 사방에 흩어졌다!');}
  });
 }
 // Multi Lens splits one eligible attack into additional damage-bearing hits.
 b.onEvent('PrepareHit',b.format,{priority:-2},function(source,target,move){const n=source?.set?Math.min(2,count('multilens',token(source))):0;if(!n||source.ignoringItem()||!move||move.category==='Status'||move.flags?.charge||move.flags?.futuremove||move.flags?.noparentalbond||move.selfdestruct||move.spreadHit||move.isZ||move.isMax||['fling','uproar','rollout','iceball','endeavor'].includes(move.id))return;const parental=move.multihitType==='parentalbond';if(move.multihit&&!parental)return;move.rogueMultiLens=n;move.rogueLensParental=parental;move.multihit=1+n+Number(parental);move.multihitType='rogueMultiLens';});
 const lensFactor=move=>move?.rogueMultiLens?(move.hit>1?.25:1-.25*move.rogueMultiLens):1;
 b.onEvent('ModifyDamage',b.format,{priority:0},function(damage,source,target,move){if(move?.rogueMultiLens&&source?.set)this.chainModify(lensFactor(move));});
 const nativeGetDamage=b.actions.getDamage;Object.defineProperty(b.actions,'getDamage',{configurable:true,enumerable:false,value(source,target,move,...args){if((typeof move==='string'?move.toLowerCase().replace(/[^a-z0-9]+/g,''):move?.id)==='lastrespects'&&source?.side?.totalFainted>100){const original=typeof move==='string'?this.dex.getActiveMove(move):move;move=Object.assign(Object.create(original),{basePowerCallback(){return 5050;}});}const sourceLens=(run?.multiLensRule||combat.multiLensRule)==='source-subset-v2',fixed=!!(move?.damage||move?.damageCallback),parentalLast=sourceLens&&move?.rogueLensParental&&move.hit===move.multihit;if(sourceLens&&move?.rogueMultiLens&&['superfang','naturesmadness','ruination'].includes(move.id)&&typeof move.damageCallback==='function'){if(!parentalLast){move.rogueLensInitialHp??=target.getUndynamaxedHP();const initial=move.rogueLensInitialHp;move=Object.assign(Object.create(move),{damageCallback(){return Math.max(1,Math.floor(initial/2));}});}}const result=nativeGetDamage.call(this,source,target,move,...args);if(typeof result==='number'&&result>0&&move?.rogueMultiLens&&fixed)return Math.max(1,Math.floor(result*(parentalLast?1:lensFactor(move))));return result;}});
 // Temporary party-wide X items modify the stage multiplier, not the stage itself.
 const xActive=id=>combat.modifiers.some(m=>m.id===id&&m.count>0&&Number.isInteger(m.remaining)&&m.remaining>0);
 b.onEvent('ModifyBoost',b.format,{priority:-10},function(boosts,p){if(p?.side?.n!==0||!xActive('xaccuracy')||!Number.isInteger(boosts.accuracy))return;if(p===this.activePokemon&&this.activeTarget?.hasAbility('unaware')&&!p.hasAbility(['moldbreaker','teravolt','turboblaze']))return;boosts.accuracy=Math.min(6,boosts.accuracy+1);});
 for(const [event,stat,id,offense] of [['ModifyAtk','atk','xattack',true],['ModifyDef','def','xdefense',false],['ModifySpA','spa','xspatk',true],['ModifySpD','spd','xspdef',false],['ModifySpe','spe','xspeed',false]])b.onEvent(event,b.format,{priority:0},function(value,p,other,move){
  if(p?.side?.n!==0||!xActive(id)||typeof value!=='number')return;
  const offensive=offense||sourceBodyPress&&move?.id==='bodypress'&&p===bodyPressStatOwner;
  if(move&&((offensive&&move.ignoreOffensive)||(!offensive&&move.ignoreDefensive)))return;
  if(move&&other?.hasAbility('unaware')&&!(offensive&&p.hasAbility(['moldbreaker','teravolt','turboblaze'])))return;
  const effective=this.runEvent('ModifyBoost',p,null,null,{...p.boosts});let stage=Math.max(-6,Math.min(6,effective[stat]||0));if(move&&other){const defender=offensive?other:p,critical=defender.getMoveHitData(move)?.crit;if(critical)stage=offensive?Math.max(0,stage):Math.min(0,stage);}
  const multiplier=stage>=0?(2+stage)/2:2/(2-stage),adjusted=Math.min(4,multiplier+.2);this.chainModify([Math.round(adjusted/multiplier*4096),4096]);
 });
 // The upstream Knock Off bonus requires at least one transferable held effect.
 b.onEvent('BasePower',b.format,{priority:0},function(power,source,target,move){if(combat.knockOffRule!=='source-subset-v1'&&move?.id==='knockoff'&&target?.item&&sourceMon(combat,target)?.rogueNativeItemNontransferable&&!combat.modifiers.some(m=>m.boxId===token(target)&&m.count>0&&m.transferable!==false))return this.modify(power,2/3);});
 b.onEvent('ModifyCritRatio',b.format,{priority:0},function(ratio,p){const scope=p?.set&&count('scopelens',token(p))&&!p.ignoringItem()?1:0,temporary=p?.side?.n===0&&xActive('direhit')?1:0;if(scope||temporary)return ratio+scope+temporary;});
 b.onEvent('AfterSubDamage',b.format,{priority:0},function(damage,target,source,move){if(['source-v2','source-v3'].includes(run?.shellBellRule||combat.shellBellRule)&&source?.set&&move&&typeof damage==='number'&&damage>0)move.rogueShellBellSubDamage=(move.rogueShellBellSubDamage||0)+damage;});
 b.onEvent('AfterMoveSecondarySelf',b.format,{priority:-1},function(p,target,move){const rule=run?.shellBellRule||combat.shellBellRule,n=p?.set?Math.min(4,count('shellbell',token(p))+(rule==='source-v3'&&p.hasItem('shellbell')?1:0)):0,damage=(move?.totalDamage||0)+(['source-v2','source-v3'].includes(rule)?(move?.rogueShellBellSubDamage||0):0);if(n&&p.hp&&!p.ignoringItem()&&damage>0&&!p.forceSwitchFlag)this.heal(Math.max(1,Math.floor(damage*n/8)),p,p,this.dex.items.get('shellbell'));});
 b.onEvent('Damage',b.format,{priority:-41},function(damage,target,source,effect){if(!target?.set)return;if((run?.focusBandRule||combat.focusBandRule)==='source-v2'&&effect?.effectType!=='Move'&&effect?.id!=='confusion')return;const n=Math.min(5,count('focusband',token(target)));if(n&&target.hp>0&&!target.ignoringItem()&&typeof damage==='number'&&damage>=target.hp&&this.randomChance(n,10)){this.add('-activate',target,'item: Focus Band');return target.hp-1;}});
 // The pinned source's Salt Cure drains 1/16 HP, or 1/8 for Water/Steel.
 if((run?.saltCureRule||combat.saltCureRule)==='source-subset-v1')b.onEvent('Damage',b.format,{priority:50},function(damage,target,source,effect){if(effect?.id==='saltcure'&&target?.set&&typeof damage==='number'&&damage>0)return Math.max(1,Math.floor(target.baseMaxhp/(target.hasType(['Water','Steel'])?8:16)));});
 installClassicBerries(b,combat,run);
 b.onEvent('Residual',b.format,{order:5,subOrder:4},function(p){const n=count('leftovers',token(p));if(n&&p.hp&&!p.ignoringItem())this.heal((run?.leftoversRule||combat.leftoversRule)==='source-v2'?Math.max(1,Math.floor(p.baseMaxhp/16))*n:p.baseMaxhp*n/16,p,p,this.dex.items.get('leftovers'));});
 b.onEvent('Residual',b.format,{order:28},function(p){
  if(!p?.hp||!count('miniblackhole',token(p)))return;
  const foes=p.adjacentFoes().filter(target=>target.hp>0);if(!foes.length)return;const target=this.sample(foes);if(target.hasAbility('stickyhold')){this.add('-activate',target,'ability: Sticky Hold');return;}
  const transferables=combat.modifiers.filter(m=>m.boxId===token(target)&&m.count>0&&m.transferable!==false&&m.id!=='miniblackhole'),options=transferables.map(m=>({kind:'modifier',entry:m}));
  if(target.item&&!p.item&&!sourceMon(combat,target)?.rogueNativeItemNontransferable)options.push({kind:'item',entry:target.getItem()});if(!options.length)return;
  const selected=this.sample(options);
  if(selected.kind==='item'){if(!classicCanReceiveHeldItem(selected.entry.id,combat.modifiers,token(p),p.item))return;const item=target.takeItem(p);if(!item||!p.setItem(item,target,this.dex.moves.get('thief')))return;this.add('-item',p,item.name,'[from] move: Thief',`[of] ${target}`);return;}
  const item=selected.entry,maximum=classicBerryMax(item.id)||({leftovers:4,soothebell:3,mysticalrock:2,scopelens:1,widelens:3,souldew:10,multilens:2,shellbell:4,berrysitrus:2,berrylum:2,berryleppa:2,reviverseed:1,focusband:5,kingsrock:3,quickclaw:3})[item.id]||99,owned=combat.modifiers.find(m=>m.boxId===token(p)&&m.id===item.id&&m.typeBoost===item.typeBoost);if((owned?.count||0)>=maximum||!classicCanReceiveHeldItem(item.id,combat.modifiers,token(p),p.item,1,item.typeBoost||null))return;
  item.count--;if(owned)owned.count++;else combat.modifiers.push({...item,boxId:token(p),count:1});
  if(run){const previous=run.modifiers.find(m=>m.boxId===token(target)&&m.id===item.id&&m.typeBoost===item.typeBoost);if(previous)previous.count=Math.max(0,previous.count-1);const received=run.modifiers.find(m=>m.boxId===token(p)&&m.id===item.id&&m.typeBoost===item.typeBoost);if(received)received.count++;else run.modifiers.push({...item,boxId:token(p),count:1});}
  if(item.id==='souldew'){syncSoulDew(p);syncSoulDew(target);}
  this.add('message',`${p.name}의 미니블랙홀이 ${target.name}의 도구 한 개를 흡수했다!`);
 });
 if(run)b.onEvent('BeforeSwitchIn',b.format,{priority:101},function(p){if(p.side.n===0)run.participants=[...new Set([...(run.participants||[]),token(p)])];});
 if(run)b.onEvent('Faint',b.format,{priority:-50},function(p){
  if(p.side.n===0){run.participants=(run.participants||[]).filter(id=>String(id)!==token(p));const mon=run.party.find(m=>String(m.boxId)===token(p));if(mon)mon.friendship=Math.max(0,(mon.friendship??50)-5);return;}
  if(run.mystery?.type==='fun-and-games'&&run.mystery.stage==='battle')return;
  const foe=sourceMon(combat,p);if(!foe||run.awardedFoes?.includes(foe.boxId))return;
  run.awardedFoes||=[];run.awardedFoes.push(foe.boxId);run.party=syncNativeTeams(this,[run.party,combat.teams[1]])[0];
  // Source faint processing includes active and just-fainted participants for
  // EXP Share, including simultaneous knockouts, before distributing EXP.
  const participants=[...new Set([...(run.participants||[]),...this.p1.active.filter(Boolean).map(token)])];
  run.expNotices=[...(run.expNotices||[]),...awardClassicExperience(run,[foe],{system,participants,weather:this.rogueFog?'fog':this.field.weather||''})];
  for(const mon of run.party){const brace=run.modifiers.find(m=>m.id==='machobrace'&&m.boxId===mon.boxId);const activeBrace=combat.modifiers.find(m=>m.id==='machobrace'&&m.boxId===mon.boxId);if(brace&&activeBrace)activeBrace.count=brace.count;const native=this.p1.pokemon.find(p=>token(p)===String(mon.boxId));if(native){sourceStats(native,mon);native.hp=Math.min(native.maxhp,mon.hp);native.level=mon.level;native.set.level=mon.level;}}
 });
 if(b.rogueWild){installWildLifecycle(b);installEncounterGuards(b);}
 bindClassicFinalBattle(b,combat,run,{preparePokemon:prepareBossPokemon,applyStats:sourceStats});
 // Reconcile stale counters only at the simulator's terminal check, after faint processing.
 const checkWin=b.checkWin;Object.defineProperty(b,'checkWin',{configurable:true,enumerable:false,value(...args){reconcileLivingCounts(this);return checkWin.apply(this,args);}});
 return abilities;
}
function snapshot(b){const registry=Object.getOwnPropertyDescriptor(b,'events');try{delete b.events;return JSON.parse(JSON.stringify(b.toJSON()));}finally{if(registry)Object.defineProperty(b,'events',registry);}}
export function repairClassicActiveReferences(b,combat){
 if(b.sides.length!==2||!b.sides[0]||!b.sides[1])throw Error('저장된 전투 진영을 확인할 수 없습니다. 저장 데이터는 유지됩니다.');
 b.sides[0].foe=b.sides[1];b.sides[1].foe=b.sides[0];
 for(const side of b.sides)for(const pokemon of side.pokemon)if(pokemon&&pokemon.side!==side)pokemon.side=side;
 for(const [sideIndex,side] of b.sides.entries())for(const [slot,pokemon] of side.active.entries()){
  if(!pokemon||pokemon.side===side&&pokemon.set&&side.pokemon.includes(pokemon))continue;
  const index=combat.activeBySide?.[sideIndex]?.[slot]??(slot===0?combat.requests?.[sideIndex]?.active:undefined);
  const source=Number.isInteger(index)?combat.teams?.[sideIndex]?.[index]:null;
  // Older/terminal snapshots can lose the public active index. The native team
  // still carries the exact occupied slot. Require a unique serialized identity;
  // never substitute an arbitrary living reserve or reset the saved battle.
  const occupants=side.pokemon.filter(p=>p?.set&&p.isActive===true&&p.position===slot);
  const replacement=(source?.boxId!=null?side.pokemon.find(p=>String(p.set?.trainerToken)===String(source.boxId)):null)||(occupants.length===1?occupants[0]:null);
  if(!replacement)throw Error('저장된 출전 포켓몬을 확인할 수 없습니다. 저장 데이터는 유지됩니다.');
  side.active[slot]=replacement;replacement.isActive=true;
 }
}
function restore(combat,run=null,system=null){
 if(combat.challengeEligibilityRule==='source-subset-v1'&&(!Array.isArray(combat.challengeRestrictions)||(run?.party||combat.teams[0]).some(p=>p.hp>0&&classicChallengeBattleEligibility(p,combat.challengeRestrictions)===null)))throw Error('지원하지 않거나 확인할 수 없는 챌린지입니다.');
 // The native deserializer indexes copied slots up to the original moveset
 // length. Pad only its cloned input and trim immediately after loading.
 const state=structuredClone(combat.snapshot),requests=state.sides.map(s=>s.activeRequest!==null),trimmedTransformSlots=[];for(const [sideIndex,side] of state.sides.entries()){side.activeRequest=null;for(const [index,p] of (side.pokemon||[]).entries())if(p?.transformed&&Array.isArray(p.moveSlots)&&p.moveSlots.length>0&&Array.isArray(p.baseMoveSlots)&&p.moveSlots.length<p.baseMoveSlots.length){const length=p.moveSlots.length;while(p.moveSlots.length<p.baseMoveSlots.length)p.moveSlots.push({...p.moveSlots[length-1],virtual:true});trimmedTransformSlots.push({sideIndex,index,length});}}
 const b=Battle.fromJSON(state),evolved=new Set();for(const {sideIndex,index,length} of trimmedTransformSlots)b.sides[sideIndex].pokemon[index].moveSlots.length=length;
 repairClassicActiveReferences(b,combat);
 // Native serialization leaves DataMove references in binding state as strings.
 for(const side of b.sides)for(const p of side.pokemon){const v=p.volatiles?.partiallytrapped,id=classicBindingId(v?.sourceEffect);if(v&&classicBindingMoves.has(id)){v.sourceEffect=b.dex.moves.get(id);v.boundDivisor=8;}}
 // Evolution can change the species passive while this Pokémon remains on the
 // field. Prepare its serialized component before binding the new descriptor.
 for(const p of b.p1.pokemon){const mon=(run?.party||combat.teams[0]).find(m=>String(m.boxId)===token(p)),expected=mon?.rogueBattleSpecies||rules.species[mon?.id]?.key;if(!mon||!expected||p.baseSpecies.id===expected)continue;evolved.add(p);
  const desired=mon.roguePassiveAbility?b.dex.abilities.get(mon.roguePassiveAbility).id:null,key=desired?'roguepassive:'+desired:null;
  for(const old of Object.keys(p.volatiles))if(old.startsWith('roguepassive:')&&old!==key)delete p.volatiles[old];
  if(key&&p.isActive&&p.hp>0&&!p.volatiles[key])p.volatiles[key]=b.initEffectState({id:key,target:p,queryActive:true,ready:true,started:true,nativeState:b.initEffectState({id:desired,target:p})});
 }
 install(b,combat,run,system);
 for(const side of b.sides)for(const p of side.pokemon){const mon=(p.side.n===0&&run?.party?.find(m=>String(m.boxId)===token(p)))||sourceMon(combat,p),expected=mon?.rogueBattleSpecies||rules.species[mon?.id]?.key,changed=evolved.has(p)||(p.side.n===0&&combat.fusionEvolutionBoxId===token(p));sourceStats(p,mon,{forceSpecies:!!mon&&!p.transformed&&(changed||p.baseSpecies.id!==expected)});
  if(changed&&mon){if(p.transformed){const species=b.dex.species.get(expected);if(species.exists){p.baseSpecies=new b.dex.Species({...species,baseStats:mon.rogueBaseStats||species.baseStats,types:mon.rogueTypes?.map(t=>types[t]||t)||species.types});p.set.species=species.name;p.level=mon.level;p.set.level=mon.level;const stats=calculateStats(mon);p.baseStoredStats={...stats};delete p.baseStoredStats.hp;p.baseMaxhp=stats.hp;p.maxhp=p.volatiles.dynamax&&species.id!=='shedinja'?Math.floor(stats.hp*(1.5+p.dynamaxLevel*.05)):stats.hp;}}const ability=b.dex.abilities.get(mon.ability).id,oldBase=p.baseAbility;if(ability){p.baseAbility=ability;p.set.ability=ability;if(!p.transformed&&p.ability===oldBase){p.ability=ability;p.abilityState=b.initEffectState({id:ability,target:p});}}p.hp=mon.hp>0?Math.min(p.maxhp,mon.hp):0;}
  applyClassicTeraAccess(p,combat,run);}
 reconcileLivingCounts(b);
 if(requests.some(Boolean)){const next=b.getRequests(b.requestState);b.sides.forEach((side,i)=>side.activeRequest=requests[i]?next[i]:null);b.prng=new PRNG(state.prng);}
 return b;
}
const uncertainEffectivenessMoves=new Set(['weatherball','judgment','revelationdance','multiattack','terrainpulse','naturalgift','technoblast','hiddenpower','aurawheel','ragingbull','ivycudgel','terablast','terastarstorm','struggle']);
function previewKnownMoveType(b,p,move){if(['judgment','multiattack'].includes(move.id)&&b.rogueFormItemMoveType?.(p)&&!p.hasAbility(['normalize','pixilate','aerilate','refrigerate','galvanize','dragonize']))return {type:b.rogueFormItemMoveType(p),power:move.basePower};if(move.id==='technoblast'&&b.rogueTechnoBlastType&&!p.hasAbility(['normalize','pixilate','aerilate','refrigerate','galvanize','dragonize']))return {type:b.rogueTechnoBlastType(p),power:move.basePower};if(move.id==='terablast'&&typeof p.terastallized==='string')return {type:p.terastallized,power:move.basePower,uncertain:p.terastallized==='Stellar'};if(move.id==='hiddenpower'&&p.hpType)return {type:p.hpType,power:move.basePower};if(move.id==='weatherball'){if(p.hasAbility('megasol'))return null;const weather=p.effectiveWeather(),weatherType={sunnyday:'Fire',desolateland:'Fire',raindance:'Water',primordialsea:'Water',sandstorm:'Rock',hail:'Ice',snowscape:'Ice'}[weather],fog=!!b.rogueFog&&!b.field.suppressingWeather();return {type:weatherType||move.type,power:move.basePower*(weatherType||fog?2:1)};}if(move.id==='terrainpulse'){const terrain=p.isGrounded()?b.field.terrain:'',terrainType={electricterrain:'Electric',grassyterrain:'Grass',mistyterrain:'Fairy',psychicterrain:'Psychic'}[terrain];return {type:terrainType||move.type,power:move.basePower*(terrainType?2:1)};}return null;}
function combatHasZ(b,side,p,a){return side===0&&!!b.rogueClassicZRing&&!!a?.canZMove&&!p?.terastallized&&!p?.volatiles.dynamax&&!p?.m.roguePermanentDynamax&&!p?.species.isMega&&!p?.species.isPrimal&&p?.species.forme!=='Ultra';}
function actorRequest(b,side,slot,team,allTeams){
 const s=b.sides[side],req=s.activeRequest,p=s.active[slot],active=team.findIndex(m=>String(m.boxId)===String(p?.set.trainerToken)),forced=!!req?.forceSwitch?.[slot];
 if(b.ended||!req||req.wait||!p||p.hp<=0&&!forced||req.forceSwitch&&!forced)return {slot,kind:'wait',active,moves:[],switches:[],specials:[]};
 const a=req.active?.[slot],revival=forced&&!!s.slotConditions[p.position]?.revivalblessing,switches=s.pokemon.map((candidate,index)=>({slot:index+1,index:team.findIndex(m=>String(m.boxId)===token(candidate)),name:team.find(m=>String(m.boxId)===token(candidate))?.name||candidate.name,hp:candidate.hp,maxHp:candidate.maxhp})).filter(q=>q.index>=0&&(revival||!b.roguePartnerSwitchAllowed||b.roguePartnerSwitchAllowed(p,s.pokemon[q.slot-1]))&&(revival?!!s.pokemon[q.slot-1].fainted&&!s.pokemon[q.slot-1].m?.released&&!s.pokemon[q.slot-1].m?.captured&&(side!==1||enemyReviveEligible(allTeams[1][q.index]))&&(side!==0||!b.rogueChallengeEligibility||b.rogueChallengeEligibility(s.pokemon[q.slot-1],1)!==null):q.hp>0&&(side!==0||!b.rogueChallengeAllowed||b.rogueChallengeAllowed(s.pokemon[q.slot-1]))&&!s.active.some(active=>active&&token(active)===String(team[q.index].boxId))&&(!(a?.trapped||p.trapped)||forced)));
 const specialEffectiveness=move=>b.sides[1-side].active.map((foe,slot)=>{if(!foe?.hp)return null;const visible=foe.illusion||foe,multiplier=move.category==='Status'?null:b.dex.getImmunity(move.type,visible)?2**b.dex.getEffectiveness(move.type,visible):0;return {slot,name:visible.name.replace(/#\d+$/,''),multiplier};}).filter(Boolean);
 const specials=[];if(a?.canDynamax)specials.push({key:'dynamax',label:'다이맥스'});if(a?.canTerastallize&&!p?.volatiles.dynamax)specials.push({key:'terastallize',label:'테라스탈'});if(combatHasZ(b,side,p,a))specials.push({key:'zmove',label:'Z기술'});
 const entries=(a?.moves||[]).map((move,index)=>({move,index,unrequested:false}));
 // Keep unavailable cards visible without adding them to the server's legal
 // commands. Native requests replace all exhausted moves with Struggle.
 if(entries.some(({move})=>move.id==='struggle'))entries.unshift(...p.moveSlots.map((move,index)=>({move,index,unrequested:true})));
 const displayMoves=entries.map(({move:m,index,unrequested})=>{
  const disabled=unrequested||!!m.disabled||m.pp!==undefined&&m.pp<=0||side===0&&classicPreventRevive({challengeRestrictions:b.rogueChallengeRestrictions})&&m.id==='revivalblessing';
  const baseMove=b.dex.moves.get(m.id),activeMax=!!p?.volatiles.dynamax,move=activeMax?b.actions.getActiveMaxMove(baseMove,p):baseMove,targets=[],targetKind=activeMax?move.target:m.target||move.target;
  if(b.activePerHalf>1&&['normal','any','adjacentFoe','adjacentAlly','adjacentAllyOrSelf'].includes(targetKind)){
   for(const candidateSide of b.sides)for(const [i,target]of candidateSide.active.entries())if(target?.hp&&b.validTarget(target,p,targetKind))targets.push({side:candidateSide.n,index:allTeams[candidateSide.n].findIndex(q=>String(q.boxId)===token(target)),slot:i,name:target.name.replace(/#\d+$/,''),target:p.getLocOf(target)});
  }
  const name=activeMax?(moveNameByKey[move.id]||move.name):(moveNameByKey[m.id]||m.move),possibleTypes=[];if(p.hasAbility('normalize'))possibleTypes.push('Normal');if(move.type==='Normal')for(const [ability,type] of [['pixilate','Fairy'],['aerilate','Flying'],['refrigerate','Ice'],['galvanize','Electric'],['dragonize','Dragon']])if(p.hasAbility(ability))possibleTypes.push(type);if(move.flags?.sound&&p.hasAbility('liquidvoice'))possibleTypes.push('Water');const converted=[...new Set(possibleTypes)],known=previewKnownMoveType(b,p,move),unknown=move.category==='Status'&&move.id!=='thunderwave'||!!known?.uncertain||uncertainEffectivenessMoves.has(move.id)&&!known||!known&&converted.length>1,effectiveType=known?.type||(unknown?move.type:converted[0]||move.type),displayType=Object.keys(types).find(key=>types[key]===effectiveType)||effectiveType;
  const effectivenessByTarget=b.sides[1-side].active.map((foe,slot)=>{if(!foe?.hp)return null;const visibleFoe=foe.illusion||foe;let multiplier=null;if(!unknown){const targetTypes=visibleFoe.getTypes();if(move.id==='thousandarrows'&&effectiveType==='Ground'&&!b.rogueInverseBattle){multiplier=2**targetTypes.filter(type=>type!=='Flying').reduce((sum,type)=>sum+b.dex.getEffectiveness(effectiveType,type),0);}else if(!b.dex.getImmunity(effectiveType,visibleFoe)){multiplier=0;}else{let stages=targetTypes.reduce((sum,type)=>sum+(move.id==='freezedry'&&type==='Water'?1:b.dex.getEffectiveness(effectiveType,type)),0);if(move.id==='flyingpress')stages+=b.dex.getEffectiveness('Flying',visibleFoe);multiplier=2**stages;}}return {slot,name:visibleFoe.name.replace(/#\d+$/,''),multiplier};}).filter(Boolean);
  const teraType=String(p.teraType||p.set?.teraType||''),teraName=Object.keys(types).find(key=>types[key]===teraType),teraTargets=move.id==='terablast'&&a?.canTerastallize&&teraName?b.sides[1-side].active.map((foe,slot)=>{if(!foe?.hp)return null;const visibleFoe=foe.illusion||foe;return {slot,name:visibleFoe.name.replace(/#\d+$/,''),multiplier:teraType==='Stellar'?null:b.dex.getImmunity(teraType,visibleFoe)?2**b.dex.getEffectiveness(teraType,visibleFoe):0};}).filter(Boolean):null,teraPreview=teraTargets?{type:teraName,typeKey:teraType.toLowerCase(),effectiveness:teraTargets[0]?.multiplier??null,effectivenessByTarget:teraTargets}:null;
  const result={id:m.id,slot:index+1,name,...(disabled?{disabled:true,disabledReason:m.pp!==undefined&&m.pp<=0?'PP가 없습니다.':'지금 사용할 수 없습니다.'}:{}),pp:m.pp??1,maxPp:m.maxpp??1,type:displayType,typeKey:effectiveType.toLowerCase(),power:known?.power??move.basePower,...moveDetails(move),accuracy:move.id==='darkvoid'&&b.rogueDarkVoidRule?80:move.accuracy===true?100:move.accuracy,category:move.category,target:targetKind,targets,effectiveness:effectivenessByTarget[0]?.multiplier??null,effectivenessByTarget,...(teraPreview?{teraPreview}:{})};
  if(a?.canDynamax){const max=b.actions.getActiveMaxMove(baseMove,p);if(max){const maxTargets=[];if(b.activePerHalf>1&&['normal','any','adjacentFoe','adjacentAlly','adjacentAllyOrSelf'].includes(max.target)){for(const candidateSide of b.sides)for(const [i,target] of candidateSide.active.entries())if(target?.hp&&b.validTarget(target,p,max.target))maxTargets.push({side:candidateSide.n,index:allTeams[candidateSide.n].findIndex(q=>String(q.boxId)===token(target)),slot:i,name:target.name.replace(/#\d+$/,''),target:p.getLocOf(target)});}const maxEffect=specialEffectiveness(max);result.variants={dynamax:{effectiveness:maxEffect[0]?.multiplier??null,effectivenessByTarget:maxEffect,name:moveNameByKey[max.id]||max.name,type:Object.keys(types).find(key=>types[key]===max.type)||max.type,typeKey:max.type.toLowerCase(),power:max.basePower,...moveDetails(max),accuracy:100,category:max.category,target:max.target,targets:maxTargets,disabled:disabled||!!a.maxMoves?.maxMoves?.[index]?.disabled}};}}
  if(combatHasZ(b,side,p,a)){const zRequest=!disabled&&a.canZMove[index];if(zRequest){const z=b.actions.getActiveZMove(baseMove,p),zTargets=[];if(b.activePerHalf>1&&['normal','any','adjacentFoe','adjacentAlly','adjacentAllyOrSelf'].includes(zRequest.target)){for(const candidateSide of b.sides)for(const [i,target] of candidateSide.active.entries())if(target?.hp&&!(zRequest.target==='normal'&&candidateSide.n===side)&&b.validTarget(target,p,zRequest.target))zTargets.push({side:candidateSide.n,index:allTeams[candidateSide.n].findIndex(q=>String(q.boxId)===token(target)),slot:i,name:target.name.replace(/#\d+$/,''),target:p.getLocOf(target)});}const zEffect=specialEffectiveness(z);result.variants={...result.variants,zmove:{effectiveness:zEffect[0]?.multiplier??null,effectivenessByTarget:zEffect,name:baseMove.category==='Status'?'Z-'+(moveNameByKey[baseMove.id]||baseMove.name):(zMoveNames.names[z.id]||moveNameByKey[z.id]||z.name),type:Object.keys(types).find(key=>types[key]===z.type)||z.type,typeKey:z.type.toLowerCase(),power:z.basePower,...moveDetails(z),accuracy:100,category:z.category,target:zRequest.target,targets:zTargets}};}else result.variants={...result.variants,zmove:{disabled:true}};}
  return result;
 });
 const legal=displayMoves.filter(move=>!move.disabled);if(!legal.length&&!forced){const struggle={id:'struggle',name:'발버둥',pp:1,maxPp:1,targets:[]};legal.push(struggle);displayMoves.push(struggle);}
 return {slot,kind:forced?'switch':'move',active,displayMoves,...(revival?{revival:true}:{}),canBaton:!forced&&b.rogueBatonOwners?.has(token(p))===true,teraType:String(p.teraType||p.set?.teraType||'').toLowerCase(),moves:legal,switches,specials};
}
function request(b,side,teams){const actors=b.sides[side].active.map((p,slot)=>actorRequest(b,side,slot,teams[side],teams));const forced=actors.filter(a=>a.kind==='switch'),available=new Set(forced.flatMap(a=>a.switches.map(s=>s.slot))).size;if(forced.length>available)for(const actor of forced.slice(available))Object.assign(actor,{kind:'wait',switches:[]});return {...(actors.find(a=>a.kind!=='wait')||actors[0]),actors};}
function output(b,combat,start=0,run=null,initialConditions=null){
 const teams=syncNativeTeams(b,combat.teams).map((team,side)=>team.map(mon=>{const p=b.sides[side].pokemon.find(p=>token(p)===String(mon.boxId)),boss=p&&mon.rogueBossSegments?{rogueBossSegmentIndex:p.m.rogueBossIndex??classicBossIndex(p.hp,p.maxhp,mon.rogueBossSegments)}:{};const sourceForm=classicBattleSourceForm(p,mon);if(p?.m)delete p.m.rogueSourceForm;return {...sourceForm,...(side===0?{rogueStatusState:savedClassicStatusState(p)}:{}),...boss,captured:!!p?.m.captured,...(p?.m.roguePermanentDynamax?{dynamaxed:true,gigantamax:true,battleAppearance:p.species.id,battleSprite:p.species.spriteid}:{})};}));
 // Sketch replaces its source slot; save exact moves and PP before restoration.
 for(const [side,team] of teams.entries())for(const mon of team)if((mon.rogueSketchRule==='source-v1'||mon.rogueTrainerSketch==='source-v1')){const p=b.sides[side].pokemon.find(p=>token(p)===String(mon.boxId));if(p&&!p.transformed){mon.moves=p.baseMoveSlots.map(slot=>moveNameByKey[slot.id]||slot.move);mon.rogueSketchPP=p.baseMoveSlots.map(slot=>slot.pp);if(side===0){const owned=run?.party?.find(q=>String(q.boxId)===String(mon.boxId));if(owned){owned.moves=[...mon.moves];owned.rogueSketchPP=[...mon.rogueSketchPP];}}}}
 // XP may have changed party levels inside Faint before this final sync.
 if(run)for(const mon of teams[0]){const grown=run.party.find(p=>p.boxId===mon.boxId);if(grown){Object.assign(mon,{level:grown.level,experience:grown.experience,friendship:grown.friendship,stats:grown.stats,moves:[...grown.moves],roguePPUps:grown.roguePPUps,rogueMachoBraceCount:grown.rogueMachoBraceCount});}}
 const requests=[request(b,0,teams),request(b,1,teams)];
 return {...combat,...(run?{teraOrb:!!run.tools?.teraOrb,teraCharged:!!run.teraCharged}:{}),teams,snapshot:snapshot(b),requests,activeBySide:requests.map(r=>r.actors.map(a=>a.active)),turn:b.turn,ended:b.ended,winner:b.ended?(b.winner===b.p1.name?0:b.winner===b.p2.name?1:null):null,
  log:battleLines(b,start,{classicStyle:true}),events:battleVisuals(b,start,combat.teams,{classicStyle:true,initialConditions}),before:combat.teams,beforeActive:combat.requests?.map(r=>r.active)||[0,0],beforeActiveBySide:combat.activeBySide||requests.map(r=>r.actors.map(a=>a.active)),weather:b.rogueFog?'fog':b.field.weather||'',terrain:b.field.terrain||''};
}
// Mystery entry moves are external actions: they consume no move PP or player turn.
export function classicMysteryOpeningMove(run,move,{system=null,enemySlot=0,targetLoc=1}={}){
 const combat=structuredClone(run.combat),b=restore(combat,run,system),start=b.log.length,enemy=b.p2.active[enemySlot];
 if(enemy?.hp&&!b.ended&&b.p1.active[targetLoc-1]?.hp){b.actions.runMove(moves[move]?.key||move,enemy,targetLoc,{externalMove:true});b.resolveFaints({checkWinIfNoFaints:true});if(!b.ended){b.checkFainted();if(b.sides.some(side=>side.active.some(p=>p?.switchFlag)))b.makeRequest('switch');}}
 return output(b,combat,start,run);
}
export function createClassicCombat(run,foes,{trainer=false,doubles=false,weather='',terrain='',weatherDuration=0,terrainDuration=0,carryActive=[],carryTera=[],carryPlayerFaints=0,carryScreens=[],carryHazards=[],carryField={},fieldBeforeEntry=false,system=null}={}){
 const legalTeraTypes=new Set(Object.values(types)),retainedTera=new Map(carryTera.filter(entry=>entry&&typeof entry.id==='string'&&legalTeraTypes.has(entry.type)).map(entry=>[entry.id,entry]));
 run.party=run.party.map(mon=>retainedTera.has(String(mon.boxId))&&mon.terastallized===retainedTera.get(String(mon.boxId)).type?mon:syncClassicKeldeoMoveForm(resetClassicAutomaticForm(resetClassicZygarde(mon,run),run,{freshBattle:true}),run));foes=foes.map(mon=>syncClassicKeldeoMoveForm(resetClassicAutomaticForm(resetClassicZygarde(mon,run),run,{freshBattle:true}),run));
 const challengeMode=run.challengeEligibilityRule==='source-subset-v1';if(challengeMode&&(!Array.isArray(run.challenges)||run.party.some(p=>p.hp>0&&classicChallengeBattleEligibility(p,run.challenges)===null)))throw Error('지원하지 않거나 확인할 수 없는 챌린지입니다.');
 if(!run.party.some(p=>p.hp>0&&(!challengeMode||classicChallengeBattleEligibility(p,run.challenges)===true)))throw Error('싸울 수 있는 포켓몬이 없습니다.');
 if(run.challenges?.length){run.party=run.party.map(mon=>applyClassicPokemonChallenges(mon,run));foes=foes.map(mon=>applyClassicPokemonChallenges(mon,run,{enemy:true,trainer}));}
 const teams=[run.party,foes].map(team=>structuredClone(team).map(mon=>mon.dynamaxed&&!mon.gigantamax&&!mon.eternamax?{...mon,hp:Math.ceil(mon.hp*calculateStats(mon).hp/Math.max(1,mon.maxHp)),maxHp:calculateStats(mon).hp,dynamaxed:false}:mon).sort((a,b)=>Number(b.hp>0)-Number(a.hp>0)));
 if(challengeMode)teams[0].sort((a,b)=>Number(classicChallengeBattleEligibility(b,run.challenges)===true)-Number(classicChallengeBattleEligibility(a,run.challenges)===true));
 if(carryActive.length){const activeOrder=new Map(carryActive.map((p,i)=>[String(p.id),i]));teams[0].sort((a,b)=>(challengeMode?Number(classicChallengeBattleEligibility(b,run.challenges)===true)-Number(classicChallengeBattleEligibility(a,run.challenges)===true):Number(b.hp>0)-Number(a.hp>0))||(activeOrder.get(String(a.boxId))??99)-(activeOrder.get(String(b.boxId))??99));}
 const modifiers=structuredClone(run.modifiers||[]);for(const mon of teams[1])for(const modifier of mon.rogueFixedModifiers||[])modifiers.push({...modifier,boxId:String(mon.boxId)});
 const combat={classic:true,enemyAiConditionalMoveRule:run.enemyAiConditionalMoveRule||null,enemyAiUserTypeRule:run.enemyAiUserTypeRule||null,enemyAiAuroraVeilRule:run.enemyAiAuroraVeilRule||null,auroraVeilWeatherRule:run.auroraVeilWeatherRule||null,megaSolShoreUpRule:run.megaSolShoreUpRule||null,megaSolFogRule:run.megaSolFogRule||null,enemyAiWeatherBallRule:run.enemyAiWeatherBallRule||null,weatherBallStrongWindsRule:run.weatherBallStrongWindsRule||null,enemyAiDampRule:run.enemyAiDampRule||null,incinerateRule:run.incinerateRule||null,knockOffRule:run.knockOffRule||null,poltergeistRule:run.poltergeistRule||null,firstTurnWaveRule:run.firstTurnWaveRule||null,sketchCopyRule:run.sketchCopyRule||null,lastResortHistoryRule:run.lastResortHistoryRule||null,enemyAiLastResortRule:run.enemyAiLastResortRule||null,enemyAiSleepMoveRule:run.enemyAiSleepMoveRule||null,enemyAiFirstTurnRule:run.enemyAiFirstTurnRule||null,enemyAiWeatherRule:run.enemyAiWeatherRule||null,enemyAiTerrainRule:run.enemyAiTerrainRule||null,enemyAiTargetRule:run.enemyAiTargetRule||null,enemyAiStatusRule:run.enemyAiStatusRule||null,snapTrapRule:run.snapTrapRule||null,sourceMovePpRule:run.sourceMovePpRule||null,zippyPpRule:run.zippyPpRule||null,zippyZapRule:run.zippyZapRule||null,shellBellRule:run.shellBellRule||null,gripClawRule:run.gripClawRule||null,typeItemRule:run.typeItemRule||null,multiLensRule:run.multiLensRule||null,leftoversRule:run.leftoversRule||null,focusBandRule:run.focusBandRule||null,dnaFusionRule:run.dnaFusionRule||null,calledMoveRule:run.calledMoveRule||null,enemyAiMatchupRule:run.enemyAiMatchupRule||null,aiMatchupSeed:typeof run.seed==='string'?run.seed:'',aiBossTrainer:!!(run.encounter?.trainer?.hasVoucher||run.encounter?.kind==='rival'&&Number(run.encounter?.trainer?.id)>=378),enemySwitchCounter:0,naturePowerRule:run.naturePowerRule||null,enemyAiRule:run.enemyAiRule||null,adaptabilityRule:run.adaptabilityRule||null,stakeoutRule:run.stakeoutRule||null,lootLedger:[],lootLedgerVersion:1,lootSequence:0,...(challengeMode?{challengeEligibilityRule:'source-subset-v1',challengeRestrictions:structuredClone(run.challenges)}:{}),...(run.encounter?.kind==='mystery'?{mysteryArenaWave:run.wave}:{}),typedPowerRule:run.typedPowerRule||null,waterBubbleRule:run.waterBubbleRule||null,typeResistRule:run.typeResistRule||null,foulPlayStatRule:run.foulPlayStatRule||null,bodyPressStatRule:run.bodyPressStatRule||null,furCoatRule:run.furCoatRule||null,entryBoostRule:run.entryBoostRule||null,traceTargetRule:run.traceTargetRule||null,ruinIgnoreRule:run.ruinIgnoreRule||null,triageRule:run.triageRule||null,moveFlagRule:run.moveFlagRule||null,moveBalanceRule:run.moveBalanceRule||null,darkVoidRule:run.darkVoidRule||null,saltCureRule:run.saltCureRule||null,proteanRule:run.proteanRule||null,berryTeatimeRule:run.berryTeatimeRule||null,berryStuffRule:run.berryStuffRule||null,berryOrderRule:run.berryOrderRule||null,biomeId:Number(run.biome)||0,dynamaxBand:!!run.tools?.dynamaxBand,zRing:!!run.tools?.zRing,teraOrb:!!run.tools?.teraOrb,teraCharged:!!run.teraCharged,teams,modifiers,trainer,doubles,finalBoss:run.encounter?.kind==='final',finalPhase:run.encounter?.phase||null};
 const seed=Array.from({length:4},()=>{run.rng=(Math.imul(run.rng||1,1664525)+1013904223)>>>0;return run.rng%65536;});
 const formatid=doubles?'gen9doublescustomgame':'gen9customgame',singleChallengeDoubles=challengeMode&&doubles&&teams[0].filter(p=>classicChallengeBattleEligibility(p,run.challenges)===true).length===1,initialPlayerTeam=singleChallengeDoubles?teams[0].slice(0,1):teams[0],players=[{name:'플레이어',team:initialPlayerTeam.map(set)},{name:'상대',team:teams[1].map(set)}];
 const hazardSides=Array.isArray(carryHazards)?carryHazards:[carryHazards,{}],hazardIds=['stealthrock','spikes','toxicspikes','stickyweb'];
 const validHazard=(side,id)=>{const saved=side?.[id],cap=id==='spikes'?3:id==='toxicspikes'?2:0,layers=saved?.layers;return !!saved&&typeof saved==='object'&&saved.id===id&&(!cap||Number.isInteger(layers)&&layers>=1&&layers<=cap);};
 const fusionImposter=run.dnaFusionRule==='source-subset-v1'&&teams.some(team=>team.some(mon=>mon.fusionSpecies))&&teams.some(team=>team.some(mon=>mon.ability==='imposter'||mon.roguePassiveAbility==='imposter'));
 const preEntry=fusionImposter||teams.some(team=>team.some(mon=>mon.rogueSourceId===718&&mon.ability==='powerconstruct'))||!!run.challenges?.length||fieldBeforeEntry||retainedTera.size>0||carryActive.length>0||hazardSides.some(side=>hazardIds.some(id=>validHazard(side,id)))||['trickroom','gravity'].some(id=>Number.isSafeInteger(carryField?.[id])&&carryField[id]>0);
 const b=new Battle(preEntry?{formatid,seed}:{formatid,seed,p1:players[0],p2:players[1]});
 if(preEntry){
  const start=b.start,remembered=new Map(carryActive.map(p=>[String(p.id),p]));
  Object.defineProperty(b,'start',{configurable:true,enumerable:false,value(){
   if(Number.isSafeInteger(carryPlayerFaints)&&carryPlayerFaints>0)this.p1.totalFainted+=carryPlayerFaints;
   for(const side of this.sides)for(const p of side.pokemon){const mon=sourceMon(combat,p);sourceStats(p,mon,{initial:true});const saved=side.n===0&&retainedTera.get(token(p));if(saved&&mon?.terastallized===saved.type){p.terastallized=saved.type;p.teraType=saved.type;p.set.teraType=saved.type;p.apparentType=saved.type;p.knownType=true;p.addedType='';p.stellarBoostedTypes=Array.isArray(saved.stellarBoostedTypes)?[...new Set(saved.stellarBoostedTypes.filter(type=>legalTeraTypes.has(type)&&type!=='Stellar'))]:[];}}
   if(!trainer)markInitialEncounter(this,run.id+':'+run.wave,String(run.biome));if(this.rogueWild)this.rogueWild.wave=run.wave;install(this,combat,run,system);
   const retainedHazards=this.sides.flatMap((side,i)=>hazardIds.filter(id=>validHazard(hazardSides[i],id)).map(id=>({side,id,saved:hazardSides[i][id]})));
   retainedHazards.sort((a,b)=>(Number.isSafeInteger(a.saved.effectOrder)?a.saved.effectOrder:Number.MAX_SAFE_INTEGER)-(Number.isSafeInteger(b.saved.effectOrder)?b.saved.effectOrder:Number.MAX_SAFE_INTEGER));
   for(const {side,id,saved} of retainedHazards)side.sideConditions[id]=this.initEffectState({id,target:side,...(['spikes','toxicspikes'].includes(id)?{layers:saved.layers}:{})});
   for(let i=0;i<this.sides.length;i++)for(const id of ['reflect','lightscreen','auroraveil','tailwind','mist','safeguard']){const duration=carryScreens[i]?.[id];if(Number.isSafeInteger(duration)&&duration>0)this.sides[i].sideConditions[id]=this.initEffectState({id,target:this.sides[i],duration});}
   // Field effects must be active before entry hazards and ability ordering.
   for(const id of ['trickroom','gravity']){const duration=carryField?.[id];if(Number.isSafeInteger(duration)&&duration>0)this.field.pseudoWeather[id]=this.initEffectState({id,target:this.field,duration});}
   // Conditions already present in the arena must affect entry hazards and abilities.
   const retainedWeather=weather==='fog'?'':weather==='snow'?'snowscape':weather;
   if(weather==='fog')this.rogueFog=true;
   if(retainedWeather){this.field.weather=retainedWeather;this.field.weatherState=this.initEffectState({id:retainedWeather,target:this.field,duration:Number.isInteger(weatherDuration)?Math.max(0,weatherDuration):0});}
   if(terrain){this.field.terrain=terrain;this.field.terrainState=this.initEffectState({id:terrain,target:this.field,duration:Number.isInteger(terrainDuration)?Math.max(0,terrainDuration):0});}
   const fieldEvent=this.fieldEvent;Object.defineProperty(this,'fieldEvent',{configurable:true,enumerable:false,value(event,targets){
    if(event==='SwitchIn'&&Array.isArray(targets)){for(const p of targets){const prev=p?.side?.n===0&&remembered.get(token(p));if(!prev)continue;for(const key of ['atk','def','spa','spd','spe','accuracy','evasion'])if(Number.isInteger(prev.boosts?.[key]))p.boosts[key]=Math.max(-6,Math.min(6,prev.boosts[key]));if(Number.isSafeInteger(prev.timesAttacked)&&prev.timesAttacked>0)p.timesAttacked+=prev.timesAttacked;if(p.ability==='slowstart'&&prev.ability==='slowstart'&&prev.abilityState?.id==='slowstart'&&Number.isInteger(prev.abilityState.counter)&&prev.abilityState.counter>=1&&prev.abilityState.counter<=5)p.abilityState.counter=prev.abilityState.counter;for(const id of ['confusion','aquaring','ingrain','focusenergy','substitute','leechseed']){const v=prev.volatiles?.[id];if(!v||typeof v!=='object'||v.id!==id||id==='confusion'&&(!Number.isInteger(v.time)||v.time<1||v.time>5)||id==='substitute'&&(!Number.isSafeInteger(v.hp)||v.hp<1||v.hp>10000)||id==='leechseed'&&!/^p2[ab]$/.test(v.sourceSlot||''))continue;p.volatiles[id]=this.initEffectState({id,target:p,...(id==='confusion'?{time:v.time}:{}),...(id==='substitute'?{hp:v.hp}:{}),...(id==='leechseed'?{sourceSlot:v.sourceSlot}:{})});}const link=prev.allyBinding,source=link&&this.p1.active.find(q=>q?.hp>0&&q.isActive&&token(q)===String(link.sourceId));if(source&&source!==p&&classicBindingMoves.has(link.move)&&Number.isInteger(link.duration)&&link.duration>=1&&link.duration<=8&&[6,8].includes(link.boundDivisor))p.volatiles.partiallytrapped=this.initEffectState({id:'partiallytrapped',target:p,source,sourceSlot:source.getSlot(),sourceEffect:this.dex.moves.get(link.move),duration:link.duration,boundDivisor:8});const escaped=prev.escapedBinding;if(!p.volatiles.partiallytrapped&&escaped&&classicBindingMoves.has(escaped.move)&&Number.isInteger(escaped.duration)&&escaped.duration>=1&&escaped.duration<=8&&[6,8].includes(escaped.boundDivisor))p.volatiles.partiallytrapped=this.initEffectState({id:'partiallytrapped',target:p,sourceEffect:this.dex.moves.get(escaped.move),duration:escaped.duration,boundDivisor:8,rogueEscapedSource:true});p.updateSpeed();}delete this.fieldEvent;return fieldEvent.call(this,event,targets.filter(p=>!(p?.side?.n===0&&remembered.has(token(p)))));}
    return fieldEvent.call(this,event,targets);
   }});
   return start.call(this);
  }});
  b.setPlayer('p1',players[0]);b.setPlayer('p2',players[1]);
 }else{
  if(Number.isSafeInteger(carryPlayerFaints)&&carryPlayerFaints>0)b.p1.totalFainted+=carryPlayerFaints;
  if(!trainer)markInitialEncounter(b,run.id+':'+run.wave,String(run.biome));if(b.rogueWild)b.rogueWild.wave=run.wave;install(b,combat,run,system);
 }
 const startedBeforeRestore=b.sides.some(side=>side.active.some(Boolean));
 for(const side of b.sides)for(const p of side.pokemon){const mon=sourceMon(combat,p);if(!preEntry)sourceStats(p,mon,{initial:true});applyClassicTeraAccess(p,combat,run);}
 const initialConditions=new Map();if(startedBeforeRestore)for(const side of b.sides)for(const p of side.active)if(p)initialConditions.set(side.n+':'+token(p),{hp:p.hp,maxHp:p.maxhp,status:({psn:'독',tox:'맹독',brn:'화상',par:'마비',slp:'잠듦',frz:'얼음'})[p.status]||null});
 if(b.requestState==='teampreview')b.makeChoices(initialPlayerTeam.map((_,i)=>i+1).join('').replace(/^/,'team '),teams[1].map((_,i)=>i+1).join('').replace(/^/,'team '));
 if(singleChallengeDoubles)for(const mon of teams[0].slice(1))appendOwnedPokemon(b,combat,run,mon);
 reconcileLivingCounts(b);
 // Initial hazards can empty a side before the first command exists.
 if(preEntry&&!b.ended){b.resolveFaints({checkWinIfNoFaints:true});if(!b.ended){b.checkFainted();if(b.sides.some(side=>side.active.some(p=>p?.switchFlag)))b.makeRequest('switch');}}
 if(!preEntry&&carryActive.length){const remembered=new Map(carryActive.map(p=>[String(p.id),p]));for(const p of b.p1.active){const previous=p&&remembered.get(token(p));if(!previous)continue;const boosts=previous.boosts||{};for(const key of ['atk','def','spa','spd','spe','accuracy','evasion'])if(Number.isInteger(boosts[key]))p.boosts[key]=Math.max(-6,Math.min(6,boosts[key]));if(Number.isSafeInteger(previous.timesAttacked)&&previous.timesAttacked>0)p.timesAttacked+=previous.timesAttacked;p.updateSpeed();}}
 // Screens for transitions that did not require pre-entry hazard setup.
 if(!preEntry)for(let i=0;i<b.sides.length;i++)for(const id of ['reflect','lightscreen','auroraveil','tailwind','mist','safeguard']){const duration=carryScreens[i]?.[id];if(Number.isSafeInteger(duration)&&duration>0&&!b.sides[i].sideConditions[id])b.sides[i].sideConditions[id]=b.initEffectState({id,target:b.sides[i],duration});}
 if(weather==='fog'&&!b.field.weather&&(!preEntry||b.rogueFog)){b.rogueFog=true;b.add('-weather','Fog');}
 const nativeWeather=weather==='fog'?'':weather==='snow'?'snowscape':weather;
 if(!preEntry&&nativeWeather&&!b.field.weather){b.field.setWeather(nativeWeather,b.p1.active[0],b.dex.moves.get(nativeWeather));b.field.weatherState.duration=Number.isInteger(weatherDuration)?Math.max(0,weatherDuration):0;}
 if(!preEntry&&terrain&&!b.field.terrain){b.field.setTerrain(terrain,b.p1.active[0],b.dex.moves.get(terrain));b.field.terrainState.duration=Number.isInteger(terrainDuration)?Math.max(0,terrainDuration):0;}
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
  if(cmd.type==='switch'){if(!actor.switches.some(s=>s.slot===cmd.slot)||switches.has(cmd.slot)||cmd.passBaton===true&&!actor.canBaton)throw Error('교체할 수 없는 포켓몬입니다.');switches.add(cmd.slot);return 'switch '+cmd.slot;}
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
  const withAiActive=(a,fn)=>{const previous=simulation.activePokemon;simulation.activePokemon=a;try{return fn();}finally{simulation.activePokemon=previous;}};
  const damage=(a,d,id)=>{try{if(combat.enemyAiWeatherBallRule==='source-v1'&&id==='weatherball'&&!a.volatiles.dynamax)return withAiActive(a,()=>{let move=simulation.dex.getActiveMove(id);simulation.singleEvent('ModifyType',move,null,a,d,move,move);simulation.singleEvent('ModifyMove',move,null,a,d,move,move);move=simulation.runEvent('ModifyType',a,d,move,move);return Number(simulation.actions.getDamage(a,d,move,true))||0;});return Number(simulation.actions.getDamage(a,d,simulation.dex.moves.get(id),true))||0;}catch{return 0;}};
  const terrainBlocked=(a,target,move)=>{if(combat.enemyAiTerrainRule!=='source-v1'||!a||!target||target.side===a.side||!target.isGrounded()||!simulation.field.isTerrain('psychicterrain')||['all','foeSide','allySide','allyTeam','self'].includes(move.target))return false;const active=simulation.dex.getActiveMove(move.id),priority=simulation.runEvent('ModifyPriority',a,target,active,active.priority||0);return typeof priority==='number'&&priority>0;};
  const weatherBlocked=(a,target,move)=>{if(combat.enemyAiWeatherRule!=='source-v1'||!a||!move||move.category==='Status')return false;const weather=simulation.field.effectiveWeather();if(weather!=='desolateland'&&weather!=='primordialsea')return false;let active=simulation.dex.getActiveMove(move.id);const applyType=()=>{simulation.singleEvent('ModifyType',active,null,a,target,active,active);active=simulation.runEvent('ModifyType',a,target,active,active);};if(combat.enemyAiWeatherBallRule==='source-v1'&&move.id==='weatherball')withAiActive(a,applyType);else applyType();return !!active&&(weather==='desolateland'&&active.type==='Water'||weather==='primordialsea'&&active.type==='Fire');};
  const firstTurnBlocked=(a,move)=>{if(!a||a.volatiles.dynamax)return false;if(combat.firstTurnWaveRule==='source-subset-v1')return ['fakeout','firstimpression','matblock'].includes(move.id)&&a.activeTurns>1;return combat.enemyAiFirstTurnRule==='source-v1'&&['fakeout','firstimpression'].includes(move.id)&&a.activeMoveActions>0;};
  const sleepMoveBlocked=(a,target,move)=>{if(combat.enemyAiSleepMoveRule!=='source-v1'||!a||!target||a.volatiles.dynamax)return false;const subject=move.id==='dreameater'?target:move.id==='snore'?a:null;return !!subject&&subject.status!=='slp'&&!subject.hasAbility('comatose');};
  const lastResortBlocked=(a,move)=>combat.enemyAiLastResortRule==='source-v1'&&!!a&&!a.volatiles.dynamax&&move.id==='lastresort'&&(a.moveSlots.length<2||!a.moveSlots.some(slot=>slot.id==='lastresort')||a.moveSlots.some(slot=>slot.id!=='lastresort'&&!slot.used));
  const poltergeistBlocked=(a,target,move)=>combat.poltergeistRule==='source-subset-v1'&&!!a&&!a.volatiles.dynamax&&move.id==='poltergeist'&&!simulation.roguePoltergeistTargetItem?.(target);
  const dampBlocked=(a,move)=>{if(combat.enemyAiDampRule!=='source-subset-v1'||!a||a.volatiles.dynamax||!['explosion','selfdestruct','mindblown','mistyexplosion'].includes(move.id))return false;return simulation.getAllActive().some(p=>p?.hp>0&&p.hasAbility('damp'));};
  const conditionalMoveBlocked=(a,target,move)=>{if(!a||!target||a.volatiles.dynamax)return false;if(move.id==='auroraveil'&&((combat.auroraVeilWeatherRule==='source-v1'&&a.hasAbility('megasol'))||(combat.enemyAiAuroraVeilRule==='source-v1'&&!['hail','snowscape'].includes(simulation.field.effectiveWeather()))))return true;if(combat.enemyAiUserTypeRule==='source-v1'&&((move.id==='burnup'&&!a.hasType('Fire'))||(move.id==='doubleshock'&&!a.hasType('Electric'))))return true;if(combat.enemyAiConditionalMoveRule!=='source-subset-v1')return false;if(move.id==='steelroller')return !simulation.field.terrain;if(move.id==='synchronoise'){const types=a.getTypes();return types.includes('???')||!types.some(type=>target.getTypes().includes(type));}return false;};
  const scoreMove=(a,id,target)=>{
   if(!a||!target)return 0;const m=simulation.dex.moves.get(id);if(terrainBlocked(a,target,m)||weatherBlocked(a,target,m)||firstTurnBlocked(a,m)||sleepMoveBlocked(a,target,m)||lastResortBlocked(a,m)||poltergeistBlocked(a,target,m)||dampBlocked(a,m)||conditionalMoveBlocked(a,target,m))return -1000;let score=0;
   if(m.category!=='Status'){
    if(target.side===a.side)score=-1000;else{const predicted=damage(a,target,id),remaining=Math.max(1,target.hp);score=predicted;if(predicted>=remaining){score+=target.maxhp*.35;if((m.priority||0)>0)score+=target.maxhp*.2;}if(m.recoil&&a.hp<=predicted*(m.recoil[0]/m.recoil[1]))score*=.7;}
   }
   else if(['protect','detect','spikyshield','kingsshield','banefulbunker','obstruct','silktrap','burningbulwark'].includes(m.id)&&!a.volatiles.stall){const ally=simulation.p2.active.some(p=>p&&p!==a&&p.hp>0),residual=foes.some(p=>['psn','tox','brn'].includes(p.status)||p.volatiles.leechseed),incoming=Math.max(0,...foes.flatMap(f=>f.getMoves().map(move=>damage(f,a,move.id))));if((ally||residual)&&incoming>=a.hp*.65)score=Math.min(a.maxhp*.5,incoming*.5);}
   else if(m.heal||['synthesis','morningsun','moonlight','shoreup'].includes(m.id)){const recipient=m.target==='self'?a:target;if(recipient?.side===a.side&&!recipient.volatiles.healblock&&recipient.hp<recipient.maxhp*.65){const weather=combat.megaSolFogRule==='source-v1'&&recipient.hasAbility('megasol')?'sunnyday':simulation.rogueFog&&!fogWeatherSuppressed(simulation)?'fog':simulation.field.effectiveWeather(),ratio=m.heal?m.heal[0]/m.heal[1]:m.id==='shoreup'?((combat.megaSolShoreUpRule==='source-v1'&&recipient.hasAbility('megasol'))?.5:weather==='sandstorm'?2/3:.5):['sunnyday','desolateland'].includes(weather)?2/3:['raindance','primordialsea','sandstorm','hail','snowscape','fog'].includes(weather)?0.25:0.5,recovery=Math.min(recipient.maxhp-recipient.hp,recipient.maxhp*ratio),danger=Math.max(0,...foes.flatMap(f=>f.getMoves().map(move=>damage(f,recipient,move.id))));score=recovery;if(danger>=recipient.hp+recovery)score*=.25;else if(danger>=recipient.hp)score*=1.25;}}
   else if(m.status&&target.side!==a.side&&!target.status&&target.runStatusImmunity(m.status==='tox'?'psn':m.status)&&!(target.isGrounded()&&(simulation.field.isTerrain('mistyterrain')||m.status==='slp'&&simulation.field.isTerrain('electricterrain')))&&(!target.side.sideConditions.safeguard||a.hasAbility('infiltrator'))&&(!target.volatiles.substitute||m.flags?.bypasssub||a.hasAbility('infiltrator'))&&(m.id!=='thunderwave'||simulation.dex.getImmunity('Electric',target))&&(!m.flags?.reflectable||!target.hasAbility('magicbounce')||a.hasAbility(['moldbreaker','teravolt','turboblaze'])))score=target.maxhp*(m.status==='slp'?.35:.2);
   else if(m.volatileStatus&&target.side!==a.side&&!target.volatiles[m.volatileStatus]&&(!target.volatiles.substitute||m.flags?.bypasssub||(combat.enemyAiStatusRule==='source-v1'&&a.hasAbility('infiltrator')))){
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
  if(actor.kind==='switch'&&actor.revival){const choices=actor.switches.filter(s=>!used.has(s.slot));if(!choices.length)return 'pass';const choice=b.sample(choices);used.add(choice.slot);return 'switch '+choice.slot;}
  if(combat.enemyAiMatchupRule==='source-matchup-v1'&&foes.length){
   const baseChart=(type,targetType)=>!simulation.dex.types.get(targetType).exists?1:simulation.dex.getImmunity(type,[targetType])?2**simulation.dex.getEffectiveness(type,[targetType]):0;
   const chart=(type,target,source,options)=>classicAiTypeMultiplier(type,target,source,baseChart,options);
   const describe=p=>({native:p,types:(p.illusion||p).getTypes(),hp:p.hp,maxHp:p.maxhp,speed:p.getStat('spe'),active:p.isActive,grounded:p.isGrounded(),terastallized:!!p.terastallized,scrappy:p.hasAbility(['scrappy','mindseye']),exposedGhost:!!p.volatiles.foresight,exposedDark:!!p.volatiles.miracleeye,forcedGrounded:!!(simulation.field.pseudoWeather.gravity||p.volatiles.ingrain||p.volatiles.smackdown||p.hasItem('ironball')),forcedAirborne:!simulation.field.pseudoWeather.gravity&&!p.volatiles.ingrain&&!p.volatiles.smackdown&&!p.hasItem('ironball')&&(p.hasAbility(['levitate','eelevate'])&&!simulation.suppressingAbility(p)||!!p.volatiles.magnetrise||!!p.volatiles.telekinesis||p.hasItem('airballoon')),strongWinds:simulation.field.effectiveWeather()==='deltastream',canPoison:!p.status&&!p.hasType(['Poison','Steel'])&&p.runStatusImmunity('psn'),legendary:!!rogueSpecies.get(sourceMon(combat,p)?.rogueSourceId||p.baseSpecies.num)?.legendary,moves:p.moveSlots.map(slot=>{const m=simulation.dex.moves.get(slot.id);return {category:m.category,type:m.type,pp:slot.pp,variableType:typeof m.onModifyType==='function'};})});
   const opponents=foes.map(describe),mean=p=>opponents.reduce((total,o)=>{const next=total+classicAiMatchupScore(p,o,chart);return o.legendary?next/2:next;},0)/opponents.length;
   const hazards=Object.entries(simulation.p2.sideConditions).filter(([id])=>['spikes','stealthrock','toxicspikes','stickyweb'].includes(id)).map(([id,state])=>({id,layers:state.layers||1}));
   const candidates=actor.switches.filter(c=>!used.has(c.slot)).map(c=>{const mon=describe(simulation.p2.pokemon[c.slot-1]);return {...c,score:mean(mon)*classicAiHazardMultiplier(mon,hazards,chart)};});
   const counter=Number.isSafeInteger(combat.enemySwitchCounter)&&combat.enemySwitchCounter>0?combat.enemySwitchCounter:0;
   if(actor.kind==='switch'&&candidates.length){const best=Math.max(...candidates.map(c=>c.score)),tied=candidates.filter(c=>c.score===best),choice=tied.length>1?tied[classicAiTieIndex(combat.aiMatchupSeed,b.turn,tied.length)]:tied[0];used.add(choice.slot);return 'switch '+choice.slot;}
   if(combat.trainer&&att&&!att.trapped&&!['twoturnmove','mustrecharge','lockedmove','bide'].some(key=>att.volatiles[key])){
    const active=describe(att),current=opponents.reduce((sum,o)=>sum+classicAiMatchupScore(active,o,chart),0)/opponents.length;
    const choice=classicAiSwitchDecision(current,candidates,{counter,boss:!!combat.aiBossTrainer,randomInt:n=>classicAiTieIndex(combat.aiMatchupSeed,b.turn,n)});
    if(choice){used.add(choice.slot);combat.enemySwitchCounter=counter+1;return 'switch '+choice.slot;}
   }
   combat.enemySwitchCounter=Math.max(counter-1,0);
  }
  const bench=(combat.enemyAiMatchupRule==='source-matchup-v1'?[]:actor.switches.filter(s=>!used.has(s.slot))).map(s=>{const p=simulation.p2.pokemon[s.slot-1],offense=Math.max(0,...p.getMoves().map(m=>scoreMove(p,m.id,foes[0]))),incoming=Math.max(0,...foes.flatMap(f=>f.getMoves().map(m=>damage(f,p,m.id))));return {...s,score:offense/Math.max(1,foes[0]?.hp)-incoming/Math.max(1,p.hp)};}).sort((a,b)=>b.score-a.score);
  if(actor.kind==='switch'){if(!bench[0])return 'pass';used.add(bench[0].slot);return 'switch '+bench[0].slot;}
  const ranked=actor.moves.flatMap(m=>{const fallback=simulation.activePerHalf>1&&simulation.actions.targetTypeChoices(m.target)?[1,2,-1,-2].find(loc=>simulation.validTargetLoc(loc,att,m.target)):undefined;return (m.targets.length?m.targets:combat.enemyAiConditionalMoveRule==='source-subset-v1'&&m.id==='synchronoise'&&simulation.activePerHalf>1&&foes.length?simulation.p1.active.flatMap((p,slot)=>p?.hp?[{side:0,slot}]:[]):[{target:fallback,side:0,slot:0}]).map(t=>{const target=simulation.sides[t.side]?.active[t.slot]||foes[0];return {m,t,score:scoreMove(att,m.id,target),...(combat.enemyAiRule==='source-ranked-v1'?{knocksOut:!!att&&!!target&&target.hp>0&&target.side!==att.side&&simulation.dex.moves.get(m.id).category!=='Status'&&!terrainBlocked(att,target,simulation.dex.moves.get(m.id))&&!weatherBlocked(att,target,simulation.dex.moves.get(m.id))&&!firstTurnBlocked(att,simulation.dex.moves.get(m.id))&&!sleepMoveBlocked(att,target,simulation.dex.moves.get(m.id))&&!lastResortBlocked(att,simulation.dex.moves.get(m.id))&&!poltergeistBlocked(att,target,simulation.dex.moves.get(m.id))&&!dampBlocked(att,simulation.dex.moves.get(m.id))&&!conditionalMoveBlocked(att,target,simulation.dex.moves.get(m.id))&&damage(att,target,m.id)>=target.hp}:{})};});}).sort((a,b)=>b.score-a.score);
  const incoming=Math.max(0,...foes.flatMap(f=>f.getMoves().map(m=>damage(f,att,m.id)))),active=ranked[0].score/Math.max(1,foes[0]?.hp)-incoming/Math.max(1,att.hp);
  if(combat.enemyAiMatchupRule!=='source-matchup-v1'&&combat.trainer&&bench[0]&&bench[0].score>active+.7&&incoming>att.hp*.65&&(b.turn-(combat.lastSwitchTurn||-10)>2)){used.add(bench[0].slot);combat.lastSwitchTurn=b.turn;return 'switch '+bench[0].slot;}
  let best=combat.enemyAiRule==='source-ranked-v1'?chooseClassicRankedMove(ranked,{smart:!!(combat.trainer||combat.teams[1]?.[actor.active]?.rogueBoss),randomInt:n=>b.random(n)}):ranked[0];if(combat.enemyAiTargetRule==='source-tie-v1')best=chooseClassicTiedTarget(best,ranked,n=>b.random(n));const canTera=!usedTera&&!!combat.teams[1]?.[actor.active]?.rogueInstantTera&&actor.specials.some(s=>s.key==='terastallize');if(canTera)usedTera=true;return 'move '+((best.m.id==='sketch'||best.t.target===undefined)&&best.m.slot?best.m.slot:best.m.id)+(best.t.target!==undefined?' '+best.t.target:'')+(canTera?' terastallize':'');
 }).join(', ');
}
export function playClassicCombat(run,command,{system=null}={}){
 const combat=structuredClone(run.combat);combat.dynamaxBand=!!run.tools?.dynamaxBand;combat.zRing=!!run.tools?.zRing;combat.teams[0]=structuredClone(run.party);const b=restore(combat,run,system),start=b.log.length;if(b.ended)throw Error('이미 끝난 전투입니다.');
 const ownRequest=request(b,0,combat.teams),input=commandFor(command,ownRequest),actions=command?.type==='turn'?command.actions:[{...command,actor:ownRequest.actors.find(a=>a.kind!=='wait')?.slot}];if(b.rogueChallengeEligibility&&actions.some(a=>a.type==='move'&&ownRequest.actors.find(actor=>actor.slot===a.actor)?.moves.some(move=>move.id==='revivalblessing'&&(a.move===move.id||a.move===move.name)))){const fainted=b.p1.pokemon.filter(p=>p.fainted&&!p.m?.released&&!p.m?.captured);if(fainted.length&&!fainted.some(p=>b.rogueChallengeEligibility(p,1)!==null))throw Error('확인되지 않은 챌린지 포켓몬은 부활할 수 없습니다.');}Object.defineProperty(b,'rogueBatonPassTokens',{configurable:true,enumerable:false,value:new Set(actions.filter(a=>a.type==='switch'&&a.passBaton===true).map(a=>token(b.p1.active[a.actor])))});recordActiveParticipants(run,b);const cpuNeeded=!!b.p2.activeRequest&&!b.p2.activeRequest.wait,cpu=cpuNeeded?aiInput(b,combat):null;
 if(!b.choose('p1',input))throw Error(b.p1.choice.error||'행동을 처리하지 못했습니다.');
 if(cpuNeeded&&!b.ended&&!b.choose('p2',cpu))throw Error(b.p2.choice.error||'상대 행동을 처리하지 못했습니다.');
 for(let i=0;i<12&&!b.ended;i++){const own=request(b,0,combat.teams),foe=request(b,1,combat.teams);if(own.kind!=='wait'||foe.kind==='wait')break;{const choice=aiInput(b,combat);if(!b.choose('p2',choice))throw Error('상대 행동을 처리하지 못했습니다.');}}
 run.participants=[...new Set([...(run.participants||[]),...b.p1.active.filter(p=>p?.hp).map(token)])];
 if(b.p1.pokemon.some(p=>p.terastallized))run.teraCharged=false;
 return output(b,combat,start,run);
}
// Fun and Games uses the real battle engine, but its opponent has no turn.
// This helper is deliberately gated to the event and accepts only move inputs.
export function playClassicMinigameTurn(run,command,{system=null}={}){
 if(command?.type==='turn'){if(!Array.isArray(command.actions)||command.actions.length!==1||command.actions[0]?.actor!==0)throw Error('미니게임에서 사용할 기술을 확인하세요.');command=command.actions[0];}
 if(run.mystery?.type!=='fun-and-games'||run.mystery.stage!=='battle'||run.encounter?.key!=='fun-and-games'||run.combat?.ended||command?.type!=='move'||command?.special)throw Error('미니게임에서 사용할 기술을 확인하세요.');
 const combat=structuredClone(run.combat);combat.teams[0]=structuredClone(run.party);const b=restore(combat,run,system),start=b.log.length;
 if(b.dex.moves.get(command.move).selfSwitch)throw Error('참가 포켓몬을 교체하는 기술은 사용할 수 없습니다.');
 if(b.ended||b.p1.active.length!==1||b.p2.active.length!==1||request(b,0,combat.teams).kind!=='move'||!b.p2.activeRequest||b.p2.activeRequest.wait)throw Error('미니게임 전투 상태를 확인하세요.');
 const input=commandFor(command,request(b,0,combat.teams));if(!b.choose('p1',input))throw Error(b.p1.choice.error||'기술을 처리하지 못했습니다.');
 // A normal "pass" command is rejected for a conscious Pokémon. An explicit
 // pass action skips its action without consuming PP or invoking a fake move.
 b.p2.clearChoice();b.p2.choice.actions.push({choice:'pass'});if(!b.allChoicesDone())throw Error('미니게임의 상대 행동을 처리하지 못했습니다.');b.commitChoices();
 return output(b,combat,start,run);
}
export function initialClassicSwitch(run,slot,boxId,{system=null}={}){
 const combat=structuredClone(run.combat);combat.teams[0]=structuredClone(run.party);const b=restore(combat,run,system),start=b.log.length,actor=request(b,0,combat.teams).actors.find(a=>a.slot===slot);
 if(!actor||actor.kind!=='move'||!actor.switches.some(option=>String(combat.teams[0][option.index]?.boxId)===String(boxId)))throw Error('교체할 수 없는 포켓몬입니다.');
 const incoming=b.p1.pokemon.find(p=>token(p)===String(boxId));if(!incoming||!b.p1.active[slot]?.hp)throw Error('교체할 포켓몬을 확인하세요.');
 const switched=b.actions.switchIn(incoming,slot);
 if(switched&&(run?.stakeoutRule||combat.stakeoutRule)==='source-subset-v1')incoming.m.rogueStakeoutInitialTurn=b.turn;
 const index=b.queue.list.findIndex(action=>action.choice==='runSwitch'&&action.pokemon===incoming);if(index>=0){b.queue.list.splice(index,1);b.actions.runSwitch(incoming);}b.resolveFaints({checkWinIfNoFaints:true});
 if(!b.ended){b.checkFainted();const forced=b.sides.some(side=>side.active.some(p=>p?.switchFlag));b.makeRequest(forced?'switch':'move');}
 return output(b,combat,start,run);
}
export function classicCombatView(combat){const {teams,before,beforeActive,beforeActiveBySide,turn,ended,winner,log,events,weather,terrain}=combat;const b=restore(combat),requests=[request(b,0,teams),request(b,1,teams)],activeBySide=requests.map(r=>r.actors.map(a=>a.active));const decorate=(team,own)=>team.map(mon=>{const base=mon.rogueBattleSpecies||rules.species[mon.id]?.key,native=base?Dex.species.get(base):null;return {...mon,rogueBaseBattleAppearance:native?.exists?native.id:null,...(own?{rogueExperienceToNext:classicExpToNext(mon)}:{})};}),viewTeams=[decorate(teams[0],true),decorate(teams[1],false)],viewBefore=Array.isArray(before)?[decorate(before[0]||[],true),decorate(before[1]||[],false)]:before;return {teams:viewTeams,before:viewBefore,beforeActive,beforeActiveBySide,requests:[requests[0]],turn,ended,winner,log,events,weather,terrain,activeBySide,side:0,active:requests.map(r=>r.active)};}

export function continueClassicWild(run,foes,{system=null}={}){
 run.party=run.party.map(mon=>resetClassicAutomaticForm(resetClassicZygarde(mon,run),run));foes=foes.map(mon=>resetClassicAutomaticForm(resetClassicZygarde(mon,run),run));
 if(run.challenges?.length){run.party=run.party.map(mon=>applyClassicPokemonChallenges(mon,run));foes=foes.map(mon=>applyClassicPokemonChallenges(mon,run,{enemy:true,trainer:!!run.encounter?.trainer||run.encounter?.kind==='trainer'}));}
 const previous=run.combat;if(!previous||previous.trainer)throw Error('야생 연속 전투 경계를 확인하세요.');
 const combat={...previous,moneyScattered:0,lastFailedBallId:null,ballFetchUsed:[],lootLedger:[],lootLedgerVersion:1,lootSequence:0,pickupSettledFor:null,biomeId:Number(run.biome)||0,dynamaxBand:!!run.tools?.dynamaxBand,zRing:!!run.tools?.zRing,teams:[structuredClone(run.party),structuredClone(foes)],modifiers:structuredClone(run.modifiers||[])};
 for(const mon of combat.teams[1])for(const modifier of mon.rogueFixedModifiers||[])combat.modifiers.push({...modifier,boxId:String(mon.boxId)});
 // Bind against new descriptors before entry. Archived foes keep their own
 // native volatile references but are excluded from public teams and AI choices.
 const b=restore({...combat,snapshot:previous.snapshot},run,system),start=b.log.length;
 // Supplies and free rewards update the owned party between encounters. A
 // previously fainted reserve still has its old faint/HP flags in the native
 // snapshot; restore that explicitly revived reserve before enemy entry.
 // Do this before entry so it cannot undo a new hazard/entry-effect faint.
 for(const p of b.p1.pokemon){const mon=sourceMon(combat,p);if(!p.isActive&&!p.m?.released&&!p.m?.captured&&p.hp<=0&&mon?.hp>0){p.hp=Math.min(p.maxhp,mon.hp);p.fainted=false;p.faintQueued=false;p.subFainted=false;const status=statuses[mon.status]||mon.status||'';p.status=status==='fnt'?'':status;p.statusState=b.initEffectState({id:p.status,target:p});}}
 reconcileLivingCounts(b);
 // A continuous encounter has no player switch-in event: record the field
 // before opposing entry effects or a first-turn knockout can award EXP.
 recordActiveParticipants(run,b);
 continueWild(b,foes.map((mon,i)=>set(mon,b.p2.pokemon.length+i)),{id:run.id+':'+run.wave,biome:String(run.biome),beforeEntry:p=>{sourceStats(p,sourceMon(combat,p),{initial:true});prepareNativePokemon(p,combat,run);}});
 for(const p of b.p1.pokemon){const mon=sourceMon(combat,p);if(mon){const old=p.hp;sourceStats(p,mon);p.hp=old>0?Math.min(p.maxhp,mon.hp):0;if((mon.item||'')!==p.item){if(p.isActive&&p.hp)p.setItem(mon.item||'');else{p.item=mon.item||'';p.itemState=b.initEffectState({id:p.item,target:p});}}
  const nextMoves=mon.moves.map(name=>b.dex.moves.get(moves[name]?.key||name));
  if(nextMoves.some((move,i)=>p.baseMoveSlots[i]?.id!==move.id)||nextMoves.length!==p.baseMoveSlots.length){p.set.moves=nextMoves.map(m=>m.id);const previous=b.rogueLastResortHistoryRule?(p.transformed?p.baseMoveSlots:p.moveSlots):[];p.baseMoveSlots=nextMoves.map((move,i)=>({move:move.name,id:move.id,pp:mon.rogueSketchPP?.[i]??mon.pp?.[move.id]??classicMaxPP(mon,i,p.battle),maxpp:classicMaxPP(mon,i,p.battle),target:move.target,disabled:false,disabledSource:'',used:previous.some(slot=>slot.id===move.id&&slot.used===true)||!!(b.rogueLastResortSourceLedger&&Array.isArray(p.m.rogueDirectMoveHistory)&&p.m.rogueDirectMoveHistory.includes(move.id))}));if(!p.transformed)p.moveSlots=p.baseMoveSlots.map(m=>({...m}));}
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
 if(run.encounter?.trainer||run.encounter?.noFlee||run.encounter?.kind==='final'||run.biome===50)throw Error('이 전투에서는 도망칠 수 없습니다.');
 const combat=structuredClone(run.combat);combat.teams[0]=structuredClone(run.party);
 const b=restore(combat,run,system),start=b.log.length,req=request(b,0,combat.teams);
 if(b.ended||req.kind!=='move')throw Error('먼저 싸울 포켓몬을 내보내세요.');
 const allies=b.p1.active.filter(p=>p?.hp),foes=b.p2.active.filter(p=>p?.hp);if(!allies.length||!foes.length)throw Error('도망칠 수 있는 전투가 아닙니다.');
 const hasRunAway=allies.some(p=>p.hasAbility('runaway'));
 if(!hasRunAway&&allies.some(p=>(p.trapped||b.p1.activeRequest?.active?.[b.p1.active.indexOf(p)]?.trapped)&&!p.hasType('Ghost')))throw Error('붙잡혀 있어 도망칠 수 없습니다.');
 // AttemptRunPhase uses Pokemon.getStat(SPD)'s permanent value. Native
 // getStat applies boosts/status/weather/items, and transformed storedStats
 // can belong to the copied target, so use the original baseStoredStats.
 const totalSpeed=list=>list.reduce((sum,p)=>sum+Math.max(1,p.baseStoredStats.spe),0),boss=foes.some(p=>(sourceMon(combat,p)?.rogueBossSegments||0)>1||sourceMon(combat,p)?.rogueBoss),tries=Number.isSafeInteger(run.escapeAttempts)?run.escapeAttempts:0;
 const ratio=totalSpeed(allies)/Math.max(1,totalSpeed(foes)),max=boss?25:95,cap=boss?6:4,bonus=boss?2:10,chance=hasRunAway?100:Math.max(5,Math.min(max,Math.round((max-5)/cap*ratio+5+bonus*tries)));
 run.escapeAttempts=tries+1;const escaped=rng()*100<chance;b.add('message',escaped?'무사히 도망쳤다!':'도망칠 수 없었다!');
 if(!escaped)resolveCaptureItemTurn(b,combat);
 return {escaped,combat:output(b,combat,start,run)};
}
// Keep a caught Pokémon's enemy-held modifiers pending until it joins the party.
function adoptCapturedModifiers(run,combat,mon){
 const pending=mon?.roguePendingCapturedModifiers;if(!Array.isArray(pending))return;
 for(const mod of pending){if(!mod||!Number.isSafeInteger(mod.count)||mod.count<=0)continue;const owned={...mod,boxId:String(mon.boxId)};run.modifiers.push(structuredClone(owned));combat.modifiers.push(structuredClone(owned));}
 delete mon.roguePendingCapturedModifiers;
}
export function captureClassicCombat(run,ballId,{system=null,targetBoxId=null,rng=Math.random}={}){
 if(!classicBallType(ballId)||!(run.balls[ballId]>0))throw Error('사용할 볼이 없습니다.');if(run.encounter.trainer)throw Error('트레이너의 포켓몬은 포획할 수 없습니다.');if(run.encounter.noCapture)throw Error('이 전투에서는 포획할 수 없습니다.');
 if(run.encounter.kind==='final'&&classicStarterRecords.filter(s=>system?.dex?.[s.sourceId]?.caught).length<classicStarterRecords.length-1)throw Error('최종 보스의 포획에는 다른 스타터 전부의 포획·부화 기록이 필요합니다.');
 const combat=structuredClone(run.combat);combat.teams[0]=structuredClone(run.party);const before=structuredClone(combat.teams),b=restore(combat,run,system),start=b.log.length,targets=b.p2.active.filter(p=>p?.hp&&!p.m.captured);
 if(!targets.length)throw Error('포획할 수 있는 야생 포켓몬이 없습니다.');if(run.biome===50&&run.encounter.kind!=='final'&&targets.some(p=>{const mon=sourceMon(combat,p);return !system?.dex?.[mon?.rogueSourceId]?.caught;}))throw Error('엔드 지역에서는 이전에 포획 기록이 있는 포켓몬만 잡을 수 있습니다.');if(targets.length>1&&!targetBoxId)throw Error('볼을 던질 포켓몬을 선택하세요.');const target=targets.find(p=>!targetBoxId||token(p)===targetBoxId);if(!target)throw Error('포획 대상을 확인하세요.');
 const original=sourceMon(combat,target),segments=original.rogueBossSegments||0,bossIndex=target.m.rogueBossIndex??classicBossIndex(target.hp,target.maxhp,segments),masterBypass=ballId==='masterball'&&(run.encounter.kind!=='final'||!run.challenges?.length);if(segments>1&&bossIndex>0&&!masterBypass&&!target.hasAbility('wonderguard'))throw Error('보스의 마지막 HP 구간에서 포획할 수 있습니다.');if(request(b,0,combat.teams).kind!=='move')throw Error('먼저 싸울 포켓몬을 내보내세요.');
 const caughtMon=syncNativeTeams(b,combat.teams)[1].find(p=>p.boxId===original.boxId),caughtSpecies=Object.values(system?.dex||{}).filter(d=>d.caught).length,{caught,shakes,critical}=attemptClassicCapture(caughtMon,ballId,{caughtSpecies},rng);run.balls[ballId]--;if(!caught)combat.lastFailedBallId=ballId;
 let owned=null,autoAdded=false,joinBlocked=false;
 b.add('message',caught?caughtMon.name+'을(를) 잡았다!':'포켓몬이 볼에서 빠져나왔다!');
 if(caught){
  owned={...caughtMon,rogueStatusState:savedClassicStatusState(target),boxId:crypto.randomUUID(),originEnemyBoxId:original.boxId,origin:'capture',rogueMetWave:run.wave,originBall:ballId,rogueMetBiome:run.biome,rogueWasBoss:!!original.rogueBoss||segments>1,rogueBoss:false,rogueBossSegments:0,captured:false};
  delete owned.rogueFixedModifiers;owned.roguePendingCapturedModifiers=combat.modifiers.filter(m=>String(m.boxId)===String(original.boxId)&&m.count>0).map(m=>({...m}));combat.modifiers=combat.modifiers.filter(m=>String(m.boxId)!==String(original.boxId));
  run.party=syncNativeTeams(b,combat.teams)[0];capturedStub(b,target);
  joinBlocked=!classicCatchJoinAllowed(run,owned);if(joinBlocked)b.add('message','챌린지 조건에 따라 포획 기록만 등록되며 파티에는 합류하지 않습니다.');
  if(!joinBlocked&&run.party.length<6){adoptCapturedModifiers(run,combat,owned);run.party.push(owned);combat.teams[0]=structuredClone(run.party);appendOwnedPokemon(b,combat,run,owned);autoAdded=true;}
  run.expNotices=[...(run.expNotices||[]),...awardClassicExperience(run,[caughtMon],{system,weather:b.rogueFog?'fog':b.field.weather||''})];
  for(const mon of run.party){const brace=run.modifiers.find(m=>m.id==='machobrace'&&m.boxId===mon.boxId),activeBrace=combat.modifiers.find(m=>m.id==='machobrace'&&m.boxId===mon.boxId);if(brace&&activeBrace)activeBrace.count=brace.count;const p=b.p1.pokemon.find(p=>token(p)===String(mon.boxId));if(p){const hp=p.hp;sourceStats(p,mon);p.hp=Math.min(p.maxhp,mon.hp);if(p.hp>hp)b.add('-heal',p,p.getHealth,'[from] level up');}}
  if(b.p2.pokemonLeft===0){b.win(b.p1);if(b.rogueWild)b.rogueWild.settledEncounterId=b.rogueWild.encounterId;}else if(!autoAdded&&!joinBlocked)combat.captureTurnPending=true;
 }
 if(!combat.captureTurnPending)resolveCaptureItemTurn(b,combat);
 const result=output(b,combat,start,run);result.before=before;result.events.unshift({kind:'capture',side:1,boxId:original.boxId,targetBoxId:original.boxId,targetSide:1,activeSlot:b.p2.active.indexOf(target),ballId,shakes,caught,critical,type:'normal',category:'status',hit:false,text:caught?caughtMon.name+' 포획 성공!':'볼에서 빠져나왔다!'});
 return {combat:result,caught:owned,autoAdded,joinBlocked,shakes};
}
// Persist an evolution into the in-progress native battle without consuming a
// turn or re-triggering switch-in abilities. New Shedinja is added as a reserve.
export function reconcileClassicEvolution(run,{system=null,fusionEvolutionBoxId=null}={}){
 if(run.challenges?.length)run.party=run.party.map(mon=>applyClassicPokemonChallenges(mon,run));
 if(!run.combat?.snapshot)return null;const combat=structuredClone(run.combat),owned=new Set([...(combat.teams[0]||[]),...run.party].map(mon=>String(mon.boxId)));combat.modifiers=[...(combat.modifiers||[]).filter(m=>m.boxId&&!owned.has(String(m.boxId))),...structuredClone(run.modifiers||[])];combat.teams[0]=structuredClone(run.party);
 if(fusionEvolutionBoxId)combat.fusionEvolutionBoxId=String(fusionEvolutionBoxId);const b=restore(combat,run,system),start=b.log.length;delete combat.fusionEvolutionBoxId;for(const mon of run.party)if(!b.p1.pokemon.some(p=>token(p)===String(mon.boxId)))appendOwnedPokemon(b,combat,run,mon);
 if(!b.ended&&b.rogueChallengeAllowed){
  reconcileLivingCounts(b);const invalid=b.p1.active.filter(p=>p?.hp>0&&!b.rogueChallengeAllowed(p));
  if(invalid.length&&!b.p1.pokemonLeft)b.win(b.p2);
  else if(invalid.length){let reserves=b.possibleSwitches(b.p1).length;for(const p of invalid){if(reserves>0){p.switchFlag=true;reserves--;continue;}const slot=b.p1.active.indexOf(p);b.runEvent('SwitchOut',p);b.singleEvent('End',p.getAbility(),p.abilityState,p);b.singleEvent('End',p.getItem(),p.itemState,p);b.queue.cancelAction(p);p.clearVolatile();p.isActive=false;p.isStarted=false;p.switchFlag=false;b.p1.active[slot]=null;}b.makeRequest(invalid.some(p=>p.switchFlag)?'switch':'move');}
 }
 if(!b.ended&&b.requestState){const requested=b.sides.map(s=>s.activeRequest!==null),prng=b.prng.clone(),requests=b.getRequests(b.requestState);b.sides.forEach((side,i)=>side.activeRequest=requested[i]?requests[i]:null);b.prng=prng;}
 return output(b,combat,start,run);
}
export function reconcileClassicCaptureParty(run,nextParty,{system=null}={}){
 if(nextParty.some(mon=>!run.party.some(old=>old.boxId===mon.boxId)&&!classicCatchJoinAllowed(run,mon)))throw Error('이 웨이브에서는 포획한 포켓몬을 파티에 추가할 수 없습니다.');
 if(run.combat.challengeEligibilityRule==='source-subset-v1'&&!run.combat.ended){const restrictions=run.combat.challengeRestrictions,checks=nextParty.map(p=>classicChallengeBattleEligibility(p,restrictions));if(checks.includes(null))throw Error('지원하지 않거나 확인할 수 없는 챌린지입니다.');if(checks.filter(x=>x===true).length<1)throw Error('남은 출전 가능 포켓몬으로 이 전투를 계속할 수 없습니다.');}
 const combat=structuredClone(run.combat);for(const mon of nextParty)adoptCapturedModifiers(run,combat,mon);combat.teams[0]=structuredClone(nextParty);run.party=nextParty;const b=restore(combat,run,system),start=b.log.length,ids=new Set(nextParty.map(p=>String(p.boxId))),activeReplaced=[];
 for(const p of b.p1.pokemon)if(!ids.has(token(p))&&!p.m.released){const slot=b.p1.active.indexOf(p);if(slot>=0)activeReplaced.push(slot);const alive=p.hp>0;p.m.released=true;p.hp=0;p.fainted=true;p.isActive=false;p.isStarted=false;p.faintQueued=false;p.switchFlag=false;p.forceSwitchFlag=false;if(alive)b.p1.pokemonLeft--;b.queue.cancelAction(p);b.singleEvent('End',p.getAbility(),p.abilityState,p);b.singleEvent('End',p.getItem(),p.itemState,p);p.clearVolatile();p.status='fnt';}
 const added=[];for(const mon of nextParty)if(!b.p1.pokemon.some(p=>token(p)===String(mon.boxId)))added.push(appendOwnedPokemon(b,combat,run,mon));if(b.rogueChallengeAllowed)reconcileLivingCounts(b);
 for(const slot of activeReplaced){const eligible=p=>p&&p.hp>0&&!p.isActive&&!p.m.released&&(!b.rogueChallengeAllowed||b.rogueChallengeAllowed(p)),addedIndex=b.rogueChallengeAllowed?added.findIndex(eligible):0,p=addedIndex>=0&&added.length?added.splice(addedIndex,1)[0]:b.p1.pokemon.find(eligible);if(!p){if(b.rogueChallengeAllowed)b.p1.active[slot]=null;continue;}if(!b.actions.switchIn(p,slot))throw Error('새 파티원을 내보내지 못했습니다.');if(!b.ended){const queued=b.queue.list.findIndex(a=>a.choice==='runSwitch'&&a.pokemon===p);if(queued>=0)b.queue.list.splice(queued,1);b.actions.runSwitch(p);}else{b.roguePlayerStarts||=[];b.roguePlayerStarts.push(token(p));}}
 if(combat.captureTurnPending){delete combat.captureTurnPending;resolveCaptureItemTurn(b,combat);}else if(!b.ended){const hasReplacement=b.p1.pokemon.some(p=>p.hp>0&&!p.isActive&&!p.m.released),needsReplacement=hasReplacement&&b.p1.active.some(p=>!!p?.switchFlag);b.makeRequest(needsReplacement?'switch':'move');}
 return output(b,combat,start,run);
}
export {restore as restoreClassicNativeBattle,snapshot as snapshotClassicNativeBattle};
