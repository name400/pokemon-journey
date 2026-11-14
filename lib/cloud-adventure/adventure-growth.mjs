import {learnableMoves,moveNameByKey} from '../pokemon-config.mjs';
import {adventureMoveKey,knowsAdventureMove,sameAdventureMove} from './adventure-move-identity.mjs';
import learnsets from '../../data/learnsets-modern.json' with {type:'json'};

// A newly learned move starts with full PP. Remaining moves keep their PP.
export function teachAdventureMove(mon,name,slot){
 const previous=mon.moves[slot],next=mon.moves.slice(),pp={...(mon.pp||{})};
 next[slot]=name;mon.moves=next.filter(Boolean);
 const oldKey=adventureMoveKey(previous),newKey=adventureMoveKey(name);
 if(oldKey&&!mon.moves.some(move=>adventureMoveKey(move)===oldKey))delete pp[oldKey];
 if(newKey)delete pp[newKey];
 mon.pp=pp;return mon;
}

// Compare the old and new level, rather than treating older relearnable moves as
// new on every level-up. Moves that do not fit remain available in management.
function applyNewMoves(after,unlocked){
 const learned=[],pending=[];
 for(const name of unlocked){
  if(knowsAdventureMove(after,name)||pending.some(move=>sameAdventureMove(move,name)))continue;
  if(after.moves.length<4){teachAdventureMove(after,name,after.moves.length);learned.push(name);}
  else pending.push(name);
 }
 return {mon:after,learned,pending};
}
// Verified early Z-A levels for the three initial starter species. Later levels
// and evolutions still use the existing learnsets until separately verified.
const introEarlyMoves={152:[[9,'차밍보이스'],[12,'잎날가르기'],[14,'씨뿌리기']],158:[[10,'물기'],[15,'거품광선']],498:[[10,'구르기'],[13,'연막'],[15,'화염바퀴']]};
function isIntroStarter(mon,world){
 if(world?.zaIntroStarterMovesV1!==true||mon?.origin!=='starter')return false;
 const id=world.zaIntroStarterBoxId;
 return typeof id==='string'?id===mon.boxId:world.zaIntroStarterSpecies!=null?world.zaIntroStarterSpecies===mon.speciesId:
  ['andi','escape','brigitte','barrierRoute','barrier','tunnel','hotel'].includes(world.zaIntroStage)&&world.activeId===mon.boxId;
}
export function applyAdventureLevelMoves(before,after,world){
 const knownBefore=new Set(learnableMoves(before,before.level));
 const legacy=applyNewMoves(after,learnableMoves(after,after.level).filter(name=>!knownBefore.has(name)));
 const extra=isIntroStarter(before,world)?(introEarlyMoves[before.speciesId]||[]).filter(([level])=>before.level<level&&level<=after.level).map(([,move])=>move):[];
 const next=applyNewMoves(legacy.mon,extra.filter(name=>!legacy.pending.some(move=>sameAdventureMove(move,name))));
 return {mon:next.mon,learned:[...legacy.learned,...next.learned],pending:[...legacy.pending,...next.pending]};
}
// Keep the Z-A introduction's verified moves available for that same starter.
// Older saves without a box ID use the original starter species (or the active
// starter during the introduction); no save or shared Pokémon is rewritten.
export function adventureLearnableMoves(mon,world){
 const result=learnableMoves(mon,mon.level);
 if(!isIntroStarter(mon,world))return result;
 const element={152:'나뭇잎',158:'물대포',498:'불꽃세례'}[mon.speciesId];
 if(!element)return result;
 const moves=['몸통박치기',mon.speciesId===158?'째려보기':'꼬리흔들기',...(mon.level>=6?[element]:[]),...(introEarlyMoves[mon.speciesId]||[]).filter(([level])=>mon.level>=level).map(([,move])=>move)];
 for(const move of moves)if(!result.some(name=>sameAdventureMove(name,move)))result.push(move);
 return result;
}
// Only newly created Z-A introduction starters use this verified first level.
export function applyAdventureIntroStarterMoves(before,after,world){
 const move={152:'나뭇잎',158:'물대포',498:'불꽃세례'}[before.speciesId];
 if(!move||before.level>=6||after.level<6)return applyAdventureLevelMoves(before,after,world);
 const first=applyNewMoves(after,[move]);
 const later=applyAdventureLevelMoves({...before,level:6},first.mon,world);
 return {mon:later.mon,learned:[...first.learned,...later.learned],pending:[...first.pending,...later.pending.filter(name=>!first.pending.some(old=>sameAdventureMove(old,name)))]};
}
export function applyAdventureEvolutionMoves(mon){
 const rows=learnsets[mon.id]||learnsets[mon.artId]||learnsets[mon.speciesId]||[];
 return applyNewMoves(mon,rows.filter(row=>row.level===0).map(row=>moveNameByKey[row.id.replaceAll('-','')]).filter(Boolean));
}
