import {crystalResearchProgress} from './adventure-mega-crystals.mjs';
import {megaResearchProgress} from './adventure-mega-research.mjs';
import {laterZoneResearch} from './adventure-zone-research.mjs';
import {anomalyIds} from './adventure-mission40.mjs';
import {zone4Research} from './adventure-zone4.mjs';
import {zone3Research} from './adventure-zone3.mjs';
import {zone2Research} from './adventure-zone2.mjs';
import {zone1Research} from './adventure-zone1.mjs';
import {lumioseDexProgress} from './adventure-dex.mjs';
import researchTmCompatibility from '../../data/adventure-za-research-tm.json' with {type:'json'};
import researchTmFormCompatibility from '../../data/adventure-za-research-tm-forms.json' with {type:'json'};
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
const TRADE_EVOLUTION_MILESTONES=[1,3,5];
function validCount(value,max){return Number.isSafeInteger(value)&&value>=0?Math.min(value,max):0;}
function milestoneProgress(count,milestones,per){const completed=milestones.filter(n=>count>=n).length;return {count,completed,points:completed*per,next:milestones[completed]??null};}
export function researchCaptureProgress(s){return RESEARCH_TYPES.map(type=>({type,...milestoneProgress(validCount(s.zaResearchCaptures?.[type],50),CAPTURE_MILESTONES,300)}));}
export function recordResearchCapture(s,types){const counts={...(s.zaResearchCaptures||{})};for(const type of new Set(Array.isArray(types)?types:[]))if(RESEARCH_TYPES.includes(type))counts[type]=Math.min(50,validCount(counts[type],50)+1);s.zaResearchCaptures=counts;}
export function researchEvolutionProgress(s){return {all:milestoneProgress(validCount(s.zaResearchEvolutions,50),EVOLUTION_MILESTONES,500),item:milestoneProgress(validCount(s.zaResearchItemEvolutions,10),ITEM_EVOLUTION_MILESTONES,500)};}
export function researchTradeEvolutionProgress(s){return milestoneProgress(validCount(s.zaResearchTradeEvolutions,5),TRADE_EVOLUTION_MILESTONES,2000);}
export function recordResearchTradeEvolution(s,mon,recipient){if(mon?.adventureResearchTradeRecipient!==recipient)return false;s.zaResearchTradeEvolutions=Math.min(5,validCount(s.zaResearchTradeEvolutions,5)+1);return true;}
export function recordResearchEvolution(s,item){s.zaResearchEvolutions=Math.min(50,validCount(s.zaResearchEvolutions,50)+1);if(item)s.zaResearchItemEvolutions=Math.min(10,validCount(s.zaResearchItemEvolutions,10)+1);}
// A completed legacy fossil quest proves one restoration, but not more.
export const RESEARCH_ACTIVITIES=['fossil','cafe','bench'];
export function researchActivityCount(s,key){if(!RESEARCH_ACTIVITIES.includes(key))return 0;const n=validCount(s?.zaResearchActivities?.[key],3);return key==='fossil'&&s?.zaSide27Complete===true?Math.max(1,n):n;}
export function recordResearchActivity(s,key){if(!RESEARCH_ACTIVITIES.includes(key))return;s.zaResearchActivities={...(s.zaResearchActivities||{}),[key]:Math.min(3,researchActivityCount(s,key)+1)};}
export function researchActivityPoints(s){return RESEARCH_ACTIVITIES.reduce((points,key)=>points+(researchActivityCount(s,key)>=3?500:0),0);}
// Total points required for levels 2 through 50.
const LEVEL_TOTALS=[100,600,1400,...Array.from({length:6},(_,i)=>2400+i*1000),...Array.from({length:10},(_,i)=>8400+i*1500),...Array.from({length:10},(_,i)=>23400+i*2000),...Array.from({length:20},(_,i)=>43400+i*2500)];
export function researchSummary(s){const battle=researchTrainerProgress(s),captures=researchCaptureProgress(s),evolution=researchEvolutionProgress(s);const points=researchTradeEvolutionProgress(s).points+crystalResearchProgress(s).points+megaResearchProgress(s).points+lumioseDexProgress(s).points+zone1Research(s).points+zone2Research(s).points+zone3Research(s).points+zone4Research(s).points+laterZoneResearch(s).reduce((n,zone)=>n+zone.points,0)+(anomalyIds(s).length===3?1000:0)+researchActivityPoints(s)+battle.points+captures.reduce((n,p)=>n+p.points,0)+evolution.all.points+evolution.item.points;const earned=LEVEL_TOTALS.filter(n=>points>=n).length;return {points,level:earned+1,next:LEVEL_TOTALS[earned]??null};}

