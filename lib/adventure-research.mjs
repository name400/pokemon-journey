// Mable's Research: documented trainer battle milestones only. Other task types
// and research-level rewards are intentionally not represented as complete.
export const TRAINER_BATTLE_MILESTONES=[5,10,15,20,25,30,40,50,60,70,80,90,100,500,1000];
export function researchTrainerWins(s){const n=s.zaResearchTrainerWins;return Number.isSafeInteger(n)&&n>=0?Math.min(n,1000):0;}
export function researchTrainerProgress(s){const wins=researchTrainerWins(s);const completed=TRAINER_BATTLE_MILESTONES.filter(n=>wins>=n).length;return {wins,completed,points:Math.min(completed,13)*200+(completed>=14?500:0)+(completed>=15?2000:0),next:TRAINER_BATTLE_MILESTONES[completed]??null};}
export function recordResearchTrainerWin(s){const before=researchTrainerProgress(s);s.zaResearchTrainerWins=Math.min(1000,before.wins+1);return researchTrainerProgress(s).completed>before.completed;}
