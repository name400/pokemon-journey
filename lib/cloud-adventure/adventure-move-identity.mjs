import {fieldMove} from './adventure-field-moves.mjs';

// Saves can contain Korean names, English names or simulator IDs.
export function adventureMoveKey(name){return String(fieldMove(name)?.key||'').toLowerCase().replace(/[^a-z0-9]/g,'');}
export function sameAdventureMove(a,b){if(typeof a!=='string'||typeof b!=='string')return false;if(a===b)return true;const key=adventureMoveKey(a);return !!key&&key===adventureMoveKey(b);}
export function knowsAdventureMove(mon,name){return Array.isArray(mon?.moves)&&mon.moves.some(move=>sameAdventureMove(move,name));}
