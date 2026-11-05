import {classicStaticMoveType} from './rogue-move-balance.mjs';
import {classicChallengeLevelMoves,classicChallengeTMs,classicRandomizedMoveName} from './rogue-challenge-randomizers.mjs';
import {Dex} from '@pkmn/sim';
import {moves as gameMoves} from './game.mjs';
import {rules} from './pokemon-config.mjs';
import {rogueSpecies,sourceMove,sourceSpeciesFor} from './rogue-reference.mjs';
import tmRules from '../data/rogue-trainer-tms.json' with {type:'json'};
const forbiddenTms=new Set(tmRules.forbidden);

// A bounded level/TM/egg pool and tactical heuristic, not the upstream
// weighted signature-move generator.
export function trainerLevelMoves(mon,rng=Math.random,{allowEggMoves=false,forRivalSignature=false,run=null}={}){
 const root=sourceSpeciesFor(mon);if(!root)return [...mon.moves];
 const ids=new Set(),tmCandidates=new Set(),seen=new Set();let record=root,first=true;
 while(record&&!seen.has(record.sourceId)){
  seen.add(record.sourceId);const baseForm=record.formList?.find(form=>form.formIndex===(first?(mon.rogueFormIndex||0):0))?.formKey||'';
  for(const [level,id] of classicChallengeLevelMoves(mon,[...(record.levelMoves||[]),...(record.formLevelMoves?.[baseForm]||[])],record))if(level===0||level===-1&&mon.level>=40||level>0&&level<=mon.level)ids.add(id);
  for(const id of classicChallengeTMs(mon,[...(record.tms||[]),...(record.formTms?.[baseForm]||[])],record.sourceId)){const tier=tmRules.tiers[id],minimum={COMMON:25,GREAT:40,ULTRA:55}[tier];if(minimum&&mon.level>=minimum&&!forbiddenTms.has(id))tmCandidates.add(id);}
  first=false;record=rogueSpecies.get(record.preEvolutionId??record.preEvolutionIds?.[0]);
 }
 const eggIds=new Set();if(!mon.rogueMovesetSeed&&allowEggMoves&&mon.level>=80){const family=rogueSpecies.get(root.starterId)||root;for(const id of (family.eggMoves||[]).slice(0,3))if(!ids.has(id)){ids.add(id);eggIds.add(id);}}
 const tmIds=new Set();for(const id of tmCandidates)if(!ids.has(id)){ids.add(id);tmIds.add(id);}
 const species=Dex.species.get(mon.rogueBattleSpecies||rules.species[mon.id]?.key||''),types=new Set(species.types||[]);
 const candidates=[];
 for(const id of ids){const name=mon.rogueMovesetSeed?classicRandomizedMoveName(id):sourceMove(id);if(!name)continue;const move=Dex.moves.get(gameMoves[name]?.key||name);if(!move.exists||move.id==='struggle')continue;
  const moveType=classicStaticMoveType(move,run),accuracy=move.accuracy===true?1:Math.max(0,Math.min(1,(move.accuracy||100)/100));let score;
  if(move.category==='Status'){
   score=move.heal?45:move.status==='slp'?40:move.status?28:move.boosts?30:move.sideCondition?25:move.volatileStatus?12:0;
  }else{
   const hits=typeof move.multihit==='number'?move.multihit:Array.isArray(move.multihit)?move.multihit[0]===2&&move.multihit[1]===5?3.1:(move.multihit[0]+move.multihit[1])/2:1;
   const power=(move.basePower||((move.damage||move.damageCallback)?45:0))*hits,offense=move.category==='Physical'?mon.stats?.atk:mon.stats?.spa,other=move.category==='Physical'?mon.stats?.spa:mon.stats?.atk;
   score=power*accuracy*(types.has(moveType)?1.4:1)*(offense&&other?Math.max(.7,Math.min(1.3,offense/other)):1)+(move.priority>0?10:0);if(move.selfdestruct)score*=.65;
  }
  if(score>0)candidates.push({id,name,type:moveType,category:move.category,egg:eggIds.has(id),tm:tmIds.has(id),score:score*(.96+rng()*.08)});
 }
 if(!candidates.length)return [...mon.moves];
 const picked=[],usedTypes=new Set(),damage=candidates.filter(move=>move.category!=='Status').sort((a,b)=>b.score-a.score),support=candidates.filter(move=>move.category==='Status').sort((a,b)=>b.score-a.score);let usedEgg=false,usedTms=0;const maxTms=mon.level>=71?3:mon.level>=41?2:mon.level>=25?1:0;
 const eligible=move=>(!move.egg||!usedEgg)&&(!move.tm||usedTms<maxTms),add=move=>{picked.push(move.name);if(move.egg)usedEgg=true;if(move.tm)usedTms++;};
 const signatureIds=mon.rogueMovesetSeed?[]:forRivalSignature?(tmRules.rivalSignatures[root.sourceId]||tmRules.signatures[root.sourceId]||[]):(tmRules.signatures[root.sourceId]||[]),signatures=signatureIds.map(id=>candidates.find(move=>move.id===id)).filter(move=>move&&eligible(move));
 if(signatures.length&&rng()<.6){const chosen=signatures[Math.floor(rng()*signatures.length)];add(chosen);if(chosen.category!=='Status')usedTypes.add(chosen.type);const pool=chosen.category==='Status'?support:damage,index=pool.findIndex(move=>move.id===chosen.id);if(index>=0)pool.splice(index,1);}
 while(damage.length&&picked.length<3){let index=damage.findIndex(move=>eligible(move)&&!usedTypes.has(move.type));if(index<0)index=damage.findIndex(eligible);if(index<0)break;const [move]=damage.splice(index,1);add(move);usedTypes.add(move.type);}
 const utility=support.find(eligible);if(utility&&picked.length<4)add(utility);
 for(const move of [...damage,...support]){if(picked.length>=4)break;if(eligible(move)&&!picked.includes(move.name))add(move);}
 return picked.length?picked:[...mon.moves];
}
