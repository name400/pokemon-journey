// The original has three timed scaffolding courses. Their compact 2D paths and
// entrance coordinates are provisional.
// https://www.serebii.net/legendsz-a/sidemissions/achallengefromfroakie.shtml
// https://www.thonky.com/pokemon-legends-z-a/side-mission-009-a-challenge-from-froakie
export const SIDE09_LIMITS=[0,30,40,50];
export function side09Available(s={}){return s.zaSide09Stage!==undefined||s.zaMission06Started===true||s.zaMission07Started===true||s.zaEmmaMegaSeen===true||Number(s.zaMission10Stage)>=1||['X','W','V','F','E','D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side09Stage(s={}){return s.zaSide09Stage===undefined?1:s.zaSide09Stage;}
export function side09Origin(stage){return stage===1?{district:'lumiose-jaune-sector8',x:16,y:6,facing:'up'}:stage===2?{district:'lumiose-jaune-sector8',x:20,y:6,facing:'up'}:stage===3||stage===4||stage===5?{district:'lumiose-north-boulevard',x:4,y:1,facing:'up'}:null;}
export function side09StartSpot(s,p){if(s.interior||!p)return false;const stage=side09Stage(s);return stage===1&&s.district==='lumiose-jaune-sector8'&&p.tile==='#'&&p.x===16&&p.y===5||stage===2&&s.district==='lumiose-jaune-sector8'&&p.tile==='#'&&p.x===20&&p.y===5||[3,4,5].includes(stage)&&s.district==='lumiose-north-boulevard'&&p.tile==='^'&&p.x===4&&p.y===0;}
export function side09Goal(stage){return stage===1?{x:18,y:8}:stage===2?{x:4,y:6}:stage===3?{x:18,y:4}:null;}
export function side09CourseMap(s={}){const stage=side09Stage(s),g=Array.from({length:17},()=>Array(23).fill('#'));const line=(y,a,b)=>{for(let x=a;x<=b;x++)g[y][x]=',';};line(12,2,18);g[11][18]=',';line(10,4,18);g[9][4]=',';line(8,4,18);if(stage>=2){g[7][18]=',';line(6,4,18);}if(stage>=3){g[5][4]=',';line(4,4,18);for(const x of [11,12,13])g[8][x]='#';}g[12][2]='q';const goal=side09Goal(stage);if(goal)g[goal.y][goal.x]='k';return g.map(row=>row.join(''));}
export function side09CourseSpot(s,p){if(s.district!=='lumiose-side09-course'||s.interior||!p)return null;if(p.tile==='q'&&p.x===2&&p.y===12)return 'exit';const g=side09Goal(side09Stage(s));return g&&p.tile==='k'&&p.x===g.x&&p.y===g.y?'goal':null;}
export function side09ValidPending(p){return !!p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).length===2&&Object.keys(p).every(k=>['xs','small'].includes(k))&&Number.isSafeInteger(p.xs)&&p.xs>=0&&p.xs<=3&&Number.isSafeInteger(p.small)&&p.small>=0&&p.small<=1;}
// Projection only: the finish action remains authoritative and uses server time.
export function side09RemainingMs(s,now=Date.now()){const stage=side09Stage(s),a=s?.zaSide09AttemptV1;if(s?.district!=='lumiose-side09-course'||![1,2,3].includes(stage)||!a||typeof a!=='object'||Array.isArray(a)||Object.keys(a).length!==2||a.stage!==stage||!Number.isSafeInteger(a.startedAt)||a.startedAt<0||!Number.isSafeInteger(now)||now<a.startedAt)return null;return Math.max(0,SIDE09_LIMITS[stage]*1000-(now-a.startedAt));}
