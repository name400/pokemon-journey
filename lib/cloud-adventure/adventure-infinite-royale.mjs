// Initial Infinite Royale reward match; ordinary battle-zone teams and points are provisional.
export const INFINITE_TRAINERS=[{id:'infinite-katrina',name:'베테랑 Katrina',team:[[80,56],[604,56]]},{id:'infinite-eden',name:'베테랑 Eden',team:[[115,56],[282,56]]},{id:'infinite-hank',name:'꼬마 Hank',team:[[123,49],[212,49]]}];
export const INFINITE_ZACH={id:'infinite-zach',name:'Zach',team:[[79,9],[16,10],[25,10]],moves:[['물대포','울음소리','몸통박치기','염동력'],['몸통박치기','울음소리','바람일으키기'],['전광석화','울음소리','전기자석파','전기쇼크']]};
export function infinitePoints(s){return Number.isInteger(s.zaInfinitePoints)&&s.zaInfinitePoints>=0?Math.min(50000,s.zaInfinitePoints):0;}
export function infiniteWins(s){return [...new Set((Array.isArray(s.zaInfiniteSessionWins)?s.zaInfiniteSessionWins:[]).filter(id=>INFINITE_TRAINERS.some(t=>t.id===id)))];}

// Second reward opponent; further reward matches are not yet configured.
export const INFINITE_GRISELLE={id:'infinite-griselle',name:'Griselle',team:[[663,69],[323,69],[142,70],[376,70],[668,71]]};

// Ordered initial reward matches 3–20; move sets and Mega Evolutions remain provisional.
export const INFINITE_FOLLOWUPS=[{id:'infinite-lida',name:'Lida',team:[[693,69],[584,69],[587,69],[134,69],[121,70]]},{id:'infinite-tarragon',name:'Tarragon',team:[[450,69],[618,69],[660,69],[553,69],[530,71]]},
{id:'infinite-xavi',name:'Xavi',team:[[545,68],[199,68],[407,68],[65,68],[676,69]]},
{id:'infinite-gwynn',name:'Gwynn',team:[[354,69],[711,69],[94,69],[478,69],[609,70]]},
{id:'infinite-lebanne',name:'Lebanne',team:[[715,69],[697,69],[334,69],[445,69],[691,70]]},
{id:'infinite-naveen',name:'Naveen',team:[[168,69],[302,69],[553,69],[681,69],[560,70]]},
{id:'infinite-yvon',name:'Yvon',team:[[683,68],[80,68],[685,68],[709,68],[666,69]]},
{id:'infinite-rintaro',name:'Rintaro',team:[[512,69],[197,69],[516,69],[196,69],[514,69]]},
{id:'infinite-canari',name:'Canari',team:[[695,69],[181,70],[618,70],[310,70],[702,70],[604,71]]},
{id:'infinite-mani',name:'Mani',team:[[695,68],[587,68],[26,68],[135,68],[26,69]]},
{id:'infinite-emma',name:'Emma',team:[[181,70],[303,70],[428,70],[460,70],[448,70],[687,71]]},
{id:'infinite-corbeau',name:'Corbeau',team:[[24,69],[689,70],[407,70],[130,70],[569,70],[545,71]]},
{id:'infinite-rival',name:'팀 MZ 동료',team:[]},
{id:'infinite-ivor',name:'Ivor',team:[[214,69],[308,70],[68,70],[701,70],[475,70],[870,71]]},
{id:'infinite-philippe',name:'Philippe',team:[[208,69],[212,69],[306,69],[707,69],[227,70]]},
{id:'infinite-jacinthe',name:'Jacinthe',team:[[703,69],[303,70],[699,70],[282,70],[700,70],[36,71]]},
{id:'infinite-grisham',name:'Grisham',team:[[675,70],[687,70],[668,70],[248,71],[373,71],[6,72]]},
{id:'infinite-vinnie',name:'Vinnie',team:[[229,69],[319,69],[362,69],[428,69],[780,71]]}];
export function infiniteRewardWins(s){const n=s.zaInfiniteRewardWins;return Number.isSafeInteger(n)&&n>=2&&n<=1000000?n:s.zaInfiniteSecondWon?2:s.zaInfiniteFirstWon?1:0;}
// Random reward matches unlock after 20 wins and Jacinthe's tournament.
// Existing saves retain the previous unlock; these additional opponents and
// post-Zygarde levels follow the public original-game table.
// https://www.serebii.net/legendsz-a/z-aroyale/rankinfinity.shtml
export const INFINITE_RANDOM_EXTRAS=[
 {id:'infinite-josee',name:'Josée',team:[[68,69],[560,69],[701,69],[675,69],[308,69]]},
 {id:'infinite-asami',name:'Asami',team:[[671,69],[671,69],[671,69],[671,69],[671,69]]},
 {id:'infinite-andi',name:'Andi',team:[[703,73],[673,73],[707,73],[531,73],[674,73]]}
];
export function infiniteRandomLocked(s){return s.zaInfiniteRandomGateV2===true&&infiniteRewardWins(s)>=20&&!s.zaSide119Complete;}
function infiniteRandomPool(s){const base=[INFINITE_ZACH,INFINITE_GRISELLE,...INFINITE_FOLLOWUPS,...INFINITE_RANDOM_EXTRAS.slice(0,2)];if(s.zaMission42Complete)return [...base,INFINITE_RANDOM_EXTRAS[2]];return s.zaInfiniteRandomGateV2?base.filter(t=>t.id!=='infinite-rival'):base;}
export function infiniteNextReward(s){const count=infiniteRewardWins(s);if(count<20)return INFINITE_FOLLOWUPS[count-2]||null;if(infiniteRandomLocked(s))return null;return [...infiniteRandomPool(s),INFINITE_RANDOM_EXTRAS[2],...INFINITE_FOLLOWUPS].find(t=>t.id===s.zaInfiniteRandomTrainer)||{id:'infinite-random-pending',name:'무작위 상대',team:[]};}
export function selectInfiniteRandom(s={},rng=Math.random){const pool=infiniteRandomPool(s);return pool[Math.floor(rng()*pool.length)];}

