// Adventure-only boundary: preserve old simulator snapshots and Pokémon data,
// while refusing new Terastallization and keeping the shared engine unchanged.
import {combatView,playCpu,validateCombatCommand} from './party-battle.mjs';
export function rejectAdventureTera(command){
 if(command?.special==='terastallize'||(Array.isArray(command?.actions)&&command.actions.some(action=>action?.special==='terastallize')))throw Error('탐험 배틀에서는 테라스탈을 사용할 수 없습니다.');
}
function withoutTera(request){
 if(!request||typeof request!=='object')return request;
 return {...request,...(Array.isArray(request.specials)?{specials:request.specials.filter(s=>s?.key!=='terastallize')}:{}) ,...(Array.isArray(request.actors)?{actors:request.actors.map(withoutTera)}:{})};
}
export function adventureTeraSafeView(view){return view&&Array.isArray(view.requests)?{...view,requests:view.requests.map(withoutTera)}:view;}
export function adventureCombatView(combat,side=0){return adventureTeraSafeView(combatView(combat,side));}
export function adventurePlayCpu(combat,command){rejectAdventureTera(command);return playCpu({...combat,disableCpuTera:true},command);}
export function adventureValidateCombatCommand(combat,side,command){rejectAdventureTera(command);return validateCombatCommand(combat,side,command);}
