// Side Mission 76 questions are paraphrased for the existing dialogue UI.
// https://gmtreks.com/pokemon-z-a/side-missions/76
// https://game8.jp/pokemon-legends-z-a/731341
export const SIDE76_QUESTIONS=Object.freeze([
 {text:'메가진화에 필요한 돌은 무엇이라고 부를까?',options:['메가돌멩이','메가스톤','메가바위'],correct:1},
 {text:'카나리의 저리더프에게 필요한 메가스톤은?',options:['저리더프나이트','저리나이트','저리더나이트'],correct:0},
 {text:'메가진화 중 강해진 기술은 무엇이라고 부를까?',options:['다이맥스 기술','기술플러스','Z기술'],correct:1},
 {text:'메가진화하면 타입이 바뀌는 포켓몬은?',options:['메가루카리오','메가전룡','메가썬더볼트'],correct:1},
 {text:'어떤 메가진화가 가장 강하다고 생각해?',options:['메가메가니움','메가염무왕','메가장크로다일'],correct:null},
]);
export function side76Available(s={}){return s.zaSide76Stage>=1||s.zaSide76Complete===true||s.zaMission25Complete===true||s.zaMission26Started===true||s.zaMission26Complete===true||s.zaMission30Started===true||s.zaMission37Complete===true||['B','A','S'].includes(s.zaRoyaleRank);}
export function side76Spot(s,spot){return s?.district==='lumiose-rouge-sector6'&&s.zaAcademyCourtyard===true&&!s.interior&&spot?.tile==='%'&&spot.x===6&&spot.y===4;}
