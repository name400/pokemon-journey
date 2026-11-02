import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {resolveDuelTurn} from '../lib/pvp.mjs';
const s={players:[makeMon(25,10),makeMon(7,10)],pending:[null,null],phase:'battle',turn:1,log:[],winner:null};
assert.throws(()=>resolveDuelTurn(s,()=>.5));
for(let i=0;i<30&&s.phase==='battle';i++){s.pending=['10만볼트','물대포'];resolveDuelTurn(s,()=>.5);assert.deepEqual(s.pending,[null,null]);}
assert.equal(s.phase,'finished');assert.equal(s.winner,0);assert.equal(s.players[1].hp,0);assert.ok(s.turn>1);
console.log('PvP duel from first turn to victory: passed');
