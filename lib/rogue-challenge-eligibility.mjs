// Partial battle eligibility adapter for pinned PokéRogue 7c088125.
// null means insufficient data or an unsupported rule; never treat it as allowed.
import {sourceSpeciesFor} from './rogue-reference.mjs';

const TYPES=['노말','격투','비행','독','땅','바위','벌레','고스트','강철','불꽃','물','풀','전기','에스퍼','얼음','드래곤','악','페어리'];

function eligibility(mon,challenges,{starter=false}={}){
 if(!mon)return null;
 if(!starter&&!Number.isFinite(mon.hp))return null;
 if(!starter&&mon.hp<=0)return false;
 if(!Array.isArray(challenges))return null;
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
