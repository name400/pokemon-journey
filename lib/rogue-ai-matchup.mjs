import {rogueSeededRandom} from './rogue-seeded-rng.mjs';
import {shiftSourceSeed} from './rogue-mysterious-challengers.mjs';
// Source moves carrying VariableMoveTypeAttr are excluded from matchup STAB.
const variableTypeMoves=new Set(['weatherball','terrainpulse','judgment','multiattack','technoblast','aurawheel','ragingbull','ivycudgel','terablast','terastarstorm','revelationdance','waterpledge','firepledge','grasspledge']);
export function classicAiSourceVariableMove(move){return typeof move?.id==='string'&&(move.id.startsWith('hiddenpower')||variableTypeMoves.has(move.id));}
// Numeric matchup/cooldown rules from pinned source pokemon.ts:getMatchupScore
// and enemy-command-phase.ts. Native type/status adapters are supplied by caller.
export function classicAiMatchupScore(mon,opponent,effectiveness){
 const outspeed=mon.speed>=opponent.speed;
 let defense=1;for(const [index,type] of opponent.types.entries()){const target=index===0&&mon.illusionDefenseRule&&mon.actualTypes?{...mon,types:mon.actualTypes}:mon;defense/=Math.max(effectiveness(type,target,opponent),.25);}
 const attacks=mon.moves.filter(move=>move.category!=='Status'&&move.pp>0);
 const offense=attacks.reduce((sum,move)=>sum+effectiveness(move.type,opponent,mon)*((mon.actualTypes||mon.types).includes(move.type)&&!move.variableType?1.5:1),0)/(attacks.length||1);
 const hp=mon.hp/mon.maxHp,other=opponent.hp/opponent.maxHp;let ratio=hp+1-other;
 if(hp<=.2&&mon.active){if(!outspeed&&offense<1.5&&defense<1.5)ratio*=.85;else ratio=1-hp+(outspeed?.2:.1);}
 else if(outspeed)ratio*=1.25;else if(hp>.2&&hp<=.4)ratio*=.5;
 return (offense+defense)*Math.min(ratio,1);
}
export function classicAiHazardMultiplier(mon,hazards,effectiveness){
 let multiplier=1;
 for(const {id,layers=1}of hazards){
  const base=mon.grounded?1:Math.min(mon.hp/mon.maxHp,.5)*2/2**layers;
  if(id==='stealthrock'){const damage=.125*effectiveness('Rock',mon,undefined,{ignoreStrongWinds:true});multiplier*=base+(1-base)*(1-Math.pow(damage,damage));}
  else if(id==='toxicspikes'){if(mon.grounded||!mon.canPoison)continue;multiplier*=mon.types.includes('Poison')?1.25:base;}
  else multiplier*=base;
 }
 return multiplier;
}
export function classicAiSwitchDecision(current,candidates,{counter=0,boss=false,randomInt}){
 const sorted=[...candidates].sort((a,b)=>b.score-a.score);if(!sorted.length)return null;
 const multiplier=1-(counter>0?Math.pow(.1,1/counter):0);
 if(sorted[0].score*multiplier<current*(boss?2:3))return null;
 const tied=sorted.filter(c=>c.score===sorted[0].score);return tied.length===1?tied[0]:tied[randomInt(tied.length)];
}

// Source trainer tie picks execute with a temporary run-seed offset and restore
// the main random stream. They must not consume the native battle PRNG.
export function classicAiTieIndex(seed,turn,length){
 if(typeof seed!=='string'||!Number.isInteger(turn)||!Number.isInteger(length)||length<1)throw Error('상대 교체 난수 설정을 확인하세요.');
 return Math.floor(rogueSeededRandom(shiftSourceSeed(seed,turn<<2),{utf16:true})()*length);
}

// Pinned Pokemon.getAttackTypeEffectiveness, used by matchup (not getDamage).
// Absorb/Flash Fire callbacks are intentionally not guessed here: the source
// matchup method only adds forced airborne, exposed typings and strong winds.
export function classicAiTypeMultiplier(type,target,source,base,{ignoreStrongWinds=false}={}){
 if(type==='Stellar')return target.terastallized?2:1;
 if(type==='Ground'&&target.forcedAirborne)return 0;
 let multiplier=1;
 for(const defender of target.types){
  let value=base(type,defender);
  if(source?.active&&value===0){
   if(type==='Ground'&&defender==='Flying'&&target.forcedGrounded)value=1;
   else if(defender==='Ghost'&&['Normal','Fighting'].includes(type)&&(target.exposedGhost||source.scrappy))value=1;
   else if(defender==='Dark'&&type==='Psychic'&&target.exposedDark)value=1;
  }
  multiplier*=value;
 }
 if(!ignoreStrongWinds&&target.strongWinds&&(target.windTypes||target.types).includes('Flying')&&base(type,'Flying')===2)multiplier/=2;
 return multiplier;
}
