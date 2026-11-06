import names from '../data/item-names.json' with {type:'json'};
/** @type {Record<string,string>} */
export const itemNames=names;
export const itemName=key=>key==='seedofmasteryza'?'숙달의씨':key==='za-tm051'?'기술머신 051 · 신비의부적':itemNames[key]||key;
