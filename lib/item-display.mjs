import names from '../data/item-names.json' with {type:'json'};
/** @type {Record<string,string>} */
export const itemNames=names;
export const itemName=key=>key==='seedofmasteryza'?'숙달의씨':key==='za-pebble'?'수수께끼의 돌':key==='za-canari-plush'?'Canari의 사인 인형':key==='za-performance-sneakers'?'퍼포먼스 스니커':key==='za-tm011'?'기술머신 011 · 벌크업':key==='za-tm066'?'기술머신 066 · 볼트체인지':key==='za-tm051'?'기술머신 051 · 신비의부적':itemNames[key]||key;
