import {ROGUE_RULE_VERSION} from './rogue-reference.mjs';
import {normalizeClassicChallengeSubset} from './rogue-challenge-eligibility.mjs';
import {ensureStarterSystem,buildStarterParty} from './rogue-starter-system.mjs';
import {repairClassicRapidGmax} from './rogue-transformations.mjs';
import {repairClassicZygarde} from './rogue-zygarde.mjs';

export const CLASSIC_SCHEMA=3;
export const CLASSIC_SAVE_SLOTS=5;
export function ensureClassicState(document,{initialStarterId=null}={}){
 if(!document.classic){document.classic={schema:CLASSIC_SCHEMA,sourceVersion:ROGUE_RULE_VERSION,activeSlot:0,slots:Array(CLASSIC_SAVE_SLOTS).fill(null),system:initialStarterId?{initialStarterId}:{},selection:null,history:[]};}
 const state=document.classic;
 if(state.schema!==CLASSIC_SCHEMA)throw Error('지원하지 않는 클래식 저장 버전입니다.');
 ensureStarterSystem(state.system,document.collection||[],{seed:document.__classicOwnerSeed||'initial-starter-default'});
 while(state.slots.length<CLASSIC_SAVE_SLOTS)state.slots.push(null);
 // Do not alter an active battle snapshot, pending capture, or growth decision.
 const run=state.slots[state.activeSlot];if(run&&['reward','interlude','route','advance','prepared'].includes(run.screen)&&!run.pendingCapture&&!run.pendingEvolution&&!run.pendingMoves?.length&&!run.pendingGrowth?.length&&Array.isArray(run.party))run.party=run.party.map(repairClassicRapidGmax);
 // A verified native Complete form must retain its current HP on reconnect.
 // Update only the active slot and its corresponding combat member.
 if(run&&Array.isArray(run.party))run.party=run.party.map(mon=>{
  const repaired=repairClassicZygarde(mon,run);if(repaired===mon)return mon;
  if(Array.isArray(run.combat?.teams?.[0]))run.combat.teams[0]=run.combat.teams[0].map(saved=>String(saved.boxId)===String(mon.boxId)?{...saved,...repaired}:saved);
  return repaired;
 });
 return state;
}
export function validateSlot(value){if(!Number.isInteger(value)||value<0||value>=CLASSIC_SAVE_SLOTS)throw Error('저장 슬롯은 1–5번입니다.');return value;}
export function selectClassicSlot(document,slot){const state=ensureClassicState(document);state.activeSlot=validateSlot(slot);state.selection=null;return state.slots[slot];}
export function prepareClassicTeam(document,slot){const state=ensureClassicState(document);state.selection={slot:validateSlot(slot)};return state.selection;}
function seedValue(value){let n=2166136261;for(const c of String(value)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0||1;}
/** Persisted RNG cursor prevents browser reloads from rerolling upcoming decisions. */
const scopedRandom=new WeakMap();
export function classicUsesScopedRandom(run){return scopedRandom.has(run);}
export function withClassicRandomSource(run,random,work){
 if(typeof random!=='function'||typeof work!=='function')throw Error('난수 생성기를 확인하세요.');
 const previous=scopedRandom.get(run);scopedRandom.set(run,random);
 try{return work();}finally{if(previous)scopedRandom.set(run,previous);else scopedRandom.delete(run);}
}
export function classicRandom(run){const override=scopedRandom.get(run);if(override)return override();let n=run.rng>>>0||1;n^=n<<13;n^=n>>>17;n^=n<<5;run.rng=n>>>0;return run.rng/4294967296;}
export function startClassicRun(document,selection,{slot=0,confirmOverwrite=false,id=crypto.randomUUID(),seed=crypto.randomUUID(),now=Date.now(),challengeRestrictions=undefined}={}){
 const restrictions=challengeRestrictions===undefined?null:normalizeClassicChallengeSubset(challengeRestrictions);
 const state=ensureClassicState(document),index=validateSlot(slot),old=state.slots[index];
 if(old&&!['victory','defeat','abandoned'].includes(old.screen)&&!confirmOverwrite)throw Error('진행 중인 저장을 덮어쓰려면 먼저 확인하세요.');
 const {party,cost}=buildStarterParty(state.system,selection,{challenges:restrictions||[],seed});
 const run={id,calledMoveRule:'source-pool-v1',sketchCopyRule:'source-v1',formItemStateRule:'source-v1',enemyAiMatchupRule:'source-matchup-v1',naturePowerRule:'source-biome-v1',dreamNativeItemsRule:'reviewed-native-v2',enemyAiRule:'source-ranked-v1',enemyAiStatusRule:'source-v1',enemyAiTargetRule:'source-tie-v1',enemyAiTerrainRule:'source-v1',enemyAiWeatherRule:'source-v1',enemyAiFirstTurnRule:'source-v1',firstTurnWaveRule:'source-subset-v1',poltergeistRule:'source-subset-v1',knockOffRule:'source-subset-v1',incinerateRule:'source-subset-v1',enemyAiSleepMoveRule:'source-v1',enemyAiDampRule:'source-subset-v1',enemyAiConditionalMoveRule:'source-subset-v1',enemyAiUserTypeRule:'source-v1',enemyAiAuroraVeilRule:'source-v1',auroraVeilWeatherRule:'source-v1',megaSolShoreUpRule:'source-v1',shoreUpSourceRule:'source-v1',megaSolFogRule:'source-v1',sunnyHealSourceRule:'source-v1',enemyAiWeatherBallRule:'source-v1',weatherBallStrongWindsRule:'source-v1',enemyAiLastResortRule:'source-v1',lastResortHistoryRule:'source-v2',weirdDreamFusionRule:'validated-v1',mysteryReviewedFormsRule:'source-subset-v1',adaptabilityRule:'source-subset-v2',stakeoutRule:'source-subset-v1',typeItemRule:'source-v2',typedPowerRule:'source-subset-v2',waterBubbleRule:'source-subset-v1',typeResistRule:'source-subset-v2',foulPlayStatRule:'source-subset-v1',bodyPressStatRule:'source-subset-v1',furCoatRule:'source-subset-v1',entryBoostRule:'source-subset-v1',traceTargetRule:'source-subset-v1',ruinIgnoreRule:'source-subset-v1',triageRule:'source-subset-v1',moveFlagRule:'source-subset-v1',berryTeatimeRule:'source-subset-v1',trainerMoveDataRule:'source-v1',snapTrapRule:'source-v1',zippyZapRule:'source-v1',zippyPpRule:'source-v1',sourceMovePpRule:'source-v1',ppUpEligibilityRule:'source-v1',moveBalanceRule:'source-subset-v2',darkVoidRule:'source-subset-v1',saltCureRule:'source-subset-v1',proteanRule:'source-subset-v1',berryOrderRule:'source-subset-v1',mysteryArenaResetRule:'source-subset-v1',mysteryInitialSwitchRule:'source-subset-v3',berryRacerRule:'source-subset-v1',avariceRecruitLevelRule:'source-subset-v1',avariceShopRule:'source-subset-v1',uncommonBreedOutcomeRule:'source-subset-v1',uncommonBreedExpRule:'source-subset-v1',snorlaxStealExpRule:'source-subset-v1',berryOfferTimingRule:'source-subset-v1',strongJuiceRewardsRule:'source-v1',mysteryFireMixedRule:'source-subset-v1',mysteryGuideMixedRule:'source-subset-v1',partTimerSalesRule:'source-subset-v1',trainingNatureRule:'source-subset-v1',vitaminNatureRule:'source-subset-v1',teleportInterfaceRule:'source-subset-v1',uncommonBreedCharmRule:'source-subset-v2',mysteryStealRule:'source-subset-v2',mysteryGuideFireRule:'source-subset-v2',...(restrictions?{challengeEligibilityRule:'source-subset-v1',challenges:restrictions}:{}),dnaFusionRule:'source-subset-v1',npcDialogueRule:'source-v1',ivScannerRule:'source-v1',goldenPunchRule:'source-v1',clownRule:'source-subset-v1',expertBreederRule:'source-subset-v1',weirdDreamRule:'source-subset-v1',challengerRule:'source-v1',bugSuperfanRule:'source-v1',dancingLessonsRule:'source-v1',safariRule:'source-subset-v1',salesmanRule:'source-subset-v1',winstrateRule:'source-subset-v3',darkDealRule:'source-subset-v1',rarerCandyRule:'source-v1',trainingRule:'source-subset-v1',trashRule:'source-subset-v1',mysteryRule:'part-timer-v19',delibirdNativeRule:'source-subset-v1',multiLensRule:'source-subset-v2',economyRule:'source-v1',enemyItemRule:'source-v2',berryMoveRule:'source-v1',berryStuffRule:'source-v1',enemyBerryRule:'source-v1',berryFullRule:'source-v1',berryCoreRule:'source-v1',reviverSeedRule:'source-v1',quickClawRule:'source-v1',kingsRockRule:'source-v1',focusBandRule:'source-v2',gripClawRule:'source-v2',shellBellRule:'source-v3',leftoversRule:'source-v2',wildSketchRule:'source-v1',trainerSketchRule:'source-v1',wildAbilityRule:'source-v1',wildVariantRule:'source-v1',trainerShinyRule:'source-v1',trainerIdentityRule:'source-v1',trainerVariantRule:'source-v1',trainerTraitsRule:'source-v1',trainerItemsRule:'source-v1',trainerFieldItemsRule:'source-v1',ruleset:CLASSIC_SCHEMA,sourceVersion:ROGUE_RULE_VERSION,seed,rng:seedValue(seed),startedAt:now,updatedAt:now,wave:1,screen:'prepared',starterCost:cost,party,money:1000,balls:{pokeball:5,greatball:0,ultraball:0,rogueball:0,masterball:0,beastball:0,quickball:0,timerball:0,netball:0,duskball:0,healball:0,luxuryball:0},modifiers:[],tools:{megaBracelet:false,dynamaxBand:false,zRing:false,teraOrb:false,map:false},teraCharged:false,biome:'town',biomeStep:1,combat:null,rewards:null,rerolls:0,pendingCapture:null,log:[],events:[]};
 run.gymStart=classicRandom(run)<.5?20:30;
 run.rivalSeed=Math.floor(classicRandom(run)*4294967296);
 run.evilTeamSeed=Math.floor(classicRandom(run)*4294967296);
 if(old)state.history.unshift({id:old.id,wave:old.wave,result:old.screen,endedAt:now,party:old.party.map(p=>({id:p.id,name:p.name,level:p.level,shiny:p.shiny}))});
 state.history=state.history.slice(0,100);state.slots[index]=run;state.activeSlot=index;state.selection=null;
 return run;
}
export function spendClassicMoney(run,price,expectedPrice=price){
 if(!Number.isSafeInteger(price)||price<0||expectedPrice!==price)throw Error('상품 가격이 변경됐습니다. 다시 확인하세요.');
 if(!Number.isFinite(run.money)||run.money<price)throw Error('이번 도전의 소지금이 부족합니다.');
 run.money-=price;return run.money;
}
export function classicSlotSummaries(document){return ensureClassicState(document).slots.map((run,index)=>({slot:index,id:run?.id||null,wave:run?.wave||0,screen:run?.screen||'empty',money:run?.money||0,...(run?.challenges?{challenges:structuredClone(run.challenges)}:{}),startedAt:run?.startedAt||null,party:(run?.party||[]).map(p=>({id:p.id,artId:p.artId,name:p.name,level:p.level,shiny:p.shiny}))}));}
