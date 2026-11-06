// Initial Infinite Royale reward match; ordinary battle-zone teams and points are provisional.
export const INFINITE_TRAINERS=[{id:'infinite-katrina',name:'베테랑 Katrina',team:[[80,56],[604,56]]},{id:'infinite-eden',name:'베테랑 Eden',team:[[115,56],[282,56]]},{id:'infinite-hank',name:'꼬마 Hank',team:[[123,49],[212,49]]}];
export const INFINITE_ZACH={id:'infinite-zach',name:'Zach',team:[[79,9],[16,10],[25,10]],moves:[['물대포','울음소리','몸통박치기','염동력'],['몸통박치기','울음소리','바람일으키기'],['전광석화','울음소리','전기자석파','전기쇼크']]};
export function infinitePoints(s){return Number.isInteger(s.zaInfinitePoints)&&s.zaInfinitePoints>=0?Math.min(50000,s.zaInfinitePoints):0;}
export function infiniteWins(s){return [...new Set((Array.isArray(s.zaInfiniteSessionWins)?s.zaInfiniteSessionWins:[]).filter(id=>INFINITE_TRAINERS.some(t=>t.id===id)))];}

// Second reward opponent; further reward matches are not yet configured.
export const INFINITE_GRISELLE={id:'infinite-griselle',name:'Griselle',team:[[663,69],[323,69],[142,70],[376,70],[668,71]]};

// Ordered initial reward matches 3–14; move sets and Mega Evolutions remain provisional.
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
{id:'infinite-corbeau',name:'Corbeau',team:[[24,69],[689,70],[407,70],[130,70],[569,70],[545,71]]}];
export function infiniteRewardWins(s){const n=s.zaInfiniteRewardWins;return Number.isSafeInteger(n)&&n>=2&&n<=14?n:s.zaInfiniteSecondWon?2:s.zaInfiniteFirstWon?1:0;}
export function infiniteNextReward(s){return INFINITE_FOLLOWUPS[infiniteRewardWins(s)-2]||null;}
