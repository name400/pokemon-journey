import {spreadClassicPokerus,rogueSeededRandom} from './rogue-seeded-rng.mjs';
import {ensureClassicState,startClassicRun,selectClassicSlot,prepareClassicTeam,classicRandom,classicSlotSummaries} from './rogue-classic-state.mjs';
import {starterCatalog,registerStarterCaught,reduceStarterCost,starterProgress,starterDexEntry,unlockedStarterCount} from './rogue-starter-system.mjs';
import {classicEncounter,classicBiome,classicBiomeChoices,enterClassicBiome} from './rogue-classic-world.mjs';
import {createClassicCombat,playClassicCombat,continueClassicWild,classicWildReplacementState,classicCombatView,captureClassicCombat,reconcileClassicCaptureParty} from './rogue-battle-engine.mjs';
import {generateClassicRewards,chooseClassicReward,classicRewardView,rerollClassicRewards,addClassicModifier,classicMoneyReward,CLASSIC_REWARD_REGISTRY,transferClassicModifier,classicTypeBoosterName} from './rogue-classic-rewards.mjs';
import {classicServices,buyClassicService,classicMaxPP,classicRemainingPP} from './rogue-classic-services.mjs';
import {classicRerollCost,classicLevelCap,classicWaveMoney} from './rogue-classic-rules.mjs';
import {learnClassicPendingMove,repairClassicLearning} from './rogue-classic-growth.mjs';
import {classicFormOptions,applyClassicForm,classicFormReversion,revertClassicForm} from './rogue-transformations.mjs';
import {configure,rules,moveNameByKey} from './pokemon-config.mjs';
import {Dex} from '@pkmn/sim';
import {moves} from './game.mjs';
import {moveDetails} from './move-description.mjs';
import {eggShopView,buyClassicEgg,hatchClassicEgg} from './rogue-egg-shop.mjs';
import {classicEvolutionOptions,evolveClassicPokemon} from './rogue-evolution.mjs';
import {classicCaptureBlockReason} from './rogue-capture-eligibility.mjs';

