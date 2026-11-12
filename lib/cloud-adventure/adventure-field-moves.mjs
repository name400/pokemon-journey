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
