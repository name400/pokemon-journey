// Partial battle eligibility adapter for pinned PokéRogue 7c088125.
// null means insufficient data or an unsupported rule; never treat it as allowed.
import {sourceSpeciesFor} from './rogue-reference.mjs';

const TYPES=['노말','격투','비행','독','땅','바위','벌레','고스트','강철','불꽃','물','풀','전기','에스퍼','얼음','드래곤','악','페어리'];

// Internal, opt-in subset only. The regular start API does not expose it yet.
export function normalizeClassicChallengeSubset(input){
 if(!Array.isArray(input)||input.length<1||input.length>2)throw Error('지원되는 챌린지 조건을 선택하세요.');
 const seen=new Set();return input.map(c=>{if(!c||typeof c!=='object'||Array.isArray(c)||Object.keys(c).some(k=>k!=='id'&&k!=='value'&&k!=='severity')||(c.severity!==undefined&&c.severity!==0)||!Number.isInteger(c.id)||!Number.isInteger(c.value)||![0,1].includes(c.id)||c.value<1||c.value>(c.id===0?9:18)||seen.has(c.id))throw Error('지원되지 않거나 중복된 챌린지 조건입니다.');seen.add(c.id);return {id:c.id,value:c.value,severity:0};});
}

// The pinned source's starter selection narrows these genders because only
// particular evolutions can remain legal in the chosen challenge.
export function classicChallengeStarterGenderEligibility(sourceId,gender,challenges=[]){
 if(!Array.isArray(challenges))return null;
 let required=null;for(const c of challenges){if(!c||!Number.isInteger(c.id)||!Number.isInteger(c.value))return null;let next=null;if(c.id===0&&c.value===4){if(sourceId===280)next='M';else if(sourceId===361)next='F';}else if(c.id===1){if(sourceId===280&&c.value===2)next='M';else if(sourceId===361&&c.value===8)next='F';else if(sourceId===412&&c.value===3)next='M';else if(sourceId===412&&[5,9,12].includes(c.value))next='F';}if(next&&required&&required!==next)return false;if(next)required=next;}
 if(!required)return true;if(!['M','F'].includes(gender))return null;return gender===required;
}
function eligibility(mon,challenges,{starter=false}={}){
 if(!mon)return null;
 if(!starter&&!Number.isFinite(mon.hp))return null;
 if(!starter&&mon.hp<=0)return false;
 if(!Array.isArray(challenges))return null;
 if(starter){const gender=classicChallengeStarterGenderEligibility(mon.rogueSourceId,mon.gender,challenges);if(gender!==true)return gender;}
 let uncertain=false;
 for(const challenge of challenges){
  if(!challenge||!Number.isInteger(challenge.id)||!Number.isInteger(challenge.value)){uncertain=true;continue;}
  if(challenge.id!==0&&challenge.id!==1){uncertain=true;continue;}
  if(challenge.value===0)continue;
  if(challenge.value<1||challenge.value>(challenge.id===0?9:18)){uncertain=true;continue;}
  const species=sourceSpeciesFor(mon);
  if(!species||mon.fusionSpecies){uncertain=true;continue;}
  if(challenge.id===0){
   if(!Number.isInteger(species.generation)){uncertain=true;continue;}
   if(species.generation!==challenge.value)return false;
   continue;
  }
  // Original applies the form's intrinsic types, not Tera or added battle types.
  // Castform counts as Normal even while its weather form has changed type.
  if(!starter&&species.sourceId===351&&challenge.value===1)continue;
  if(mon.mega||mon.primal||mon.ultra||mon.dynamaxed||mon.gigantamax||(mon.rogueFormIndex==null&&Number(mon.id)!==species.pokemonId)){uncertain=true;continue;}
  const index=mon.rogueFormIndex??0;
  if(!Number.isInteger(index)||index<0){uncertain=true;continue;}
  const form=species.formList.find(row=>row.formIndex===index)||(index===0?{types:species.types,formKey:''}:null);
  if(!form||!Array.isArray(form.types)||!form.types.length||(index>0&&form.formKey!==mon.rogueFormKey)){uncertain=true;continue;}
  if(!form.types.includes(TYPES[challenge.value-1]))return false;
 }
 return uncertain?null:true;
}

export function classicChallengeBattleEligibility(mon,challenges=[]){return eligibility(mon,challenges);}
export function classicChallengeStarterEligibility(mon,challenges=[]){return eligibility(mon,challenges,{starter:true});}
