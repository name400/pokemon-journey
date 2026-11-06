import names from '../data/item-names.json' with {type:'json'};
/** @type {Record<string,string>} */
export const itemNames=names;
export const itemName=key=>key==='seedofmasteryza'?'숙달의씨':key==='za-exp-candy-l'?'경험사탕L':key==='za-exp-candy-m'?'경험사탕M':key==='za-zygarde-cube'?'지가르데큐브':key==='za-pebble'?'수수께끼의 돌':key==='za-canari-plush'?'Canari의 사인 인형':key==='za-performance-sneakers'?'퍼포먼스 스니커':key==='za-tm022'?'기술머신 022 · 제비반환':key==='za-tm041'?'기술머신 041 · 물의파동':key==='za-tm040'?'기술머신 040 · 씨기관총':key==='za-tm104'?'기술머신 104 · 플레어드라이브':key==='za-tm020'?'기술머신 020 · 치근거리기':key==='za-tm100'?'기술머신 100 · 더스트슈트':key==='za-tm011'?'기술머신 011 · 벌크업':key==='za-tm066'?'기술머신 066 · 볼트체인지':key==='za-tm051'?'기술머신 051 · 신비의부적':itemNames[key]||key;
