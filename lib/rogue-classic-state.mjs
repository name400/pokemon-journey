import {ROGUE_RULE_VERSION} from './rogue-reference.mjs';
import {ensureStarterSystem,buildStarterParty} from './rogue-starter-system.mjs';

export const CLASSIC_SCHEMA=3;
export const CLASSIC_SAVE_SLOTS=5;
export function ensureClassicState(document,{initialStarterId=null}={}){
 if(!document.classic){document.classic={schema:CLASSIC_SCHEMA,sourceVersion:ROGUE_RULE_VERSION,activeSlot:0,slots:Array(CLASSIC_SAVE_SLOTS).fill(null),system:initialStarterId?{initialStarterId}:{},selection:null,history:[]};}
 const state=document.classic;
 if(state.schema!==CLASSIC_SCHEMA)throw Error('지원하지 않는 클래식 저장 버전입니다.');
 ensureStarterSystem(state.system,document.collection||[],{seed:document.__classicOwnerSeed||'initial-starter-default'});
 while(state.slots.length<CLASSIC_SAVE_SLOTS)state.slots.push(null);
 return state;
}
export function validateSlot(value){if(!Number.isInteger(value)||value<0||value>=CLASSIC_SAVE_SLOTS)throw Error('저장 슬롯은 1–5번입니다.');return value;}
export function selectClassicSlot(document,slot){const state=ensureClassicState(document);state.activeSlot=validateSlot(slot);state.selection=null;return state.slots[slot];}
export function prepareClassicTeam(document,slot){const state=ensureClassicState(document);state.selection={slot:validateSlot(slot)};return state.selection;}
function seedValue(value){let n=2166136261;for(const c of String(value)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0||1;}
/** Persisted RNG cursor prevents browser reloads from rerolling upcoming decisions. */
export function classicRandom(run){let n=run.rng>>>0||1;n^=n<<13;n^=n>>>17;n^=n<<5;run.rng=n>>>0;return run.rng/4294967296;}
export function startClassicRun(document,selection,{slot=0,confirmOverwrite=false,id=crypto.randomUUID(),seed=crypto.randomUUID(),now=Date.now()}={}){
 const state=ensureClassicState(document),index=validateSlot(slot),old=state.slots[index];
 if(old&&!['victory','defeat','abandoned'].includes(old.screen)&&!confirmOverwrite)throw Error('진행 중인 저장을 덮어쓰려면 먼저 확인하세요.');
 const {party,cost}=buildStarterParty(state.system,selection);
 const run={id,mysteryRule:'part-timer-v2',economyRule:'source-v1',enemyItemRule:'source-v2',berryMoveRule:'source-v1',enemyBerryRule:'source-v1',berryFullRule:'source-v1',berryCoreRule:'source-v1',reviverSeedRule:'source-v1',quickClawRule:'source-v1',kingsRockRule:'source-v1',focusBandRule:'source-v1',wildSketchRule:'source-v1',trainerSketchRule:'source-v1',wildVariantRule:'source-v1',trainerShinyRule:'source-v1',trainerTraitsRule:'source-v1',trainerItemsRule:'source-v1',trainerFieldItemsRule:'source-v1',ruleset:CLASSIC_SCHEMA,sourceVersion:ROGUE_RULE_VERSION,seed,rng:seedValue(seed),startedAt:now,updatedAt:now,wave:1,screen:'prepared',starterCost:cost,party,money:1000,balls:{pokeball:5,greatball:0,ultraball:0,rogueball:0,masterball:0,quickball:0,timerball:0,netball:0,duskball:0,healball:0,luxuryball:0},modifiers:[],tools:{megaBracelet:false,dynamaxBand:false,zRing:false,teraOrb:false,map:false},teraCharged:false,biome:'town',biomeStep:1,combat:null,rewards:null,rerolls:0,pendingCapture:null,log:[],events:[]};
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
export function classicSlotSummaries(document){return ensureClassicState(document).slots.map((run,index)=>({slot:index,id:run?.id||null,wave:run?.wave||0,screen:run?.screen||'empty',money:run?.money||0,startedAt:run?.startedAt||null,party:(run?.party||[]).map(p=>({id:p.id,artId:p.artId,name:p.name,level:p.level,shiny:p.shiny}))}));}
