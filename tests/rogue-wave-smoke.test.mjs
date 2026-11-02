// Synthetic generation smoke test: this does not claim a natural 200-wave clear.
import assert from 'node:assert/strict';
import {classicEncounter} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat} from '../lib/rogue-battle-engine.mjs';
const seen=new Set();
for(let wave=1;wave<=200;wave++){
 const run={id:'wave-smoke',wave,biome:0,party:[makeReferenceMon(1,100,{boxId:'p'}),makeReferenceMon(4,100,{boxId:'q'})],rng:7919+wave,gymStart:20,seed:'wave-smoke',tools:{},modifiers:[],encounter:{kind:'wild'}};
 const encounter=classicEncounter(run);seen.add(encounter.kind);
 assert.ok(encounter.team.length,`wave ${wave}: empty team`);
 assert.ok(encounter.team.every(mon=>mon.level>=1&&mon.level<=100),`wave ${wave}: invalid level`);
 run.encounter=encounter;
 const combat=createClassicCombat(run,encounter.team,{trainer:!!encounter.trainer,doubles:encounter.doubles});
 assert.ok(combat.requests?.[0],`wave ${wave}: no player request`);
}
for(const kind of ['wild','rival','gym','evil','elite','champion','final'])assert.ok(seen.has(kind),`missing ${kind} encounter`);
console.log('All 200 scheduled waves initialize in a synthetic fixture; this is not a full playthrough.');
