import names from '../data/item-names.json' with {type:'json'};
/** @type {Record<string,string>} */
export const itemNames=names;
export const itemName=key=>key==='seedofmasteryza'?'숙달의씨':itemNames[key]||key;
