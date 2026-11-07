import {initialTeraType} from './tera-type.mjs';
// Data and stat helpers. Battle mechanics are provided by full-battle.mjs.
import pokedex from '../data/pokedex.json' with {type:'json'};
import chart from '../data/type-chart.json' with {type:'json'};
import {rules,levelMoves,configure,defaultIVs,defaultEVs} from './pokemon-config.mjs';
export const species=pokedex;
const legacyMoves = {
 '몸부림':{type:'노말',power:50,acc:100,recoil:.25},'몸통박치기':{type:'노말',power:40,acc:100},'할퀴기':{type:'노말',power:40,acc:100},'전광석화':{type:'노말',power:40,acc:100,priority:1},
 '덩굴채찍':{type:'풀',power:45,acc:100},'불꽃세례':{type:'불꽃',power:40,acc:100,burn:.1},'불꽃엄니':{type:'불꽃',power:65,acc:95,burn:.1},
 '물대포':{type:'물',power:40,acc:100},'거품광선':{type:'물',power:65,acc:100},'전기쇼크':{type:'전기',power:40,acc:100,paralyze:.1},'10만볼트':{type:'전기',power:90,acc:100,paralyze:.1},
 '돌떨구기':{type:'바위',power:50,acc:90},'물기':{type:'악',power:60,acc:100},'핥기':{type:'고스트',power:30,acc:100,paralyze:.3},'용의숨결':{type:'드래곤',power:60,acc:100,paralyze:.3},'독가루':{type:'독',power:0,acc:75,poison:1}
};
const typeNames={Normal:'노말',Fire:'불꽃',Water:'물',Electric:'전기',Grass:'풀',Ice:'얼음',Fighting:'격투',Poison:'독',Ground:'땅',Flying:'비행',Psychic:'에스퍼',Bug:'벌레',Rock:'바위',Ghost:'고스트',Dragon:'드래곤',Dark:'악',Steel:'강철',Fairy:'페어리'};
export const moves=Object.fromEntries(Object.entries(rules.moves).map(([name,m])=>[name,{...m,type:typeNames[m.type]||m.type,...legacyMoves[name]}]));moves['몸부림']={...moves['발버둥'],...legacyMoves['몸부림'],key:'struggle'};

export const stages=[{name:'숲길의 트레이너',kind:'일반',ids:[43]},{name:'바위 체육관',kind:'체육관',ids:[74,74]},{name:'물가의 트레이너',kind:'일반',ids:[54]},{name:'물 체육관',kind:'체육관',ids:[7,54]},{name:'전기의 관문',kind:'체육관',ids:[25,133]},{name:'사천왕의 시험',kind:'사천왕',ids:[92,147,37]},{name:'챔피언의 도전',kind:'챔피언',ids:[1,4,7]}];
export const pick=(a,n=1)=>[...a].sort(()=>Math.random()-.5).slice(0,n);
export const makeMon=(id,level=5)=>{const s=species.find(x=>x.id===id);if(!s||!Number.isInteger(level)||level<1||level>100)throw Error('종 또는 레벨이 올바르지 않습니다.');const mon=configure({...s,baseHp:s.hp,baseAtk:s.atk,baseDef:s.def,baseSpa:s.spa,baseSpdDef:s.spdDef,baseSpeed:s.spd,level,experience:0,status:null,gender:/female|암컷/i.test(s.identifier+' '+s.formName)?'F':/male|수컷/i.test(s.identifier+' '+s.formName)?'M':s.genderRate===-1?'N':(crypto.getRandomValues(new Uint8Array(1))[0]%8)<(s.genderRate??4)?'F':'M',friendship:s.baseHappiness??70,affection:0,beauty:0,walkSteps:0,damageTaken:0,moveUsage:{},personality:crypto.getRandomValues(new Uint32Array(1))[0],encryptionConstant:crypto.getRandomValues(new Uint32Array(1))[0],ivs:defaultIVs(),evs:defaultEVs(),nature:'hardy',ability:rules.species[id]?.abilities[0]||'',item:'',shiny:false,moves:levelMoves(s,level)});mon.teraType=initialTeraType(s.speciesId,mon.personality);return mon;};
export const effectiveness=(attack,defend)=>(Array.isArray(defend)?defend:[defend]).reduce((n,type)=>n*(chart[attack]?.[type]??1),1);