export function activeClassicRun(document){const state=ensureClassicState(document);return state.slots[state.activeSlot];}
const modifierNames=new Map(CLASSIC_REWARD_REGISTRY.map(def=>[def.id,def]));
const teraLabels={Normal:'노말',Fire:'불꽃',Water:'물',Electric:'전기',Grass:'풀',Ice:'얼음',Fighting:'격투',Poison:'독',Ground:'땅',Flying:'비행',Psychic:'에스퍼',Bug:'벌레',Rock:'바위',Ghost:'고스트',Dragon:'드래곤',Dark:'악',Steel:'강철',Fairy:'페어리',Stellar:'스텔라'};
function classicFormLabel(mon){const key=String(mon.rogueFormKey||'');if(key==='mega-x')return '메가진화 X';if(key==='mega-y')return '메가진화 Y';if(key.startsWith('mega'))return '메가진화';if(key==='primal')return '원시회귀';if(key.startsWith('gigantamax'))return '거다이맥스';if(key==='eternamax')return '무한다이맥스';if(key==='ultra')return '울트라버스트';if(typeof mon.terastallized==='string'&&mon.terastallized)return (teraLabels[mon.terastallized]||mon.terastallized)+' 테라스탈';return '';}
function heldModifierViews(mon,run){return (run.modifiers||[]).filter(m=>m.boxId===mon.boxId&&m.count>0).map(m=>{const def=modifierNames.get(m.id),name=m.id==='evolutiontracker'?'진화 보물 추적':m.id==='typebooster'?classicTypeBoosterName(m.typeBoost):def?.name||m.id;return {id:m.id,typeBoost:m.typeBoost||null,name,count:m.count,description:def?.description||'',transferable:!!def?.target&&['modifier','typebooster'].includes(def.effect)&&m.transferable!==false&&m.id!=='evolutiontracker'};});}
function moveInfo(mon,name,index=null){const native=Dex.moves.get(moves[name]?.key||name),label=moveNameByKey[native.id]||name;return {id:native.id,name:label,type:moves[label]?.type||native.type,typeKey:native.type.toLowerCase(),category:native.category,power:native.basePower,accuracy:native.accuracy,pp:index===null?native.pp:classicRemainingPP(mon,index),maxPp:index===null?native.pp:classicMaxPP(mon,index),...moveDetails(native)};}
function beginEncounter(run,system,{carry=false}={}){
 const prior=run.encounter;spreadClassicPokerus(run.party,()=>classicRandom(run));run.participants=[];run.awardedFoes=[];run.expNotices=[];run.pendingMoves=[];run.encounter=classicEncounter(run);run.screen='battle';run.log=[];
 const sameWild=carry&&prior?.kind==='wild'&&run.encounter.kind==='wild'&&run.wave%10!==1&&run.combat?.doubles===run.encounter.doubles;
 if(sameWild){const pending=classicWildReplacementState(run);if(pending.slots.length){run.pendingWildSwitch={...pending,choices:{}};run.screen='wildswitch';return run;}}
 run.combat=sameWild?continueClassicWild(run,run.encounter.team,{system}):createClassicCombat(run,run.encounter.team,{system,trainer:!!run.encounter.trainer,doubles:run.encounter.doubles,weather:run.weather});
 run.party=run.combat.teams[0];run.log=run.combat.log;return run;
}
function fixedWaveRewards(run){
 if(run.wave===8){addClassicModifier(run,'expshare',{saturate:true});addClassicModifier(run,'superexpcharm',{saturate:true});}
 if(run.wave===25)addClassicModifier(run,'expshare',{saturate:true});
 if(run.wave===95&&run.encounter?.kind==='rival'&&!run.tools.teraOrb){run.tools.teraOrb=true;run.teraCharged=true;run.fixedRewardNotice='95층 라이벌 보상으로 테라스탈오브를 받았습니다.';}
 if(run.wave%10===0&&run.wave<200){if(run.wave===10)addClassicModifier(run,'expcharm',{saturate:true});addClassicModifier(run,run.wave%30===(run.gymStart===30?0:20)?'superexpcharm':'expcharm',{saturate:true});if(run.wave%50===0&&run.wave<=150)addClassicModifier(run,'goldenpokeball',{max:3,saturate:true});}
}
function queueOrScreen(run,screen){run.afterLearn=screen;run.screen=run.pendingMoves?.length?'learn':screen;}
function finishWave(run,system,document){
 if(run.combat.winner!==0){run.screen='defeat';run.endedAt=Date.now();return;}
 run.coinRewards||=[];if(!run.coinRewards.includes(run.wave)){document.coins=(document.coins||0)+100+run.wave*5+(run.encounter.trainer?Math.floor(classicWaveMoney(run.wave)*2):0)+(run.wave%10===0?1000:0)+(run.wave===200?20000:0);run.coinRewards.push(run.wave);}
 fixedWaveRewards(run);
 if(run.encounter.trainer)run.money+=classicMoneyReward(run,run.encounter.trainer.moneyMultiplier||1);
 if(run.wave===200){run.endedAt=Date.now();queueOrScreen(run,'victory');return;}
 if(run.wave%10===0)queueOrScreen(run,'interlude');else{generateClassicRewards(run,system);queueOrScreen(run,'reward');}
}
function guardRun(state){const run=state.slots[state.activeSlot];if(!run)throw Error('진행할 도전을 선택하세요.');return run;}
// A live legacy run past the fourth rival has already earned this fixed reward.
function repairClassicTeraReward(run){if(!run||['victory','defeat','abandoned'].includes(run.screen))return;const earned=run.wave>95||run.wave===95&&run.encounter?.kind==='rival'&&(['reward','advance'].includes(run.screen)||run.screen==='learn'&&run.afterLearn==='reward');if(earned&&!run.tools?.teraOrb){run.tools||={};run.tools.teraOrb=true;run.teraCharged=true;run.fixedRewardNotice='95층 라이벌 보상으로 테라스탈오브를 받았습니다.';}}
// Repair old stalled battles only when the player's entire current party is
// fainted and at least one opposing Pokémon is still alive; no party is reset.
function repairClassicDefeat(run){if(run?.screen==='battle'&&run.combat&&!run.combat.ended&&run.party?.length&&run.party.every(mon=>Number.isFinite(mon.hp)&&mon.hp<=0)&&run.combat.teams?.[1]?.some(mon=>mon.hp>0&&!mon.captured)){run.screen='defeat';run.endedAt||=Date.now();}}
export function applyClassicAction(document,payload){
 const state=ensureClassicState(document),system=state.system;repairClassicDefeat(state.slots[state.activeSlot]);repairClassicTeraReward(state.slots[state.activeSlot]);repairClassicLearning(state.slots[state.activeSlot]);let finishedBattle=null;
 if(payload.action==='selectSlot'){selectClassicSlot(document,payload.slot);return {};}
 if(payload.action==='prepare'){prepareClassicTeam(document,payload.slot??state.activeSlot);return {};}
 if(payload.action==='cancelSelection'){state.selection=null;return {};}
 if(payload.action==='reduceCost'){reduceStarterCost(system,payload.sourceId);return {};}
 if(payload.action==='buyEgg')return {purchasedEgg:buyClassicEgg(document,payload)};
 if(payload.action==='hatchEgg')return {hatchedEgg:hatchClassicEgg(document,payload.eggId)};
 if(payload.action==='start'){
  const run=startClassicRun(document,payload.selection,{slot:payload.slot??state.selection?.slot??state.activeSlot,confirmOverwrite:payload.confirmOverwrite===true});
  run.biome=0;run.waveCycleOffset=Math.floor(rogueSeededRandom(run.seed)()*8)*5;beginEncounter(run,system);if(run.screen==='battle'&&run.combat.ended){finishedBattle=classicCombatView(run.combat);finishWave(run,system,document);}return {finishedBattle};
 }
 const run=guardRun(state);run.updatedAt=Date.now();
 if(payload.action==='turn'){
  if(run.screen!=='battle')throw Error('전투 중에 행동을 선택하세요.');run.combat=playClassicCombat(run,payload.command,{system});run.party=run.combat.teams[0];run.log=run.combat.log;
  if(run.combat.ended){finishedBattle=classicCombatView(run.combat);finishWave(run,system,document);}else if(run.pendingMoves?.length)queueOrScreen(run,'battle');
 }else if(payload.action==='capture'){
  if(run.screen!=='battle')throw Error('야생 전투 중에 볼을 던지세요.');const result=captureClassicCombat(run,payload.ballId,{system,targetBoxId:payload.boxId,rng:()=>classicRandom(run)});run.combat=result.combat;run.party=run.combat.teams[0];
  if(result.caught){registerStarterCaught(system,result.caught,{kind:'capture',boss:result.wasBoss});finishedBattle={...classicCombatView(run.combat),actionResult:'capture'};if(result.autoAdded){run.pendingCapture=null;if(run.combat.ended)finishWave(run,system,document);else queueOrScreen(run,'battle');}else{run.pendingCapture=result.caught;run.screen='capture';}}
  else if(run.combat.ended){finishedBattle=classicCombatView(run.combat);finishWave(run,system,document);}
 }else if(payload.action==='acceptCapture'){
  if(run.screen!=='capture'||!run.pendingCapture)throw Error('파티에 추가할 포켓몬이 없습니다.');
  const nextParty=[...run.party];if(payload.release!==true){if(nextParty.length<6)nextParty.push(run.pendingCapture);else{const index=nextParty.findIndex(p=>p.boxId===payload.replaceBoxId);if(index<0)throw Error('교체할 파티원을 선택하세요.');nextParty[index]=run.pendingCapture;}}
  run.pendingMoves=(run.pendingMoves||[]).filter(p=>nextParty.some(mon=>mon.boxId===p.boxId));run.combat=reconcileClassicCaptureParty(run,nextParty,{system});run.party=run.combat.teams[0];run.pendingCapture=null;if(run.combat.ended){finishedBattle=classicCombatView(run.combat);finishWave(run,system,document);}else queueOrScreen(run,'battle');
 }else if(payload.action==='learn'){
  if(run.screen!=='learn')throw Error('새 기술을 배우는 단계가 아닙니다.');learnClassicPendingMove(run,{boxId:payload.boxId,move:payload.move,slot:payload.slot??null});if(!run.pendingMoves.length)run.screen=run.afterLearn;
 }else if(payload.action==='buyService'){buyClassicService(run,payload,{system});}
 else if(payload.action==='reroll'){rerollClassicRewards(run,payload.expectedPrice,system);}
 else if(payload.action==='reward'){const reward=chooseClassicReward(run,payload,system);run.lastRewardName=reward.name;queueOrScreen(run,'advance');}
 else if(payload.action==='skipReward'){if(run.screen!=='reward')throw Error('보상 선택 단계가 아닙니다.');run.rewards=null;run.screen='advance';}
 else if(payload.action==='next'){
  if(!['advance','interlude'].includes(run.screen))throw Error('현재 선택을 마친 뒤 다음 웨이브로 진행하세요.');
  delete run.fixedRewardNotice;
  if(run.screen==='interlude'){
   run.party=run.party.map(p=>configure(p,{hp:p.maxHp,status:null,pp:{}}));run.teraCharged=!!run.tools.teraOrb;run.routeChoices=classicBiomeChoices(run);
   if(run.tools.map&&run.routeChoices.length>1){run.screen='route';return {};}
   enterClassicBiome(run,run.routeChoices[Math.floor(classicRandom(run)*run.routeChoices.length)].id);
  }
  if(!run.party.some(p=>p.hp>0)){run.screen='defeat';run.endedAt=Date.now();return {};}
  run.wave++;run.biomeStep=(run.wave-1)%10+1;beginEncounter(run,system,{carry:run.wave%10!==1});if(run.screen==='battle'&&run.combat.ended){finishedBattle=classicCombatView(run.combat);finishWave(run,system,document);}
 }else if(payload.action==='route'){
  if(run.screen!=='route'||!run.routeChoices.some(p=>p.id===payload.biomeId))throw Error('다음 바이옴을 선택하세요.');enterClassicBiome(run,payload.biomeId);run.wave++;beginEncounter(run,system);if(run.screen==='battle'&&run.combat.ended){finishedBattle=classicCombatView(run.combat);finishWave(run,system,document);}
 }else if(payload.action==='undoWildReplacement'){
  const pending=run.pendingWildSwitch;if(run.screen!=='wildswitch'||!pending)throw Error('지금은 교체 선택을 되돌릴 수 없습니다.');
  const last=[...pending.slots].reverse().find(entry=>pending.choices[entry.slot]);if(!last)throw Error('되돌릴 교체 선택이 없습니다.');delete pending.choices[last.slot];
 }else if(payload.action==='chooseWildReplacement'){
  const pending=run.pendingWildSwitch;if(run.screen!=='wildswitch'||!pending)throw Error('지금은 교체 대상을 선택할 수 없습니다.');
  const next=pending.slots.find(entry=>!pending.choices[entry.slot]);if(!next)throw Error('선택할 자리가 없습니다.');
  const id=payload.boxId,member=run.party.find(p=>p.boxId===id);
  if(typeof id!=='string'||!member||member.hp<=0||pending.reservedBoxIds.includes(id)||Object.values(pending.choices).includes(id))throw Error('교체할 수 있는 다른 대기 포켓몬을 선택하세요.');
  pending.choices[next.slot]=id;
  if(pending.slots.every(entry=>pending.choices[entry.slot])){
   run.combat=continueClassicWild(run,run.encounter.team,{system,replacements:pending.choices});run.party=run.combat.teams[0];run.log=run.combat.log;delete run.pendingWildSwitch;run.screen='battle';
   if(run.screen==='battle'&&run.combat.ended){finishedBattle=classicCombatView(run.combat);finishWave(run,system,document);}
  }
 }else if(payload.action==='transferModifier'){
  transferClassicModifier(run,payload);
 }else if(payload.action==='evolve'){
  const previousScreen=run.screen,evolution=evolveClassicPokemon(run,system,payload);if(run.pendingMoves?.length)queueOrScreen(run,previousScreen);return {evolutionResult:evolution};
 }else if(payload.action==='form'){
  if(['battle','learn','capture','wildswitch'].includes(run.screen))throw Error('전투와 교체 선택을 마친 뒤 모습을 바꾸세요.');const index=run.party.findIndex(p=>p.boxId===payload.boxId);if(index<0)throw Error('포켓몬을 선택하세요.');const before=run.party[index];run.party[index]=applyClassicForm(before,run,payload.item,system);return {formResult:{before,after:run.party[index],reverted:false}};
 }else if(payload.action==='revertForm'){
  if(['battle','learn','capture','wildswitch'].includes(run.screen))throw Error('전투와 교체 선택을 마친 뒤 모습을 바꾸세요.');const index=run.party.findIndex(p=>p.boxId===payload.boxId);if(index<0)throw Error('포켓몬을 선택하세요.');const before=run.party[index];run.party[index]=revertClassicForm(before,run);return {formResult:{before,after:run.party[index],reverted:true}};
 }else if(payload.action==='abandon'){
  if(!payload.confirm)throw Error('도전 종료를 확인하세요.');run.screen='abandoned';run.endedAt=Date.now();
 }else throw Error('알 수 없는 클래식 행동입니다.');
 return {finishedBattle};
}
export function classicGameView(document,{includeStarters=false}={}){
 const state=ensureClassicState(document),run=state.slots[state.activeSlot];repairClassicDefeat(run);repairClassicTeraReward(run);repairClassicLearning(run);let battle=null,view=null;
 if(run){view=structuredClone(run);delete view.combat;delete view.seed;delete view.rng;delete view.encounter?.team;delete view.rewards;delete view.awardedFoes;
  view.globalModifiers=(run.modifiers||[]).filter(m=>!m.boxId&&m.count>0).map(m=>({id:m.id,name:m.id==='goldenpokeball'?'황금 몬스터볼':modifierNames.get(m.id)?.name||m.id,count:m.count,description:m.id==='goldenpokeball'?'전투 후 보상 선택지가 중첩당 1개 늘어납니다. 최대 3개 중첩.':modifierNames.get(m.id)?.description||''}));view.party=view.party.map(p=>({...p,abilityName:rules.abilities[p.ability]?.name||p.ability,natureName:rules.natures[p.nature]?.name||p.nature,formLabel:classicFormLabel(p),heldModifiers:heldModifierViews(p,run),heldItemName:p.item?(rules.items[p.item]?.name||p.item):null,moveDetails:p.moves.map((name,index)=>moveInfo(p,name,index)),forms:classicFormOptions(p,run,{system:state.system}),formReversion:classicFormReversion(p,run)?.name||null,evolutions:classicEvolutionOptions(p,run,state.system)}));view.biome=classicBiome(run);view.levelCap=classicLevelCap(run.wave);view.captureAllowed=false;view.captureReason=null;
  if(run.screen==='battle'){battle=classicCombatView({...run.combat,teams:[run.party,run.combat.teams[1]]});const enemies=(battle.activeBySide?.[1]||[]).map(i=>battle.teams[1]?.[i]).filter(p=>p&&p.hp>0&&!p.captured);const reason=classicCaptureBlockReason(run,state.system,enemies);view.captureAllowed=!reason;view.captureReason=run.encounter?.trainer?null:reason;}
  if(run.screen==='learn'){const pending=run.pendingMoves[0],mon=run.party.find(p=>p.boxId===pending.boxId);if(mon)view.learning={mon,currentMoves:mon.moves.map((name,index)=>moveInfo(mon,name,index)),newMove:moveInfo(mon,pending.move)};}
  if(run.screen==='reward'){view.rewards=classicRewardView(run,state.system);view.services=classicServices(run,{system:state.system});view.rerollCost=classicRerollCost(run.wave,run.rerolls);}
 }
 return {schema:3,activeSlot:state.activeSlot,slots:classicSlotSummaries(document),selecting:!!state.selection,selectionSlot:state.selection?.slot??state.activeSlot,run:view,battle,starters:includeStarters?starterCatalog(state.system):undefined,eggShop:eggShopView(document),meta:{unlocked:unlockedStarterCount(state.system),candies:Object.values(state.system.starterData).reduce((n,s)=>n+s.candies,0)}};
}
