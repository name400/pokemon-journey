import {rogueSpecies,sourceSpeciesFor} from './rogue-reference.mjs';
import {starterProgress} from './rogue-starter-system.mjs';
// Source: pagefaultgames/pokerogue 7c088125, src/data/egg.ts,
// src/data/balance/rates.ts and egg-gacha-ui-handler.ts (AGPL-3.0-only).
// This module does not spend vouchers or create eggs; callers must make those
// changes atomically when the complete gacha and hatch lifecycle is connected.
export const CLASSIC_GACHA_VOUCHERS=Object.freeze({
 regular:Object.freeze({cost:1,pulls:1}),regular10:Object.freeze({cost:10,pulls:10}),
 plus:Object.freeze({cost:1,pulls:5}),premium:Object.freeze({cost:1,pulls:10}),golden:Object.freeze({cost:1,pulls:25}),
});
export const CLASSIC_GACHA_HATCH_WAVES=Object.freeze([10,25,50,100]);
export function classicEggTierFromRoll(roll,mode){
 if(!Number.isInteger(roll)||roll<0||roll>255||!['move','legendary','shiny'].includes(mode))throw Error('알 뽑기 확률 입력을 확인하세요.');
 const offset=Number(mode==='legendary');return roll>=52+offset?0:roll>=8+offset?1:roll>=1+offset?2:3;
}
export function classicGachaTiers({mode,pulls,pity=[0,0,0,0],rng=Math.random}){
 if(!['move','legendary','shiny'].includes(mode)||![1,5,10,25].includes(pulls)||!Array.isArray(pity)||pity.length!==4||pity.some(n=>!Number.isSafeInteger(n)||n<0))throw Error('알 뽑기 입력을 확인하세요.');
 const counts=[...pity],tiers=[];for(let index=0;index<pulls;index++){
  const value=rng();if(!(value>=0&&value<1))throw Error('알 뽑기 난수를 확인하세요.');let tier=classicEggTierFromRoll(Math.floor(value*256),mode);
  const guaranteed=pulls===25?2:pulls===10?1:0;if(index===pulls-1&&guaranteed&&!tiers.some(t=>t>=guaranteed))tier=guaranteed;
  counts[1]++;counts[2]++;counts[3]+=mode==='legendary'?2:1;
  if(tier===0){if(counts[3]>=412)tier=3;else if(counts[2]>=59)tier=2;else if(counts[1]>=9)tier=1;}
  counts[tier]=0;tiers.push(tier);
 }
 return {tiers,pity:counts};
}
// Trainer categories here are the ones whose upstream initFor... methods set
// hasVoucher=true. Rival and regular trainers do not award these vouchers.
export function awardClassicTrainerVoucher(system,encounter){
 const trainer=encounter?.trainer,eligible=['gym','elite','champion'].includes(encounter?.kind)||encounter?.kind==='evil'&&trainer?.title==='악의 조직 보스';
 if(!eligible||!Number.isInteger(trainer?.id))return null;
 system.voucherCounts||={regular:0,plus:0,premium:0,golden:0};system.voucherUnlocks||={};
 const key=String(trainer.id),first=!system.voucherUnlocks[key],champion=(trainer.moneyMultiplier||1)>=10,type=first?(champion?'premium':'plus'):(champion?'plus':'regular');
 const current=system.voucherCounts[type]??0;if(!Number.isSafeInteger(current)||current<0)throw Error('알 바우처 저장을 확인하세요.');
 system.voucherCounts[type]=current+1;system.voucherUnlocks[key]=true;return {type,first,trainerId:trainer.id};
}
// CLASSIC_VICTORY has score 250 in upstream 7c088125, giving one golden voucher.
export function awardClassicVictoryVoucher(system){
 system.voucherUnlocks||={};if(system.voucherUnlocks['classic-victory'])return null;
 system.voucherCounts||={};const current=system.voucherCounts.golden??0;if(!Number.isSafeInteger(current)||current<0||!Number.isSafeInteger(current+1))throw Error('알 바우처 저장을 확인하세요.');
 system.voucherCounts.golden=current+1;system.voucherUnlocks['classic-victory']=true;return {type:'golden',first:true,achievement:'classic-victory'};
}
// Upstream GameOverPhase awards one Plus voucher per first species-line ribbon
// and a Premium on every classic win after the first. This is account-wide.
export function awardClassicVictoryRewards(system,run){
 if(run.victoryVoucherRewards)return null;
 const first=!system.voucherUnlocks?.['classic-victory'],wins=new Map();let plus=0;
 const root=(id,stopAtStarter)=>{const seen=new Set();while(rogueSpecies.has(id)&&!seen.has(id)){seen.add(id);const record=rogueSpecies.get(id),next=record.preEvolutionId??record.preEvolutionIds?.[0];if(!next||stopAtStarter&&record.isStarter)break;id=next;}return id;};
 for(const mon of run.party||[]){const species=sourceSpeciesFor(mon);if(!species)throw Error('완주 포켓몬의 종을 확인하세요.');const a=root(species.sourceId,false),b=root(species.sourceId,true);for(const id of a===b?[a]:[a,b]){const previous=wins.has(id)?wins.get(id):(system.starterData?.[id]?.classicWinCount??0);if(!Number.isSafeInteger(previous)||previous<0||!Number.isSafeInteger(previous+1))throw Error('완주 기록을 확인하세요.');if(previous===0)plus++;wins.set(id,previous+1);}}
 const counts=system.voucherCounts||{},premium=first?0:1;for(const [type,added] of [['plus',plus],['premium',premium],['golden',first?1:0]]){const count=counts[type]??0;if(!Number.isSafeInteger(count)||count<0||!Number.isSafeInteger(count+added))throw Error('알 바우처 저장을 확인하세요.');}
 for(const [id,count] of wins)starterProgress(system,id).classicWinCount=count;
 system.voucherCounts||={};const golden=awardClassicVictoryVoucher(system)?1:0;system.voucherCounts.plus=(system.voucherCounts.plus??0)+plus;system.voucherCounts.premium=(system.voucherCounts.premium??0)+premium;
 run.victoryVoucherRewards={golden,premium,plus};return run.victoryVoucherRewards;
}
// Source applies this weight after its egg-tier and unlock-pity filters.
export function classicEggSpeciesWeight(tier,cost){
 if(!Number.isInteger(tier)||tier<0||tier>3||!Number.isFinite(cost))throw Error('알 후보 비용을 확인하세요.');
 const [min,max]=[[1,3],[4,5],[6,7],[8,9]][tier],clamped=Math.min(max,Math.max(min,cost));
 return Math.floor((((max-clamped)/(max-min+1))*1.5+1)*100);
}
export function classicGachaEggMoveIndex(tier,mode,rng=Math.random){
 if(!Number.isInteger(tier)||tier<0||tier>3||!['move','legendary','shiny'].includes(mode))throw Error('알 유전기 입력을 확인하세요.');
 const random=()=>{const n=rng();if(!(n>=0&&n<1))throw Error('알 뽑기 난수를 확인하세요.');return n;};
 const rate=(mode==='move'?[12,8,6,4]:[36,24,12,6])[tier];return Math.floor(random()*rate)===0?3:Math.floor(random()*3);
}
