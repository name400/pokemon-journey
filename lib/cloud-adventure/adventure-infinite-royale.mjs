import {makeMon} from '../game.mjs';
import {trainerTeam} from '../campaign.mjs';
import {mission10OriginalStarter,mission36RivalTeam} from './adventure-mission10.mjs';

// Initial Infinite Royale reward match; ordinary battle-zone teams and points are provisional.
export const INFINITE_TRAINERS=[{id:'infinite-katrina',name:'베테랑 Katrina',team:[[80,56],[604,56]]},{id:'infinite-eden',name:'베테랑 Eden',team:[[115,56],[282,56]]},{id:'infinite-hank',name:'꼬마 Hank',team:[[123,49],[212,49]]},
 // Original standard-trainer teams for streak 0–5. The positions and points
 // in the shared 2D battle zone remain provisional.
 // https://www.serebii.net/legendsz-a/z-aroyale/rankinfinity.shtml
 {id:'infinite-standard-axel',name:'조깅맨 Axel',team:[[121,56],[130,56]],moves:[['liquidation','surf','recover','hydropump'],['hurricane','dragonrush','hydropump','hyperbeam']]},
 {id:'infinite-standard-sara',name:'관광객 Sara',team:[[227,58],[225,58]],moves:[['metalsound','spikes','irondefense','bravebird'],['featherdance','icepunch','freezedry','blizzard']]},
 {id:'infinite-standard-colette',name:'배틀걸 Colette',team:[[870,57],[675,57]],moves:[['noretreat','irondefense','closecombat','megahorn'],['crunch','bodyslam','outrage','focusenergy']]},
 {id:'infinite-standard-rania',name:'회사원 Rania',team:[[407,56],[531,56]],moves:[['poisonjab','synthesis','toxic','leafstorm'],['takedown','wish','hypervoice','doubleedge']]},
 {id:'infinite-standard-amaury',name:'배낭여행자 Amaury',team:[[450,58],[553,58]],moves:[['roar','heavyslam','earthquake','doubleedge'],['irontail','earthquake','doubleedge','outrage']]},
 {id:'infinite-standard-asuka',name:'배낭여행자 Asuka',team:[[530,58],[323,58]],moves:[['swordsdance','drillrun','earthquake','megahorn'],['earthquake','flamethrower','doubleedge','heatcrash']]},
 {id:'infinite-standard-wyatt',name:'작업자 Wyatt',team:[[208,56],[306,56]],moves:[['heavyslam','dig','stoneedge','doubleedge'],['irontail','irondefense','heavyslam','doubleedge']]}
];
export const INFINITE_EXTRA_POSITIONS=Object.freeze([['a',3,5],['b',19,11],['e',12,5],['t',3,11],['j',9,11],['k',15,11],['n',19,5]]);
export const INFINITE_ZACH={id:'infinite-zach',name:'Zach',team:[[79,9],[16,10],[25,10]],moves:[['물대포','울음소리','몸통박치기','염동력'],['몸통박치기','울음소리','바람일으키기'],['전광석화','울음소리','전기자석파','전기쇼크']]};
export function infinitePoints(s){return Number.isInteger(s.zaInfinitePoints)&&s.zaInfinitePoints>=0?Math.min(50000,s.zaInfinitePoints):0;}
export function infiniteWins(s){return [...new Set((Array.isArray(s.zaInfiniteSessionWins)?s.zaInfiniteSessionWins:[]).filter(id=>INFINITE_TRAINERS.some(t=>t.id===id)))];}

// Second reward opponent.
export const INFINITE_GRISELLE={id:'infinite-griselle',name:'Griselle',team:[[663,69],[323,69],[142,70],[376,70],[668,71]]};

