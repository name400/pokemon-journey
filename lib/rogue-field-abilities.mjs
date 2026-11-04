import {classicWaveMoney} from './rogue-classic-rules.mjs';
import {classicChallengeBattleEligibility} from './rogue-challenge-eligibility.mjs';
const key=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'');

// Source reference: MoneyAbAttr and BattleEndPhase in the user-provided ZIP.
// Honey Gather is unsuppressable, applies to eligible surviving party members,
// and contributes scattered money before the normal money multipliers settle.
export function classicPostBattleVictory(run){
 const combat=run.combat,foes=combat?.teams?.[1]||[];
 if(!combat?.ended||combat.winner!==0||!foes.length)return false;
 const nativeFoes=combat.snapshot?.sides?.[1]?.pokemon||[];
 return !foes.some(mon=>{const native=nativeFoes.find(p=>String(p.set?.trainerToken)===String(mon.boxId));return native?.m?.released||mon.released||mon.hp>0&&!mon.captured;});
}
export function classicPostBattleOwners(run,wanted){
 const nativeParty=run.combat?.snapshot?.sides?.[0]?.pokemon||[];
 return (run.party||[]).filter(mon=>{
  if(mon.hp<=0||run.challengeEligibilityRule==='source-subset-v1'&&classicChallengeBattleEligibility(mon,run.challenges)!==true)return false;
  const native=nativeParty.find(p=>String(p.set?.trainerToken)===String(mon.boxId));
  return key(native?.ability||mon.ability)===wanted||key(mon.roguePassiveAbility)===wanted;
 });
}
export function collectClassicHoneyGather(run){
 if(!classicPostBattleVictory(run))return {amount:0,owners:[]};
 const combat=run.combat,foes=combat.teams[1];
 const encounter=JSON.stringify([run.wave,...foes.map(mon=>String(mon.boxId))]);
 if(combat.honeyGatherSettledFor===encounter)return {amount:0,owners:[]};
 combat.honeyGatherSettledFor=encounter;
 const owners=classicPostBattleOwners(run,'honeygather');
 const amount=classicWaveMoney(run.wave,.2)*owners.length;
 combat.moneyScattered=(combat.moneyScattered||0)+amount;
 return {amount,owners};
}

const ballNames={pokeball:'몬스터볼',greatball:'슈퍼볼',ultraball:'하이퍼볼',rogueball:'로그볼',masterball:'마스터볼'};
// Source reference: FetchBallAbAttr, once-per-battle condition, failed capture.
// Native hasAbility includes active/passive suppression through the adapter.
export function installClassicBallFetch(battle,combat,run){
 if(!run?.balls)return;
 battle.onEvent('Residual',battle.format,{priority:-200},function(){
  const ball=combat.lastFailedBallId;if(!Object.hasOwn(ballNames,ball||''))return;
  const used=Array.isArray(combat.ballFetchUsed)?combat.ballFetchUsed:[];
  const owner=this.p1.active.find(p=>p?.hp>0&&!p.fainted&&p.hasAbility('ballfetch')&&!used.includes(String(p.set.trainerToken)));
  if(!owner)return;
  run.balls[ball]=Math.min(99,Math.max(0,Number(run.balls[ball])||0)+1);
  combat.ballFetchUsed=[...used,String(owner.set.trainerToken)];combat.lastFailedBallId=null;
  this.add('-ability',owner,'Ball Fetch');this.add('message',ballNames[ball]+'을 주웠다!');
 });
}
