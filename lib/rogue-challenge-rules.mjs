// Active challenge IDs and values from pinned PokéRogue 7c088125.
// IDs 2 and 3 are intentionally absent: the source disables them.
export const CLASSIC_CHALLENGE_LIMITS=Object.freeze({0:9,1:18,5:1,6:1,7:1,8:3,9:1,10:2});
export function classicChallengeValue(run,id){return (run?.challenges||run?.challengeRestrictions||[]).find(c=>c?.id===id)?.value||0;}
export function classicPartyHealAllowed(run){return ![1,3].includes(classicChallengeValue(run,8));}
export function classicShopAllowed(run){return ![2,3].includes(classicChallengeValue(run,8));}
export function classicChallengeRibbonKeys(challenges){return [...new Set(challenges.flatMap(c=>({4:['freshStart'],5:['inverse'],6:['flipStats'],7:['limitedCatch'],8:c.value===3?['noHeal','noShop','noSupport']:c.value===1?['noHeal']:['noShop'],9:['hardcore'],10:['passives']})[c.id]||[]))];}

export function classicPreventRevive(run){return classicChallengeValue(run,9)===1;}
export function classicReviveItemAllowed(run,itemId){return !classicPreventRevive(run)||!['revive','maxrevive','sacredash'].includes(itemId);}
export function classicCatchJoinAllowed(run,mon){return !classicChallengeValue(run,7)||(mon?.rogueMetWave??run.wave)%10===1||run.mystery?.type==='teleport'&&['pay','interface'].includes(run.mystery.job);}