// Ordered initial reward matches 3–20; unlisted move sets remain provisional.
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
  const choices={grass:[160,500],fire:[154,160],water:[500,154]},choice=mission10OriginalStarter(s)||s.zaMission10Starter,pair=Object.hasOwn(choices,choice||'')?choices[choice]:null;if(!pair)return null;
  return {...t,team:after?[[678,74],[706,74],[713,75],[pair[0],75],[310,76],[pair[1],76]]:infiniteRewardWins(s)>=20?[[678,62],[706,62],[713,62],[pair[0],63],[310,63],[pair[1],64]]:[[678,70],[706,70],[pair[0],71],[310,71],[pair[1],71],[10061,72]]};
 }
 const levels=after?AFTER_ZYGARDE_LEVELS[t.id]:null;
 return levels&&levels.length===t.team.length?{...t,team:t.team.map(([id],i)=>[id,levels[i]])}:t;
}

// Initial reward matches and random rematches use the same moves; only their
// levels change after Zygarde. Existing combat snapshots are never rewritten.
// https://www.serebii.net/legendsz-a/z-aroyale/rankinfinity.shtml
const INFINITE_VERIFIED_SETS={
 'infinite-yvon':{ids:[683,80,685,709,666],item:'',moves:[['hypnosis','moonblast','psychic','healblock'],['psychic','flamethrower','hydropump','shadowball'],['stickyweb','faketears','dazzlinggleam','energyball'],['woodhammer','phantomforce','xscissor','forestscurse'],['hurricane','bugbuzz','dazzlinggleam','protect']]},
 'infinite-rintaro':{ids:[512,197,516,196,514],item:'',moves:[['protect','gigadrain','crunch','rocktomb'],['protect','snarl','moonlight','toxic'],['protect','liquidation','icebeam','gunkshot'],['protect','powergem','charm','psychic'],['protect','fireblast','solarbeam','flamewheel']]},
 'infinite-mani':{ids:[695,587,26,135,26],item:'',moves:[['solarbeam','thunder','bulldoze','electroweb'],['discharge','airslash','charge','thunder'],['psychic','thunderbolt','playrough','reflect'],['charm','shadowball','thunderbolt','protect'],['irontail','playrough','dig','voltswitch']]},
 'infinite-josee':{ids:[68,560,701,675,308],item:'',moves:[['poisonjab','earthquake','icepunch','closecombat'],['ironhead','crunch','closecombat','headsmash'],['poisonjab','bravebird','flyingpress','stoneedge'],['closecombat','nightslash','gunkshot','ironhead'],['psychic','firepunch','icepunch','thunderpunch']]},
 'infinite-asami':{ids:[671,671,671,671,671],item:'',moves:[['magicalleaf','drainingkiss','energyball','fairywind'],['lightscreen','synthesis','drainingkiss','gigadrain'],['swift','charm','solarbeam','dazzlinggleam'],['safeguard','calmmind','drainingkiss','psychic'],['psychic','moonblast','wish','protect']]},
 'infinite-andi':{ids:[703,673,707,531,674],item:'eviolite',moves:[['stealthrock','moonblast','lightscreen','stoneedge'],['earthquake','leafblade','megahorn','bulkup'],['dazzlinggleam','flashcannon','drainingkiss','metalsound'],['hypervoice','wish','takedown','zenheadbutt'],['brickbreak','bodyslam','detect','crunch']]},
 'infinite-gwynn':{ids:[354,711,94,478,609],item:'chandelurite',moves:[['고스트다이브','섀도클로','탁쳐서떨구기','회복봉인'],['trickortreat','섀도클로','파워휩','세차게휘두르기'],['섀도볼','매지컬샤인','오물폭탄','최면술'],['섀도볼','냉동빔','물의파동','회복봉인'],['화염방사','명상','사이코키네시스','섀도볼']]},
 'infinite-corbeau':{ids:[24,689,407,130,569,545],item:'scolipite',moves:[['독찌르기','불꽃엄니','맹독','흡혈'],['스톤에지','아쿠아브레이크','독찌르기','스텔스록'],['기가드레인','광합성','오물폭탄','섀도볼'],['깨물어부수기','폭포오르기','얼음엄니','bounce'],['더스트슈트','록블라스트','씨기관총','세차게휘두르기'],['더스트슈트','방어','시저크로스','지진']]},
 'infinite-vinnie':{ids:[229,319,362,428,780],item:'drampanite',moves:[['화염방사','회오리불꽃','바크아웃','오물폭탄'],['바다회오리','아쿠아제트','깜짝베기','베어가르기'],['프리즈드라이','지진','냉동빔','아이언헤드'],['방어','폭발펀치','드레인키스','bounce'],['용성군','얼어붙은바람','화염방사','명상']]},
 'infinite-xavi':{ids:[545,199,407,65,676],item:'',moves:[['메가혼','더스트슈트','지진','압정뿌리기'],['미래예지','하이드로펌프','눈보라','손가락흔들기'],['압정뿌리기','독압정','에너지볼','매지컬샤인'],['사이코키네시스','리플렉터','섀도볼','기합구슬'],['불꽃엄니','번개엄니','얼음엄니','깨물어부수기']]},
 'infinite-canari':{ids:[695,181,618,310,702,604],item:'eelektrossite',moves:[['솔라빔','파도타기','파라볼라차지','방전'],['매지컬샤인','번개','파워젬','냉동펀치'],['방전','오물웨이브','스텔스록','대지의힘'],['바크아웃','화염방사','10만볼트','방어'],['분노의앞니','번개','매지컬샤인','애교부리기'],['아쿠아브레이크','화염방사','전자포','기가드레인']]},
 'infinite-ivor':{ids:[214,308,68,701,475,870],item:'falinksite',moves:[['스톤에지','메가혼','벌크업','인파이트'],['사념의박치기','폭발펀치','방어','냉동펀치'],['지진','인파이트','독찌르기','벌크업'],['칼춤','플라잉프레스','아이언헤드','번개펀치'],['사이코커터','리프블레이드','스톤에지','불꽃펀치'],['아이언헤드','인파이트','스톤샤워','배수의진']]},
 'infinite-jacinthe':{ids:[703,303,699,282,700,36],item:'clefablite',moves:[['스텔스록','스톤에지','문포스','러스터캐논'],['치근거리기','아이언헤드','깨물어부수기','불꽃엄니'],['눈보라','프리즈드라이','록블라스트','방어'],['문포스','매지컬플레임','사이코키네시스','명상'],['문포스','섀도볼','매지컬샤인','거짓울음'],['에어슬래시','문포스','매지컬플레임','방어']]},
 'infinite-tarragon':{ids:[450,618,660,553,530],item:'excadrite',moves:[['헤비봄버','망각술','지진','스텔스록'],['대지의힘','오물폭탄','10만볼트','스텔스록'],['칼춤','냉동펀치','불꽃펀치','지진'],['아이언헤드','더스트슈트','깨물어부수기','벌크업'],['칼춤','아이언헤드','드릴라이너','메가혼']]},
 'infinite-lebanne':{ids:[715,697,334,445,691],item:'dragalgite',moves:[['폭풍','분노의앞니','용의파동','화염방사'],['지진','와이드브레이커','스톤에지','아이언헤드'],['코튼가드','회오리불꽃','폭풍','용의숨결'],['지진','칼춤','드래곤클로','아이언헤드'],['오물폭탄','용의파동','하이드로펌프','방어']]},
 'infinite-philippe':{ids:[208,212,306,707,227],item:'skarmorite',moves:[['스톤에지','헤비봄버','스텔스록','와이드브레이커'],['방어','아이언헤드','시저크로스','에어슬래시'],['아이언테일','스톤샤워','지진','냉동펀치'],['회복봉인','매지컬샤인','러스터캐논','빛의장막'],['드릴라이너','깜짝베기','강철날개','방어']]},
 'infinite-grisham':{ids:[675,687,668,248,373,6],item:'charizarditex',moves:[['인파이트','깨물어부수기','그로우펀치','방어'],['벌크업','사이코쇼크','깜짝베기','아쿠아브레이크'],['오버히트','대지의힘','바크아웃','하이퍼보이스'],['스톤에지','냉동펀치','깨물어부수기','지진'],['제비반환','지진','불꽃엄니','용성군'],['플레어드라이브','에어슬래시','드래곤다이브','방어']]},
 'infinite-griselle':{ids:[663,323,142,376,668],item:'pyroarite',moves:[['플레어드라이브','강철날개','브레이브버드','유턴'],['지진','분연','스톤샤워','방어'],['스톤에지','아이언헤드','깨물어부수기','번개엄니'],['불릿펀치','사이코커터','지진','냉동펀치'],['화염방사','대지의힘','하이퍼보이스','바크아웃']]},
 'infinite-lida':{ids:[693,584,587,134,121],item:'starminite',moves:[['악의파동','파동탄','물의파동','머드샷'],['냉동빔','얼어붙은바람','러스터캐논','고드름떨구기'],['볼트체인지','에어슬래시','유턴','아이언테일'],['아쿠아링','눈보라','파도타기','섀도볼'],['사념의박치기','아쿠아브레이크','벌크업','눈보라']]},
 'infinite-naveen':{ids:[168,302,553,681,560],item:'scraftinite',moves:[['메가혼','독찌르기','끈적끈적네트','흡혈'],['섀도클로','사념의박치기','이상한빛','파워젬'],['깨물어부수기','아이언테일','지진','모래지옥'],['킹실드','섀도볼','러스터캐논','인파이트'],['아이언테일','냉동펀치','그로우펀치','깨물어부수기']]},
 'infinite-emma':{ids:[181,303,428,460,448,687],item:'malamarite',moves:[['번개','파워젬','용의파동','빛의장막'],['치근거리기','폭발펀치','깨물어부수기','아이언헤드'],['불꽃펀치','냉동펀치','번개펀치','그로우펀치'],['냉동펀치','씨뿌리기','리프스톰','지진'],['불릿펀치','신속','그로우펀치','스톤에지'],['독찌르기','깜짝베기','사이코커터','베어가르기']]}
};
export function infiniteTrainerBattleTeam(trainer){
 const team=trainerTeam({...trainer,strategy:'balanced'}),set=INFINITE_VERIFIED_SETS[trainer.id];
 if(!set)return team;
 if(team.length!==set.ids.length||team.some((mon,index)=>mon.id!==set.ids[index]))throw Error('무한 로열 상대 편성을 확인하세요.');
 return team.map((mon,index)=>({...mon,moves:[...set.moves[index]],pp:{},item:index===team.length-1?set.item:''}));
}
export function infiniteTrainerVerified(id){return Object.hasOwn(INFINITE_VERIFIED_SETS,id);}

// The fixed fifteenth match uses Mega Eternal Flower Floette; later random
// rematches use the rival's final Prism Tower roster at higher levels.
// https://bulbapedia.bulbagarden.net/wiki/Urbain
export function infiniteRivalBattleTeam(s){
 const choice=mission10OriginalStarter(s)||s.zaMission10Starter;if(!['grass','fire','water'].includes(choice))return null;
 const finalTeam=mission36RivalTeam(choice),random=infiniteRewardWins(s)>=20,after=s.zaMission42Complete===true&&random;
 const selected=random?finalTeam:[finalTeam[0],finalTeam[1],finalTeam[3],finalTeam[4],finalTeam[5]];
 const levels=after?[74,74,75,75,76,76]:random?[62,62,62,63,63,64]:[70,70,71,71,71];
 const team=selected.map((mon,index)=>({...makeMon(mon.id,levels[index]),boxId:`npc-infinite-rival-${index}`,gender:mon.gender,moves:[...mon.moves],item:random?mon.item:'',pp:{}}));
 if(!random)team.push({...makeMon(10061,72),boxId:'npc-infinite-rival-5',gender:'F',moves:['파멸의빛','에너지볼','기가드레인','광합성'],item:'floettite',pp:{}});
 return team;
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
