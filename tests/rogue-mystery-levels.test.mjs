import test from 'node:test';
import assert from 'node:assert/strict';
import templates from '../data/rogue-trainer-template-rules.json' with {type:'json'};
import {classicMysteryLevelAdditive,classicTrainerLevel} from '../lib/rogue-classic-rules.mjs';
import {classicStatTrainerEncounter,classicTrainerEncounter,classicMysteriousChallengerCandidates} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
test('mystery level scaling matches source wave/10 rounding, including brutal 1.5 and nonnegative clamp',()=>{
 for(const [wave,multiplier,expected]of [[10,1,1],[25,1,3],[49,1,5],[100,1,10],[42,1.5,6],[50,1.5,8],[200,1.5,30],[100,-1,0],[50,0,0],[50,null,0]])assert.equal(classicMysteryLevelAdditive(wave,multiplier),expected);
 for(const [wave,multiplier]of [[0,1],[201,1],[1,Infinity],[1,NaN]])assert.throws(()=>classicMysteryLevelAdditive(wave,multiplier));
});
function fixture(wave){return {id:'source-mystery-level',seed:'source-mystery-level',wave,biome:1,rng:42,party:[makeReferenceMon(151,50,{boxId:'hero',moves:['Splash']})],modifiers:[],tools:{},balls:{}};}
test('all five stat-trainer parties use source level scaling at original levels above100',()=>{
 for(const wave of [22,49,101,180])for(const id of [120,121,122,123,124]){
  const run=fixture(wave),encounter=classicStatTrainerEncounter(run,id),template=templates.templates[encounter.template];
  for(const [i,mon]of encounter.team.entries())assert.equal(mon.level,classicTrainerLevel(wave,template.slots[i].strength)+classicMysteryLevelAdditive(wave,1));
  run.encounter=encounter;run.combat=createClassicCombat(run,encounter.team,{trainer:true,doubles:encounter.doubles});
  const restored=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run);
  for(const mon of encounter.team)assert.equal(restored.p2.pokemon.find(p=>p.set.trainerToken===mon.boxId).level,mon.level);
 }
});
test('the shared trainer generator accepts normal, hard and brutal source modifiers at original levels above100',()=>{
 for(const multiplier of [0,1,1.5]){
  const run=fixture(50),encounter=classicTrainerEncounter(run,1,{kind:'mystery',mysteryLevelModifier:multiplier}),template=templates.templates[encounter.template];
  for(const [i,mon]of encounter.team.entries())assert.equal(mon.level,classicTrainerLevel(50,template.slots[i].strength)+Math.round(5*multiplier));
 }
 const run=fixture(200),encounter=classicTrainerEncounter(run,1,{kind:'mystery',mysteryLevelModifier:1.5});assert.ok(encounter.team.every(mon=>mon.level>100&&Number.isInteger(mon.level)));
});
test('challenger overrides construct source-sized hard and elite parties without changing cached templates',()=>{
 for(const [wave,override,size,multiplier] of [[20,'MYSTERIOUS_HARD',2,1],[21,'MYSTERIOUS_HARD',3,1],[101,'MYSTERIOUS_HARD',6,1],[100,'ELITE_FOUR',6,1.5]]){
  const run=fixture(wave);run.trainerTemplates={[wave+':1']:'ONE_AVG'};
  const encounter=classicTrainerEncounter(run,1,{kind:'mystery',mysteryChallenger:true,templateOverride:override,mysteryLevelModifier:multiplier,female:false});
  assert.equal(encounter.template,override);assert.equal(encounter.team.length,size);assert.equal(encounter.doubles,false);
  assert.equal(run.trainerTemplates[wave+':1'],'ONE_AVG');
  const strengths=override==='MYSTERIOUS_HARD'?[5,...Array(size-1).fill(3)]:templates.templates.ELITE_FOUR.slots.map(slot=>slot.strength);
  for(const [i,mon] of encounter.team.entries())assert.equal(mon.level,classicTrainerLevel(wave,strengths[i])+classicMysteryLevelAdditive(wave,multiplier));
  run.encounter=encounter;run.combat=createClassicCombat(run,encounter.team,{trainer:true,doubles:encounter.doubles});
  const restored=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run);
  assert.equal(restored.p2.pokemon.length,size);
 }
 assert.throws(()=>classicTrainerEncounter(fixture(20),1,{kind:'trainer',templateOverride:'ELITE_FOUR'}));
 assert.throws(()=>classicTrainerEncounter(fixture(20),1,{kind:'mystery',mysteryChallenger:true,templateOverride:'UNKNOWN'}));
 const duo=classicTrainerEncounter(fixture(40),58,{kind:'mystery',mysteryChallenger:true,templateOverride:'MYSTERIOUS_HARD',mysteryLevelModifier:1});
 assert.equal(duo.doubles,true);assert.equal(duo.team.length,3);
});
test('challenger candidate draws are reproducible and survive JSON without rerolling',()=>{
 for(const biome of [0,1,5,16,40])for(const seed of [1,42,1000]){
  const run=fixture(80);run.biome=biome;run.rng=seed;const duplicate=structuredClone(run);
  const candidates=classicMysteriousChallengerCandidates(run);assert.deepEqual(candidates,classicMysteriousChallengerCandidates(duplicate));
  assert.deepEqual(JSON.parse(JSON.stringify(candidates)),candidates);
  for(const candidate of Object.values(candidates)){assert.ok(Number.isInteger(candidate.id));assert.equal(typeof candidate.female,'boolean');}
 }
});
