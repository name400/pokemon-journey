import {spreadClassicPokerus,rogueSeededRandom} from './rogue-seeded-rng.mjs';
import {ensureClassicState,startClassicRun,selectClassicSlot,prepareClassicTeam,classicRandom,classicSlotSummaries} from './rogue-classic-state.mjs';
import {starterCatalog,starterUnlockedCount,registerStarterCaught,reduceStarterCost,unlockStarterPassive,starterProgress,starterDexEntry} from './rogue-starter-system.mjs';
import {classicEncounter,classicBiome,classicBiomeChoices,enterClassicBiome} from './rogue-classic-world.mjs';
import {createClassicCombat,playClassicCombat,continueClassicWild,initialClassicSwitch,classicCombatView,captureClassicCombat,reconcileClassicCaptureParty,attemptClassicEscape} from './rogue-battle-engine.mjs';
import {generateClassicRewards,chooseClassicReward,classicRewardView,rerollClassicRewards,addClassicModifier,lapseClassicLures,classicModifierInventory} from './rogue-classic-rewards.mjs';
import {classicServices,buyClassicService,classicMaxPP,classicRemainingPP} from './rogue-classic-services.mjs';
import {classicRerollCost,classicLevelCap,classicWaveMoney} from './rogue-classic-rules.mjs';
import {learnClassicPendingMove,repairClassicLearning} from './rogue-classic-growth.mjs';
import {classicFormOptions,applyClassicForm} from './rogue-transformations.mjs';
import {configure,rules,moveNameByKey} from './pokemon-config.mjs';
import {Dex} from '@pkmn/sim';
import {moves} from './game.mjs';
import {moveDetails} from './move-description.mjs';
import {eggShopView,drawClassicEggs,buyClassicSpeciesEgg,awardClassicVouchers,lapseClassicEggs,acknowledgeClassicHatch,acknowledgeClassicHatches} from './rogue-egg-shop.mjs';
import {classicEvolutionOptions,evolveClassicPokemon} from './rogue-evolution.mjs';
import {rogueSpecies} from './rogue-reference.mjs';
const classicStarterRecords=[...rogueSpecies.values()].filter(species=>species.isStarter);

