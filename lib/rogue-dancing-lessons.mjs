// Dancing Lessons rules from PokéRogue 7c088125.
import {Dex} from '@pkmn/sim';
import {moves} from './game.mjs';
const DANCES=new Set(['aquastep','clangoroussoul','dragondance','featherdance','fierydance','lunardance','petaldance','revelationdance','quiverdance','swordsdance','teeterdance','victorydance']);
export function classicDancingMoves(mon){if(!mon||mon.hp<=0)return [];return (mon.moves||[]).map(name=>({name,id:Dex.moves.get(moves[name]?.key||name).id})).filter(move=>DANCES.has(move.id));}
export function classicDancingEligible(run){return (run.party||[]).filter(mon=>mon.hp>0&&classicDancingMoves(mon).length).map(mon=>({boxId:mon.boxId,moves:classicDancingMoves(mon)}));}
