import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {syncNativeTeams} from '../lib/party-battle.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

test('targeted callers pay Pressure once for the selected target, never for their follow-up',async()=>{
 for(const caller of ['Mirror Move','Nature Power'])for(const modern of [false,true]){
  const user=makeReferenceMon(151,50,{boxId:'caller',moves:[caller],ability:'runaway'}),foe=makeReferenceMon(242,100,{boxId:'foe',moves:[caller==='Mirror Move'?'Tackle':'Splash'],ability:'pressure'}),run={id:'target-caller-pressure',rng:42,wave:21,biome:1,party:[user],modifiers:[],tools:{},encounter:{kind:'trainer'},calledMoveRule:'source-pool-v1',naturePowerRule:'source-biome-v1',...(modern?{calledTargetPressureRule:'source-v1'}:{})};run.combat=createClassicCombat(run,[foe],{trainer:true});run.party=run.combat.teams[0];let b=restoreClassicNativeBattle(run.combat,run),p=b.p1.active[0],before=p.moveSlots[0].pp;b.makeChoices('move 1','move 1');assert.ok(b.log.some(line=>line.includes('[from] move: '+caller)),caller);assert.equal(p.moveSlots[0].pp,before-(modern?2:3),`${caller} modern=${modern}`);
  run.combat.teams=syncNativeTeams(b,run.combat.teams);run.party=run.combat.teams[0];run.combat.snapshot=snapshotClassicNativeBattle(b);const doc=await decodeGameData(await encodeGameData({run,other:{safe:true}}));assert.deepEqual(doc.other,{safe:true});b=restoreClassicNativeBattle(doc.run.combat,doc.run);assert.equal(b.p1.active[0].moveSlots[0].pp,before-(modern?2:3));
 }
});

test('spread Nature Power pays only for the selected target in doubles after save recovery',async()=>{
 for(const selectedPressure of [false,true]){
  const user=makeReferenceMon(151,50,{boxId:'caller',moves:['Nature Power'],ability:'runaway'}),ally=makeReferenceMon(7,50,{boxId:'ally',moves:['Splash'],ability:'runaway'}),foes=[makeReferenceMon(242,100,{boxId:'foe1',moves:['Splash'],ability:selectedPressure?'pressure':'runaway'}),makeReferenceMon(242,100,{boxId:'foe2',moves:['Splash'],ability:selectedPressure?'runaway':'pressure'})],run={id:'target-pressure-spread',rng:42,wave:21,biome:18,party:[user,ally],modifiers:[],tools:{},encounter:{kind:'trainer'},calledMoveRule:'source-pool-v1',naturePowerRule:'source-biome-v1',calledTargetPressureRule:'source-v1'};run.combat=createClassicCombat(run,foes,{trainer:true,doubles:true});run.party=run.combat.teams[0];let b=restoreClassicNativeBattle(run.combat,run),p=b.p1.active[0],before=p.moveSlots[0].pp;b.makeChoices('move naturepower 1,move splash','move splash,move splash');assert.ok(b.log.some(line=>line.includes('|Lava Plume|')));assert.equal(p.moveSlots[0].pp,before-(selectedPressure?2:1));run.combat.teams=syncNativeTeams(b,run.combat.teams);run.party=run.combat.teams[0];run.combat.snapshot=snapshotClassicNativeBattle(b);const saved=(await decodeGameData(await encodeGameData({run}))).run;b=restoreClassicNativeBattle(saved.combat,saved);assert.equal(b.p1.active[0].moveSlots[0].pp,before-(selectedPressure?2:1));
 }
});

test('new runs enable the targeted caller rule without changing other slots',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs'),doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'target-caller-pressure'});assert.equal(run.calledTargetPressureRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});
});
