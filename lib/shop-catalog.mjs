import {rules} from './pokemon-config.mjs';import {evolutionItems} from './evolution.mjs';import local from '../data/localization.json' with {type:'json'};
const names=Object.fromEntries(Object.entries(local.items).map(([k,v])=>[k.replaceAll('-',''),v]));
export const shopItems=[...new Set([...Object.keys(rules.items),...evolutionItems])].filter(id=>!['gimmighoulcoin','meltancandy'].includes(id)).map(id=>({id,name:names[id]||rules.items[id]?.name||id,category:evolutionItems.includes(id)?'evolution':id.endsWith('berry')?'berry':'held',price:id.endsWith('berry')?300:/(ite|iumz|memory|plate)$/.test(id)?4000:evolutionItems.includes(id)?2000:1500}));

shopItems.push({id:'gimmighoulcoin',name:'모으령 코인',category:'evolution',price:100},{id:'meltancandy',name:'멜탄 사탕',category:'evolution',price:200});
