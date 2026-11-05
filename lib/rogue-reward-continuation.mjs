// Reward phase, not an event-name allowlist, owns empty-reward continuation.
// Never let a pending party/learning/evolution/dialogue choice be skipped.
export function classicCanLeaveReward(run){
 return !!run&&run.screen==='reward'&&!run.pendingCapture&&!run.pendingEvolution&&!run.pendingMysteryPreBattle&&!run.pendingSafariCatch&&!run.pendingMoves?.length&&!run.pendingGrowth?.length&&!run.npcDialogueQueue?.length&&run.mystery?.stage!=='confirm';
}
export function classicCanContinueEmptyReward(run){
 return classicCanLeaveReward(run)&&(run.rewards==null||Array.isArray(run.rewards)&&run.rewards.length===0);
}
