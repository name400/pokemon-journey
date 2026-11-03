import assert from 'node:assert/strict';
import {classicTrainerEncounter} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon,sourceMove} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {rules} from '../lib/pokemon-config.mjs';
const seen={119:new Set(),362:new Set()};
for(const id of [119,362])for(let rng=1;rng<=35;rng++){
 const run={id:'trainer-moves',wave:199,biome:0,rng,party:[makeReferenceMon(151,100,{boxId:'player',moves:['Protect']})],modifiers:[],tools:{},seed:'fixture',trainerSeededMovesRule:'source-v1'};
 const encounter=classicTrainerEncounter(run,id,{kind:id===119?'evil':'champion'}),mon=encounter.team[id===119?4:5];seen[id].add(mon.rogueFormIndex);assert.equal(mon.rogueBossSegments,2);assert.equal(mon.moves.length,4);
 if(id===119){assert.equal(mon.rogueSourceId,966);assert.equal(mon.gender,'N');assert.ok([sourceMove(859),sourceMove(442)].includes(mon.moves[0]));assert.equal(mon.moves[1],sourceMove(667));assert.equal(mon.moves[2],sourceMove(({1:897,2:896,3:898,4:900,5:899})[mon.rogueFormIndex]));}
 else {assert.equal(mon.rogueSourceId,892);assert.equal(mon.gender,'M');assert.equal(mon.moves[0],sourceMove(mon.rogueFormIndex===2?817:818));assert.ok([280,370].map(sourceMove).includes(mon.moves[1]));assert.ok([7,9,8].map(sourceMove).includes(mon.moves[2]));assert.ok([442,398,444].map(sourceMove).includes(mon.moves[3]));}
 if(rng<=2){run.encounter=encounter;run.combat=createClassicCombat(run,[mon],{trainer:true});let native=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run);assert.deepEqual(native.p2.active[0].baseMoveSlots.map(s=>s.id),mon.moves.map(m=>rules.moves[m]?.key));assert.equal(native.p2.active[0].gender,mon.gender);assert.equal(run.combat.teams[1][0].rogueBossSegments,2);run.combat=playClassicCombat(run,{type:'move',move:'protect'});native=restoreClassicNativeBattle(run.combat,run);assert.equal(native.p2.active[0].baseMoveSlots.length,4);assert.equal(native.p2.active[0].gender,mon.gender);}
}
assert.deepEqual([...seen[119]].sort(),[1,2,3,4,5]);assert.deepEqual([...seen[362]].sort(),[2,3]);
// Prior challenges do not adopt the new randomly selected fixed forms.
for(const id of [119,362]){const run={id:'legacy',wave:199,biome:0,rng:1,party:[makeReferenceMon(151,100,{boxId:'player'})],modifiers:[],tools:{},seed:'fixture'};const m=classicTrainerEncounter(run,id,{kind:'champion'}).team[id===119?4:5];assert.equal(m.rogueFormIndex,undefined);}
console.log('Seeded fixed trainer forms/moves, both Urshifu and five Starmobiles, real turns, snapshots and legacy passed.');
