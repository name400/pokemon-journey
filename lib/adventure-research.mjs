// Mable's Research: documented trainer battle milestones only. Other task types
// and research-level rewards are intentionally not represented as complete.
export const TRAINER_BATTLE_MILESTONES=[5,10,15,20,25,30,40,50,60,70,80,90,100,500,1000];
export function researchTrainerWins(s){const n=s.zaResearchTrainerWins;return Number.isSafeInteger(n)&&n>=0?Math.min(n,1000):0;}
export function researchTrainerProgress(s){const wins=researchTrainerWins(s);const completed=TRAINER_BATTLE_MILESTONES.filter(n=>wins>=n).length;return {wins,completed,points:Math.min(completed,13)*200+(completed>=14?500:0)+(completed>=15?2000:0),next:TRAINER_BATTLE_MILESTONES[completed]??null};}
export function recordResearchTrainerWin(s){const before=researchTrainerProgress(s);s.zaResearchTrainerWins=Math.min(1000,before.wins+1);return researchTrainerProgress(s).completed>before.completed;}

export const RESEARCH_TYPES=['노말','불꽃','물','전기','풀','얼음','격투','독','땅','비행','에스퍼','벌레','바위','고스트','드래곤','악','강철','페어리'];
const CAPTURE_MILESTONES=[3,8,15,25,50];
const EVOLUTION_MILESTONES=[3,6,10,15,20,25,30,35,40,50];
const ITEM_EVOLUTION_MILESTONES=[1,5,10];
function validCount(value,max){return Number.isSafeInteger(value)&&value>=0?Math.min(value,max):0;}
function milestoneProgress(count,milestones,per){const completed=milestones.filter(n=>count>=n).length;return {count,completed,points:completed*per,next:milestones[completed]??null};}
export function researchCaptureProgress(s){return RESEARCH_TYPES.map(type=>({type,...milestoneProgress(validCount(s.zaResearchCaptures?.[type],50),CAPTURE_MILESTONES,300)}));}
export function recordResearchCapture(s,types){const counts={...(s.zaResearchCaptures||{})};for(const type of new Set(Array.isArray(types)?types:[]))if(RESEARCH_TYPES.includes(type))counts[type]=Math.min(50,validCount(counts[type],50)+1);s.zaResearchCaptures=counts;}
export function researchEvolutionProgress(s){return {all:milestoneProgress(validCount(s.zaResearchEvolutions,50),EVOLUTION_MILESTONES,500),item:milestoneProgress(validCount(s.zaResearchItemEvolutions,10),ITEM_EVOLUTION_MILESTONES,500)};}
export function recordResearchEvolution(s,item){s.zaResearchEvolutions=Math.min(50,validCount(s.zaResearchEvolutions,50)+1);if(item)s.zaResearchItemEvolutions=Math.min(10,validCount(s.zaResearchItemEvolutions,10)+1);}
// Total points required for levels 2 through 50.
const LEVEL_TOTALS=[100,600,1400,...Array.from({length:6},(_,i)=>2400+i*1000),...Array.from({length:10},(_,i)=>8400+i*1500),...Array.from({length:10},(_,i)=>23400+i*2000),...Array.from({length:20},(_,i)=>43400+i*2500)];
export function researchSummary(s){const battle=researchTrainerProgress(s),captures=researchCaptureProgress(s),evolution=researchEvolutionProgress(s);const points=battle.points+captures.reduce((n,p)=>n+p.points,0)+evolution.all.points+evolution.item.points;const earned=LEVEL_TOTALS.filter(n=>points>=n).length;return {points,level:earned+1,next:LEVEL_TOTALS[earned]??null};}

// Only verified base species are listed; regional/form-specific and remaining learners need review.
export const RESEARCH_TM_REWARDS=[
 {level:2,number:'004',move:'바위깨기',learners:[66,67,68,447,448,659,660]},
 {level:3,number:'046',move:'머드샷',learners:[9,23,24,304,305,306,650,651,652,659,660,672,673,688,689,692,693]},
 {level:4,number:'017',move:'방어',learners:[1,4,6,63,142,304,305,306,650,652,659]},
 {level:5,number:'021',move:'번개엄니',learners:[24,142,371]},
 {level:6,number:'014',move:'불꽃엄니',learners:[6,24,142,371]},
 {level:7,number:'015',move:'얼음엄니',learners:[24,142,713,998]},
];
export function researchTm(level){return RESEARCH_TM_REWARDS.find(r=>r.level===level);}
export function hasResearchTm(s,level){return !!researchTm(level)&&Array.isArray(s.zaResearchRewards)&&s.zaResearchRewards.includes(level);}
export function canLearnResearchTm(s,m,level){const tm=researchTm(level);return !!tm&&hasResearchTm(s,level)&&tm.learners.includes(m?.speciesId)&&!m?.moves?.includes(tm.move);}
// Keep legacy names for clients and tests from earlier development commits.
export function hasResearchRockSmash(s){return hasResearchTm(s,2);}
export function canLearnResearchRockSmash(s,m){return canLearnResearchTm(s,m,2);}
export function hasResearchMudShot(s){return hasResearchTm(s,3);}
export function canLearnResearchMudShot(s,m){return canLearnResearchTm(s,m,3);}
