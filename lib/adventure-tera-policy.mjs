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
export function adventureCombatView(combat,side=0){return adventureTeraSafeView(combatView(combat,side));}
export function adventurePlayCpu(combat,command){rejectAdventureSpecial(command);return playCpu({...combat,disableCpuTera:true},command);}
export function adventureValidateCombatCommand(combat,side,command){rejectAdventureSpecial(command);return validateCombatCommand(combat,side,command);}
