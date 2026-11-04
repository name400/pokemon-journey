// Species-selection foundation for Weird Dream, pinned to PokéRogue 7c088125.
// The event remains disabled until transformation and save semantics are complete.
import {configure} from './pokemon-config.mjs';
export const WEIRD_DREAM_EXCLUDED_SPECIES = Object.freeze([
 'ARCEUS','ETERNATUS','NIHILEGO','BUZZWOLE','PHEROMOSA','XURKITREE','CELESTEELA','KARTANA','GUZZLORD','POIPOLE','NAGANADEL','STAKATAKA','BLACEPHALON',
 'GREAT_TUSK','SCREAM_TAIL','BRUTE_BONNET','FLUTTER_MANE','SLITHER_WING','SANDY_SHOCKS','ROARING_MOON','WALKING_WAKE','GOUGING_FIRE','RAGING_BOLT','IRON_TREADS','IRON_BUNDLE','IRON_HANDS','IRON_JUGULIS','IRON_MOTH','IRON_THORNS','IRON_VALIANT','IRON_LEAVES','IRON_BOULDER','IRON_CROWN',
 'PHIONE','TYPE_NULL','COSMOG','COSMOEM','MELTAN','KUBFU','URSHIFU','CALYREX','OGERPON','OKIDOGI','MUNKIDORI','FEZANDIPITI','TERAPAGOS',
]);
function shuffle(items,random){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
/**
 * Each party entry is {key, speciesId, baseTotal}; pool entries are
 * {speciesId, baseTotal}. Results retain the original party order.
 */
export function planWeirdDreamSpecies(party,pool,excludedIds,random){
 if(!Array.isArray(party)||party.length<1||!Array.isArray(pool)||typeof random!=='function')throw Error('꿈의 파티를 확인하세요.');
 const excluded=new Set(excludedIds),used=new Set(party.map(p=>p.speciesId)),chosen=new Map();let highUsed=false,legendUsed=false;
 for(const [index,mon] of shuffle(party,random).entries()){
  if(!Number.isFinite(mon.baseTotal)||!Number.isInteger(mon.speciesId)||mon.key==null||chosen.has(mon.key))throw Error('꿈의 포켓몬 자료를 확인하세요.');
  let low=index<2?90:40,high=index<2?110:50,candidates=[];
  // The source requires more than 20 eligible species before shuffling; fail
  // explicitly on incomplete catalogs instead of looping forever.
  for(let step=0;step<=100;step++,low-=10,high+=10){
   candidates=pool.filter(s=>Number.isInteger(s.speciesId)&&Number.isFinite(s.baseTotal)&&s.baseTotal>=Math.max(mon.baseTotal+low,0)&&s.baseTotal<=mon.baseTotal+high&&!excluded.has(s.speciesId)&&(!legendUsed||s.baseTotal<570||s.baseTotal>600)&&(!highUsed||s.baseTotal<=600));
   if(candidates.length>20&&candidates.some(s=>!used.has(s.speciesId)))break;
  }
  if(candidates.length<=20||!candidates.some(s=>!used.has(s.speciesId)))throw Error('꿈의 변환 후보가 충분하지 않습니다.');
  const choices=shuffle(candidates,random);let choice;while(choices.length&&!choice){const next=choices.pop();if(!used.has(next.speciesId))choice=next;}
  if(!choice)throw Error('꿈의 변환 후보가 없습니다.');
  used.add(choice.speciesId);chosen.set(mon.key,choice.speciesId);if(choice.baseTotal>600)highUsed=true;else if(choice.baseTotal>=570)legendUsed=true;
 }
 return party.map(mon=>({key:mon.key,speciesId:chosen.get(mon.key)}));
}

// Classic stores EXP relative to the current level, so the start of the new
// level is represented as zero rather than the source's absolute total EXP.
export function lowerWeirdDreamPartyLevels(party){
 if(!Array.isArray(party)||!party.length||party.some(mon=>!Number.isSafeInteger(mon.level)||mon.level<1||mon.dynamaxed))throw Error('꿈의 파티 레벨을 확인하세요.');
 return party.map(mon=>configure(mon,{level:Math.max(Math.ceil(mon.level*.9),1),experience:0,hp:mon.hp}));
}
