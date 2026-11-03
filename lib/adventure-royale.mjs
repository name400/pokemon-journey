// First Z-A Royale mission, using the documented trainer teams.
// See https://www.serebii.net/legendsz-a/z-aroyale/rankz.shtml
export const ROYALE_Z_TRAINERS=[
 {id:'royale-z-erica',name:'사무원 Erica',team:[[69,6]],moves:[['덩굴채찍','성장']]},
 {id:'royale-z-daniel',name:'배낭여행자 Daniel',team:[[659,6],[661,6]],moves:[['몸통박치기','째려보기'],['울음소리','쪼기']]},
 {id:'royale-z-jean',name:'사무원 Jean',team:[[13,6]],moves:[['독침','실뿜기']]},
];
export const ROYALE_Z_PROMOTION={id:'royale-z-zach',name:'드라이버 Zach',team:[[79,8],[16,9],[25,9]],moves:[['물대포','울음소리','몸통박치기','염동력'],['몸통박치기','울음소리','바람일으키기'],['전광석화','울음소리','전기자석파','전기쇼크']]};
export function royaleZWins(s){return [...new Set((Array.isArray(s.zaRoyaleZWins)?s.zaRoyaleZWins:[]).filter(id=>ROYALE_Z_TRAINERS.some(t=>t.id===id)))];}
export function royaleZReady(s){return s.zaRoyaleRank==='Z'&&royaleZWins(s).length===ROYALE_Z_TRAINERS.length;}
export function royaleDialogue(s){
 if(!s.zaRoyaleRank)return {name:'도시 광장',text:'Z-A 로열은 밤의 배틀 존에서 참가자와 겨루는 대회입니다. 현재 광장은 첫 진행을 위한 임시 접수 장소입니다.',action:'royaleJoin',label:'로열 참가하기'};
 if(s.zaRoyaleRank==='Y')return {name:'도시 광장',text:'랭크 Y 승급을 달성했습니다. 다음은 티켓포인트 3,000점을 모아 Yvon과 승급전입니다. 포인트 집계와 이 승급전은 아직 준비 중입니다.'};
 if(s.zaRoyaleRank!=='Z')return {name:'도시 광장',text:`현재 로열 랭크 ${s.zaRoyaleRank}. 해당 랭크의 경기는 아직 준비 중입니다.`};
 const wins=royaleZWins(s);
 if(royaleZReady(s))return {name:'로열 임시 접수처',text:'세 상대를 이겨 첫 도전권을 얻었습니다. 밤에 승급전에서 승리하면 랭크 Y가 됩니다.',action:'royaleZach',label:'Zach에게 승급전 도전'};
 return {name:'로열 임시 접수처',text:`배틀 존 첫 세 상대 ${wins.length}/3. 밤에 배틀 존으로 들어가 트레이너를 만나세요.`,action:'enterRoyaleZone',label:'배틀 존으로 들어가기'};
}

export function royaleZoneDialogue(s,tile){
 const index={O:0,U:1,V:2}[tile],trainer=ROYALE_Z_TRAINERS[index];if(!trainer)return null;
 if(s.zaRoyaleRank!=='Z')return {name:trainer.name,text:'이 배틀 존의 첫 로열 도전은 끝났습니다.'};
 if(royaleZWins(s).includes(trainer.id))return {name:trainer.name,text:'이미 배틀을 마쳤습니다. 다른 참가자를 찾아보세요.'};
 return {name:trainer.name,text:'밤의 배틀 존에서 실력을 겨뤄 보겠어요?',action:['royaleErica','royaleDaniel','royaleJean'][index],label:'로열 배틀 시작'};
}