const AFTER_ZYGARDE_LEVELS={
 'infinite-zach':[10,11,11],'infinite-griselle':[73,73,74,74,75],
 'infinite-lida':[73,73,73,73,74],'infinite-tarragon':[73,73,73,73,75],
 'infinite-xavi':[72,72,72,72,73],'infinite-gwynn':[73,73,73,73,74],
 'infinite-lebanne':[73,73,73,73,74],'infinite-naveen':[73,73,73,73,74],
 'infinite-yvon':[72,72,72,72,73],'infinite-rintaro':[73,73,73,73,73],
 'infinite-canari':[73,74,74,74,74,75],'infinite-mani':[72,72,72,72,73],
 'infinite-emma':[74,74,74,74,74,75],'infinite-corbeau':[73,74,74,74,74,75],
 'infinite-ivor':[73,74,74,74,74,75],'infinite-philippe':[73,73,73,73,74],
 'infinite-jacinthe':[73,74,74,74,74,75],'infinite-grisham':[74,74,74,75,75,76],
 'infinite-vinnie':[73,73,73,73,75],'infinite-josee':[73,73,73,73,73],
 'infinite-asami':[73,73,73,73,73],'infinite-andi':[73,73,73,73,73]
};
export function infiniteRewardTeam(s,t){
 if(!t)return null;
 const after=s.zaMission42Complete===true&&infiniteRewardWins(s)>=20;
 if(t.id==='infinite-rival'){
  const choices={grass:[160,500],fire:[154,160],water:[500,154]},pair=choices[s.zaMission10Starter];if(!pair)return null;
  return {...t,team:after?[[678,74],[706,74],[713,75],[pair[0],75],[310,76],[pair[1],76]]:[[678,70],[706,70],[pair[0],71],[310,71],[pair[1],71],[10061,72]]};
 }
 const levels=after?AFTER_ZYGARDE_LEVELS[t.id]:null;
 return levels&&levels.length===t.team.length?{...t,team:t.team.map(([id],i)=>[id,levels[i]])}:t;
}

// Exact integer weights behind the rounded percentages in the public reward table.
// https://bulbapedia.bulbagarden.net/wiki/Infinite_Z-A_Royale#Rewards
export const INFINITE_PRIZES=[
 {id:'bignugget',quantity:1,weight:20},
 ...['hpup','protein','iron','carbos','calcium','zinc'].map(id=>({id,quantity:5,weight:10})),
 {id:'bottlecap',quantity:3,weight:10},
 ...['metalcoat','whippeddream','sachet','kingsrock','goldbottlecap'].map(id=>({id,quantity:1,weight:5})),
 ...['fastball','levelball','lureball','heavyball','loveball','friendball','moonball'].map(id=>({id,quantity:1,weight:4})),
 {id:'masterball',quantity:1,weight:2}
];
export function drawInfinitePrize(rng=Math.random){const value=rng();if(!Number.isFinite(value)||value<0||value>=1)throw Error('추첨값을 확인하세요.');let slot=Math.floor(value*145);for(const prize of INFINITE_PRIZES){if(slot<prize.weight)return prize;slot-=prize.weight;}throw Error('추첨 보상을 확인하세요.');}
