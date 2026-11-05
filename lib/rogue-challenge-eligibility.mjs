import {CLASSIC_CHALLENGE_LIMITS} from './rogue-challenge-rules.mjs';
// Partial battle eligibility adapter for pinned PokéRogue 7c088125.
// null means insufficient data or an unsupported rule; never treat it as allowed.
import {sourceSpeciesFor,DEFAULT_STARTER_IDS} from './rogue-reference.mjs';
import {classicTypesWithCustomSecond} from './rogue-custom-types.mjs';
import {Dex} from '@pkmn/sim';
import {rules} from './pokemon-config.mjs';
import {classicNativeForm} from './rogue-transformations.mjs';
import {validatedClassicDnaFusion} from './rogue-dna-fusion.mjs';

const TYPES=['노말','격투','비행','독','땅','바위','벌레','고스트','강철','불꽃','물','풀','전기','에스퍼','얼음','드래곤','악','페어리'];

// Internal, opt-in subset only. The regular start API does not expose it yet.
export function normalizeClassicChallengeSubset(input){
 if(!Array.isArray(input)||input.length<1||input.length>Object.keys(CLASSIC_CHALLENGE_LIMITS).length)throw Error('지원되는 챌린지 조건을 선택하세요.');
 const seen=new Set();return input.map(c=>{if(!c||typeof c!=='object'||Array.isArray(c)||Object.keys(c).some(k=>k!=='id'&&k!=='value'&&k!=='severity')||(c.severity!==undefined&&c.severity!==0)||!Number.isInteger(c.id)||!Number.isInteger(c.value)||!Object.hasOwn(CLASSIC_CHALLENGE_LIMITS,c.id)||c.value<1||c.value>CLASSIC_CHALLENGE_LIMITS[c.id]||seen.has(c.id))throw Error('지원되지 않거나 중복된 챌린지 조건입니다.');seen.add(c.id);return {id:c.id,value:c.value,severity:0};});
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
  if(starter&&challenge.id===4&&challenge.value===1){const source=sourceSpeciesFor(mon);if(!source){uncertain=true;continue;}if(!DEFAULT_STARTER_IDS.includes(source.sourceId)&&!DEFAULT_STARTER_IDS.includes(source.starterId))return false;}
  if(challenge.id!==0&&challenge.id!==1){if(!Object.hasOwn(CLASSIC_CHALLENGE_LIMITS,challenge.id)||challenge.value<1||challenge.value>CLASSIC_CHALLENGE_LIMITS[challenge.id])uncertain=true;continue;}
  if(challenge.value===0)continue;
  if(challenge.value<1||challenge.value>(challenge.id===0?9:18)){uncertain=true;continue;}
  const species=sourceSpeciesFor(mon);
  if(!species){uncertain=true;continue;}
  if(mon.fusionSpecies){
   const fusion=!starter&&validatedClassicDnaFusion(mon),donor=fusion&&sourceSpeciesFor(fusion.donor);
   if(!fusion||!donor||!Number.isInteger(species.generation)||!Number.isInteger(donor.generation)){uncertain=true;continue;}
   if(challenge.id===0){if(species.generation!==challenge.value||donor.generation!==challenge.value)return false;}
   else if(!(species.sourceId===351&&challenge.value===1)&&!fusion.types.includes(TYPES[challenge.value-1]))return false;
   continue;
  }
  if(challenge.id===0){
   if(!Number.isInteger(species.generation)){uncertain=true;continue;}
   if(species.generation!==challenge.value)return false;
   continue;
  }
  // Original applies the form's intrinsic types, not Tera or added battle types.
  // Castform counts as Normal even while its weather form has changed type.
  if(!starter&&species.sourceId===351&&challenge.value===1)continue;
  if(mon.rogueFormIndex==null&&Number(mon.id)!==species.pokemonId){uncertain=true;continue;}
  const index=mon.rogueFormIndex??0;
  if(!Number.isInteger(index)||index<0){uncertain=true;continue;}
  const form=species.formList.find(row=>row.formIndex===index)||(index===0?{types:species.types,formKey:''}:null);
  if(!form||!Array.isArray(form.types)||!form.types.length||(index>0&&form.formKey!==mon.rogueFormKey)){uncertain=true;continue;}
  // Ultra requires a validated Dusk Mane or Dawn Wings transition, not just
  // a standalone flag on a base Necrozma or an unrelated saved Pokémon.
  if(mon.ultra){const native=Dex.species.get(mon.rogueBattleSpecies||''),parent=species.formList.find(f=>f.formKey===mon.rogueUltraOrigin);let validTypes=false;try{const expected=classicTypesWithCustomSecond(mon,form.types);validTypes=Array.isArray(mon.rogueTypes)&&mon.rogueTypes.length===expected.length&&mon.rogueTypes.every((type,index)=>type===expected[index]);}catch{}if(species.sourceId!==800||form.formKey!=='ultra'||!['dusk-mane','dawn-wings'].includes(mon.rogueUltraOrigin)||![species.pokemonId,parent?.pokemonId].includes(Number(mon.id))||!native.exists||native.id!=='necrozmaultra'||mon.mega||mon.primal||mon.gigantamax||mon.dynamaxed||!form.baseStats||['hp','atk','def','spa','spd','spe'].some(stat=>mon.rogueBaseStats?.[stat]!==form.baseStats[stat])||!validTypes){uncertain=true;continue;}}
  if(mon.mega||mon.primal||mon.gigantamax){const base=Dex.species.get(rules.species[species.pokemonId]?.key||''),native=Dex.species.get(mon.rogueBattleSpecies||''),expected=classicNativeForm(species,form),flags=Number(!!mon.mega)+Number(!!mon.primal)+Number(!!mon.gigantamax);if(flags!==1||mon.dynamaxed&&!mon.gigantamax||!base.exists||!native.exists||native.baseSpecies!==base.baseSpecies||mon.mega&&(!native.isMega||!String(form.formKey).startsWith('mega'))||mon.primal&&(!native.isPrimal||!String(form.formKey).startsWith('primal'))||mon.gigantamax&&(!mon.dynamaxed||!native.forme.endsWith('Gmax')||!String(form.formKey).startsWith('gigantamax')||!expected?.exists||native.id!==expected.id)){uncertain=true;continue;}}
  else if(mon.dynamaxed&&(index!==0||mon.rogueBattleSpecies&&Dex.species.get(mon.rogueBattleSpecies).id!==Dex.species.get(rules.species[species.pokemonId]?.key||'').id)){uncertain=true;continue;}
  let types=form.types;if(!starter&&mon.rogueCustomSecondType){try{types=classicTypesWithCustomSecond(mon,form.types);}catch{uncertain=true;continue;}}
  if(!types.includes(TYPES[challenge.value-1]))return false;
 }
 return uncertain?null:true;
}

export function classicChallengeBattleEligibility(mon,challenges=[]){return eligibility(mon,challenges);}
export function classicChallengeStarterEligibility(mon,challenges=[]){return eligibility(mon,challenges,{starter:true});}