// Z-A 2.0 base-form TM compatibility; alternate forms remain restricted.
// https://github.com/Fortelle/pokemon-learnsets/tree/79351bcf414276f82efda89c474f9de6e837af06/raw/legendsza%402.0.0
export const RESEARCH_TM_REWARDS=[
 {level:2,number:'004',move:'바위깨기',learners:researchTmCompatibility['004']},
 {level:3,number:'046',move:'머드샷',learners:researchTmCompatibility['046']},
 {level:4,number:'017',move:'방어',learners:researchTmCompatibility['017']},
 {level:5,number:'021',move:'번개엄니',learners:researchTmCompatibility['021']},
 {level:6,number:'014',move:'불꽃엄니',learners:researchTmCompatibility['014']},
 {level:7,number:'015',move:'얼음엄니',learners:researchTmCompatibility['015']},
 {level:8,number:'070',move:'바다회오리',learners:researchTmCompatibility['070']},
 {level:9,number:'061',move:'섀도클로',learners:researchTmCompatibility['061']},
 {level:11,number:'016',move:'빛의장막',learners:researchTmCompatibility['016']},
 {level:12,number:'042',move:'기가드레인',learners:researchTmCompatibility['042']},
 {level:13,number:'024',move:'냉동펀치',learners:researchTmCompatibility['024']},
 {level:14,number:'003',move:'사이코쇼크',learners:researchTmCompatibility['003']},
 {level:15,number:'023',move:'번개펀치',learners:researchTmCompatibility['023']},
 {level:16,number:'032',move:'그림자분신',learners:researchTmCompatibility['032']},
 {level:17,number:'029',move:'불꽃펀치',learners:researchTmCompatibility['029']},
 {level:18,number:'078',move:'땅고르기',learners:researchTmCompatibility['078']},
 {level:19,number:'082',move:'유턴',learners:researchTmCompatibility['082']},
 {level:20,number:'059',move:'사념의박치기',learners:researchTmCompatibility['059']},
 {level:21,number:'030',move:'칼춤',learners:researchTmCompatibility['030']},
 {level:22,number:'084',move:'러스터캐논',learners:researchTmCompatibility['084']},
 {level:23,number:'012',move:'스톤샤워',learners:researchTmCompatibility['012']},
 {level:24,number:'067',move:'10만볼트',learners:researchTmCompatibility['067']},
 {level:26,number:'006',move:'명상',learners:researchTmCompatibility['006']},
 {level:27,number:'077',move:'독찌르기',learners:researchTmCompatibility['077']},
 {level:28,number:'068',move:'열풍',learners:researchTmCompatibility['068']},
 {level:29,number:'073',move:'파도타기',learners:researchTmCompatibility['073']},
 {level:30,number:'087',move:'아이언테일',learners:researchTmCompatibility['087']},
 {level:31,number:'097',move:'회복봉인',learners:researchTmCompatibility['097']},
 {level:32,number:'053',move:'오물폭탄',learners:researchTmCompatibility['053']},
 {level:33,number:'106',move:'번개',learners:researchTmCompatibility['106']},
 {level:34,number:'069',move:'지진',learners:researchTmCompatibility['069']},
 {level:35,number:'055',move:'기가임팩트',learners:researchTmCompatibility['055']},
 {level:37,number:'107',move:'인파이트',learners:researchTmCompatibility['107']},
 {level:38,number:'083',move:'나쁜음모',learners:researchTmCompatibility['083']},
 {level:39,number:'064',move:'솔라빔',learners:researchTmCompatibility['064']},
 {level:40,number:'096',move:'하이드로펌프',learners:researchTmCompatibility['096']},
 {level:41,number:'038',move:'불대문자',learners:researchTmCompatibility['038']},
 {level:42,number:'105',move:'눈보라',learners:researchTmCompatibility['105']},
 {level:44,number:'102',move:'기합구슬',learners:researchTmCompatibility['102']},
 {level:45,number:'050',move:'오버히트',learners:researchTmCompatibility['050']},
 {level:46,number:'093',move:'역린',learners:researchTmCompatibility['093']},
];
export function researchTm(level){return RESEARCH_TM_REWARDS.find(r=>r.level===level);}
export function hasResearchTm(s,level){return !!researchTm(level)&&Array.isArray(s.zaResearchRewards)&&s.zaResearchRewards.includes(level);}
export function canLearnResearchTm(s,m,level){const tm=researchTm(level);if(!tm||!hasResearchTm(s,level)||!m||m.moves?.includes(tm.move))return false;if(m.id===m.speciesId)return tm.learners.includes(m.speciesId);const form=researchTmFormCompatibility[m.id];return !!form&&form.speciesId===m.speciesId&&form.tms.includes(tm.number);}
// Keep legacy names for clients and tests from earlier development commits.
export function hasResearchRockSmash(s){return hasResearchTm(s,2);}
export function canLearnResearchRockSmash(s,m){return canLearnResearchTm(s,m,2);}
export function hasResearchMudShot(s){return hasResearchTm(s,3);}
export function canLearnResearchMudShot(s,m){return canLearnResearchTm(s,m,3);}

// Non-TM level rewards. The charm is a persistent key item tracked in the reward record.
export const RESEARCH_ITEM_REWARDS=Object.freeze([
 {level:10,item:'za-exp-candy-s',name:'경험사탕 S',quantity:10},
 {level:25,item:'za-exp-candy-m',name:'경험사탕 M',quantity:10},
 {level:36,item:'bottlecap',name:'은색병뚜껑',quantity:10},
 {level:43,item:'za-exp-candy-l',name:'경험사탕 L',quantity:10},
 {level:47,item:'za-exp-candy-xl',name:'경험사탕 XL',quantity:10},
 {level:48,item:'goldbottlecap',name:'금색병뚜껑',quantity:3},
 {level:49,item:'masterball',name:'마스터볼',quantity:1},
 {level:50,item:'shinycharm',name:'빛나는부적',quantity:1},
]);
export function researchItemReward(level){return RESEARCH_ITEM_REWARDS.find(r=>r.level===level);}
export function hasResearchItemReward(s,level){return !!researchItemReward(level)&&Array.isArray(s?.zaResearchItemRewards)&&s.zaResearchItemRewards.includes(level);}
