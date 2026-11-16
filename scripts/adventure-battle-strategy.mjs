// Choose only actions exposed by the current API request. This is a local
// playthrough helper, not battle AI or a change to game rules.
export function chooseAdventureAttack(request, lead) {
 const moves=(request?.moves||[]).filter(move=>!move.disabled&&move.pp>0);
 const score=move=>(move.power||0)*(move.effectiveness??1)*(lead?.types?.includes(move.type)?1.5:1);
 moves.sort((a,b)=>score(b)-score(a));
 if(!moves.length)throw Error('No selectable move');
 const move=moves[0],command={type:'move',move:move.name};
 const mega=(request.specials||[]).find(s=>['mega','megax','megay'].includes(s.key));
 if(mega)command.special=mega.key;
 else if(move.plusReady===true)command.plus=true;
 return command;
}
