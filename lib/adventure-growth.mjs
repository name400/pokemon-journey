import {moves} from './game.mjs';
import {learnableMoves} from './pokemon-config.mjs';

function moveKey(name){return String(moves[name]?.key||'').toLowerCase().replace(/[^a-z0-9]/g,'');}

// A newly learned move starts with full PP. Remaining moves keep their PP.
export function teachAdventureMove(mon,name,slot){
 const previous=mon.moves[slot],next=mon.moves.slice(),pp={...(mon.pp||{})};
 next[slot]=name;mon.moves=next.filter(Boolean);
 for(const move of [previous,name]){const key=moveKey(move);if(key)delete pp[key];}
 mon.pp=pp;return mon;
}

// Compare the old and new level, rather than treating older relearnable moves as
// new on every level-up. Moves that do not fit remain available in management.
export function applyAdventureLevelMoves(before,after){
 const knownBefore=new Set(learnableMoves(before,before.level));
 const unlocked=learnableMoves(after,after.level).filter(name=>!knownBefore.has(name)&&!after.moves.includes(name));
 const learned=[],pending=[];
 for(const name of unlocked){
  if(after.moves.length<4){teachAdventureMove(after,name,after.moves.length);learned.push(name);}
  else pending.push(name);
 }
 return {mon:after,learned,pending};
}
