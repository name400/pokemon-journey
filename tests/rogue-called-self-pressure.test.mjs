import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {syncNativeTeams} from '../lib/party-battle.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture(caller,modern){
 const user=makeReferenceMon(151,50,{boxId:'caller',moves:[caller],ability:'runaway'}),ally=makeReferenceMon(7,50,{boxId:'ally',moves:['Tackle'],ability:'runaway'}),foe=makeReferenceMon(242,100,{boxId:'foe',moves:[caller==='Copycat'?'Tackle':'Splash'],ability:'pressure'});
 const run={id:'caller-pressure',rng:42,wave:21,party:[user,ally],modifiers:[],tools:{},encounter:{kind:'trainer'},calledMoveRule:'source-pool-v1',...(modern?{calledSelfPressureRule:'source-v1'}:{})};run.combat=createClassicCombat(run,[foe],{trainer:true});run.party=run.combat.teams[0];return run;
}

test('self-targeted callers consume only their own PP when their called attack hits Pressure',async()=>{
 for(const caller of ['Metronome','Copycat','Assist'])for(const modern of [false,true]){
  let run=fixture(caller,modern),battle=restoreClassicNativeBattle(run.combat,run),actor=battle.p1.active[0];
  const previous=battle.sample.bind(battle);battle.sample=values=>values.find(value=>value==='tackle'||value?.id==='tackle')??previous(values);
  if(caller==='Copycat')battle.lastMove=battle.dex.moves.get('tackle');
  const before=actor.moveSlots[0].pp;battle.makeChoices('move 1','move 1');assert.ok(battle.log.some(line=>line.includes('|Tackle|')),caller);assert.equal(actor.moveSlots[0].pp,before-(modern?1:2),`${caller} modern=${modern}`);
  run.combat.teams=syncNativeTeams(battle,run.combat.teams);run.party=run.combat.teams[0];run.combat.snapshot=snapshotClassicNativeBattle(battle);const doc=await decodeGameData(await encodeGameData({run,other:{safe:true}}));assert.deepEqual(doc.other,{safe:true});battle=restoreClassicNativeBattle(doc.run.combat,doc.run);assert.equal(battle.p1.active[0].moveSlots[0].pp,before-(modern?1:2));
 }
});

test('double-battle calls preserve PP and save state without changing direct Pressure costs',async()=>{
 for(const caller of ['Metronome','Copycat','Assist']){
  const run=fixture(caller,true);run.party[1].moves=['Tackle','Splash'];const foes=[makeReferenceMon(242,100,{boxId:'foe1',moves:[caller==='Copycat'?'Tackle':'Splash'],ability:'pressure'}),makeReferenceMon(242,100,{boxId:'foe2',moves:['Splash'],ability:'pressure'})];run.combat=createClassicCombat(run,foes,{trainer:true,doubles:true});run.party=run.combat.teams[0];let b=restoreClassicNativeBattle(run.combat,run),actor=b.p1.active[0],sample=b.sample.bind(b);b.sample=values=>values.find(value=>value==='tackle'||value?.id==='tackle')??sample(values);const before=actor.moveSlots[0].pp;
  b.makeChoices('move 1,move 2',caller==='Copycat'?'move 1 1,move 1':'move 1,move 1');assert.ok(b.log.some(line=>line.includes('|Tackle|')&&line.includes('[from] move: '+caller)),caller);assert.equal(actor.moveSlots[0].pp,before-1,caller);
  run.combat.teams=syncNativeTeams(b,run.combat.teams);run.party=run.combat.teams[0];run.combat.snapshot=snapshotClassicNativeBattle(b);const saved=(await decodeGameData(await encodeGameData({run}))).run;b=restoreClassicNativeBattle(saved.combat,saved);assert.equal(b.p1.active[0].moveSlots[0].pp,before-1);
 }
 const run=fixture('Tackle',true),b=restoreClassicNativeBattle(run.combat,run),before=b.p1.active[0].moveSlots[0].pp;b.makeChoices('move 1','move splash');assert.equal(b.p1.active[0].moveSlots[0].pp,before-2);
});

test('new runs use the self-caller rule without changing another save slot',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs'),doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'called-self-pressure'});assert.equal(run.calledSelfPressureRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});
});
