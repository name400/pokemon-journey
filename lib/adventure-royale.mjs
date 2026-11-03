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
export function royaleZPoints(s){return Math.min(1000,royaleZWins(s).length*350);}
export function royaleYPoints(s){const n=s.zaRoyaleYPoints;return Number.isInteger(n)&&n>=0?Math.min(3000,n):0;}
export function royaleYWins(s){return [...new Set((Array.isArray(s.zaRoyaleYSessionWins)?s.zaRoyaleYSessionWins:[]).filter(id=>ROYALE_Y_TRAINERS.some(t=>t.id===id)))];}
export function royaleYReady(s){return s.zaRoyaleRank==='Y'&&royaleYPoints(s)>=3000;}
export function royaleZWins(s){return [...new Set((Array.isArray(s.zaRoyaleZWins)?s.zaRoyaleZWins:[]).filter(id=>ROYALE_Z_TRAINERS.some(t=>t.id===id)))];}
export function royaleZReady(s){return s.zaRoyaleRank==='Z'&&royaleZWins(s).length===ROYALE_Z_TRAINERS.length;}
export function royaleDialogue(s){
 if(!s.zaRoyaleRank)return {name:'도시 광장',text:'Z-A 로열은 밤의 배틀 존에서 참가자와 겨루는 대회입니다. 현재 광장은 첫 진행을 위한 임시 접수 장소입니다.',action:'royaleJoin',label:'로열 참가하기'};
 if(s.zaRoyaleRank==='Y')return royaleYReady(s)?{name:'로열 임시 접수처',text:'티켓포인트 3,000점을 모았습니다. 밤에 Yvon과 승급전을 치르세요.',action:'royaleYvon',label:'Yvon에게 승급전 도전'}:{name:'로열 임시 접수처',text:`랭크 Y · 티켓포인트 ${royaleYPoints(s)}/3000. 밤에 배틀 존에서 포인트를 모으세요.`,action:'enterRoyaleZone',label:'배틀 존으로 들어가기'};
 if(s.zaRoyaleRank!=='Z')return {name:'도시 광장',text:`현재 로열 랭크 ${s.zaRoyaleRank}. 해당 랭크의 경기는 아직 준비 중입니다.`};
 const wins=royaleZWins(s);
 if(royaleZReady(s))return {name:'로열 임시 접수처',text:'세 상대를 이겨 첫 도전권을 얻었습니다. 밤에 승급전에서 승리하면 랭크 Y가 됩니다.',action:'royaleZach',label:'Zach에게 승급전 도전'};
 return {name:'로열 임시 접수처',text:`배틀 존 첫 세 상대 ${wins.length}/3. 밤에 배틀 존으로 들어가 트레이너를 만나세요.`,action:'enterRoyaleZone',label:'배틀 존으로 들어가기'};
}

export function royaleZoneDialogue(s,tile){
 const index={O:0,U:1,V:2}[tile],trainer=ROYALE_Z_TRAINERS[index];if(!trainer)return null;
 if(s.zaRoyaleRank==='Y'){const yTrainer=ROYALE_Y_TRAINERS[index];if(royaleYReady(s))return {name:yTrainer.name,text:'도전권을 얻었습니다. 광장의 승급전에 도전하세요.'};if(royaleYWins(s).includes(yTrainer.id))return {name:yTrainer.name,text:'이번 방문에서는 배틀을 마쳤습니다. 광장에 돌아간 뒤 다시 입장할 수 있습니다.'};return {name:yTrainer.name,text:'밤의 배틀 존에서 승리하면 티켓포인트를 얻습니다.',action:['royaleErica','royaleDaniel','royaleJean'][index],label:'로열 배틀 시작'};}
 if(s.zaRoyaleRank!=='Z')return {name:trainer.name,text:'이 배틀 존의 로열 도전은 끝났습니다.'};
 if(royaleZWins(s).includes(trainer.id))return {name:trainer.name,text:'이미 배틀을 마쳤습니다. 다른 참가자를 찾아보세요.'};
 return {name:trainer.name,text:'밤의 배틀 존에서 실력을 겨뤄 보겠어요?',action:['royaleErica','royaleDaniel','royaleJean'][index],label:'로열 배틀 시작'};
}
