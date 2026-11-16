import {adventureMorpekoEvents} from './cloud-adventure/adventure-ability-rules.mjs';
// Adventure-only boundary: preserve old simulator snapshots and Pokémon data,
// while allowing only Mega Evolution and keeping the shared engine unchanged.
import {combatView,playCpu,validateCombatCommand} from './party-battle.mjs';
const ALLOWED_SPECIALS=new Set(['mega','megax','megay']);
export function rejectAdventureSpecial(command){
 if(command?.special&&!ALLOWED_SPECIALS.has(command.special))throw Error('탐험 배틀에서는 메가진화만 사용할 수 있습니다.');
 if(Array.isArray(command?.actions))for(const action of command.actions)rejectAdventureSpecial(action);
}
function withoutTera(request){
 if(!request||typeof request!=='object')return request;
 return {...request,...(Array.isArray(request.specials)?{specials:request.specials.filter(s=>ALLOWED_SPECIALS.has(s?.key))}:{}) ,...(Array.isArray(request.actors)?{actors:request.actors.map(withoutTera)}:{})};
}
export function adventureTeraSafeView(view){return view&&Array.isArray(view.requests)?{...view,requests:view.requests.map(withoutTera)}:view;}
export function adventureCombatView(combat,side=0){
 const base=adventureTeraSafeView(combatView(combat,side)),view=side===0&&combat.adventureMegaPowerV1?.playerLocked===true?{...base,requests:base.requests.map(r=>({...r,specials:(r.specials||[]).filter(s=>!['mega','megax','megay'].includes(s.key))}))}:base,req=view?.requests?.[0],active=combat.teams?.[side]?.[combat.requests?.[side]?.active];
 if(combat.adventureMorpekoV1!==true||active?.battleAppearance!=='morpekohangry'||!Array.isArray(req?.moves))return view;
 return {...view,requests:[{...req,moves:req.moves.map(move=>move.id==='aurawheel'?{...move,type:'악',typeKey:'dark'}:move)}]};
}
export function adventurePlayCpu(combat,command){rejectAdventureSpecial(command);const result=playCpu({...combat,disableCpuTera:true},command);return {...result,events:adventureMorpekoEvents(result.events,combat.teams,combat.adventureMorpekoV1)};}
export function adventureValidateCombatCommand(combat,side,command){rejectAdventureSpecial(command);return validateCombatCommand(combat,side,command);}
