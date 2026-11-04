import {rogueSpecies,sourceSpeciesFor} from './rogue-reference.mjs';
import {classicChallengeBattleEligibility,normalizeClassicChallengeSubset} from './rogue-challenge-eligibility.mjs';

// Source challenge ribbons are awarded to the eligible species and its
// pre-evolutions, including fainted party members. Store plain JSON arrays.
export function recordClassicChallengeRibbons(system,run){
 if(run.challengeEligibilityRule!=='source-subset-v1')return null;
 const challenges=normalizeClassicChallengeSubset(run.challenges),existing=system.challengeRibbonSpecies;
 if(existing!=null&&(typeof existing!=='object'||Array.isArray(existing)))throw Error('챌린지 리본 기록을 확인하세요.');
 const records=structuredClone(existing||{}),eligibleBoxIds=[],speciesIds=new Set();
 for(const mon of run.party||[]){if(!Number.isFinite(mon.hp)||mon.hp<0||classicChallengeBattleEligibility({...mon,hp:Math.max(1,mon.hp)},challenges)!==true)continue;let species=sourceSpeciesFor(mon);if(!species)continue;eligibleBoxIds.push(mon.boxId);const seen=new Set();while(species&&!seen.has(species.sourceId)){seen.add(species.sourceId);speciesIds.add(species.sourceId);species=rogueSpecies.get(species.preEvolutionId);}}
 for(const id of speciesIds){const prior=records[id];if(prior!=null&&(typeof prior!=='object'||Array.isArray(prior)||!Array.isArray(prior.generations)||!Array.isArray(prior.types)||prior.generations.some(v=>!Number.isInteger(v)||v<1||v>9)||prior.types.some(v=>!Number.isInteger(v)||v<1||v>18)))throw Error('챌린지 리본 기록을 확인하세요.');const record=prior||{generations:[],types:[]};for(const challenge of challenges){const list=challenge.id===0?record.generations:record.types;if(!list.includes(challenge.value))list.push(challenge.value);}records[id]=record;}
 system.challengeRibbonSpecies=records;run.challengeResult={challenges,eligibleBoxIds};return run.challengeResult;
}
