import {RANK_E_TRAINERS,rankEPoints,rankEWins} from './adventure-rank-d.mjs';
import {RANK_F_TRAINERS,rankFPoints,rankFWins} from './adventure-rank-e.mjs';
// First Z-A Royale mission, using the documented trainer teams.
// See https://www.serebii.net/legendsz-a/z-aroyale/rankz.shtml
export const ROYALE_Z_TRAINERS=[
 {id:'royale-z-erica',name:'사무원 Erica',team:[[69,6]],moves:[['덩굴채찍','성장']]},
 {id:'royale-z-daniel',name:'배낭여행자 Daniel',team:[[659,6],[661,6]],moves:[['몸통박치기','째려보기'],['울음소리','쪼기']]},
 {id:'royale-z-jean',name:'사무원 Jean',team:[[13,6]],moves:[['독침','실뿜기']]},
];
export const ROYALE_Z_PROMOTION={id:'royale-z-zach',name:'드라이버 Zach',team:[[79,8],[16,9],[25,9]],moves:[['물대포','울음소리','몸통박치기','염동력'],['몸통박치기','울음소리','바람일으키기'],['전광석화','울음소리','전기자석파','전기쇼크']]};
// Z-A Rank Y trainers and the documented 400 ticket points per victory.
export const ROYALE_Y_TRAINERS=[
 {id:'royale-y-hugo',name:'스쿨키드 Hugo',team:[[167,10],[543,10]],moves:[['독침','실뿜기','흡수','엉겨붙기'],['독침','째려보기','구르기','방어']]},
 {id:'royale-y-chloe',name:'스쿨키드 Chloé',team:[[16,10],[661,10]],moves:[['몸통박치기','울음소리','바람일으키기'],['울음소리','쪼기','전광석화']]},
 {id:'royale-y-charlotte',name:'사무원 Charlotte',team:[[667,13],[677,13]],moves:[['불꽃세례','울부짖기','분발','박치기'],['째려보기','차밍보이스','염동력','거짓울음']]},
];
export const ROYALE_Y_PROMOTION={id:'royale-y-yvon',name:'사무원 Yvon',team:[[682,15],[684,15],[666,16]],moves:[['요정의바람','거짓울음','차밍보이스'],['몸통박치기','애교부리기','요정의바람','거짓울음'],['빛의장막','엉겨붙기','바람일으키기','드레인키스']]};
// Z-A Rank X documented trainers and their 450-point wins.
export const ROYALE_X_TRAINERS=[
 {id:'royale-x-lenny',name:'사무원 Lenny',team:[[23,14],[92,14]],moves:[['째려보기','독침','물기','뱀눈초리'],['핥기','최면술','염동력','야습']]},
 {id:'royale-x-lilou',name:'사무원 Lilou',team:[[25,15],[35,15]],moves:[['전기쇼크','전광석화','전기자석파','볼부비부비'],['튀어오르기','요정의바람','차밍보이스','애교부리기']]},
 {id:'royale-x-logan',name:'배낭여행자 Logan',team:[[15,15],[69,15]],moves:[['독침','실뿜기','단단해지기','기충전'],['엉겨붙기','잎날가르기','수면가루','독가루']]},
];
// Z-A Rank W documented trainers; each win gives 500 ticket points.
export const ROYALE_W_PROMOTION={id:'royale-w-rintaro',name:'웨이터 Rintaro',team:[[512,24],[516,24],[514,24]],moves:[['방어','덩굴채찍','물기','매지컬리프'],['방어','물기','거품광선','물대포'],['방어','물기','불꽃세례','화염바퀴']]};
export const ROYALE_W_TRAINERS=[
 {id:'royale-w-mathis',name:'조거 Mathis',team:[[228,16],[672,16]],moves:[['불꽃세례','몸통박치기','울부짖기','물기'],['꼬리흔들기','씨뿌리기','잎날가르기','머드샷']]},
 {id:'royale-w-aya',name:'조거 Aya',team:[[662,18],[17,18]],moves:[['쪼기','전광석화','불꽃세례','깃털댄스'],['울음소리','바람일으키기','전광석화','회오리']]},
 {id:'royale-w-sean',name:'작업원 Sean',team:[[688,16],[92,16]],moves:[['엉겨붙기','돌떨구기','거품광선','록블라스트'],['핥기','최면술','염동력','야습']]},
];
export function royaleWPoints(s){const n=s.zaRoyaleWPoints;return Number.isInteger(n)&&n>=0?Math.min(5000,n):0;}
export function royaleWWins(s){return [...new Set((Array.isArray(s.zaRoyaleWSessionWins)?s.zaRoyaleWSessionWins:[]).filter(id=>ROYALE_W_TRAINERS.some(t=>t.id===id)))];}
export function royaleWReady(s){return s.zaRoyaleRank==='W'&&royaleWPoints(s)>=5000;}
// Representative Rank V teams; per-win ticket value is provisional.
export const ROYALE_V_TRAINERS=[
 {id:'royale-v-jaques',name:'스쿨키드 Jaques',team:[[666,21],[15,21]]},
 {id:'royale-v-anna',name:'웨이트리스 Anna',team:[[79,21],[515,21]]},
 {id:'royale-v-warren',name:'관광객 Warren',team:[[24,22],[17,22]]},
];
export function royaleVPoints(s){const n=s.zaRoyaleVPoints;return Number.isInteger(n)&&n>=0?Math.min(6000,n):0;}
export function royaleVWins(s){return [...new Set((Array.isArray(s.zaRoyaleVSessionWins)?s.zaRoyaleVSessionWins:[]).filter(id=>ROYALE_V_TRAINERS.some(t=>t.id===id)))];}
export function royaleVReady(s){return s.zaRoyaleRank==='V'&&s.zaMission10Stage===4&&royaleVPoints(s)>=6000;}
// Main Mission 07 hotel battle; the current hotel is a provisional location.
export const ROYALE_JOSEE={id:'royale-story-josee',name:'정의단 Josée',team:[[66,10],[307,11]],moves:[['째려보기','바위깨기','기충전'],['염동력','분발']]};
export function joseeRequired(s){return s.zaRoyaleRank==='Y'&&s.zaJoseeRequired===true&&s.zaJoseeComplete!==true;}
export function joseeAction(s){return s.zaRoyaleRank==='Y'&&s.zaJoseeComplete!==true?{action:'battleJosee',label:'Josée와 배틀'}:null;}

