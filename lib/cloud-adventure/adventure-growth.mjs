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
export function applyAdventureLevelMoves(before,after){
 const knownBefore=new Set(learnableMoves(before,before.level));
 return applyNewMoves(after,learnableMoves(after,after.level).filter(name=>!knownBefore.has(name)));
}
export function applyAdventureEvolutionMoves(mon){
 const rows=learnsets[mon.id]||learnsets[mon.artId]||learnsets[mon.speciesId]||[];
 return applyNewMoves(mon,rows.filter(row=>row.level===0).map(row=>moveNameByKey[row.id.replaceAll('-','')]).filter(Boolean));
}
