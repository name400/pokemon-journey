// Restricted subset of PokeRogue beta 7c088125 mystery encounters.
// Unsupported source candidates fall back to ordinary wild battles.
import {Dex} from '@pkmn/sim';
import {moves} from './game.mjs';
import {calculateStats} from './pokemon-config.mjs';
import {classicRandom} from './rogue-classic-state.mjs';
import {classicWaveMoney,classicMoneyGain} from './rogue-classic-rules.mjs';
import {classicMaxPP,classicRemainingPP} from './rogue-classic-services.mjs';
import {awardClassicExperience} from './rogue-classic-growth.mjs';
const charming=new Set(['charm','flatter','dragoncheer','alluringvoice','attract','sweetscent','captivate','aromaticmist']);
const moveId=name=>Dex.moves.get(moves[name]?.key||name).id;
export function mysteryCanWork(mon,job){return !!mon&&mon.hp>0&&['delivery','warehouse','sales'].includes(job)&&(job!=='sales'||mon.moves.some(name=>charming.has(moveId(name))));}
export function maybeClassicMystery(run){
 if(!['part-timer-v1','part-timer-v2','part-timer-v3'].includes(run.mysteryRule)||run.encounter?.kind!=='wild'||run.wave<10||run.wave>180||run.wave%10===0||run.wave%10===1)return false;
 const state=run.mysteryState||={spawnWeight:3,history:[]},last=state.history.at(-1);if(last&&run.wave<=last.wave+3){state.spawnWeight+=3;return false;}
 const expected=12*(run.wave-10)/170,rate=state.spawnWeight+Math.min((expected-state.history.length)*15,128);const spawned=Math.floor(classicRandom(run)*256)<rate;
 if(!spawned||Number(run.biome)!==4){state.spawnWeight+=3;return false;}
 const weights=[66-6*state.history.length,40,19,3],total=weights.reduce((a,b)=>a+b,0),tierRoll=Math.floor(classicRandom(run)*total);if(tierRoll<=total-weights[0]){state.spawnWeight+=3;return false;}
 const candidates=['berries','fight-or-flight','uncommon-breed','part-timer','global-trade'];if(run.mysteryRule==='part-timer-v1'||canMeetVitaminDealer(run))candidates.push('shady-vitamins');if(run.wave<=100)candidates.push('department-store');if((run.mysteryRule==='part-timer-v3'?run.party.filter(p=>p.hp>0).length:run.party.length)>=2)candidates.push('mysterious-chest');if([2,3,4].includes(run.wave%10))candidates.push('teleport');
 const eligible=run.mysteryRule!=='part-timer-v1'?candidates.filter(type=>type!==last?.type&&state.history.filter(event=>event.type===type).length<2):candidates;const selected=eligible[Math.floor(classicRandom(run)*eligible.length)];if(selected!=='part-timer'&&!(selected==='shady-vitamins'&&run.mysteryRule!=='part-timer-v1')&&!(selected==='mysterious-chest'&&run.mysteryRule==='part-timer-v3')){state.spawnWeight+=3;return false;}
 state.spawnWeight=3;state.history.push({type:selected,tier:'common',wave:run.wave});run.encounter={kind:'mystery',trainer:null,key:selected};run.mystery={type:selected,stage:'choose',selection:null};run.screen='mystery';run.combat=null;run.log=[];return true;
}
export function canMeetVitaminDealer(run){return run.money>=classicWaveMoney(run.wave,1.5)&&run.party.some(p=>p.hp>0&&p.hp/p.maxHp>=.51);}
export function mysteryVitaminEligible(run,mon,job){return !!mon&&mon.hp>0&&['cheap','expensive'].includes(job)&&run.money>=classicWaveMoney(run.wave,job==='cheap'?1.5:5)&&(job!=='cheap'||mon.hp/mon.maxHp>=.51);}
export function selectClassicMystery(run,{job,boxId}){if(run.screen!=='mystery'||run.mystery?.stage!=='choose')throw Error('진행 중인 이벤트 선택을 확인하세요.');const mon=run.party.find(p=>p.boxId===boxId),type=run.mystery.type;if(type==='part-timer'&&!mysteryCanWork(mon,job))throw Error('일을 맡길 수 있는 포켓몬을 선택하세요.');if(type==='shady-vitamins'&&job!=='leave'&&!mysteryVitaminEligible(run,mon,job))throw Error('조건에 맞는 포켓몬과 충분한 돈을 확인하세요.');if(type==='mysterious-chest'&&(!['open','leave'].includes(job)||boxId))throw Error('상자의 선택을 확인하세요.');if(!['part-timer','shady-vitamins','mysterious-chest'].includes(type)||type==='shady-vitamins'&&job==='leave'&&boxId)throw Error('이벤트 선택을 확인하세요.');run.mystery.selection={job,boxId:boxId||null};run.mystery.stage='confirm';}
export function cancelClassicMysterySelection(run){if(run.screen!=='mystery'||run.mystery?.stage!=='confirm')throw Error('취소할 이벤트 선택이 없습니다.');run.mystery.selection=null;run.mystery.stage='choose';}
const STAT_KEYS=['hp','atk','def','spa','spd','spe'];
function completeVitaminDealer(run,system){
 const {job,boxId}=run.mystery.selection||{};if(job==='leave'){run.mystery={type:'shady-vitamins',stage:'resolved',job};return {shopOnly:true};}
 const mon=run.party.find(p=>p.boxId===boxId);if(!mysteryVitaminEligible(run,mon,job))throw Error('조건에 맞는 포켓몬과 충분한 돈을 확인하세요.');
 run.money-=classicWaveMoney(run.wave,job==='cheap'?1.5:5);const stats=[];
 for(let i=0;i<2;i++){const stat=STAT_KEYS[Math.floor(classicRandom(run)*STAT_KEYS.length)];stats.push(stat);const entries=run.modifiers.filter(m=>m.id==='basestatbooster'&&m.boxId===boxId&&m.stat===stat),limit=Math.max(1,mon.ivs?.[stat]??31);if(entries.reduce((sum,m)=>sum+m.count,0)>=limit)continue;if(entries.length)entries[0].count++;else run.modifiers.push({id:'basestatbooster',boxId,count:1,stat,typeBoost:null,transferable:false});const hp=mon.hp,oldMax=mon.maxHp;mon.rogueBaseBoosts||={};mon.rogueBaseBoosts[stat]=(mon.rogueBaseBoosts[stat]||0)+1;mon.stats=calculateStats(mon);mon.maxHp=mon.stats.hp;mon.hp=Math.min(mon.maxHp,hp+Math.max(0,mon.maxHp-oldMax));}
 if(job==='cheap'){mon.hp=Math.max(1,mon.hp-Math.floor(mon.maxHp/2));const original=mon.nature||'hardy',natures=Dex.natures.all().filter(n=>n.id!==original);mon.rogueOriginalNature||=original;mon.nature=natures[Math.floor(classicRandom(run)*natures.length)].id;mon.stats=calculateStats(mon);mon.maxHp=mon.stats.hp;mon.hp=Math.min(mon.hp,mon.maxHp);}
 run.expNotices=awardClassicExperience(run,[{baseExperience:100,level:run.wave}],{system,participants:[boxId],trainer:false,pokemonDefeated:false});run.mystery={type:'shady-vitamins',stage:'resolved',job,boxId,stats};return {shopOnly:true};
}
export function completeClassicMystery(run,system){
 if(run.screen!=='mystery'||run.mystery?.stage!=='confirm')throw Error('확인할 이벤트 선택이 없습니다.');if(run.mystery.type==='shady-vitamins'){const result=completeVitaminDealer(run,system);recordMysteryCompletion(run);return result;}if(run.mystery.type==='mysterious-chest'){const job=run.mystery.selection?.job;if(!['open','leave'].includes(job))throw Error('상자의 선택을 확인하세요.');if(job==='leave'){recordMysteryCompletion(run);run.mystery={type:'mysterious-chest',stage:'resolved',job};return {shopOnly:true};}const roll=Math.floor(classicRandom(run)*100);if(roll<30){const target=run.party.filter(p=>p.hp>0).reduce((best,p)=>!best||p.level>best.level?p:best,null);if(!target)throw Error('참여할 포켓몬이 없습니다.');target.hp=0;run.mystery={type:'mysterious-chest',stage:'battle',roll,knockedOut:target.boxId};return {chestBattle:true};}const tiers=roll>=75?[0,0,1,1]:roll>=45?[2,2,2]:roll>=35?[3,3]:[4];recordMysteryCompletion(run);run.mystery={type:'mysterious-chest',stage:'resolved',job,roll};return {rewardTiers:tiers};}if(run.mystery.type!=='part-timer')throw Error('확인할 이벤트를 찾지 못했습니다.');const {job,boxId}=run.mystery.selection||{},mon=run.party.find(p=>p.boxId===boxId);if(!mysteryCanWork(mon,job))throw Error('일을 맡길 수 있는 포켓몬을 선택하세요.');
 const stats=mon.stats,lv=mon.level,baseSpeed=Math.floor(196*lv*.01)+5,baseHp=Math.floor(166*lv*.01)+lv+10,baseOther=Math.floor(166*lv*.01)+5;
 const ratio=job==='delivery'?stats.spe/baseSpeed:job==='warehouse'?(stats.hp+1.5*(stats.atk+stats.def))/(baseHp+3*baseOther):1,multiplier=Math.min(4,Math.max(1,2.5*ratio));
 for(const [i,name] of mon.moves.entries()){const id=moveId(name),remaining=classicRemainingPP(mon,i),pp=Math.min(2,remaining);mon.pp||={};mon.pp[id]=pp;if(Array.isArray(mon.rogueSketchPP))mon.rogueSketchPP[i]=pp;}
 const gain=classicMoneyGain(run,classicWaveMoney(run.wave,multiplier));run.money+=gain;run.expNotices=awardClassicExperience(run,[{baseExperience:100,level:run.wave}],{system,participants:[boxId],trainer:false,pokemonDefeated:false});recordMysteryCompletion(run);run.mystery={type:'part-timer',stage:'resolved',job,boxId,gain};return {shopOnly:false};
}

export function recordMysteryCompletion(run){run.mysteryState||={spawnWeight:3,history:[]};run.mysteryState.completedWaves||=[];if(!run.mysteryState.completedWaves.includes(run.wave))run.mysteryState.completedWaves.push(run.wave);}
