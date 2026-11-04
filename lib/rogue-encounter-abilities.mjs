import {configure,rules} from './pokemon-config.mjs';
import {classicChallengeBattleEligibility} from './rogue-challenge-eligibility.mjs';
const id=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'');

export function classicEncounterLeads(run,doubles=false){
 const party=run.party||[],wanted=doubles?2:1,indices=run.combat?.activeBySide?.[0]||[],selected=[];
 for(let slot=0;slot<wanted;slot++){
  const index=indices[slot];
  // Preserve an occupied/fainted field position. The source checks the sliced
  // leads' ability eligibility; it does not search the entire bench for a user.
  if(slot<indices.length)selected.push(Number.isInteger(index)&&index>=0?party[index]:null);
  else selected.push(party.find(mon=>!selected.includes(mon))||null);
 }
 return selected.filter(mon=>mon&&mon.hp>0&&(run.challengeEligibilityRule!=='source-subset-v1'||classicChallengeBattleEligibility(mon,run.challenges)===true));
}

// EncounterPhase applies Synchronize in reverse field order. Thus slot zero
// wins when both prospective leads have it. The original random nature is still
// rolled before this override; no extra RNG or reroll on loading is introduced.
export function synchronizeClassicEncounterNature(run,encounter){
 if(!encounter||encounter.trainer||!['wild','final'].includes(encounter.kind))return encounter;
 const nativeParty=run.combat?.snapshot?.sides?.[0]?.pokemon||[];
 const native=mon=>nativeParty.find(p=>String(p.set?.trainerToken)===String(mon.boxId));
 const abilities=mon=>[id(native(mon)?.ability||mon.currentAbility||mon.ability),id(mon.roguePassiveAbility)];
 const gasOwners=(run.party||[]).filter(mon=>mon.hp>0&&native(mon)?.isActive&&!native(mon)?.volatiles?.gastroacid&&abilities(mon).includes('neutralizinggas'));
 const owner=classicEncounterLeads(run,!!encounter.doubles).find(mon=>{
  const p=native(mon),own=abilities(mon);
  if(!own.includes('synchronize')||!Object.hasOwn(rules.natures,mon.nature||'')||p?.volatiles?.gastroacid)return false;
  return !p?.isActive||!gasOwners.length||own.includes('neutralizinggas')||id(p?.item??mon.item)==='abilityshield';
 });
 if(!owner)return encounter;
 encounter.team=encounter.team.map(mon=>configure(mon,{nature:owner.nature,hp:mon.hp}));
 return encounter;
}