export const ROYALE_NAVEEN={id:'royale-story-naveen',name:'팀 MZ Naveen',team:[[167,16],[302,16],[559,17]],moves:[['흡수','엉겨붙기','야습','시저크로스'],['몸통박치기','째려보기','야습','돌진'],['몸통박치기','박치기','그로우펀치','암석봉인']]};
export function naveenRequired(s){return s.zaRoyaleRank==='X'&&s.zaNaveenRequired===true&&s.zaNaveenComplete!==true;}
export function naveenAction(s){return ['X','W'].includes(s.zaRoyaleRank)&&s.zaNaveenComplete!==true?{action:'battleNaveen',label:'Naveen과 배틀'}:null;}
// Main Mission 08; locations are provisional in the current city layout.
export const ROYALE_LIDA={id:'royale-story-lida',name:'팀 MZ Lida',team:[[692,22],[582,22],[120,23]],moves:[['머드샷','아쿠아제트','거품광선','물대포'],['몸통박치기','도발','얼어붙은바람','단단해지기'],['이상한빛','물대포','단단해지기','거품광선']]};
export function lidaStage(s){return Number.isInteger(s.zaLidaStage)&&s.zaLidaStage>=0&&s.zaLidaStage<=2?s.zaLidaStage:0;}
export function lidaRequired(s){return s.zaRoyaleRank==='W'&&s.zaLidaRequired===true&&lidaStage(s)<2;}
export function lidaBagAction(s){return s.zaRoyaleRank==='W'&&lidaStage(s)===0?{action:'takeLidaBag',label:'Lida의 물건 맡기'}:null;}
export function lidaBattleAction(s){return s.zaRoyaleRank==='W'&&lidaStage(s)===1?{action:'battleLida',label:'물건을 전하고 Lida와 배틀'}:null;}
export const ROYALE_X_PROMOTION={id:'royale-x-xavi',name:'스쿨키드 Xavi',team:[[543,20],[315,20],[64,21],[676,21]],moves:[['압정뿌리기','구르기','싫은소리','바늘미사일'],['압정뿌리기','수면가루','잎날가르기','매지컬리프'],['환상빔','리플렉터','섀도볼','염동력'],['불꽃엄니','번개엄니','돌진','물기']]};
export function royaleXPoints(s){const n=s.zaRoyaleXPoints;return Number.isInteger(n)&&n>=0?Math.min(4000,n):0;}
export function royaleXWins(s){return [...new Set((Array.isArray(s.zaRoyaleXSessionWins)?s.zaRoyaleXSessionWins:[]).filter(id=>ROYALE_X_TRAINERS.some(t=>t.id===id)))];}
export function royaleXReady(s){return s.zaRoyaleRank==='X'&&royaleXPoints(s)>=4000;}
export function royaleZPoints(s){return Math.min(1000,royaleZWins(s).length*350);}
export function royaleYPoints(s){const n=s.zaRoyaleYPoints;return Number.isInteger(n)&&n>=0?Math.min(3000,n):0;}
export function royaleYWins(s){return [...new Set((Array.isArray(s.zaRoyaleYSessionWins)?s.zaRoyaleYSessionWins:[]).filter(id=>ROYALE_Y_TRAINERS.some(t=>t.id===id)))];}
export function royaleYReady(s){return s.zaRoyaleRank==='Y'&&royaleYPoints(s)>=3000;}
export function royaleZWins(s){return [...new Set((Array.isArray(s.zaRoyaleZWins)?s.zaRoyaleZWins:[]).filter(id=>ROYALE_Z_TRAINERS.some(t=>t.id===id)))];}
export function royaleZReady(s){return s.zaRoyaleRank==='Z'&&royaleZWins(s).length===ROYALE_Z_TRAINERS.length;}
export function royaleDialogue(s){
 if(s.zaRoyaleRank==='E'&&s.zaMission19Stage===1)return rankEPoints(s)>=35000?{name:'로열 임시 접수처',text:'도전권을 얻었습니다. 정의단 도장으로 가세요.'}:{name:'로열 임시 접수처',text:`랭크 E · 티켓포인트 ${rankEPoints(s)}/35000. 밤에 배틀 존에서 모으세요.`,action:'enterRoyaleZone',label:'배틀 존으로 들어가기'};
 if(s.zaRoyaleRank==='F'&&s.zaMission14Stage===1)return rankFPoints(s)>=32000?{name:'로열 임시 접수처',text:'도전권을 얻었습니다. 호텔 안내 직원에게 Naveen을 찾아가세요.'}:{name:'로열 임시 접수처',text:`랭크 F · 티켓포인트 ${rankFPoints(s)}/32000. 밤에 배틀 존에서 모으세요.`,action:'enterRoyaleZone',label:'배틀 존으로 들어가기'};
 if(s.zaRoyaleRank==='V'&&s.zaMission10Stage===4)return royaleVReady(s)?{name:'로열 임시 접수처',text:'도전권을 얻었습니다. 콰자르티코 앞에서 Vinnie를 만나세요.'}:{name:'로열 임시 접수처',text:`랭크 V · 티켓포인트 ${royaleVPoints(s)}/6000. 밤에 배틀 존에서 포인트를 모으세요.`,action:'enterRoyaleZone',label:'배틀 존으로 들어가기'};
 if(!s.zaRoyaleRank)return {name:'도시 광장',text:'Z-A 로열은 밤의 배틀 존에서 참가자와 겨루는 대회입니다. 현재 광장은 첫 진행을 위한 임시 접수 장소입니다.',action:'royaleJoin',label:'로열 참가하기'};
 if(joseeRequired(s))return {name:'로열 임시 접수처',text:'먼저 야생 구역 3에서 Josée와 배틀하세요. 임무 05의 나머지 장면은 준비 중입니다.'};
 if(s.zaRoyaleRank==='Y')return royaleYReady(s)?{name:'로열 임시 접수처',text:'티켓포인트 3,000점을 모았습니다. 밤에 Yvon과 승급전을 치르세요.',action:'royaleYvon',label:'Yvon에게 승급전 도전'}:{name:'로열 임시 접수처',text:`랭크 Y · 티켓포인트 ${royaleYPoints(s)}/3000. 밤에 배틀 존에서 포인트를 모으세요.`,action:'enterRoyaleZone',label:'배틀 존으로 들어가기'};
 if(naveenRequired(s))return {name:'로열 임시 접수처',text:'다음 로열 경기에 앞서 호텔 앞에서 Naveen을 만나세요.'};
 if(s.zaRoyaleRank==='X')return royaleXReady(s)?{name:'로열 임시 접수처',text:'티켓포인트 4,000점을 모았습니다. 밤에 Xavi와 승급전을 치르세요.',action:'royaleXavi',label:'Xavi에게 승급전 도전'}:{name:'로열 임시 접수처',text:`랭크 X · 티켓포인트 ${royaleXPoints(s)}/4000. 밤에 배틀 존에서 포인트를 모으세요.`,action:'enterRoyaleZone',label:'배틀 존으로 들어가기'};
 if(lidaRequired(s))return {name:'로열 임시 접수처',text:lidaStage(s)===0?'호텔 안내 직원에게 Lida의 물건을 맡아 주세요.':'정원 지구에서 Lida에게 물건을 전하고 배틀하세요.'};
 if(s.zaRoyaleRank==='W')return royaleWReady(s)?{name:'로열 임시 접수처',text:'티켓포인트 5,000점을 모았습니다. 밤에 Rintaro와 승급전을 치르세요. 승리 보상 금액은 확인 중입니다.',action:'royaleRintaro',label:'Rintaro에게 승급전 도전'}:{name:'로열 임시 접수처',text:`랭크 W · 티켓포인트 ${royaleWPoints(s)}/5000. 밤에 배틀 존에서 포인트를 모으세요.`,action:'enterRoyaleZone',label:'배틀 존으로 들어가기'};
 if(s.zaRoyaleRank!=='Z')return {name:'도시 광장',text:`현재 로열 랭크 ${s.zaRoyaleRank}. 해당 랭크의 경기는 아직 준비 중입니다.`};
 const wins=royaleZWins(s);
 if(royaleZReady(s))return {name:'로열 임시 접수처',text:'세 상대를 이겨 첫 도전권을 얻었습니다. 밤에 승급전에서 승리하면 랭크 Y가 됩니다.',action:'royaleZach',label:'Zach에게 승급전 도전'};
 return {name:'로열 임시 접수처',text:`배틀 존 첫 세 상대 ${wins.length}/3. 밤에 배틀 존으로 들어가 트레이너를 만나세요.`,action:'enterRoyaleZone',label:'배틀 존으로 들어가기'};
}

