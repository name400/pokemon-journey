import {Dex} from '@pkmn/sim';
import {moves} from './game.mjs';

// Empty slots are always used first; replacing an existing move requires an explicit choice.
export function installClassicMove(mon,name,replaceIndex){
 const native=Dex.moves.get(moves[name]?.key||name);
 if(!native.exists||mon.moves.includes(name))throw Error('배울 기술을 확인하세요.');
 const index=mon.moves.length<4?mon.moves.length:replaceIndex;
 if(!Number.isInteger(index)||index<0||index>=4||index>mon.moves.length)throw Error('교체할 기술 자리를 선택하세요.');
 if(mon.moves[index])mon.rogueMoveHistory=[...new Set([...(mon.rogueMoveHistory||[]),mon.moves[index]])];
 mon.moves[index]=name;mon.pp||={};mon.pp[native.id]=native.pp;if(mon.roguePPUps)delete mon.roguePPUps[native.id];
 return index;
}