export function activeClassicRun(document){const state=ensureClassicState(document);return state.slots[state.activeSlot];}
function moveInfo(mon,name,index=null){const native=Dex.moves.get(moves[name]?.key||name),label=moveNameByKey[native.id]||name;return {id:native.id,name:label,type:moves[label]?.type||native.type,typeKey:native.type.toLowerCase(),category:native.category,power:native.basePower,accuracy:native.accuracy,pp:index===null?native.pp:classicRemainingPP(mon,index),maxPp:index===null?native.pp:classicMaxPP(mon,index),...moveDetails(native)};}
function beginEncounter(run,system,{carry=false}={}){
 const prior=run.encounter,escapedEncounter=!!run.escapedEncounter;delete run.escapedEncounter;run.escapeAttempts=0;spreadClassicPokerus(run.party,()=>classicRandom(run));run.participants=[];run.awardedFoes=[];run.expNotices=[];run.pendingMoves=[];run.encounter=classicEncounter(run);run.screen='battle';run.log=[];
 const previousActors=run.combat?.activeBySide?.[0]||[],previousNative=run.combat?.snapshot?.sides?.[0]?.pokemon||[];
 const activeReady=previousActors.length>0&&previousActors.every(index=>{const mon=run.combat?.teams?.[0]?.[index],native=mon&&previousNative.find(p=>String(p.set?.trainerToken)===String(mon.boxId));return !!(mon&&mon.hp>0&&native&&!native.switchFlag&&!native.forceSwitchFlag);});
 const sameWild=carry&&!escapedEncounter&&prior?.kind==='wild'&&run.encounter.kind==='wild'&&run.wave%10!==1&&run.combat?.doubles===run.encounter.doubles&&activeReady;
 // Fresh trainer encounters clear temporary arena effects; permanent effects survive.
 // A new biome receives its own rolled conditions instead of the previous arena.
 const previousField=run.wave%10!==1?run.combat?.snapshot?.field:null;
 const continuousWild=carry&&prior?.kind==='wild'&&run.encounter.kind==='wild'&&run.wave%10!==1;
 const preserved=(name)=>{if(!previousField)return {id:run[name]||'',duration:0};if(name==='weather'&&run.combat?.snapshot?.rogueFog)return {id:'fog',duration:0};const state=previousField[name+'State'],duration=state?.duration;return previousField[name]&&(duration===0||continuousWild&&Number.isInteger(duration)&&duration>0)?{id:previousField[name],duration}:{id:'',duration:0};};
 const weather=preserved('weather'),terrain=preserved('terrain');
 const carryActive=continuousWild&&!sameWild?(run.combat?.snapshot?.sides?.[0]?.pokemon||[]).filter(p=>p.isActive&&p.hp>0&&p.set?.trainerToken!=null).map(p=>({id:String(p.set.trainerToken),boosts:p.boosts||{}})):[];
 run.combat=sameWild?continueClassicWild(run,run.encounter.team,{system}):createClassicCombat(run,run.encounter.team,{system,trainer:!!run.encounter.trainer,doubles:run.encounter.doubles,weather:weather.id,weatherDuration:weather.duration,terrain:terrain.id,terrainDuration:terrain.duration,carryActive});
 run.party=run.combat.teams[0];run.initialSwitchSlots=!run.encounter.trainer&&!run.combat.ended?(run.combat.requests?.[0]?.actors||[]).filter(a=>a.kind==='move'&&a.switches?.length).map(a=>a.slot):[];run.log=run.combat.log;run.waveLog=[...(run.combat.log||[])];run.waveLogTurnStart=0;return run;
}
function recordWaveBattleLog(run){const previous=Array.isArray(run.waveLog)?run.waveLog:Array.isArray(run.log)?run.log:[],lines=Array.isArray(run.combat?.log)?run.combat.log:[];run.waveLogTurnStart=previous.length;run.waveLog=[...previous,...lines];run.log=lines;}
function fixedWaveRewards(run){
 if(run.wave===8){addClassicModifier(run,'expshare');addClassicModifier(run,'superexpcharm');}
 if(run.wave===25)addClassicModifier(run,'expshare');
 if(run.wave%10===0&&run.wave<200){if(run.wave===10)addClassicModifier(run,'expcharm');addClassicModifier(run,run.wave%30===(run.gymStart===30?0:20)?'superexpcharm':'expcharm');if(run.wave%50===0&&run.wave<=150)addClassicModifier(run,'goldenpokeball',{max:3});}
}
function queueOrScreen(run,screen){run.afterLearn=screen;run.screen=run.pendingMoves?.length?'learn':screen;}
function finishWave(run,system,document){
 lapseClassicLures(run);
 if(run.combat.winner!==0){run.screen='defeat';run.endedAt=Date.now();return;}
 run.coinRewards||=[];if(!run.coinRewards.includes(run.wave)){document.coins=(document.coins||0)+100+run.wave*5+(run.encounter.trainer?Math.floor(classicWaveMoney(run.wave)*2):0)+(run.wave%10===0?1000:0)+(run.wave===200?20000:0);run.coinRewards.push(run.wave);}
 awardClassicVouchers(system,run);
 lapseClassicEggs(document,run);
 fixedWaveRewards(run);
 if(run.encounter.trainer)run.money+=classicWaveMoney(run.wave,run.encounter.trainer.moneyMultiplier||1);
 if(run.wave===200){run.screen='victory';run.endedAt=Date.now();return;}
 if(run.wave%10===0)queueOrScreen(run,'interlude');else{generateClassicRewards(run);queueOrScreen(run,'reward');}
}
function guardRun(state){const run=state.slots[state.activeSlot];if(!run)throw Error('진행할 도전을 선택하세요.');return run;}
function advanceClassic(run,system){
 if(!['advance','interlude'].includes(run.screen))throw Error('현재 선택을 마친 뒤 다음 웨이브로 진행하세요.');
 if(run.screen==='interlude'){run.party=run.party.map(p=>configure(p,{hp:p.maxHp,status:null,rogueStatusState:null,pp:{},...(Array.isArray(p.rogueSketchPP)?{rogueSketchPP:p.moves.map((_,i)=>classicMaxPP(p,i))}:{})}));run.teraCharged=!!run.tools.teraOrb;run.routeChoices=classicBiomeChoices(run);if(run.tools.map&&run.routeChoices.length>1){run.screen='route';return;}enterClassicBiome(run,run.routeChoices[Math.floor(classicRandom(run)*run.routeChoices.length)].id);}
 run.wave++;run.biomeStep=(run.wave-1)%10+1;beginEncounter(run,system,{carry:run.wave%10!==1});
}
/** @param {any} document @param {any} payload @param {{pickupSourceId?:number|null}} [options] */
export function applyClassicAction(document,payload,{pickupSourceId=null}={}){
 const state=ensureClassicState(document),system=state.system;repairClassicLearning(state.slots[state.activeSlot]);let finishedBattle=null;
 if(payload.action==='selectSlot'){selectClassicSlot(document,payload.slot);return {};}
 if(payload.action==='prepare'){prepareClassicTeam(document,payload.slot??state.activeSlot);return {};}
 if(payload.action==='cancelSelection'){state.selection=null;return {};}
 if(payload.action==='reduceCost'){reduceStarterCost(system,payload.sourceId);return {};}
 if(payload.action==='unlockPassive'){unlockStarterPassive(system,payload.sourceId,payload.expectedCost);return {};}
 if(payload.action==='buySpeciesEgg'){if(!state.selection)throw Error('스타터 선택 중에 알을 교환하세요.');return {candyEgg:buyClassicSpeciesEgg(document,payload)};}
 if(payload.action==='drawEggs'){if(!state.selection&&state.slots[state.activeSlot]?.screen==='reward')throw Error('웨이브 보상을 먼저 선택한 뒤 알 뽑기를 이용하세요.');return {drawnEggs:drawClassicEggs(document,payload,undefined,{pickupSourceId})};}
 if(payload.action==='ackHatch'){acknowledgeClassicHatch(document,payload.eggId);return {};}
 if(payload.action==='ackHatches'){acknowledgeClassicHatches(document,payload.eggIds);return {};}
 if(payload.action==='start'){
  const run=startClassicRun(document,payload.selection,{slot:payload.slot??state.selection?.slot??state.activeSlot,confirmOverwrite:payload.confirmOverwrite===true});
  run.biome=0;run.waveCycleOffset=Math.floor(rogueSeededRandom(run.seed)()*8)*5;beginEncounter(run,system);return {};
 }
 const run=guardRun(state);run.updatedAt=Date.now();
 if(payload.action==='recoverBattle'){
  const native=run.combat?.snapshot?.sides,own=native?.[0]?.pokemon,foe=native?.[1]?.pokemon;
  if(run.screen!=='battle'||!run.party?.length||run.party.some(p=>p.hp>0)||!Array.isArray(own)||!Array.isArray(foe)||!run.party.every(mon=>own.some(p=>String(p.set?.trainerToken)===String(mon.boxId)&&p.hp<=0))||!foe.some(p=>p.hp>0&&!p.fainted&&!p.m?.released&&!p.m?.captured))throw Error('복구할 패배 전투가 아닙니다.');
  const snapshot=run.combat.snapshot;snapshot.sides[0].pokemonLeft=0;snapshot.ended=true;snapshot.winner=snapshot.sides[1].name;
  run.combat.ended=true;run.combat.winner=1;run.combat.events=[];run.combat.log=['싸울 수 있는 포켓몬이 모두 쓰러졌다!'];recordWaveBattleLog(run);finishedBattle=classicCombatView(run.combat);finishWave(run,system,document);
 }else if(payload.action==='initialSwitch'){
  const slot=run.initialSwitchSlots?.[0];if(run.screen!=='battle'||!Number.isInteger(slot)||payload.slot!==slot)throw Error('교체 선택을 확인하세요.');
  if(payload.boxId){run.combat=initialClassicSwitch(run,slot,payload.boxId,{system});run.party=run.combat.teams[0];recordWaveBattleLog(run);}else{run.combat.events=[];run.combat.log=[];}
  run.initialSwitchSlots.shift();run.initialSwitchSlots=run.initialSwitchSlots.filter(next=>run.combat.requests?.[0]?.actors?.some(a=>a.slot===next&&a.kind==='move'&&a.switches?.length));if(run.combat.ended){run.initialSwitchSlots=[];finishedBattle=classicCombatView(run.combat);finishWave(run,system,document);}else if(run.combat.requests?.[0]?.actors?.some(a=>a.kind==='switch'))run.initialSwitchSlots=[];
 }else if(payload.action==='turn'){
  if(run.initialSwitchSlots?.length)throw Error('먼저 전투 시작 전 교체 여부를 선택하세요.');if(run.screen!=='battle')throw Error('전투 중에 행동을 선택하세요.');run.combat=playClassicCombat(run,payload.command,{system});run.party=run.combat.teams[0];recordWaveBattleLog(run);
  if(run.combat.ended){finishedBattle=classicCombatView(run.combat);finishWave(run,system,document);}else if(run.pendingMoves?.length)queueOrScreen(run,'battle');
 }else if(payload.action==='escape'){
  if(run.initialSwitchSlots?.length)throw Error('먼저 전투 시작 전 교체 여부를 선택하세요.');if(run.screen!=='battle')throw Error('야생 전투 중에만 도망칠 수 있습니다.');const result=attemptClassicEscape(run,{system,rng:()=>classicRandom(run)});run.combat=result.combat;run.party=run.combat.teams[0];recordWaveBattleLog(run);
  if(result.escaped){lapseClassicLures(run);run.escapedEncounter=true;run.lastRewardName=null;run.screen=run.wave%10===0?'interlude':'advance';finishedBattle={...classicCombatView(run.combat),actionResult:'escape'};}else if(run.combat.ended){finishedBattle=classicCombatView(run.combat);finishWave(run,system,document);}
 }else if(payload.action==='capture'){
  if(run.initialSwitchSlots?.length)throw Error('먼저 전투 시작 전 교체 여부를 선택하세요.');if(run.screen!=='battle')throw Error('야생 전투 중에 볼을 던지세요.');const result=captureClassicCombat(run,payload.ballId,{system,targetBoxId:payload.boxId,rng:()=>classicRandom(run)});run.combat=result.combat;run.party=run.combat.teams[0];recordWaveBattleLog(run);
  if(result.caught){registerStarterCaught(system,result.caught,{kind:'capture',boss:!!result.caught.rogueWasBoss});finishedBattle={...classicCombatView(run.combat),actionResult:'capture'};if(result.autoAdded){run.pendingCapture=null;if(run.combat.ended)finishWave(run,system,document);else queueOrScreen(run,'battle');}else{run.pendingCapture=result.caught;run.screen='capture';}}
  else if(run.combat.ended){finishedBattle=classicCombatView(run.combat);finishWave(run,system,document);}
 }else if(payload.action==='acceptCapture'){
  if(run.screen!=='capture'||!run.pendingCapture)throw Error('파티에 추가할 포켓몬이 없습니다.');
  const nextParty=[...run.party];if(payload.release!==true){if(nextParty.length<6)nextParty.push(run.pendingCapture);else{const index=nextParty.findIndex(p=>p.boxId===payload.replaceBoxId);if(index<0)throw Error('교체할 파티원을 선택하세요.');nextParty[index]=run.pendingCapture;}}
  run.pendingMoves=(run.pendingMoves||[]).filter(p=>nextParty.some(mon=>mon.boxId===p.boxId));run.combat=reconcileClassicCaptureParty(run,nextParty,{system});run.party=run.combat.teams[0];recordWaveBattleLog(run);run.pendingCapture=null;if(run.combat.ended){finishedBattle=classicCombatView(run.combat);finishWave(run,system,document);}else queueOrScreen(run,'battle');
 }else if(payload.action==='learn'){
  if(run.screen!=='learn')throw Error('새 기술을 배우는 단계가 아닙니다.');learnClassicPendingMove(run,{boxId:payload.boxId,move:payload.move,slot:payload.slot??null});if(!run.pendingMoves.length){run.screen=run.afterLearn;if(['advance','interlude'].includes(run.screen))advanceClassic(run,system);}
 }else if(payload.action==='buyService'){buyClassicService(run,payload,{system});}
 else if(payload.action==='reroll'){rerollClassicRewards(run,payload.expectedPrice);}
 else if(payload.action==='reward'){const reward=chooseClassicReward(run,payload,system);run.lastRewardName=reward.name;queueOrScreen(run,'advance');if(run.screen==='advance')advanceClassic(run,system);}
 else if(payload.action==='skipReward'){if(run.screen!=='reward')throw Error('보상 선택 단계가 아닙니다.');run.rewards=null;run.screen='advance';advanceClassic(run,system);}
 else if(payload.action==='next'){advanceClassic(run,system); }else if(payload.action==='route'){
  if(run.screen!=='route'||!run.routeChoices.some(p=>p.id===payload.biomeId))throw Error('다음 바이옴을 선택하세요.');enterClassicBiome(run,payload.biomeId);run.wave++;beginEncounter(run,system);
 }else if(payload.action==='evolve'){
  const previousScreen=run.screen,evolution=evolveClassicPokemon(run,system,payload);if(run.pendingMoves?.length)queueOrScreen(run,previousScreen);return {evolutionResult:evolution};
 }else if(payload.action==='form'){
  if(['battle','learn','capture'].includes(run.screen))throw Error('전투 후 파티 메뉴에서 모습을 바꾸세요.');const index=run.party.findIndex(p=>p.boxId===payload.boxId);if(index<0)throw Error('포켓몬을 선택하세요.');run.party[index]=applyClassicForm(run.party[index],run,payload.item);
 }else if(payload.action==='abandon'){
  if(!payload.confirm)throw Error('도전 종료를 확인하세요.');run.screen='abandoned';run.endedAt=Date.now();
 }else throw Error('알 수 없는 클래식 행동입니다.');
 if(finishedBattle){finishedBattle.log=[...(run.waveLog||run.log||[])];finishedBattle.previousLogCount=Math.max(0,Math.min(finishedBattle.log.length,run.waveLogTurnStart||0));}
 return {finishedBattle};
}
/** @param {any} document @param {{includeStarters?:boolean,pickupSourceId?:number|null}} [options] */
export function classicGameView(document,{includeStarters=false,pickupSourceId=null}={}){
 const state=ensureClassicState(document),run=state.slots[state.activeSlot];repairClassicLearning(run);let battle=null,view=null;
 if(run){view=structuredClone(run);delete view.combat;delete view.seed;delete view.rng;delete view.encounter?.team;delete view.rewards;delete view.awardedFoes;delete view.waveLog;delete view.waveLogTurnStart;
  view.modifierInventory=classicModifierInventory(run);view.party=view.party.map(p=>({...p,abilityName:rules.abilities[p.ability]?.name||p.ability,forms:classicFormOptions(p,run),evolutions:classicEvolutionOptions(p,run,state.system)}));view.biome=classicBiome(run);view.levelCap=classicLevelCap(run.wave);const starters=classicStarterRecords,finalAllowed=run.encounter?.kind!=='final'||starters.filter(s=>state.system.dex[s.sourceId]?.caught).length>=starters.length-1,foeIndices=run.combat?.activeBySide?.[1]||[],endAllowed=run.biome!==50||run.encounter?.kind==='final'||foeIndices.every(index=>{const foe=run.combat?.teams?.[1]?.[index];return !foe||!!state.system.dex[foe.rogueSourceId]?.caught;});view.captureAllowed=!run.encounter?.trainer&&finalAllowed&&endAllowed;view.captureUnavailableReason=run.encounter?.trainer?'트레이너의 포켓몬은 포획할 수 없습니다.':!finalAllowed?'최종 보스를 잡으려면 다른 스타터의 포획 기록이 필요합니다.':!endAllowed?'엔드 지역에서는 포획 기록이 있는 포켓몬만 잡을 수 있습니다.':'';
  if(run.screen==='battle'){battle=classicCombatView({...run.combat,dynamaxBand:!!run.tools?.dynamaxBand,teams:[run.party,run.combat.teams[1]]});const slot=run.initialSwitchSlots?.[0],actor=battle.requests?.[0]?.actors?.find(a=>a.slot===slot);if(actor?.kind==='move'&&actor.switches?.length)battle.initialSwitch={slot,active:actor.active,switches:actor.switches};battle.log=[...(run.waveLog||run.log||battle.log||[])].map(line=>String(line).replace(/ability([a-z0-9]+)/gi,(match,id)=>rules.abilities[id.toLowerCase()]?.name||match));battle.previousLogCount=Math.max(0,Math.min(battle.log.length,run.waveLogTurnStart||0));}
  if(run.screen==='learn'){const pending=run.pendingMoves[0],mon=run.party.find(p=>p.boxId===pending.boxId);if(mon)view.learning={mon,currentMoves:mon.moves.map((name,index)=>moveInfo(mon,name,index)),newMove:moveInfo(mon,pending.move)};}
  if(run.screen==='reward'){view.rewards=classicRewardView(run,state.system);view.services=classicServices(run,{system:state.system});view.rerollCost=classicRerollCost(run.wave,run.rerolls);}
 }
 const starters=includeStarters?starterCatalog(state.system):null,unlockedCount=starters?new Set(starters.filter(p=>p.unlocked).map(p=>p.sourceId)).size:starterUnlockedCount(state.system);
 return {schema:3,activeSlot:state.activeSlot,slots:classicSlotSummaries(document),selecting:!!state.selection,selectionSlot:state.selection?.slot??state.activeSlot,run:view,battle,starters:starters||undefined,eggShop:eggShopView(document,{pickupSourceId}),pendingHatches:state.system.pendingHatches||[],meta:{unlocked:unlockedCount,candies:Object.values(state.system.starterData).reduce((n,s)=>n+s.candies,0)}};
}
