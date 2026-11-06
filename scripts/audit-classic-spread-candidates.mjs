// Inventory only: native metadata cannot prove PokéRogue ordering or eligibility.
import {Dex} from '@pkmn/sim';
import {readFileSync} from 'node:fs';
import {moves} from '../lib/game.mjs';
const source=readFileSync(new URL('../lib/rogue-battle-engine.mjs',import.meta.url),'utf8');
const section=source.split('const firstHitMoves=new Set(')[1]?.split('const originalGetSpread')[0];
if(!section)throw Error('Could not locate reviewed spread move set');
const reviewed=new Set([...section.matchAll(/'([a-z0-9]+)'/g)].map(match=>match[1]));
const available=new Set(Object.entries(moves).map(([name,move])=>Dex.moves.get(move.key||name).id));
const candidates=Dex.moves.all().filter(move=>available.has(move.id)&&['allAdjacent','allAdjacentFoes'].includes(move.target)&&move.category!=='Status'&&!move.flags?.charge&&!move.flags?.futuremove&&!move.flags?.noparentalbond&&!move.selfdestruct&&!move.isZ&&!move.isMax&&!move.multihit);
const remaining=candidates.filter(move=>!reviewed.has(move.id)).map(move=>({id:move.id,target:move.target,basePower:move.basePower,secondary:!!(move.secondary||move.secondaries),self:!!(move.self||move.selfBoost),hitCallback:!!(move.onHit||move.onAfterHit||move.damageCallback)}));
console.log(JSON.stringify({disclaimer:'Native metadata inventory only; verify source targeting, eligibility, effects, randomness and full turn ordering before enabling.',candidates:candidates.length,reviewed:candidates.length-remaining.length,remaining},null,2));
