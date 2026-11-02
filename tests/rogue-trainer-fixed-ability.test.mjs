import assert from 'node:assert/strict';
import {classicTrainerEncounter} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon,sourceMove} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
for(const seed of [42,123,444,888]){
 const run={id:'trainer-ability',wave:199,biome:0,rng:seed,party:[makeReferenceMon(1,100,{boxId:'player'})],modifiers:[],tools:{},seed:'fixture',teraCharged:false};
 const encounter=classicTrainerEncounter(run,355,{kind:'champion'});run.encounter=encounter;
 const togekiss=encounter.team.find(mon=>mon.rogueSourceId===468),lucario=encounter.team.find(mon=>mon.rogueSourceId===448);
 assert.equal(togekiss?.ability,'serenegrace');assert.equal(lucario?.ability,'innerfocus');
 const combat=createClassicCombat(run,encounter.team,{trainer:true});const native=restoreClassicNativeBattle(combat,run);
 assert.equal(native.p2.pokemon.find(p=>p.set.trainerToken===togekiss.boxId).getAbility().id,'serenegrace');
 assert.equal(native.p2.pokemon.find(p=>p.set.trainerToken===lucario.boxId).getAbility().id,'innerfocus');
}
// Giovanni's fixed Rhyperior is a two-segment trainer boss, with its fixed ability.
const giovanniRun={id:'trainer-boss',wave:115,biome:0,rng:42,party:[makeReferenceMon(1,100,{boxId:'player'})],modifiers:[],tools:{},seed:'fixture',teraCharged:false};
const giovanni=classicTrainerEncounter(giovanniRun,100,{kind:'evil'});const boss=giovanni.team.find(mon=>mon.rogueSourceId===464);assert.equal(boss.rogueBoss,true);assert.equal(boss.rogueBossSegments,2);assert.equal(boss.ability,'solidrock');giovanniRun.encounter=giovanni;const bossBattle=createClassicCombat(giovanniRun,giovanni.team,{trainer:true});assert.equal(bossBattle.teams[1].find(mon=>mon.boxId===boss.boxId).rogueBossSegments,2);
// Giovanni's first member is guaranteed Fake Out in its preferred slot, including in native combat.
assert.equal(giovanni.team[0].moves[2],sourceMove(252));
assert.ok(restoreClassicNativeBattle(bossBattle,giovanniRun).p2.pokemon[0].moves.includes('fakeout'));
giovanniRun.party=[makeReferenceMon(151,100,{boxId:'mew',moves:['Night Shade']})];giovanniRun.combat=createClassicCombat(giovanniRun,[boss],{trainer:true});const maxHp=giovanniRun.combat.teams[1][0].maxHp;for(let turn=0;turn<2;turn++){giovanniRun.combat=playClassicCombat(giovanniRun,{type:'move',move:'nightshade'});giovanniRun.party=giovanniRun.combat.teams[0];}const nativeBoss=restoreClassicNativeBattle(giovanniRun.combat,giovanniRun).p2.active[0];assert.equal(nativeBoss.hp,Math.round(maxHp/2));assert.equal(nativeBoss.m.rogueBossIndex,0);assert.equal(nativeBoss.boosts.atk,0);assert.equal(nativeBoss.boosts.def,0);
console.log('Cynthia fixed ability slots survive multiple seeds and reach the native battle engine.');