export function royaleZoneDialogue(s,tile){
 const index={O:0,U:1,V:2}[tile],trainer=ROYALE_Z_TRAINERS[index];if(!trainer)return null;
 if(s.zaRoyaleRank==='E'&&s.zaMission19Stage===1){const t=RANK_E_TRAINERS[index];if(rankEPoints(s)>=35000)return {name:t.name,text:'도전권을 얻었습니다.'};if(rankEWins(s).includes(t.id))return {name:t.name,text:'이번 방문의 배틀을 마쳤습니다.'};return {name:t.name,text:'밤의 배틀 존에서 티켓포인트를 모으세요.',action:['royaleErica','royaleDaniel','royaleJean'][index],label:'로열 배틀 시작'};}
 if(s.zaRoyaleRank==='F'&&s.zaMission14Stage===1){const t=RANK_F_TRAINERS[index];if(rankFPoints(s)>=32000)return {name:t.name,text:'도전권을 얻었습니다.'};if(rankFWins(s).includes(t.id))return {name:t.name,text:'이번 방문의 배틀을 마쳤습니다.'};return {name:t.name,text:'밤의 배틀 존에서 티켓포인트를 모으세요.',action:['royaleErica','royaleDaniel','royaleJean'][index],label:'로열 배틀 시작'};}
 if(s.zaRoyaleRank==='V'&&s.zaMission10Stage===4){const v=ROYALE_V_TRAINERS[index];if(royaleVReady(s))return {name:v.name,text:'도전권을 얻었습니다. 콰자르티코에서 Vinnie에게 도전하세요.'};if(royaleVWins(s).includes(v.id))return {name:v.name,text:'이번 방문의 배틀을 마쳤습니다. 광장에 돌아간 뒤 다시 입장할 수 있습니다.'};return {name:v.name,text:'밤의 배틀 존에서 티켓포인트를 모으세요.',action:['royaleErica','royaleDaniel','royaleJean'][index],label:'로열 배틀 시작'};}
 if(s.zaRoyaleRank==='W'){const wTrainer=ROYALE_W_TRAINERS[index];if(royaleWReady(s))return {name:wTrainer.name,text:'도전권을 얻었습니다. 광장에서 Rintaro에게 도전하세요.'};if(royaleWWins(s).includes(wTrainer.id))return {name:wTrainer.name,text:'이번 방문에서는 배틀을 마쳤습니다. 광장에 돌아간 뒤 다시 입장할 수 있습니다.'};return {name:wTrainer.name,text:'밤의 배틀 존에서 승리하면 티켓포인트를 얻습니다.',action:['royaleErica','royaleDaniel','royaleJean'][index],label:'로열 배틀 시작'};}
 if(s.zaRoyaleRank==='X'){const xTrainer=ROYALE_X_TRAINERS[index];if(royaleXReady(s))return {name:xTrainer.name,text:'도전권을 얻었습니다. 광장의 승급전에 도전하세요.'};if(royaleXWins(s).includes(xTrainer.id))return {name:xTrainer.name,text:'이번 방문에서는 배틀을 마쳤습니다. 광장에 돌아간 뒤 다시 입장할 수 있습니다.'};return {name:xTrainer.name,text:'밤의 배틀 존에서 승리하면 티켓포인트를 얻습니다.',action:['royaleErica','royaleDaniel','royaleJean'][index],label:'로열 배틀 시작'};}
 if(s.zaRoyaleRank==='Y'){const yTrainer=ROYALE_Y_TRAINERS[index];if(royaleYReady(s))return {name:yTrainer.name,text:'도전권을 얻었습니다. 광장의 승급전에 도전하세요.'};if(royaleYWins(s).includes(yTrainer.id))return {name:yTrainer.name,text:'이번 방문에서는 배틀을 마쳤습니다. 광장에 돌아간 뒤 다시 입장할 수 있습니다.'};return {name:yTrainer.name,text:'밤의 배틀 존에서 승리하면 티켓포인트를 얻습니다.',action:['royaleErica','royaleDaniel','royaleJean'][index],label:'로열 배틀 시작'};}
 if(s.zaRoyaleRank!=='Z')return {name:trainer.name,text:'이 배틀 존의 로열 도전은 끝났습니다.'};
 if(royaleZWins(s).includes(trainer.id))return {name:trainer.name,text:'이미 배틀을 마쳤습니다. 다른 참가자를 찾아보세요.'};
 return {name:trainer.name,text:'밤의 배틀 존에서 실력을 겨뤄 보겠어요?',action:['royaleErica','royaleDaniel','royaleJean'][index],label:'로열 배틀 시작'};
}
