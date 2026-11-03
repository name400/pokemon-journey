// Restricted subset of PokeRogue beta 7c088125 mystery encounters.
// Unsupported source candidates fall back to ordinary wild battles.
import {Dex} from '@pkmn/sim';
import {moves} from './game.mjs';
import {classicRandom} from './rogue-classic-state.mjs';
import {classicWaveMoney,classicMoneyGain} from './rogue-classic-rules.mjs';
import {classicMaxPP,classicRemainingPP} from './rogue-classic-services.mjs';
import {awardClassicExperience} from './rogue-classic-growth.mjs';
const charming=new Set(['charm','flatter','dragoncheer','alluringvoice','attract','sweetscent','captivate','aromaticmist']);
const moveId=name=>Dex.moves.get(moves[name]?.key||name).id;
export function mysteryCanWork(mon,job){return !!mon&&mon.hp>0&&['delivery','warehouse','sales'].includes(job)&&(job!=='sales'||mon.moves.some(name=>charming.has(moveId(name))));}
export function maybeClassicMystery(run){
 if(run.mysteryRule!=='part-timer-v1'||run.encounter?.kind!=='wild'||run.wave<10||run.wave>180||run.wave%10===0||run.wave%10===1)return false;
 const state=run.mysteryState||={spawnWeight:3,history:[]},last=state.history.at(-1);if(last&&run.wave<=last.wave+3){state.spawnWeight+=3;return false;}
 const expected=12*(run.wave-10)/170,rate=state.spawnWeight+Math.min((expected-state.history.length)*15,128);const spawned=Math.floor(classicRandom(run)*256)<rate;
 if(!spawned||Number(run.biome)!==4){state.spawnWeight+=3;return false;}
 const weights=[66-6*state.history.length,40,19,3],total=weights.reduce((a,b)=>a+b,0),tierRoll=Math.floor(classicRandom(run)*total);if(tierRoll<=total-weights[0]){state.spawnWeight+=3;return false;}
 const candidates=['berries','fight-or-flight','uncommon-breed','part-timer','global-trade','shady-vitamins'];if(run.wave<=100)candidates.push('department-store');if(run.party.length>=2)candidates.push('mysterious-chest');if([2,3,4].includes(run.wave%10))candidates.push('teleport');
 if(candidates[Math.floor(classicRandom(run)*candidates.length)]!=='part-timer'){state.spawnWeight+=3;return false;}
 state.spawnWeight=3;state.history.push({type:'part-timer',tier:'common',wave:run.wave});run.encounter={kind:'mystery',trainer:null,key:'part-timer'};run.mystery={type:'part-timer',stage:'choose',selection:null};run.screen='mystery';run.combat=null;run.log=[];return true;
}
export function selectClassicMystery(run,{job,boxId}){if(run.screen!=='mystery'||run.mystery?.type!=='part-timer'||run.mystery.stage!=='choose')throw Error('진행 중인 이벤트 선택을 확인하세요.');const mon=run.party.find(p=>p.boxId===boxId);if(!mysteryCanWork(mon,job))throw Error('일을 맡길 수 있는 포켓몬을 선택하세요.');run.mystery.selection={job,boxId};run.mystery.stage='confirm';}
export function cancelClassicMysterySelection(run){if(run.screen!=='mystery'||run.mystery?.stage!=='confirm')throw Error('취소할 이벤트 선택이 없습니다.');run.mystery.selection=null;run.mystery.stage='choose';}
export function completeClassicMystery(run,system){
 if(run.screen!=='mystery'||run.mystery?.type!=='part-timer'||run.mystery.stage!=='confirm')throw Error('확인할 이벤트 선택이 없습니다.');const {job,boxId}=run.mystery.selection||{},mon=run.party.find(p=>p.boxId===boxId);if(!mysteryCanWork(mon,job))throw Error('일을 맡길 수 있는 포켓몬을 선택하세요.');
 const stats=mon.stats,lv=mon.level,baseSpeed=Math.floor(196*lv*.01)+5,baseHp=Math.floor(166*lv*.01)+lv+10,baseOther=Math.floor(166*lv*.01)+5;
 const ratio=job==='delivery'?stats.spe/baseSpeed:job==='warehouse'?(stats.hp+1.5*(stats.atk+stats.def))/(baseHp+3*baseOther):1,multiplier=Math.min(4,Math.max(1,2.5*ratio));
 for(const [i,name] of mon.moves.entries()){const id=moveId(name),remaining=classicRemainingPP(mon,i),pp=Math.min(2,remaining);mon.pp||={};mon.pp[id]=pp;if(Array.isArray(mon.rogueSketchPP))mon.rogueSketchPP[i]=pp;}
 const gain=classicMoneyGain(run,classicWaveMoney(run.wave,multiplier));run.money+=gain;run.expNotices=awardClassicExperience(run,[{baseExperience:100,level:run.wave}],{system,participants:[boxId],trainer:false,pokemonDefeated:false});run.mysteryState||={spawnWeight:3,history:[]};run.mysteryState.completedWaves||=[];if(!run.mysteryState.completedWaves.includes(run.wave))run.mysteryState.completedWaves.push(run.wave);run.mystery={type:'part-timer',stage:'resolved',job,boxId,gain};return gain;
}
