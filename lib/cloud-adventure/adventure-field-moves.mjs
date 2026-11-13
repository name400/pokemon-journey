import {moves} from '../game.mjs';

// Saved Pokémon can contain localized names, Showdown identifiers or English
// names. Resolve these against the same move data used by adventure battles.
const byId = new Map(Object.values(moves).filter(move=>typeof move?.key==='string').map(move=>[move.key,move]));
export function fieldMove(name){
 if(typeof name!=='string')return undefined;
 if(Object.hasOwn(moves,name))return moves[name];
 const id=name.toLowerCase().replace(/[^a-z0-9]/g,'');
 return id?byId.get(id):undefined;
}

// Documented Z-A bramble-breaking moves that are not Fire attacks. Keep the
// existing broad Flying-attack rule at older locations for save compatibility.
// https://bulbapedia.bulbagarden.net/wiki/Obstruction
const BRAMBLE_MOVES=new Set(['hyperbeam','razorleaf','thunder','selfdestruct','explosion','superfang','slash','outrage','steelwing','dragonbreath','aerialace','leafblade','nightslash','airslash','xscissor','shadowclaw','psychocut','dracometeor','leafstorm','stoneedge','watershuriken','oblivionwing','thousandarrows','lightofruin','coreenforcer','nihillight']);
export function canClearBramble(mon,{legacyFlying=true}={}){
 if(!mon||!(mon.hp>0)||!Array.isArray(mon.moves))return false;
 return mon.moves.some(name=>{const move=fieldMove(name);if(!move)return false;const id=String(move.key||'').toLowerCase().replace(/[^a-z0-9]/g,'');return BRAMBLE_MOVES.has(id)||(Number(move.power)>0&&(move.type==='불꽃'||legacyFlying&&move.type==='비행'));});
}
