import local from '../data/localization.json' with {type:'json'};
export const itemNames=Object.fromEntries(Object.entries(local.items).map(([k,v])=>[k.replaceAll('-',''),v]));
Object.assign(itemNames,{gimmighoulcoin:'모으령 코인',meltancandy:'멜탄 사탕'});
export const itemName=key=>itemNames[key]||key;
